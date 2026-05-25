<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProductMessageController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $request->validate(['message' => 'required|string|max:1000']);

        $user = Auth::user();
        $sellerId = $product->vendor_id;

        // Customer messages seller, seller messages customer (receiver passed from frontend)
        $receiverId = $request->input('receiver_id', $sellerId);

        ProductMessage::create([
            'product_id'  => $product->id,
            'sender_id'   => $user->id,
            'receiver_id' => $receiverId,
            'message'     => $request->message,
        ]);

        return Inertia::location(back()->getTargetUrl());
    }

    // Seller inbox: all conversations grouped by product
    public function sellerInbox()
    {
        $user = Auth::user();

        // Get all products owned by this seller that have messages
        $productIds = Product::where('vendor_id', $user->id)->pluck('id');

        // Group conversations: for each product, get unique customers
        $conversations = ProductMessage::with(['sender:id,name', 'product:id,name'])
            ->whereIn('product_id', $productIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($msg) use ($user) {
                // Group by product_id + customer_id
                $customerId = $msg->sender_id === $user->id ? $msg->receiver_id : $msg->sender_id;
                return $msg->product_id . '_' . $customerId;
            })
            ->map(function ($msgs) use ($user) {
                $latest = $msgs->first();
                $customerId = $latest->sender_id === $user->id ? $latest->receiver_id : $latest->sender_id;
                return [
                    'product_id'      => $latest->product_id,
                    'product_name'    => $latest->product->name ?? 'Unknown',
                    'customer_id'     => $customerId,
                    'customer_name'   => $msgs->first(fn($m) => $m->sender_id === $customerId)?->sender->name ?? 'Customer',
                    'last_message'    => $latest->message,
                    'last_at'         => $latest->created_at,
                    'unread'          => $msgs->where('sender_id', '!=', $user->id)->where('read_at', null)->count(),
                ];
            })
            ->values();

        return Inertia::render('Seller/Messages/Index', compact('conversations'));
    }

    public function sellerConversation(Request $request, Product $product)
    {
        $user = Auth::user();
        abort_if($product->vendor_id !== $user->id, 403);

        $customerId = $request->query('customer_id');

        // Mark all unread messages from this customer as read
        ProductMessage::where('product_id', $product->id)
            ->where('sender_id', $customerId)
            ->where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = ProductMessage::with('sender:id,name')
            ->where('product_id', $product->id)
            ->where(function ($q) use ($user, $customerId) {
                $q->where(fn($q) => $q->where('sender_id', $user->id)->where('receiver_id', $customerId))
                  ->orWhere(fn($q) => $q->where('sender_id', $customerId)->where('receiver_id', $user->id));
            })
            ->orderBy('created_at')
            ->get(['id', 'sender_id', 'message', 'created_at']);

        // Get all conversations for sidebar
        $productIds = Product::where('vendor_id', $user->id)->pluck('id');
        $conversations = ProductMessage::with(['sender:id,name', 'product:id,name'])
            ->whereIn('product_id', $productIds)
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($msg) use ($user) {
                $cid = $msg->sender_id === $user->id ? $msg->receiver_id : $msg->sender_id;
                return $msg->product_id . '_' . $cid;
            })
            ->map(function ($msgs) use ($user) {
                $latest = $msgs->first();
                $cid = $latest->sender_id === $user->id ? $latest->receiver_id : $latest->sender_id;
                return [
                    'product_id'    => $latest->product_id,
                    'product_name'  => $latest->product->name ?? 'Unknown',
                    'customer_id'   => $cid,
                    'customer_name' => $msgs->first(fn($m) => $m->sender_id === $cid)?->sender->name ?? 'Customer',
                    'last_message'  => $latest->message,
                    'last_at'       => $latest->created_at,
                ];
            })
            ->values();

        return Inertia::render('Seller/Messages/Index', [
            'conversations'      => $conversations,
            'activeMessages'     => $messages,
            'activeProductId'    => $product->id,
            'activeProductName'  => $product->name,
            'activeCustomerId'   => (int) $customerId,
        ]);
    }
}
