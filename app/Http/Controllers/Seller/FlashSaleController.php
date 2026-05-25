<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class FlashSaleController extends Controller
{
    public function index()
    {
        $submissions = FlashSaleProduct::where('seller_id', auth()->id())
            ->with(['flashSale:id,title,start_time,end_time,active', 'product:id,name,price'])
            ->latest()->paginate(20);

        $openSales = FlashSale::where('active', true)
            ->where('end_time', '>', now())
            ->select('id', 'title', 'start_time', 'end_time')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Seller/FlashSales/Index', compact('submissions', 'openSales'));
    }

    public function create(FlashSale $flashSale)
    {
        abort_if(!$flashSale->active || $flashSale->end_time < now(), 422, 'Flash sale is not open.');

        $submitted = FlashSaleProduct::where('flash_sale_id', $flashSale->id)
            ->where('seller_id', auth()->id())
            ->pluck('product_id');

        $products = Product::where('vendor_id', auth()->id())
            ->where('status', 'active')
            ->select('id', 'name', 'price', 'stock_quantity')
            ->get()
            ->whereNotIn('id', $submitted)
            ->values();

        return Inertia::render('Seller/FlashSales/Submit', compact('flashSale', 'products'));
    }

    public function store(Request $request, FlashSale $flashSale)
    {
        Log::info('FSP STORE HIT', ['all' => $request->all(), 'seller' => auth()->id(), 'flash_sale_id' => $flashSale->id]);

        abort_if(!$flashSale->active || $flashSale->end_time < now(), 422, 'Flash sale is not open.');

        $validated = $request->validate([
            'product_id'       => 'required|exists:products,id',
            'flash_price'      => 'required|numeric|min:0.01',
            'flash_stock'      => 'required|numeric|min:1',
            'max_per_customer' => 'nullable|numeric|min:0',
        ]);

        Log::info('FSP STORE VALIDATED', $validated);

        $product = Product::where('id', $validated['product_id'])
            ->where('vendor_id', auth()->id())
            ->firstOrFail();

        abort_if((int) $validated['flash_stock'] > $product->stock_quantity, 422, 'Flash stock cannot exceed available stock.');

        FlashSaleProduct::updateOrCreate(
            ['flash_sale_id' => $flashSale->id, 'product_id' => $product->id],
            [
                'seller_id'        => auth()->id(),
                'flash_price'      => $validated['flash_price'],
                'flash_stock'      => (int) $validated['flash_stock'],
                'max_per_customer' => (int) ($validated['max_per_customer'] ?? 0),
                'status'           => 'pending',
            ]
        );

        Log::info('FSP STORE DONE');

        return redirect()->route('seller.flash-sales.index')->with('success', 'Product submitted for flash sale approval.');
    }

    public function storeAll(Request $request, FlashSale $flashSale)
    {
        Log::info('FSP STORE-ALL HIT', ['all' => $request->all(), 'seller' => auth()->id()]);

        abort_if(!$flashSale->active || $flashSale->end_time < now(), 422, 'Flash sale is not open.');

        $request->validate([
            'discount_percent' => 'required|numeric|min:1|max:99',
            'flash_stock_mode' => 'required|in:all,custom',
            'stock_percent'    => 'nullable|numeric|min:1|max:100',
            'max_per_customer' => 'nullable|numeric|min:0',
        ]);

        $discount   = (float) $request->discount_percent;
        $stockMode  = $request->flash_stock_mode;
        $stockPct   = (float) ($request->stock_percent ?? 100);
        $maxPerCust = (int) ($request->max_per_customer ?? 0);

        $submitted = FlashSaleProduct::where('flash_sale_id', $flashSale->id)
            ->where('seller_id', auth()->id())
            ->pluck('product_id');

        $products = Product::where('vendor_id', auth()->id())
            ->where('status', 'active')
            ->where('stock_quantity', '>', 0)
            ->whereNotIn('id', $submitted)
            ->get();

        foreach ($products as $product) {
            $flashPrice = round($product->price * (1 - $discount / 100), 2);
            $flashStock = $stockMode === 'all'
                ? $product->stock_quantity
                : max(1, (int) round($product->stock_quantity * $stockPct / 100));

            FlashSaleProduct::updateOrCreate(
                ['flash_sale_id' => $flashSale->id, 'product_id' => $product->id],
                [
                    'seller_id'        => auth()->id(),
                    'flash_price'      => $flashPrice,
                    'flash_stock'      => $flashStock,
                    'max_per_customer' => $maxPerCust,
                    'status'           => 'pending',
                ]
            );
        }

        return redirect()->route('seller.flash-sales.index')
            ->with('success', "{$products->count()} product(s) submitted for flash sale approval.");
    }

    public function destroy(FlashSaleProduct $flashSaleProduct)
    {
        abort_if($flashSaleProduct->seller_id !== auth()->id(), 403);
        abort_if($flashSaleProduct->status === 'approved' && $flashSaleProduct->flashSale->isActive(), 422, 'Cannot remove an active approved submission.');

        $flashSaleProduct->delete();

        return back()->with('success', 'Submission removed.');
    }

    public function edit(FlashSaleProduct $flashSaleProduct)
    {
        abort_if($flashSaleProduct->seller_id !== auth()->id(), 403);
        abort_if($flashSaleProduct->status === 'approved', 422, 'Approved submissions cannot be edited.');

        $flashSaleProduct->load(['flashSale:id,title,start_time,end_time', 'product:id,name,price,stock_quantity']);

        return Inertia::render('Seller/FlashSales/Edit', compact('flashSaleProduct'));
    }

    public function update(Request $request, FlashSaleProduct $flashSaleProduct)
    {
        abort_if($flashSaleProduct->seller_id !== auth()->id(), 403);
        abort_if($flashSaleProduct->status === 'approved', 422, 'Approved submissions cannot be edited.');

        $validated = $request->validate([
            'flash_price'      => 'required|numeric|min:0.01',
            'flash_stock'      => 'required|numeric|min:1',
            'max_per_customer' => 'nullable|numeric|min:0',
        ]);

        $product = Product::findOrFail($flashSaleProduct->product_id);
        abort_if((int) $validated['flash_stock'] > $product->stock_quantity, 422, 'Flash stock cannot exceed available stock.');

        $flashSaleProduct->update([
            'flash_price'      => $validated['flash_price'],
            'flash_stock'      => (int) $validated['flash_stock'],
            'max_per_customer' => (int) ($validated['max_per_customer'] ?? 0),
            'status'           => 'pending',
        ]);

        return redirect()->route('seller.flash-sales.index')->with('success', 'Submission updated.');
    }
}
