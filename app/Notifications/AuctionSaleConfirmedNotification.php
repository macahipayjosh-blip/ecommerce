<?php

namespace App\Notifications;

use App\Mail\AuctionWonMail;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class AuctionSaleConfirmedNotification extends Notification
{
    use Queueable;

    public function __construct(public Product $product, public Order $order, public string $role)
    {
    }

    public function via($notifiable): array
    {
        return $this->role === 'winner' ? ['database', 'mail'] : ['database'];
    }

    public function toMail($notifiable)
    {
        return new AuctionWonMail($notifiable, $this->product, $this->order);
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'auction_sale_confirmed',
            'product_id' => $this->product->id,
            'product_name' => $this->product->name,
            'order_id' => $this->order->id,
            'role' => $this->role,
            'message' => $this->role === 'winner'
                ? "Congratulations! You won the auction and your order #{$this->order->order_number} has been created."
                : "Your auction sold successfully. Order #{$this->order->order_number} has been confirmed.",
        ];
    }
}
