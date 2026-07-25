<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'manage-users', 'manage-roles', 'manage-settings', 'view-logs', 'backup-restore',
            'manage-products', 'manage-categories', 'manage-sellers', 'manage-orders',
            'manage-customers', 'manage-coupons', 'manage-payments',
            'manage-own-products', 'view-own-sales', 'manage-inventory',
            'manage-profile', 'view-orders',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Admin has full control
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $admin->syncPermissions(Permission::all());

        $seller = Role::firstOrCreate(['name' => 'seller', 'guard_name' => 'web']);
        $seller->syncPermissions(['manage-own-products', 'view-own-sales', 'manage-inventory']);

        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $customer->syncPermissions(['manage-profile', 'view-orders']);

        Role::firstOrCreate(['name' => 'support_agent', 'guard_name' => 'web']);
    }
}
