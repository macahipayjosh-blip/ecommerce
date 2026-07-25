<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderMessage;
use App\Models\Review;
use App\Notifications\AuctionSaleConfirmedNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerOrderController extends Controller
{
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())
            ->with(['items.product', 'items.product.images', 'shipment'])
            ->latest()
            ->paginate(10);

        $auctionNotifications = auth()->user()->unreadNotifications()
            ->where('type', AuctionSaleConfirmedNotification::class)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'order_id' => $notification->data['order_id'] ?? null,
                    'product_name' => $notification->data['product_name'] ?? null,
                    'message' => $notification->data['message'] ?? 'You have a new auction notification.',
                    'created_at' => $notification->created_at?->toDateTimeString(),
                ];
            });

        return Inertia::render('Customer/Orders/Index', compact('orders', 'auctionNotifications'));
    }

    public function show(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);

        $order->load(['items.product.images', 'shipment', 'address', 'seller' => fn($q) => $q->select('id','name','email')]);
        $order->load(['messages.sender:id,name']);

        $reviewedProductIds = \App\Models\Review::where('user_id', auth()->id())
            ->whereIn('product_id', $order->items->pluck('product_id'))
            ->pluck('product_id')
            ->values()
            ->toArray();

        $authId = auth()->id();

        $orderData = array_merge($order->toArray(), [
            'shipping_cost' => $order->shipping,
            'discount'      => 0,
            'proof_photo'   => $order->proof_photo,
        ]);

        return Inertia::render('Customer/Orders/Show', [
            'order'              => $orderData,
            'reviewedProductIds' => $reviewedProductIds,
            'authId'             => $authId,
        ]);
    }

    public function store(Request $request)
    {
        // Delegate to shared OrderController
        return app(\App\Http\Controllers\OrderController::class)->store($request);
    }

    public function cancel(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        abort_if(!in_array($order->status, ['pending', 'confirmed']), 422, 'Order cannot be cancelled.');

        $order->update(['status' => 'cancelled']);

        // Restore stock
        foreach ($order->items as $item) {
            $item->product->increment('stock_quantity', $item->quantity);
        }

        return back()->with('success', 'Order cancelled successfully.');
    }

    public function requestReturn(Request $request, Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        abort_if($order->status !== 'delivered', 422, 'Only delivered orders can be returned.');
        abort_if(!empty($order->proof_photo), 422, 'Return is not allowed after proof of delivery has been submitted.');

        $request->validate(['reason' => 'required|string|max:500']);

        // Create a support ticket for the return
        \App\Models\SupportTicket::create([
            'customer_id' => auth()->id(),
            'order_id'    => $order->id,
            'subject'     => 'Return Request for Order #' . $order->order_number,
            'message'     => $request->reason,
            'status'      => 'open',
            'priority'    => 'medium',
        ]);

        return back()->with('success', 'Return request submitted. Our team will contact you.');
    }

    public function storeReview(Request $request, Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        abort_if($order->status !== 'delivered', 422, 'You can only review delivered orders.');

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'rating'     => 'required|integer|min:1|max:5',
            'comment'    => 'nullable|string|max:1000',
        ]);

        // Ensure the product is part of this order
        abort_if(!$order->items->pluck('product_id')->contains($request->product_id), 422, 'Product not in this order.');

        Review::updateOrCreate(
            ['user_id' => auth()->id(), 'product_id' => $request->product_id],
            ['rating' => $request->rating, 'comment' => $request->comment, 'approved' => false]
        );

        return back()->with('success', 'Review submitted successfully.');
    }

    public function invoice(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        $order->load(['items.product.images', 'address', 'user']);

        return Inertia::render('Customer/Orders/Invoice', compact('order'));
    }

    public function sendMessage(Order $order, Request $request)
    {
        abort_if($order->user_id !== auth()->id(), 403);
        $request->validate(['message' => 'required|string|max:1000']);

        OrderMessage::create([
            'order_id'  => $order->id,
            'sender_id' => auth()->id(),
            'message'   => $request->message,
        ]);

        return back()->with('success', 'Message sent successfully.');
    }
}
