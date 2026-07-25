<?php

namespace App\Http\Controllers\Dashboards;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\SystemLog;
use App\Models\PaymentTransaction;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    private array $paid = ['paid', 'shipped', 'delivered'];

    public function index()
    {
        $today      = Carbon::today();
        $weekStart  = Carbon::now()->startOfWeek();
        $monthStart = Carbon::now()->startOfMonth();

        $stats = [
            'todaySales'       => (float) Order::whereDate('created_at', $today)->whereIn('status', $this->paid)->sum('total'),
            'weekSales'        => (float) Order::where('created_at', '>=', $weekStart)->whereIn('status', $this->paid)->sum('total'),
            'monthSales'       => (float) Order::where('created_at', '>=', $monthStart)->whereIn('status', $this->paid)->sum('total'),
            'totalRevenue'     => (float) Order::whereIn('status', $this->paid)->sum('total'),
            'totalOrders'      => Order::count(),
            'pendingOrders'    => Order::where('status', 'pending')->count(),
            'processingOrders' => Order::where('status', 'confirmed')->count(),
            'totalCustomers'   => User::role('customer')->count(),
            'totalSellers'     => User::role('seller')->count(),
            'lowStock'         => Product::whereColumn('stock_quantity', '<=', 'low_stock_threshold')->count(),
            'failedPayments'   => PaymentTransaction::where('status', 'failed')->count(),
            'newUsersToday'    => User::whereDate('created_at', $today)->count(),
            'todayLogs'        => SystemLog::whereDate('created_at', $today)->count(),
        ];

        $recentOrders = Order::with(['user:id,name,email', 'items'])
            ->latest()->take(10)->get();

        $topProducts = Product::withCount('orderItems')
            ->orderByDesc('order_items_count')
            ->take(5)
            ->get(['id', 'name', 'sku', 'price', 'stock_quantity']);

        $allProducts = Product::with(['images', 'category:id,name', 'brand:id,name'])
            ->latest()
            ->get(['id', 'name', 'price', 'stock_quantity', 'status', 'sku', 'weight', 'weight_unit', 'category_id', 'brand_id']);

        $salesChart = collect(range(6, 0))->map(function ($i) {
            $date = Carbon::now()->subDays($i);
            return [
                'date'  => $date->format('M d'),
                'sales' => (float) Order::whereDate('created_at', $date)->whereIn('status', $this->paid)->sum('total'),
            ];
        });

        $revenueChart = collect(range(11, 0))->map(function ($i) {
            $date = Carbon::now()->subMonths($i);
            return [
                'month'   => $date->format('M'),
                'revenue' => (float) Order::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->whereIn('status', $this->paid)
                    ->sum('total'),
            ];
        });

        $roleCount = fn(string $role) => \Spatie\Permission\Models\Role::where('name', $role)->exists()
            ? User::role($role)->count()
            : 0;

        $roleBreakdown = [
            ['role' => 'Customers',      'count' => $roleCount('customer')],
            ['role' => 'Sellers',        'count' => $roleCount('seller')],
            ['role' => 'Support Agents', 'count' => $roleCount('support_agent')],
            ['role' => 'Admins',         'count' => $roleCount('admin')],
        ];

        $recentLogs = SystemLog::with('user:id,name')
            ->latest()->take(8)->get();

        return Inertia::render('Dashboards/admin', compact(
            'stats', 'recentOrders', 'topProducts', 'salesChart',
            'allProducts', 'revenueChart', 'roleBreakdown', 'recentLogs'
        ));
    }
}
