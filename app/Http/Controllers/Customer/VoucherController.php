<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\UserVoucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VoucherController extends Controller
{
    public function index()
    {
        $userId = Auth::id();

        $claimedIds = UserVoucher::where('user_id', $userId)->pluck('coupon_id');

        $available = Coupon::where('active', true)
            ->where(fn($q) => $q->whereNull('valid_to')->orWhere('valid_to', '>=', now()))
            ->where(fn($q) => $q->whereNull('valid_from')->orWhere('valid_from', '<=', now()))
            ->where(fn($q) => $q->whereNull('claim_limit')->orWhereColumn('claimed_count', '<', 'claim_limit'))
            ->whereNotIn('id', $claimedIds)
            ->where(fn($q) => $q->whereNull('vendor_id')->orWhere('vendor_id', '!=', $userId))
            ->get(['id', 'code', 'type', 'value', 'min_order_amount', 'valid_to', 'claim_limit', 'claimed_count']);

        $claimed = UserVoucher::with('coupon')
            ->where('user_id', $userId)
            ->get()
            ->map(fn($uv) => [
                'id'               => $uv->coupon->id,
                'code'             => $uv->coupon->code,
                'type'             => $uv->coupon->type,
                'value'            => $uv->coupon->value,
                'min_order_amount' => $uv->coupon->min_order_amount,
                'valid_to'         => $uv->coupon->valid_to,
                'is_used'          => $uv->is_used,
                'is_expired'       => $uv->coupon->valid_to && now()->gt($uv->coupon->valid_to),
            ]);

        return Inertia::render('Customer/Vouchers/Index', compact('available', 'claimed'));
    }

    public function claim(Request $request)
    {
        $request->validate(['coupon_id' => 'required|exists:coupons,id']);

        $userId = Auth::id();
        $coupon = Coupon::findOrFail($request->coupon_id);

        if (!$coupon->active) {
            return back()->with('error', 'This voucher is not available.');
        }
        if ($coupon->valid_to && now()->gt($coupon->valid_to)) {
            return back()->with('error', 'This voucher has expired.');
        }
        if ($coupon->claim_limit && $coupon->claimed_count >= $coupon->claim_limit) {
            return back()->with('error', 'This voucher is fully claimed.');
        }
        if ($coupon->vendor_id && $coupon->vendor_id === $userId) {
            return back()->with('error', 'You cannot claim your own voucher.');
        }
        if (UserVoucher::where('user_id', $userId)->where('coupon_id', $coupon->id)->exists()) {
            return back()->with('error', 'You have already claimed this voucher.');
        }

        UserVoucher::create(['user_id' => $userId, 'coupon_id' => $coupon->id]);
        $coupon->increment('claimed_count');

        return back()->with('success', 'Voucher claimed! You can use it in your cart.');
    }
}
