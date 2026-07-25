<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Models\User;
use App\Notifications\AuctionAssignedToRiderNotification;
use Illuminate\Console\Command;

class AutoProgressAuctionOrders extends Command
{
    protected $signature = 'auction:progress-orders';
    protected $description = 'Automatically progress auction orders through delivery stages';

    public function handle()
    {
        $progressCount = 0;

        // Progress auction orders that are old enough for the next stage
        Order::where('payment_method', 'auction')
            ->whereIn('status', ['confirmed', 'shipped'])
            ->chunk(50, function ($orders) use (&$progressCount) {
                foreach ($orders as $order) {
                    $minutesSinceCreated = now()->diffInMinutes($order->created_at);
                    $minutesSinceUpdated = now()->diffInMinutes($order->updated_at);

                    // confirmed → shipped (after 2 minutes, assign rider if none)
                    if ($order->status === 'confirmed' && $minutesSinceCreated >= 2) {
                        if (!$order->rider_id) {
                            $rider = User::role('rider')->where('is_active', true)->inRandomOrder()->first();
                            if ($rider) {
                                $order->rider_id = $rider->id;
                                try {
                                    $rider->notify(new AuctionAssignedToRiderNotification($order));
                                } catch (\Throwable $e) {
                                    report($e);
                                }
                            }
                        }
                        $order->status = 'shipped';
                        $order->save();
                        $progressCount++;
                        $this->info("Order #{$order->order_number}: confirmed → shipped");
                    }
                    
                    // shipped → delivered (after 4 more minutes)
                    elseif ($order->status === 'shipped' && $minutesSinceCreated >= 6) {
                        $order->status = 'delivered';
                        $order->delivered_at = now();
                        $order->save();
                        $progressCount++;
                        $this->info("Order #{$order->order_number}: shipped → delivered");
                    }
                }
            });

        $this->info("Progressed {$progressCount} auction orders.");
        return 0;
    }
}