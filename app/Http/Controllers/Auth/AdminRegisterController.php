<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class AdminRegisterController extends Controller
{
    /**
     * Show the admin registration form.
     * The token in the URL must match ADMIN_REGISTER_TOKEN in .env.
     */
    public function create(string $token): Response|RedirectResponse
    {
        if (! $this->validToken($token)) {
            abort(403, 'Invalid or missing registration token.');
        }

        return Inertia::render('auth/admin-register', ['token' => $token]);
    }

    public function store(Request $request, string $token): RedirectResponse
    {
        if (! $this->validToken($token)) {
            abort(403, 'Invalid or missing registration token.');
        }

        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'email'      => 'required|email|lowercase|max:255|unique:users,email',
            'password'   => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name'     => trim($request->first_name . ' ' . $request->last_name),
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'admin',
        ]);

        \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $user->assignRole('admin');

        return redirect()->route('login')
            ->with('status', 'Admin account created. You may now log in.');
    }

    private function validToken(string $token): bool
    {
        $secret = $_ENV['ADMIN_REGISTER_TOKEN']
            ?? $_SERVER['ADMIN_REGISTER_TOKEN']
            ?? env('ADMIN_REGISTER_TOKEN');
        return $secret && hash_equals($secret, $token);
    }
}
