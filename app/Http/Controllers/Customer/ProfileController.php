<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user    = auth()->user()->load('customerProfile');
        $addresses = Address::where('user_id', auth()->id())->get();

        return Inertia::render('Customer/Profile/Index', compact('user', 'addresses'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name'  => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        auth()->user()->update($validated);

        if ($request->hasFile('profile_picture')) {
            $path = $request->file('profile_picture')->store('avatars', 'public');
            auth()->user()->update(['profile_picture' => $path]);
        }

        return back()->with('success', 'Profile updated successfully.');
    }

    public function wishlist()
    {
        $user = auth()->user()->load('customerProfile');
        $wishlistIds = $user->customerProfile?->wishlist ?? [];
        $products = Product::whereIn('id', $wishlistIds)->with(['category', 'brand', 'images', 'reviews'])->get();

        return Inertia::render('Customer/Profile/Wishlist', compact('products'));
    }

    public function toggleWishlist(Product $product)
    {
        $profile = auth()->user()->customerProfile;
        $wishlist = $profile->wishlist ?? [];

        if (in_array($product->id, $wishlist)) {
            $wishlist = array_values(array_diff($wishlist, [$product->id]));
            $message  = 'Removed from favorites.';
        } else {
            $wishlist[] = $product->id;
            $message    = 'Added to favorites.';
        }

        $profile->update(['wishlist' => $wishlist]);

        return back()->with('success', $message);
    }

    public function addresses()
    {
        $addresses = Address::where('user_id', auth()->id())->get();
        $user = auth()->user()->load('customerProfile');
        return Inertia::render('Customer/Profile/Addresses', compact('addresses', 'user'));
    }

    public function storeAddress(Request $request)
    {
        $validated = $request->validate([
            'type'          => 'required|in:shipping,billing',
            'full_name'     => 'required|string|max:255',
            'phone'         => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'required|string|max:100',
            'state'         => 'required|string|max:100',
            'postal_code'   => 'required|string|max:20',
            'country'       => 'required|string|max:100',
            'is_default'    => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();

        if (!empty($validated['is_default'])) {
            Address::where('user_id', auth()->id())->where('type', $validated['type'])->update(['is_default' => false]);
        }

        Address::create($validated);

        return back()->with('success', 'Address added successfully.');
    }

    public function updateAddress(Request $request, Address $address)
    {
        abort_if($address->user_id !== auth()->id(), 403);

        $validated = $request->validate([
            'full_name'     => 'required|string|max:255',
            'phone'         => 'required|string|max:20',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'city'          => 'required|string|max:100',
            'state'         => 'required|string|max:100',
            'postal_code'   => 'required|string|max:20',
            'country'       => 'required|string|max:100',
            'is_default'    => 'boolean',
        ]);

        if (!empty($validated['is_default'])) {
            Address::where('user_id', auth()->id())->where('type', $address->type)->update(['is_default' => false]);
        }

        $address->update($validated);

        return back()->with('success', 'Address updated successfully.');
    }

    public function destroyAddress(Address $address)
    {
        abort_if($address->user_id !== auth()->id(), 403);
        $address->delete();

        return back()->with('success', 'Address deleted.');
    }
}
