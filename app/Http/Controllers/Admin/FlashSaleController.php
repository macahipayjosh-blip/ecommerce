<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use App\Models\FlashSaleProduct;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FlashSaleController extends Controller
{
    public function index()
    {
        $flashSales = FlashSale::with('creator')->latest()->paginate(20);

        return Inertia::render('Admin/FlashSales/Index', [
            'flashSales' => $flashSales,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/FlashSales/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time'  => 'required|date',
            'end_time'    => 'required|date|after:start_time',
            'active'      => 'boolean',
        ]);

        $validated['created_by']     = auth()->id();
        $validated['discount_type']  = 'fixed';
        $validated['discount_value'] = 0;

        FlashSale::create($validated);

        return redirect()->route('admin.flash-sales.index')->with('success', 'Flash sale created successfully.');
    }

    public function show(FlashSale $flashSale)
    {
        $flashSale->load('creator');

        $submissions = FlashSaleProduct::where('flash_sale_id', $flashSale->id)
            ->with(['product:id,name,price', 'seller:id,name'])
            ->get();

        return Inertia::render('Admin/FlashSales/Show', [
            'flashSale'   => $flashSale,
            'submissions' => $submissions,
        ]);
    }

    public function edit(FlashSale $flashSale)
    {
        return Inertia::render('Admin/FlashSales/Edit', compact('flashSale'));
    }

    public function update(Request $request, FlashSale $flashSale)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_time'  => 'required|date',
            'end_time'    => 'required|date|after:start_time',
            'active'      => 'boolean',
        ]);

        $flashSale->update($validated);

        return redirect()->route('admin.flash-sales.index')->with('success', 'Flash sale updated successfully.');
    }

    public function destroy(FlashSale $flashSale)
    {
        $flashSale->delete();

        return redirect()->route('admin.flash-sales.index')->with('success', 'Flash sale deleted successfully.');
    }

    // ─── Submission Actions ───────────────────────────────────────────────────

    public function approveProduct(FlashSaleProduct $flashSaleProduct)
    {
        $flashSaleProduct->update(['status' => 'approved']);
        return back()->with('success', 'Product approved for flash sale.');
    }

    public function rejectProduct(FlashSaleProduct $flashSaleProduct)
    {
        $flashSaleProduct->update(['status' => 'rejected']);
        return back()->with('success', 'Product rejected.');
    }

    public function removeProduct(FlashSaleProduct $flashSaleProduct)
    {
        $flashSaleProduct->delete();
        return back()->with('success', 'Listing removed.');
    }

    public function approveAll(FlashSale $flashSale)
    {
        $count = FlashSaleProduct::where('flash_sale_id', $flashSale->id)
            ->where('status', 'pending')
            ->update(['status' => 'approved']);

        return back()->with('success', "{$count} product(s) approved.");
    }

    public function rejectAll(FlashSale $flashSale)
    {
        $count = FlashSaleProduct::where('flash_sale_id', $flashSale->id)
            ->where('status', 'pending')
            ->update(['status' => 'rejected']);

        return back()->with('success', "{$count} product(s) rejected.");
    }
}
