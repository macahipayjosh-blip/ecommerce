<?php

namespace App\Notifications;

use App\Models\Product;
use App\Models\AuctionBid;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionOutbidNotification extends Notification
{
    use Queueable;

    public function __construct(public Product $product, public AuctionBid $newHighestBid)
    {
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'auction_outbid',
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'new_highest_bid' => (string) $this->newHighestBid->amount,
            'message' => "Your bid was outbid. Current highest bid is ₱{$this->newHighestBid->amount}.",
        ];
    }
}
