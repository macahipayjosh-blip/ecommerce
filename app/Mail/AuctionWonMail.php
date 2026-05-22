<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AuctionWonMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $winner,
        public Product $product,
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🏆 You Won the Auction: ' . $this->product->name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.auction_winner',
        );
    }
}
