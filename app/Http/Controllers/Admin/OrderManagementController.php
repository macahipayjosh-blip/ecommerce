<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\AuctionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'seller', 'items.product'])->latest();

        // Auto-settle auctions before showing auction order list so ended auctions create orders.
        $type = $request->query('type', 'all');
        if ($type === 'auction') {
            $admin = \App\Models\User::role('admin')->first();
            if ($admin) {
                app(AuctionService::class)->settleEndedAuctions($admin);
            }

            $query->where(function ($q) {
                $q->where('order_number', 'like', 'AUCTION-%')
                  ->orWhere('auction_fee', '>', 0);
            });
        }

        $orders = $query->paginate(20)->appends($request->only('type'));

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filterType' => $type,
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['user', 'seller', 'items.product.images', 'shipment', 'paymentTransactions']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,paid,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        return back()->with('success', 'Order status updated successfully.');
    }

    public function refund(Request $request, Order $order)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0|max:' . $order->total,
            'reason' => 'required|string|max:255',
        ]);

        $order->update(['status' => 'cancelled']);

        return back()->with('success', 'Refund processed successfully.');
    }
}