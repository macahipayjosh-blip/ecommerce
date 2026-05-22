<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class AuctionAssignedToRiderNotification extends Notification
{
    use Queueable;

    public function __construct(public Order $order)
    {
    }

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'auction_assigned_to_rider',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'product_count' => $this->order->items()->count(),
            'message' => "You have been assigned a transport task for order #{$this->order->order_number}.",
        ];
    }
}
