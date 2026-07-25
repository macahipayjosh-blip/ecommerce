<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\PasswordOtpMail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OtpController extends Controller
{
    public function send(Request $request): RedirectResponse
    {
        $request->validate(['email' => 'required|email|exists:users,email']);

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_otps')->where('email', $request->email)->delete();
        DB::table('password_otps')->insert([
            'email'      => $request->email,
            'otp'        => bcrypt($otp),
            'expires_at' => now()->addMinutes(10),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Mail::to($request->email)->send(new PasswordOtpMail($otp));

        return back()->with('otp_sent', true)->with('otp_email', $request->email);
    }

    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ]);

        $record = DB::table('password_otps')
            ->where('email', $request->email)
            ->latest('created_at')
            ->first();

        if (! $record || now()->isAfter($record->expires_at) || ! password_verify($request->otp, $record->otp)) {
            throw ValidationException::withMessages(['otp' => 'Invalid or expired OTP.']);
        }

        DB::table('password_otps')->where('email', $request->email)->delete();

        // Generate a real password-reset token and redirect to reset-password page
        $token = app('auth.password.broker')->createToken(
            \App\Models\User::where('email', $request->email)->first()
        );

        return redirect()->route('password.reset', ['token' => $token, 'email' => $request->email]);
    }
}
