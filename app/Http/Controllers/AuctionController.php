<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Services\AuctionService;
use Inertia\Inertia;

class AuctionController extends Controller
{
    public function show(Product $product, AuctionService $auctionService)
    {
        abort_unless($product->is_auction, 404);

        // Auto-settle when time has passed
        if (in_array($product->auction_status, ['live', 'pending', 'ended']) && $product->auction_end_at && now()->gt($product->auction_end_at)) {
            try {
                $admin = \App\Models\User::role('admin')->first();
                $auctionService->settleAuction($product, $admin);
                $product->refresh();
            } catch (\Throwable $e) {
                $product->update(['auction_status' => 'ended']);
            }
        }

        $product->load([
            'bids' => fn($q) => $q->orderByDesc('amount'),
            'bids.user:id,name',
            'images:id,product_id,image_path,is_primary',
            'seller:id,name',
        ]);
        return Inertia::render('Auctions/Show', compact('product'));
    }

    public function placeBid(Request $request, Product $product, AuctionService $auctionService)
    {
        if (!auth()->check()) {
            abort(401);
        }

        if ($product->vendor_id === auth()->id()) {
            return redirect()->route('auctions.show', $product)
                ->withErrors(['amount' => 'You cannot bid on your own auction.']);
        }

        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'max_proxy_amount' => 'nullable|numeric|min:0.01',
        ]);

        try {
            $auctionService->placeBid($product, auth()->user(), (float) $data['amount'], isset($data['max_proxy_amount']) ? (float) $data['max_proxy_amount'] : null);
        } catch (\Throwable $e) {
            return redirect()->route('auctions.show', $product)
                ->withErrors(['amount' => $e->getMessage()]);
        }

        return redirect()->route('auctions.show', $product)->with('success', 'Bid placed successfully.');
    }
}
