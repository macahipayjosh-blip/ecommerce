<?php

namespace App\Services;

use App\Models\AuctionBid;
use App\Models\AuctionDispute;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Notifications\AuctionBidPlacedNotification;
use App\Notifications\AuctionOutbidNotification;
use App\Notifications\AuctionSaleConfirmedNotification;
use App\Notifications\AuctionAssignedToRiderNotification;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class AuctionService
{
    public const MIN_BID_INCREMENT = 1;
    public const AUCTION_FEE_RATE = 0.08; // 8% fee by default

    public function placeBid(Product $product, User $user, float $amount, ?float $maxProxyAmount = null): AuctionBid
    {
        if (!$product->is_auction) {
            throw new \InvalidArgumentException('Product is not listed for auction.');
        }

        $now = now();
        if (!$product->auction_end_at || $now->gt($product->auction_end_at) || $product->auction_status === 'ended' || $product->auction_status === 'settled') {
            throw new \InvalidArgumentException('Auction is not currently active.');
        }

        if ($product->vendor_id === $user->id) {
            throw new \InvalidArgumentException('Sellers cannot bid on their own auction.');
        }

        $highestBid = $product->bids()->orderByDesc('amount')->first();
        $minimum = max($product->reserve_price ?? 0, $highestBid?->amount ?? 0) + self::MIN_BID_INCREMENT;

        if ($amount < $minimum) {
            throw new \InvalidArgumentException("Bid must be at least ₱{$minimum}.");
        }

        $bid = AuctionBid::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'amount' => $amount,
            'max_proxy_amount' => $maxProxyAmount,
            'is_proxy' => filled($maxProxyAmount),
        ]);

        $newBid = $this->resolveProxyBids($product, $bid);

        if ($highestBid && $highestBid->user_id !== $newBid->user_id) {
            $highestBid->user->notify(new AuctionOutbidNotification($product, $newBid));
        }

        $product->auction_status = 'live';
        $minutesLeft = $now->diffInMinutes($product->auction_end_at, false);
        if ($minutesLeft <= 5) {
            $product->auction_end_at = $product->auction_end_at->addMinutes(5);
        }
        $product->save();

        $vendor = $product->vendor ?? \App\Models\User::find($product->vendor_id);
        if ($vendor) {
            $vendor->notify(new AuctionBidPlacedNotification($product, $newBid));
        }

        return $newBid;
    }

    public function settleAuction(Product $product, User $admin): ?Order
    {
        if (!$product->is_auction) {
            throw new \InvalidArgumentException('Product is not an auction.');
        }

        if (!$product->auction_end_at || now()->lt($product->auction_end_at)) {
            throw new \InvalidArgumentException('Auction has not ended yet.');
        }

        if ($product->auction_status === 'settled') {
            throw new \InvalidArgumentException('Auction has already been settled.');
        }

        $highestBid = $product->bids()->orderByDesc('amount')->first();
        $product->auction_status = 'ended';
        $product->save();

        if (!$highestBid || ($product->reserve_price !== null && $highestBid->amount < $product->reserve_price)) {
            $product->auction_status = 'settled';
            $product->save();
            return null;
        }

        $winner = $highestBid->user;
        $address = $winner->addresses()->where('is_default', true)->first() ?? $winner->addresses()->first();

        if (!$address) {
            throw new \InvalidArgumentException('Winning bidder has no shipping address.');
        }

        return DB::transaction(function () use ($product, $highestBid, $winner, $address, $admin) {
            $order = Order::create([
                'user_id' => $winner->id,
                'vendor_id' => $product->vendor_id,
                'order_number' => 'AUCTION-' . strtoupper(Str::random(8)),
                'address_id' => $address->id,
                'subtotal' => $highestBid->amount,
                'tax' => 0,
                'shipping' => 0,
                'auction_fee' => round($highestBid->amount * self::AUCTION_FEE_RATE, 2),
                'total' => $highestBid->amount + round($highestBid->amount * self::AUCTION_FEE_RATE, 2),
                'status' => 'confirmed',
                'payment_method' => 'auction',
            ]);

            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $product->id,
                'quantity' => 1,
                'unit_price' => $highestBid->amount,
                'total_price' => $highestBid->amount,
            ]);

            if ($product->stock_quantity > 0) {
                $product->decrement('stock_quantity');
            }

            $product->status = 'inactive';
            $product->auction_status = 'settled';
            $product->save();

            $rider = User::role('rider')->where('is_active', true)->first();
            if ($rider) {
                $order->rider_id = $rider->id;
                $order->save();
                $rider->notify(new AuctionAssignedToRiderNotification($order));
            }

            $winner->notify(new AuctionSaleConfirmedNotification($product, $order, 'winner'));
            $product->vendor->notify(new AuctionSaleConfirmedNotification($product, $order, 'seller'));

            return $order;
        });
    }

    protected function resolveProxyBids(Product $product, AuctionBid $incomingBid): AuctionBid
    {
        $bids = $product->bids()->get()->groupBy('user_id')->map(function ($group) {
            return [
                'user_id' => $group->first()->user_id,
                'max_bid' => $group->flatMap(fn ($bid) => [$bid->max_proxy_amount, $bid->amount])->filter()->max(),
                'latest' => $group->sortByDesc('created_at')->first(),
            ];
        })->sortByDesc('max_bid');

        if ($bids->count() < 2) {
            return $product->bids()->orderByDesc('amount')->first();
        }

        $top = $bids->values()[0];
        $second = $bids->values()[1];
        $targetAmount = min($top['max_bid'], $second['max_bid'] + self::MIN_BID_INCREMENT);

        if ($top['latest']->amount < $targetAmount) {
            $bid = AuctionBid::create([
                'product_id' => $product->id,
                'user_id' => $top['user_id'],
                'amount' => $targetAmount,
                'max_proxy_amount' => $top['max_bid'],
                'is_proxy' => true,
            ]);
            return $bid;
        }

        return $product->bids()->orderByDesc('amount')->first();
    }
}
