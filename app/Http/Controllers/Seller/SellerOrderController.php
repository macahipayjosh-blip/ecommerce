<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class SellerOrderController extends Controller
{
    private function sellerOrderQuery()
    {
        $sellerId = auth()->id();
        return Order::where(function ($q) use ($sellerId) {
            $q->where('vendor_id', $sellerId)
              ->orWhereHas('items.product', fn($p) => $p->where('vendor_id', $sellerId));
        });
    }

    public function index(Request $request)
    {
        $status        = $request->validate(['status' => 'nullable|in:pending,confirmed,shipped,delivered,cancelled,paid'])['status'] ?? null;
        $auctionStatus = $request->validate(['auction_status' => 'nullable|in:pending,confirmed,shipped,delivered,cancelled,paid'])['auction_status'] ?? null;

        $base        = fn() => $this->sellerOrderQuery()->where('payment_method', '!=', 'auction');
        $auctionBase = fn() => $this->sellerOrderQuery()->where('payment_method', 'auction');

        $orders = $base()
            ->with(['user:id,name,email', 'items.product:id,name,price', 'items.product.images'])
            ->when($status, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15, ['*'], 'page')
            ->withQueryString();

        $auctionOrders = $auctionBase()
            ->with(['user:id,name,email', 'items.product:id,name,price,is_auction', 'items.product.images'])
            ->when($auctionStatus, fn($q, $s) => $q->where('status', $s))
            ->latest()
            ->paginate(15, ['*'], 'auction_page')
            ->withQueryString();

        $statusCounts = [
            'all'       => $base()->count(),
            'pending'   => $base()->where('status', 'pending')->count(),
            'confirmed' => $base()->where('status', 'confirmed')->count(),
            'shipped'   => $base()->where('status', 'shipped')->count(),
            'delivered' => $base()->where('status', 'delivered')->count(),
            'cancelled' => $base()->where('status', 'cancelled')->count(),
        ];

        $auctionStatusCounts = [
            'all'       => $auctionBase()->count(),
            'confirmed' => $auctionBase()->where('status', 'confirmed')->count(),
            'shipped'   => $auctionBase()->where('status', 'shipped')->count(),
            'delivered' => $auctionBase()->where('status', 'delivered')->count(),
            'cancelled' => $auctionBase()->where('status', 'cancelled')->count(),
        ];

        return Inertia::render('Seller/Orders/Index', compact('orders', 'statusCounts', 'auctionOrders', 'auctionStatusCounts'));
    }

    public function show(Order $order)
    {
        $sellerId = auth()->id();
        $hasAccess = $order->vendor_id === $sellerId
            || $order->items()->whereHas('product', fn($p) => $p->where('vendor_id', $sellerId))->exists();
        abort_if(!$hasAccess, 403);
        $order->load(['customer', 'items.product.images', 'address']);

        return Inertia::render('Seller/Orders/Show', [
            'order' => array_merge($order->toArray(), [
                'customer'         => $order->customer ? ['name' => $order->customer->name, 'email' => $order->customer->email] : null,
                'shipping_address' => $order->address,
                'shipping_cost'    => $order->shipping,
                'payment_status'   => $order->payment_collected ? 'paid' : 'pending',
            ]),
        ]);
    }

    public function invoice(Order $order)
    {
        $sellerId = auth()->id();
        $hasAccess = $order->vendor_id === $sellerId
            || $order->items()->whereHas('product', fn($p) => $p->where('vendor_id', $sellerId))->exists();
        abort_if(!$hasAccess, 403);
        $order->load(['customer', 'items.product', 'address']);

        return Inertia::render('Seller/Orders/Invoice', [
            'order' => array_merge($order->toArray(), [
                'customer'         => $order->customer ? ['name' => $order->customer->name, 'email' => $order->customer->email] : null,
                'shipping_address' => $order->address,
                'shipping_cost'    => $order->shipping,
            ]),
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $sellerId = auth()->id();
        $hasAccess = $order->vendor_id === $sellerId
            || $order->items()->whereHas('product', fn($p) => $p->where('vendor_id', $sellerId))->exists();
        abort_if(!$hasAccess, 403);

        $request->validate([
            'status' => 'required|in:confirmed,shipped,delivered,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        return back()->with('success', 'Order status updated.');
    }

    public function analytics()
    {
        $paid = ['paid', 'shipped', 'delivered'];
        $sellerId = auth()->id();

        $monthlySales = collect(range(5, 0))->map(function ($i) use ($paid, $sellerId) {
            $date = Carbon::now()->subMonths($i);
            $base = fn() => $this->sellerOrderQuery()
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month);
            return [
                'month'  => $date->format('M Y'),
                'sales'  => (float) $base()->whereIn('status', $paid)->sum('total'),
                'orders' => $base()->count(),
            ];
        });

        return Inertia::render('Seller/Analytics', compact('monthlySales'));
    }

    public function payouts()
    {
        $sellerId = auth()->id();
        $seller   = auth()->user()->sellerProfile;

        $pendingCOD = Order::where('vendor_id', $sellerId)
            ->where('payment_method', 'cod')
            ->where('seller_credited', false)
            ->whereNotIn('status', ['cancelled', 'returned'])
            ->sum('total');

        $recentCredited = Order::where('vendor_id', $sellerId)
            ->where('seller_credited', true)
            ->latest('delivered_at')
            ->take(5)
            ->get(['id', 'order_number', 'total', 'delivered_at', 'payment_method']);

        return Inertia::render('Seller/Payouts', compact('seller', 'pendingCOD', 'recentCredited'));
    }
}
