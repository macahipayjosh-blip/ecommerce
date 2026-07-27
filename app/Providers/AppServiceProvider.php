<?php

namespace App\Providers;

use App\Models\Product;
use App\Models\ProductMessage;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        if (app()->environment('production')) {
            URL::forceScheme('https');
            URL::forceRootUrl(config('app.url'));
            $this->app['request']->server->set('HTTPS', 'on');
        }

        \Illuminate\Support\Facades\Gate::policy(\App\Models\Order::class, \App\Policies\OrderPolicy::class);

        // Share unread message count for sellers
        Inertia::share('unreadMessages', function () {
            $user = auth()->user();
            if (!$user || !$user->hasAnyRole(['seller', 'vendor'])) return 0;

            $productIds = Product::where('vendor_id', $user->id)->pluck('id');

            return ProductMessage::whereIn('product_id', $productIds)
                ->where('receiver_id', $user->id)
                ->whereNull('read_at')
                ->count();
        });
    }
}
