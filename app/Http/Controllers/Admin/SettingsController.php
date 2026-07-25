<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public static array $defaults = [
        'site_name'                    => 'BSABShop',
        'site_tagline'                 => 'CPSU BSABShop',
        'banner_subtitle'              => 'Welcome to CPSU-BSAB',
        'banner_title'                 => 'BSAB Essential Deals',
        'banner_description'           => 'Start Your Farming Journey Today!',
        'banner_badge'                 => '15% OFF for CPSU Students!',
        'banner_shop_btn'              => 'Shop Now →',
        'banner_image'                 => '',
        'dashboard_banner_title'       => 'My Dashboard',
        'dashboard_banner_subtitle'    => 'Welcome back',
        'dashboard_banner_description' => 'Track your orders, favorites, and more.',
        'dashboard_banner_btn'         => 'Shop Now →',
        'flash_title'                  => 'Flash Sale',
        'categories_title'             => 'Featured Categories',
        'products_title'               => 'Latest Products',
        'footer_brand'                 => 'CPSU BSABShop',
        'footer_tagline'               => 'A modern e-commerce platform for CPSU-BSAB students and faculty.',
        'footer_col2_title'            => 'Quick Links',
        'footer_quick_links'           => 'About Us,Track Order,FAQ',
        'footer_col3_title'            => 'Payments',
        'footer_payments'              => 'GCash,PayMaya,COD',
        'footer_col4_title'            => 'Follow Us',
        'footer_social_links'          => '📘 Facebook|#,📷 Instagram|#,▶️ YouTube|#,🎵 TikTok|#',
        'footer_copyright'             => '© 2025 CPSU BSABShop. All rights reserved.',
        'footer_contact'               => 'Contact Us',
        'gcash_qr_image'               => '',
        'gcash_number'                 => '',
        'gcash_name'                   => '',
        'site_logo'                    => '',
    ];

    public static function all(): array
    {
        $settings = [];
        foreach (self::$defaults as $key => $default) {
            $settings[$key] = Setting::get($key, $default);
        }
        return $settings;
    }

    public function index()
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => self::all(),
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'banner_image'           => 'nullable|image|max:4096',
            'dashboard_banner_image' => 'nullable|image|max:4096',
            'gcash_qr_image'         => 'nullable|image|max:2048',
            'site_logo'              => 'nullable|image|max:2048',
        ]);

        $allowed = array_keys(self::$defaults);
        foreach ($request->only($allowed) as $key => $value) {
            if (is_string($value)) {
                Setting::set($key, $value);
            }
        }

        foreach (['banner_image', 'gcash_qr_image', 'site_logo'] as $imgKey) {
            if ($request->hasFile($imgKey)) {
                $old = Setting::get($imgKey);
                if ($old) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($old);
                }
                $path = $request->file($imgKey)->store('banners', 'public');
                Setting::set($imgKey, $path);
            }
        }

        return back()->with('success', 'Settings saved.');
    }
}
