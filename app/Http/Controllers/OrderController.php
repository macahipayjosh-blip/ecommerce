<?php

namespace App\Http\Controllers;

use App\Models\{Cart, CartItem, Order, OrderItem, Product, FlashSaleProduct};
use App\Models\UserVoucher;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['items.product', 'shipment', 'paymentTransaction'])
            ->where('user_id', Auth::id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Orders/Index', compact('orders'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'address_id'     => 'required|exists:addresses,id',
            'payment_method' => 'nullable|string',
        ]);

        $user = Auth::user();
        $cart = Cart::where('user_id', $user->id)->with('items.product')->first();

        if (!$cart || $cart->items->isEmpty()) {
            return back()->with('error', 'Cart is empty.');
        }

        $order = null;
        DB::transaction(function () use ($cart, $request, $user, &$order) {
            $subtotal = 0;

            // Resolve flash sale prices and validate stock
            $resolvedItems = $cart->items->map(function ($cartItem) use ($user) {
                $product = $cartItem->product;
                $unitPrice = $cartItem->unit_price;

                // Check if there's an active approved flash sale for this product
                $fsp = FlashSaleProduct::where('product_id', $product->id)
                    ->where('status', 'approved')
                    ->whereHas('flashSale', fn($q) => $q->where('active', true)
                        ->where('start_time', '<=', now())
                        ->where('end_time', '>=', now()))
                    ->lockForUpdate()
                    ->first();

                if ($fsp) {
                    // Validate time & stock
                    abort_if($fsp->remainingStock() < $cartItem->quantity, 422,
                        "Not enough flash sale stock for \"{$product->name}\".");

                    // Enforce per-customer limit
                    if ($fsp->max_per_customer > 0) {
                        $alreadyBought = OrderItem::whereHas('order', fn($q) => $q->where('user_id', $user->id)
                                ->whereNotIn('status', ['cancelled']))
                            ->where('product_id', $product->id)
                            ->sum('quantity');

                        abort_if(($alreadyBought + $cartItem->quantity) > $fsp->max_per_customer, 422,
                            "Purchase limit reached for \"{$product->name}\".");
                    }

                    $unitPrice = (float) $fsp->flash_price;
                }

                return [
                    'cartItem'  => $cartItem,
                    'unitPrice' => $unitPrice,
                    'fsp'       => $fsp,
                ];
            });

            foreach ($resolvedItems as $item) {
                $subtotal += $item['unitPrice'] * $item['cartItem']->quantity;
            }

            $order = Order::create([
                'user_id'        => $user->id,
                'order_number'   => 'ORD-' . strtoupper(uniqid()),
                'address_id'     => $request->address_id,
                'subtotal'       => $subtotal,
                'tax'            => $cart->tax ?? 0,
                'shipping'       => $cart->shipping ?? 0,
                'total'          => $subtotal + ($cart->tax ?? 0) + ($cart->shipping ?? 0),
                'status'         => 'pending',
                'payment_method' => $request->payment_method ?? 'cod',
            ]);

            foreach ($resolvedItems as $item) {
                $cartItem = $item['cartItem'];
                $unitPrice = $item['unitPrice'];
                $fsp = $item['fsp'];

                OrderItem::create([
                    'order_id'    => $order->id,
                    'product_id'  => $cartItem->product_id,
                    'quantity'    => $cartItem->quantity,
                    'unit_price'  => $unitPrice,
                    'total_price' => $cartItem->quantity * $unitPrice,
                ]);

                // Decrement flash stock separately from main stock
                if ($fsp) {
                    $fsp->increment('sold_count', $cartItem->quantity);
                } else {
                    $cartItem->product->decrement('stock_quantity', $cartItem->quantity);
                }
            }

            // Mark voucher as used
            if ($cart->coupon_code) {
                $coupon = Coupon::where('code', $cart->coupon_code)->first();
                if ($coupon) {
                    UserVoucher::where('user_id', $user->id)
                        ->where('coupon_id', $coupon->id)
                        ->update(['is_used' => true]);
                    $coupon->increment('used_count');
                }
            }

            $cart->items()->delete();
            $cart->update(['subtotal' => 0, 'tax' => 0, 'shipping' => 0, 'discount' => 0, 'total' => 0, 'coupon_code' => null]);
        });

        return redirect()->route('customer.orders.show', $order)->with('success', 'Order placed successfully!');
    }

    public function show(Order $order)
    {
        if ($order->user_id !== Auth::id() && !Auth::user()->hasRole('admin')) {
            abort(403);
        }

        $order->load(['items.product', 'shipment', 'paymentTransaction', 'shippingAddress', 'billingAddress']);

        return Inertia::render('Orders/Show', compact('order'));
    }
}
