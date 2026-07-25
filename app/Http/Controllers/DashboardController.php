<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Dashboards\CustomerDashboardController;
use App\Http\Controllers\Dashboards\SellerDashboardController;
use App\Http\Controllers\Dashboards\AdminDashboardController;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Admin/super_admin always go to admin dashboard
        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            return app(AdminDashboardController::class)->index();
        }

        // For users with both customer+seller roles, use session active_role.
        // Default to customer when no active role is present so the first login lands on buyer view.
        $activeRole = session('active_role', null);

        // Seller/vendor always go to seller dashboard
        if ($user->hasRole('seller') || $user->hasRole('vendor')) {
            return redirect()->route('seller.dashboard');
        }

        if ($user->hasRole('customer')) {
            if (!$activeRole) {
                session(['active_role' => 'customer']);
            }
            return app(CustomerDashboardController::class)->index();
        }

        return redirect()->route('home');
    }
}
