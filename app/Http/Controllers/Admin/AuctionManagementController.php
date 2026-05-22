<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AuctionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AuctionManagementController extends Controller
{
    public function index()
    {
        $auctions = Product::where('is_auction', true)
            ->with([
                'seller:id,name,email',
                'bids:id,product_id,amount,user_id',
                'bids.user:id,name',
                'images' => fn($q) => $q->where('is_primary', true)->select('id', 'product_id', 'image_path'),
            ])
            ->latest()
            ->paginate(15);

        return Inertia::render('Admin/Auctions/Index', compact('auctions'));
    }

    public function show(Product $product)
    {
        abort_unless($product->is_auction, 404);

        if (in_array($product->auction_status, ['live', 'pending']) && $product->auction_end_at && now()->gt($product->auction_end_at)) {
            try {
                $admin = \App\Models\User::role('admin')->first();
                app(AuctionService::class)->settleAuction($product, $admin);
                $product->refresh();
            } catch (\Throwable $e) {
                $product->update(['auction_status' => 'ended']);
            }
        }

        $product->load([
            'seller:id,name,email',
            'bids' => fn($q) => $q->orderByDesc('amount'),
            'bids.user:id,name',
            'images:id,product_id,image_path,is_primary',
        ]);

        return Inertia::render('Admin/Auctions/Show', compact('product'));
    }

    public function update(Request $request, Product $product)
    {
        abort_unless($product->is_auction, 404);
        $validated = $request->validate([
            'auction_status' => 'required|in:pending,live,ended,settled',
        ]);
        $product->update($validated);

        return back()->with('success', 'Auction status updated.');
    }

    public function destroy(Product $product)
    {
        abort_unless($product->is_auction, 404);
        foreach ($product->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }
        $product->delete();

        return redirect()->route('admin.auctions.index')->with('success', 'Auction deleted.');
    }
}
