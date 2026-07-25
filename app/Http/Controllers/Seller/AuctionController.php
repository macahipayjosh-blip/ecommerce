<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\InventoryLog;
use App\Services\AuctionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class AuctionController extends Controller
{
    public function index()
    {
        $auctions = Product::where('vendor_id', auth()->id())
            ->where('is_auction', true)
            ->with(['images' => fn($q) => $q->where('is_primary', true)->select('id', 'product_id', 'image_path')])
            ->withCount('bids')
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Seller/Auctions/Index', compact('auctions'));
    }

    public function create()
    {
        return Inertia::render('Seller/Auctions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'required|string',
            'breed'            => 'required|string|max:255',
            'age'              => 'required|string|max:255',
            'weight'           => 'required|numeric|min:0',
            'weight_unit'      => 'required|string',
            'reserve_price'    => 'nullable|numeric|min:0',
            'auction_duration' => 'required|in:1_day,3_days,1_week',
            'auction_start_at' => 'nullable|date',
            'images.*'         => 'image|max:2048',
        ]);

        $durations = ['1_day' => 1, '3_days' => 3, '1_week' => 7];
        $start = $validated['auction_start_at'] ? now()->parse($validated['auction_start_at']) : now();
        $end   = (clone $start)->addDays($durations[$validated['auction_duration']]);

        $product = Product::create([
            'name'             => $validated['name'],
            'slug'             => Str::slug($validated['name']) . '-' . Str::random(5),
            'description'      => $validated['description'],
            'price'            => $validated['reserve_price'] ?? 0,
            'vendor_id'        => auth()->id(),
            'category_id'      => null,
            'brand_id'         => null,
            'status'           => 'active',
            'is_auction'       => true,
            'reserve_price'    => $validated['reserve_price'] ?? null,
            'auction_start_at' => $start,
            'auction_end_at'   => $end,
            'breed'            => $validated['breed'],
            'age'              => $validated['age'],
            'weight'           => $validated['weight'],
            'weight_unit'      => $validated['weight_unit'],
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $product->images()->create([
                    'image_path' => $file->store('products', 'public'),
                    'is_primary' => $index === 0,
                ]);
            }
        }

        InventoryLog::create(['product_id' => $product->id, 'quantity_change' => 1, 'reason' => 'initial_stock']);

        return redirect()->route('seller.auctions.index')->with('success', 'Auction created successfully.');
    }

    public function show(Product $auction)
    {
        abort_unless($auction->vendor_id === auth()->id() && $auction->is_auction, 403);

        // Auto-settle when auction time has elapsed and not yet settled
        if (in_array($auction->auction_status, ['live', 'pending', 'ended'])
            && $auction->auction_end_at
            && now()->gt($auction->auction_end_at)
        ) {
            try {
                $admin = \App\Models\User::role('admin')->first();
                app(AuctionService::class)->settleAuction($auction, $admin);
            } catch (\Throwable $e) {
                report($e);
            }
            $auction->refresh();
        }

        $auction->load([
            'images',
            'bids' => fn($q) => $q->orderByDesc('amount'),
            'bids.user:id,name,email',
        ]);

        // Find the order created for this auction (if settled)
        $order = null;
        if ($auction->auction_status === 'settled') {
            $order = \App\Models\Order::whereHas('items', fn($q) => $q->where('product_id', $auction->id))
                ->select('id', 'order_number', 'status', 'total', 'user_id', 'created_at')
                ->with('user:id,name,email')
                ->latest()
                ->first();
        }

        return Inertia::render('Seller/Auctions/Show', compact('auction', 'order'));
    }

    public function edit(Product $auction)
    {
        abort_unless($auction->vendor_id === auth()->id() && $auction->is_auction, 403);
        $auction->load('images');
        return Inertia::render('Seller/Auctions/Edit', compact('auction'));
    }

    public function update(Request $request, Product $auction)
    {
        abort_unless($auction->vendor_id === auth()->id() && $auction->is_auction, 403);

        $validated = $request->validate([
            'name'             => 'required|string|max:255',
            'description'      => 'required|string',
            'breed'            => 'required|string|max:255',
            'age'              => 'required|string|max:255',
            'weight'           => 'required|numeric|min:0',
            'weight_unit'      => 'required|string',
            'reserve_price'    => 'nullable|numeric|min:0',
            'auction_start_at' => 'nullable|date',
            'auction_end_at'   => 'nullable|date',
            'images.*'         => 'image|max:2048',
            'deleted_images'   => 'nullable|array',
            'deleted_images.*' => 'integer',
        ]);

        $auction->update([
            'name'             => $validated['name'],
            'description'      => $validated['description'],
            'breed'            => $validated['breed'],
            'age'              => $validated['age'],
            'weight'           => $validated['weight'],
            'weight_unit'      => $validated['weight_unit'],
            'reserve_price'    => $validated['reserve_price'] ?? null,
            'price'            => $validated['reserve_price'] ?? 0,
            'auction_start_at' => $validated['auction_start_at'] ?? $auction->auction_start_at,
            'auction_end_at'   => $validated['auction_end_at'] ?? $auction->auction_end_at,
        ]);

        if (!empty($validated['deleted_images'])) {
            $images = ProductImage::whereIn('id', $validated['deleted_images'])
                ->where('product_id', $auction->id)->get();
            foreach ($images as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
        }

        if ($request->hasFile('images')) {
            $hasPrimary = $auction->images()->where('is_primary', true)->exists();
            foreach ($request->file('images') as $index => $file) {
                $auction->images()->create([
                    'image_path' => $file->store('products', 'public'),
                    'is_primary' => !$hasPrimary && $index === 0,
                ]);
                $hasPrimary = true;
            }
        }

        return redirect()->route('seller.auctions.index')->with('success', 'Auction updated successfully.');
    }

    public function placeOrder(Product $auction)
    {
        abort_unless($auction->vendor_id === auth()->id() && $auction->is_auction, 403);
        abort_unless(in_array($auction->auction_status, ['live', 'pending', 'ended']), 422, 'Auction is already settled.');

        try {
            $admin = \App\Models\User::role('admin')->first();
            $order = app(AuctionService::class)->settleAuction($auction, $admin);
            $auction->refresh();

            if ($order) {
                return redirect()->route('seller.orders.show', $order)->with('success', 'Auction order placed successfully. Order #' . $order->order_number);
            }

            return back()->with('error', 'Cannot place order: No valid bids or bid does not meet reserve price.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Failed to place order: ' . $e->getMessage());
        }
    }

    public function destroy(Product $auction)
    {
        abort_unless($auction->vendor_id === auth()->id() && $auction->is_auction, 403);
        foreach ($auction->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }
        $auction->delete();
        return redirect()->route('seller.auctions.index')->with('success', 'Auction deleted.');
    }
}
