<?php

namespace App\Notifications;

use App\Models\AuctionBid;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionBidPlacedNotification extends Notification
{
    use Queueable;

    public function __construct(public Product $product, public AuctionBid $bid)
    {
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'auction_bid_placed',
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'bid_amount' => (string) $this->bid->amount,
            'bidder_id' => $this->bid->user_id,
            'message' => "A new bid of ₱{$this->bid->amount} was placed on your auction.",
        ];
    }
}
