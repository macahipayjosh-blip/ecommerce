<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load(['roles', 'customerProfile', 'sellerProfile']);
        $role = $user->getRoleNames()->first();

        $profileAddress = Address::where('user_id', $user->id)
            ->where('is_profile_address', true)
            ->first();

        $stats = [];
        if ($role === 'customer') {
            $stats = [
                'total_orders'   => $user->orders()->count(),
                'total_spent'    => (float) ($user->customerProfile?->total_spent ?? 0),
                'loyalty_points' => $user->customerProfile?->loyalty_points ?? 0,
                'wishlist_count' => count($user->customerProfile?->wishlist ?? []),
            ];
        } elseif (in_array($role, ['seller', 'vendor'])) {
            $stats = [
                'total_products' => \App\Models\Product::where('vendor_id', $user->id)->count(),
                'total_orders'   => \App\Models\Order::where('vendor_id', $user->id)->count(),
                'balance'        => (float) ($user->sellerProfile?->balance ?? 0),
                'store_name'     => $user->sellerProfile?->store_name ?? '',
            ];
        } elseif (in_array($role, ['admin'])) {
            $stats = [
                'total_users'    => \App\Models\User::count(),
                'total_orders'   => \App\Models\Order::count(),
                'total_products' => \App\Models\Product::count(),
                'total_revenue'  => (float) \App\Models\Order::whereIn('status', ['delivered', 'shipped'])->sum('total'),
            ];
        }

        return Inertia::render('Profile', [
            'user' => [
                'id'                => $user->id,
                'name'              => $user->name,
                'first_name'        => $user->first_name,
                'last_name'         => $user->last_name,
                'middle_name'       => $user->middle_name,
                'date_of_birth'     => $user->date_of_birth,
                'gender'            => $user->gender,
                'email'             => $user->email,
                'phone'             => $user->phone,
                'profile_picture'   => $user->profile_picture,
                'is_verified'       => $user->is_verified,
                'is_active'         => $user->is_active,
                'email_verified_at' => $user->email_verified_at?->toDateString(),
                'created_at'        => $user->created_at->toDateString(),
                'roles'             => $user->getRoleNames(),
            ],
            'profileAddress' => $profileAddress,
            'stats'          => $stats,
            'status'         => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'first_name'    => ['nullable', 'string', 'max:100'],
            'last_name'     => ['nullable', 'string', 'max:100'],
            'middle_name'   => ['nullable', 'string', 'max:100'],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender'        => ['nullable', 'in:male,female,other,prefer_not_to_say'],
            'email'         => ['required', 'email', 'max:255', 'unique:users,email,' . $request->user()->id],
            'phone'         => ['nullable', 'string', 'max:20'],
        ]);

        $user = $request->user();

        // Sync full name from first + last
        if (!empty($validated['first_name']) || !empty($validated['last_name'])) {
            $validated['name'] = trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? ''));
        }

        if (isset($validated['email']) && $validated['email'] !== $user->email) {
            $user->email_verified_at = null;
        }

        $user->update($validated);

        return back()->with('status', 'Profile updated successfully.');
    }

    public function updateAddress(Request $request)
    {
        $validated = $request->validate([
            'address_line1' => ['required', 'string', 'max:255'],
            'address_line2' => ['nullable', 'string', 'max:255'],
            'city'          => ['required', 'string', 'max:100'],
            'state'         => ['required', 'string', 'max:100'],
            'postal_code'   => ['required', 'string', 'max:20'],
            'country'       => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user();

        Address::updateOrCreate(
            ['user_id' => $user->id, 'is_profile_address' => true],
            array_merge($validated, [
                'user_id'            => $user->id,
                'type'               => 'shipping',
                'full_name'          => $user->name,
                'phone'              => $user->phone ?? '',
                'is_profile_address' => true,
            ])
        );

        return back()->with('status', 'Address updated successfully.');
    }

    public function updateAvatar(Request $request)
    {
        $request->validate(['avatar' => ['required', 'image', 'max:2048']]);

        $user = $request->user();

        if ($user->profile_picture) {
            Storage::disk('public')->delete($user->profile_picture);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['profile_picture' => $path]);

        return back()->with('status', 'Avatar updated.');
    }
}
