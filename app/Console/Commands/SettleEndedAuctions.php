<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\User;
use App\Services\AuctionService;
use Illuminate\Console\Command;

class SettleEndedAuctions extends Command
{
    protected $signature = 'auctions:settle';
    protected $description = 'Settle all auctions whose end time has passed';

    public function handle(AuctionService $auctionService): void
    {
        $admin = User::role('admin')->first();

        $ended = Product::where('is_auction', true)
            ->whereIn('auction_status', ['live', 'pending', 'ended'])
            ->where('auction_end_at', '<=', now())
            ->get();

        if ($ended->isEmpty()) {
            $this->info('No auctions to settle.');
            return;
        }

        foreach ($ended as $product) {
            try {
                $order = $auctionService->settleAuction($product, $admin);
                if ($order) {
                    $this->info("Settled #{$product->id} '{$product->name}' — Order {$order->order_number} created.");
                } else {
                    $this->info("Settled #{$product->id} '{$product->name}' — No winner.");
                }
            } catch (\Throwable $e) {
                $this->error("Failed #{$product->id}: {$e->getMessage()}");
            }
        }
    }
}
