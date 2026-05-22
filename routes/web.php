<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\OrderManagementController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\ActivityController;
use App\Http\Controllers\Admin\RiderManagementController;
use App\Http\Controllers\Auth\RiderRegisterController;
use App\Http\Controllers\Admin\PaymentMonitoringController;
use App\Http\Controllers\Admin\ReturnManagementController;
use App\Http\Controllers\Admin\ReportsController;
use App\Http\Controllers\Admin\FlashSaleController;
use App\Http\Controllers\Seller\ProductManagementController;
use App\Http\Controllers\Seller\SellerOrderController;
use App\Http\Controllers\Seller\SellerDashboardController;
use App\Http\Controllers\Customer\VoucherController;
use App\Http\Controllers\Customer\CustomerOrderController;
use App\Http\Controllers\Customer\ProfileController as CustomerProfileController;
use App\Http\Controllers\Rider\RiderController;
use App\Http\Controllers\ProfileController as SharedProfileController;
use App\Http\Controllers\RoleSwitchController;
use App\Http\Controllers\SellerApplicationController;

Route::get('/', [\App\Http\Controllers\ProductController::class, 'welcome'])->name('home');

Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');
    Route::get('/auctions/{product}', [\App\Http\Controllers\AuctionController::class, 'show'])->name('auctions.show');
Route::middleware('auth')->post('/auctions/{product}/bid', [\App\Http\Controllers\AuctionController::class, 'placeBid'])->name('auctions.bid');
Route::get('/auctions/{product}/bid', fn($product) => redirect()->route('auctions.show', $product));

Route::middleware('auth')->group(function () {

    // ─── Role Switch ──────────────────────────────────────────────────────────
    Route::post('role/switch', [RoleSwitchController::class, 'switch'])->name('role.switch');

    // ─── Seller Application ───────────────────────────────────────────────────
    Route::get('seller-application', [SellerApplicationController::class, 'create'])->name('seller.application.create');
    Route::post('seller-application', [SellerApplicationController::class, 'store'])->name('seller.application.store');

    // ─── Shared Dashboard (role-based redirect) ───────────────────────────────
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ─── Shared Profile (all roles) ──────────────────────────────────────────
    Route::get('profile', [SharedProfileController::class, 'show'])->name('profile.show');
    Route::patch('profile', [SharedProfileController::class, 'update'])->name('profile.save');
    Route::patch('profile/address', [SharedProfileController::class, 'updateAddress'])->name('profile.address');
    Route::post('profile/avatar', [SharedProfileController::class, 'updateAvatar'])->name('profile.avatar');

    // ─── Public Product Browsing (all authenticated users) ───────────────────
    Route::get('products', [ProductController::class, 'index'])->name('products.index');

    // ─── Cart (customers) ─────────────────────────────────────────────────────
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('add', [CartController::class, 'add'])->name('add');
        Route::patch('update', [CartController::class, 'update'])->name('update');
        Route::delete('{cartItem}', [CartController::class, 'remove'])->name('remove');
        Route::post('coupon', [CartController::class, 'applyCoupon'])->name('coupon');
    });

    // ─── Customer Routes ──────────────────────────────────────────────────────
    Route::middleware('role:customer')->prefix('customer')->name('customer.')->group(function () {
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::get('products/{product}', [ProductController::class, 'show'])->name('products.show');
        Route::get('cart', [CartController::class, 'index'])->name('cart.index');
        Route::post('cart/add', [CartController::class, 'add'])->name('cart.add');
        Route::patch('cart/update', [CartController::class, 'update'])->name('cart.update');
        Route::delete('cart/{cartItem}', [CartController::class, 'remove'])->name('cart.remove');
        Route::post('cart/coupon', [CartController::class, 'applyCoupon'])->name('cart.coupon');
        Route::get('vouchers', [VoucherController::class, 'index'])->name('vouchers.index');
        Route::post('vouchers/claim', [VoucherController::class, 'claim'])->name('vouchers.claim');
        Route::get('orders', [CustomerOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');
        Route::post('orders', [CustomerOrderController::class, 'store'])->name('orders.store');
        Route::patch('orders/{order}/cancel', [CustomerOrderController::class, 'cancel'])->name('orders.cancel');
        Route::post('orders/{order}/return', [CustomerOrderController::class, 'requestReturn'])->name('orders.return');
        Route::post('orders/{order}/review', [CustomerOrderController::class, 'storeReview'])->name('orders.review');
        Route::get('orders/{order}/invoice', [CustomerOrderController::class, 'invoice'])->name('orders.invoice');
        Route::post('orders/{order}/message', [CustomerOrderController::class, 'sendMessage'])->name('orders.message');
        Route::post('auctions/{product}/bid', [\App\Http\Controllers\AuctionController::class, 'placeBid'])->name('auctions.bid');
        Route::get('profile', [CustomerProfileController::class, 'index'])->name('profile.index');
        Route::patch('profile', [CustomerProfileController::class, 'update'])->name('profile.patch');
        Route::get('wishlist', [CustomerProfileController::class, 'wishlist'])->name('wishlist');
        Route::post('wishlist/{product}', [CustomerProfileController::class, 'toggleWishlist'])->name('wishlist.toggle');
        Route::get('addresses', [CustomerProfileController::class, 'addresses'])->name('addresses');
        Route::post('addresses', [CustomerProfileController::class, 'storeAddress'])->name('addresses.store');
        Route::patch('addresses/{address}', [CustomerProfileController::class, 'updateAddress'])->name('addresses.update');
        Route::delete('addresses/{address}', [CustomerProfileController::class, 'destroyAddress'])->name('addresses.destroy');
    });

    // ─── Seller Routes ────────────────────────────────────────────────────────
    Route::middleware('role:seller|vendor')->prefix('seller')->name('seller.')->group(function () {
        // Dashboard
        Route::get('dashboard', [SellerDashboardController::class, 'dashboard'])->name('dashboard');

        // Products
        Route::get('products', [ProductManagementController::class, 'index'])->name('products.index');
        Route::get('products/create', [ProductManagementController::class, 'create'])->name('products.create');
        Route::get('auctions', [\App\Http\Controllers\Seller\AuctionController::class, 'index'])->name('auctions.index');
        Route::get('auctions/create', [\App\Http\Controllers\Seller\AuctionController::class, 'create'])->name('auctions.create');
        Route::post('auctions', [\App\Http\Controllers\Seller\AuctionController::class, 'store'])->name('auctions.store');
        Route::get('auctions/{auction}', [\App\Http\Controllers\Seller\AuctionController::class, 'show'])->name('auctions.show');
        Route::get('auctions/{auction}/edit', [\App\Http\Controllers\Seller\AuctionController::class, 'edit'])->name('auctions.edit');
        Route::put('auctions/{auction}', [\App\Http\Controllers\Seller\AuctionController::class, 'update'])->name('auctions.update');
        Route::delete('auctions/{auction}', [\App\Http\Controllers\Seller\AuctionController::class, 'destroy'])->name('auctions.destroy');
        Route::post('products', [ProductManagementController::class, 'store'])->name('products.store');
        Route::get('products/{product}', [ProductManagementController::class, 'show'])->name('products.show');
        Route::get('products/{product}/edit', [ProductManagementController::class, 'edit'])->name('products.edit');
        Route::put('products/{product}', [ProductManagementController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductManagementController::class, 'destroy'])->name('products.destroy');
        Route::delete('products/{product}/images/{image}', [ProductManagementController::class, 'deleteImage'])->name('products.images.destroy');

        // Orders
        Route::get('orders', [SellerOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [SellerOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [SellerOrderController::class, 'updateStatus'])->name('orders.status');

        // Inventory
        Route::get('inventory', [SellerDashboardController::class, 'inventory'])->name('inventory.index');
        Route::patch('inventory/{product}/stock', [SellerDashboardController::class, 'updateStock'])->name('inventory.stock');
        Route::get('inventory/{product}/logs', [SellerDashboardController::class, 'inventoryLogs'])->name('inventory.logs');

        // Reviews
        Route::get('reviews', [SellerDashboardController::class, 'reviews'])->name('reviews.index');

        // Promotions
        Route::get('promotions', [SellerDashboardController::class, 'promotions'])->name('promotions.index');
        Route::get('promotions/create', [SellerDashboardController::class, 'createPromotion'])->name('promotions.create');
        Route::post('promotions', [SellerDashboardController::class, 'storePromotion'])->name('promotions.store');
        Route::get('promotions/{coupon}/edit', [SellerDashboardController::class, 'editPromotion'])->name('promotions.edit');
        Route::put('promotions/{coupon}', [SellerDashboardController::class, 'updatePromotion'])->name('promotions.update');
        Route::patch('promotions/{coupon}/toggle', [SellerDashboardController::class, 'togglePromotion'])->name('promotions.toggle');
        Route::delete('promotions/{coupon}', [SellerDashboardController::class, 'destroyPromotion'])->name('promotions.destroy');

        // Profile
        Route::get('profile', [SellerDashboardController::class, 'profile'])->name('profile.index');
        Route::patch('profile', [SellerDashboardController::class, 'updateProfile'])->name('profile.update');

        // Returns
        Route::get('returns', [SellerDashboardController::class, 'returns'])->name('returns.index');
        Route::patch('returns/{order}/process', [SellerDashboardController::class, 'processReturn'])->name('returns.process');

        // Performance
        Route::get('performance', [SellerDashboardController::class, 'performance'])->name('performance.index');

        // Analytics & Payouts (legacy)
        Route::get('analytics', [SellerOrderController::class, 'analytics'])->name('analytics');
        Route::get('payouts', [SellerOrderController::class, 'payouts'])->name('payouts');
    });

    // ─── Admin Routes ─────────────────────────────────────────────────────────
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        // Users
        Route::get('users', [UserManagementController::class, 'index'])->name('users.index');
        Route::get('users/{user}', [UserManagementController::class, 'show'])->name('users.show');
        Route::patch('users/{user}/role', [UserManagementController::class, 'updateRole'])->name('users.role');
        Route::patch('users/{user}/status', [UserManagementController::class, 'toggleStatus'])->name('users.status');
        Route::delete('users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');

        // Orders
        Route::get('orders', [OrderManagementController::class, 'index'])->name('orders.index');
        Route::get('orders/{order}', [OrderManagementController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [OrderManagementController::class, 'updateStatus'])->name('orders.status');
        Route::post('orders/{order}/refund', [OrderManagementController::class, 'refund'])->name('orders.refund');

        // Products
        Route::get('products', [ProductController::class, 'adminIndex'])->name('products.index');
        Route::get('products/{product}/show', [ProductController::class, 'adminShow'])->name('products.show');
        Route::resource('products', ProductController::class)->except(['index', 'show']);
        Route::delete('products/{product}/images/{image}', [ProductController::class, 'destroyImage'])->name('products.images.destroy');

        // Auctions
        Route::get('auctions', [\App\Http\Controllers\Admin\AuctionManagementController::class, 'index'])->name('auctions.index');
        Route::get('auctions/{product}', [\App\Http\Controllers\Admin\AuctionManagementController::class, 'show'])->name('auctions.show');
        Route::patch('auctions/{product}', [\App\Http\Controllers\Admin\AuctionManagementController::class, 'update'])->name('auctions.update');
        Route::delete('auctions/{product}', [\App\Http\Controllers\Admin\AuctionManagementController::class, 'destroy'])->name('auctions.destroy');

        // Categories
        Route::resource('categories', CategoryController::class);

        // Brands
        Route::resource('brands', BrandController::class);

        // Coupons
        Route::resource('coupons', CouponController::class);

        // Settings
        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::post('settings', [SettingsController::class, 'update'])->name('settings.update');

        // Activity Logs
        Route::get('activity', [ActivityController::class, 'index'])->name('activity.index');

        // Riders
        Route::get('riders', [RiderManagementController::class, 'index'])->name('riders.index');
        Route::post('riders/{user}/approve', [RiderRegisterController::class, 'approve'])->name('riders.approve');
        Route::post('riders/{user}/decline', [RiderRegisterController::class, 'decline'])->name('riders.decline');

        // Payments
        Route::get('payments', [PaymentMonitoringController::class, 'index'])->name('payments.index');

        // Returns
        Route::get('returns', [ReturnManagementController::class, 'index'])->name('returns.index');

        // Seller Applications
        Route::get('seller-applications', [SellerApplicationController::class, 'index'])->name('seller-applications.index');
        Route::get('seller-applications/{sellerApplication}', [SellerApplicationController::class, 'show'])->name('seller-applications.show');
        Route::post('seller-applications/{sellerApplication}/approve', [SellerApplicationController::class, 'approve'])->name('seller-applications.approve');
        Route::post('seller-applications/{sellerApplication}/decline', [SellerApplicationController::class, 'decline'])->name('seller-applications.decline');

        // Flash Sales
        Route::resource('flash-sales', FlashSaleController::class);

        // Reports
        Route::get('reports', [ReportsController::class, 'index'])->name('reports.index');
    });

    // ─── Rider Routes ─────────────────────────────────────────────────────────
    Route::middleware('role:rider')->prefix('rider')->name('rider.')->group(function () {
        Route::get('dashboard',                          [RiderController::class, 'dashboard'])->name('dashboard');
        Route::get('pickup',                             [RiderController::class, 'pickup'])->name('pickup');
        Route::patch('pickup/{order}/confirm',           [RiderController::class, 'confirmPickup'])->name('pickup.confirm');
        Route::get('pickup/{order}/confirm',             fn() => redirect()->route('rider.pickup'));
        Route::get('handling',                           [RiderController::class, 'handling'])->name('handling');
        Route::patch('handling/{order}',                 [RiderController::class, 'updateHandling'])->name('handling.update');
        Route::get('navigation',                         [RiderController::class, 'navigation'])->name('navigation');
        Route::patch('navigation/{order}/deliver',       [RiderController::class, 'markDelivered'])->name('navigation.deliver');
        Route::get('app-interaction',                    [RiderController::class, 'appInteraction'])->name('app-interaction');
        Route::patch('app-interaction/{order}',          [RiderController::class, 'updateStatus'])->name('app-interaction.update');
        Route::get('communication',                      [RiderController::class, 'communication'])->name('communication');
        Route::post('communication/{order}/message',      [RiderController::class, 'sendMessage'])->name('communication.message');
        Route::get('payment',                            [RiderController::class, 'payment'])->name('payment');
        Route::patch('payment/{order}/collect',          [RiderController::class, 'collectPayment'])->name('payment.collect');
        Route::get('proof',                              [RiderController::class, 'proof'])->name('proof');
        Route::post('proof/{order}/upload',              [RiderController::class, 'uploadProof'])->name('proof.upload');
        Route::get('time',                               [RiderController::class, 'timeManagement'])->name('time');
        Route::get('vehicle',                            [RiderController::class, 'vehicle'])->name('vehicle');
        Route::post('vehicle/checklist',                 [RiderController::class, 'saveChecklist'])->name('vehicle.checklist');
        Route::get('compliance',                         [RiderController::class, 'compliance'])->name('compliance');
        Route::get('returns',                            [RiderController::class, 'returns'])->name('returns');
        Route::patch('returns/{order}/submit',           [RiderController::class, 'submitReturn'])->name('returns.submit');
        Route::get('performance',                        [RiderController::class, 'performance'])->name('performance');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
