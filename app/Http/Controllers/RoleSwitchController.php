<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class RoleSwitchController extends Controller
{
    public function switch(Request $request)
    {
        $user = auth()->user();

        // Ensure user always has the customer role
        if (!$user->hasRole('customer')) {
            $user->assignRole('customer');
        }

        $activeRole = session('active_role', null);
        if (!$activeRole) {
            session(['active_role' => 'customer']);
            $activeRole = 'customer';
        }

        if ($activeRole === 'seller' && $user->hasRole('seller')) {
            session(['active_role' => 'customer']);
            return redirect()->route('dashboard')->with('success', 'Switched to Customer mode.');
        }

        if ($activeRole === 'customer' && $user->hasRole('seller')) {
            session(['active_role' => 'seller']);
            return redirect()->route('seller.dashboard')->with('success', 'Switched to Seller mode.');
        }

        return back()->with('error', 'Cannot switch roles.');
    }
}
