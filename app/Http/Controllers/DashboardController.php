<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Dashboards\CustomerDashboardController;
use App\Http\Controllers\Dashboards\AdminDashboardController;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            return app(AdminDashboardController::class)->index();
        }

        if ($user->hasRole('seller') || $user->hasRole('vendor')) {
            return redirect()->route('seller.dashboard');
        }

        if ($user->hasRole('customer')) {
            session(['active_role' => 'customer']);
            return app(CustomerDashboardController::class)->index();
        }

        return redirect()->route('home');
    }
}
