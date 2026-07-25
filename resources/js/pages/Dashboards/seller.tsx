import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BarChart2, DollarSign, Eye, Package, Plus, ShoppingCart, TrendingUp, Wallet } from 'lucide-react';
import SellerLayout from '@/layouts/SellerLayout';

interface Stats {
    todaySales: number; monthSales: number; totalOrders: number;
    pendingOrders: number; totalProducts: number; lowStock: number; balance: number;
}

export default function SellerDashboard({ stats, recentOrders, lowStockProducts }: {
    stats: Stats; recentOrders: any[]; lowStockProducts: any[];
}) {
    const statusBadge: Record<string, string> = {
        pending: 'badge-yellow', confirmed: 'badge-blue',
        paid: 'badge-purple', shipped: 'badge-purple',
        delivered: 'badge-green', cancelled: 'badge-red',
    };

    const metrics = [
        { label: "Today's Sales",  value: `₱${stats.todaySales.toFixed(2)}`,  icon: <DollarSign className="h-5 w-5" />,  delta: null },
        { label: 'Month Sales',    value: `₱${stats.monthSales.toFixed(2)}`,  icon: <TrendingUp className="h-5 w-5" />,  delta: null },
        { label: 'Total Orders',   value: stats.totalOrders,                  icon: <ShoppingCart className="h-5 w-5" />, delta: null },
        { label: 'Pending Orders', value: stats.pendingOrders,                icon: <AlertTriangle className="h-5 w-5" />, delta: null },
        { label: 'Total Products', value: stats.totalProducts,                icon: <Package className="h-5 w-5" />,     delta: null },
        { label: 'Low Stock',      value: stats.lowStock,                     icon: <AlertTriangle className="h-5 w-5" />, delta: null },
        { label: 'Balance',        value: `₱${stats.balance.toFixed(2)}`,     icon: <Wallet className="h-5 w-5" />,      delta: null },
    ];

    return (
        <SellerLayout breadcrumb="Overview">
            <Head title="Seller Dashboard" />

            <div className="pg-header">
                <div className="pg-title">Dashboard</div>
                <div className="pg-subtitle">Here's what's happening in your store.</div>
            </div>

            {/* Metrics */}
            <div className="stat-grid" style={{ marginBottom: 28 }}>
                {metrics.map((m) => (
                    <div key={m.label} className="stat-card">
                        <div className="stat-icon" style={{ background: '#e8f5e4' }}>{m.icon}</div>
                        <div className="stat-label">{m.label}</div>
                        <div className="stat-value">{m.value}</div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header"><span className="card-title">Quick Actions</span></div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                        {[
                            { label: 'Add Product',  href: route('seller.products.create'), icon: <Plus className="h-5 w-5" /> },
                            { label: 'My Products',  href: route('seller.products.index'),  icon: <Package className="h-5 w-5" /> },
                            { label: 'Orders',       href: route('seller.orders.index'),    icon: <ShoppingCart className="h-5 w-5" /> },
                            { label: 'Analytics',    href: route('seller.analytics'),       icon: <BarChart2 className="h-5 w-5" /> },
                        ].map((a) => (
                            <Link key={a.label} href={a.href} className="btn btn-secondary"
                                style={{ flexDirection: 'column', padding: 16, gap: 8, justifyContent: 'center', height: 'auto' }}>
                                {a.icon}{a.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders + Low Stock */}
            <div className="grid-2">
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Orders</span>
                        <Link href={route('seller.orders.index')} className="btn btn-secondary btn-sm">View all →</Link>
                    </div>
                    <div>
                        {recentOrders.length === 0 ? (
                            <div className="empty-state"><div className="empty-state-text">No orders yet.</div></div>
                        ) : recentOrders.map((order) => (
                            <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e8f0e6' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>#{order.order_number}</div>
                                    <div style={{ fontSize: 11, color: '#6b7e68' }}>{order.user?.name}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span className={`badge ${statusBadge[order.status] ?? 'badge-gray'}`}>{order.status}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600 }}>₱{Number(order.total).toFixed(2)}</span>
                                    <Link href={route('seller.orders.show', order.id)} style={{ color: '#6b7e68' }}><Eye className="h-4 w-4" /></Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Low Stock Alert</span>
                        <Link href={route('seller.products.index')} className="btn btn-secondary btn-sm">Manage →</Link>
                    </div>
                    <div>
                        {lowStockProducts.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon"><Package className="mx-auto h-10 w-10" style={{ color: '#d4ddd2' }} /></div>
                                <div className="empty-state-text">All products are well stocked.</div>
                            </div>
                        ) : lowStockProducts.map((product) => (
                            <div key={product.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e8f0e6' }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 500 }}>{product.name}</div>
                                    <div style={{ fontSize: 11, color: '#6b7e68' }}>SKU: {product.sku}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>{product.stock_quantity} left</div>
                                    <div style={{ fontSize: 11, color: '#6b7e68' }}>Min: {product.low_stock_threshold}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
