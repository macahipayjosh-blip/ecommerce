import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Bike,
    CalendarDays,
    CheckCircle,
    ClipboardList,
    Clock,
    CreditCard,
    Diamond,
    DollarSign,
    FolderOpen,
    Minus,
    Package,
    RotateCcw,
    Settings,
    ShoppingBag,
    Store,
    Tag,
    TrendingUp,
    UserPlus,
    Users,
} from 'lucide-react';
import { useState } from 'react';

interface Stats {
    todaySales: number;
    weekSales: number;
    monthSales: number;
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    totalCustomers: number;
    totalSellers: number;
    totalRiders: number;
    lowStock: number;
    failedPayments: number;
    newUsersToday: number;
    todayLogs: number;
}
interface ProductImage {
    url: string;
    is_primary: boolean;
}
interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
    status: string;
    sku?: string;
    category?: { name: string };
    brand?: { name: string };
    images?: ProductImage[];
}
interface RoleBreakdown {
    role: string;
    count: number;
}
interface RevenueMonth {
    month: string;
    revenue: number;
}
interface RecentLog {
    id: number;
    action: string;
    ip_address: string | null;
    created_at: string;
    user: { name: string } | null;
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-yellow',
    confirmed: 'badge-blue',
    paid: 'badge-purple',
    shipped: 'badge-purple',
    delivered: 'badge-green',
    cancelled: 'badge-red',
};

function ProductCard({ product }: { product: Product }) {
    const [img, setImg] = useState(0);
    const images = product.images ?? [];
    const pi = images.findIndex((i) => i.is_primary);
    const sorted = pi > 0 ? [images[pi], ...images.filter((_, i) => i !== pi)] : images;

    return (
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', background: '#f9fafb', aspectRatio: '4/3', overflow: 'hidden' }}>
                {sorted.length > 0 ? (
                    <img src={sorted[img]?.url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, opacity: 0.2 }}>
                        📦
                    </div>
                )}
                <span
                    className={`badge ${product.status === 'active' ? 'badge-green' : 'badge-gray'}`}
                    style={{ position: 'absolute', top: 10, right: 10 }}
                >
                    {product.status}
                </span>
                {product.stock_quantity === 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <span className="badge badge-red">Out of Stock</span>
                    </div>
                )}
            </div>
            {sorted.length > 1 && (
                <div style={{ display: 'flex', gap: 6, padding: '8px 12px 0', overflowX: 'auto' }}>
                    {sorted.map((im, i) => (
                        <button
                            key={i}
                            onClick={() => setImg(i)}
                            style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                overflow: 'hidden',
                                border: `2px solid ${i === img ? '#2d5a27' : '#e5e7eb'}`,
                                flexShrink: 0,
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            <img src={im.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                    ))}
                </div>
            )}
            <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {product.name}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px', fontSize: 11, color: '#6b7280' }}>
                    {product.category && <span>📁 {product.category.name}</span>}
                    {product.brand && <span>🏷 {product.brand.name}</span>}
                    {product.sku && <span style={{ color: '#9ca3af' }}>SKU: {product.sku}</span>}
                </div>
                <div
                    style={{
                        marginTop: 'auto',
                        paddingTop: 10,
                        borderTop: '1px solid #f0f1f3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <span style={{ fontSize: 16, fontWeight: 700 }}>₱{Number(product.price).toFixed(2)}</span>
                    <Link href={route('admin.products.edit', product.id)} className="btn btn-secondary btn-sm">
                        Edit
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard({
    stats,
    recentOrders,
    topProducts,
    salesChart,
    allProducts,
    revenueChart,
    roleBreakdown,
    recentLogs,
}: {
    stats: Stats;
    recentOrders: any[];
    topProducts: any[];
    salesChart: any[];
    allProducts: Product[];
    revenueChart: RevenueMonth[];
    roleBreakdown: RoleBreakdown[];
    recentLogs: RecentLog[];
}) {
    const maxSales = Math.max(...salesChart.map((d) => d.sales), 1);
    const maxRevenue = Math.max(...revenueChart.map((m) => m.revenue), 1);

    const cardConfigs = [
        { label: "Today's Sales", value: `₱${stats.todaySales.toFixed(2)}`, accent: 'green', icon: <DollarSign size={20} /> },
        { label: 'This Week', value: `₱${stats.weekSales.toFixed(2)}`, accent: 'teal', icon: <CalendarDays size={20} /> },
        { label: 'This Month', value: `₱${stats.monthSales.toFixed(2)}`, accent: 'blue', icon: <CalendarDays size={20} /> },
        { label: 'Total Revenue', value: `₱${stats.totalRevenue.toFixed(2)}`, accent: 'purple', icon: <Diamond size={20} /> },
        { label: 'Total Orders', value: stats.totalOrders, accent: 'lime', icon: <ShoppingBag size={20} /> },
        { label: 'Pending Orders', value: stats.pendingOrders, accent: 'amber', icon: <Clock size={20} />, trend: 'down', trendText: 'Needs action' },
        { label: 'Customers', value: stats.totalCustomers, accent: 'green', icon: <Users size={20} />, trend: 'up', trendText: 'Registered' },
        { label: 'Sellers', value: stats.totalSellers, accent: 'teal', icon: <Store size={20} />, trend: 'up', trendText: 'Active' },
        { label: 'Riders', value: stats.totalRiders, accent: 'blue', icon: <Bike size={20} />, trend: 'ok', trendText: 'Available' },
        { label: 'Low Stock', value: stats.lowStock, accent: 'amber', icon: <AlertTriangle size={20} />, trend: 'ok', trendText: 'All stocked' },
        {
            label: 'Failed Payments',
            value: stats.failedPayments,
            accent: 'red',
            icon: <CreditCard size={20} />,
            trend: 'ok',
            trendText: 'No failures',
        },
        { label: 'New Users Today', value: stats.newUsersToday, accent: 'green', icon: <UserPlus size={20} /> },
    ];

    const accentColors: Record<string, { accent: string; ci: string; trend?: string }> = {
        green: { accent: 'accent-green', ci: 'ci-green' },
        teal: { accent: 'accent-teal', ci: 'ci-teal' },
        blue: { accent: 'accent-blue', ci: 'ci-blue' },
        purple: { accent: 'accent-purple', ci: 'ci-purple' },
        lime: { accent: 'accent-lime', ci: 'ci-lime' },
        amber: { accent: 'accent-amber', ci: 'ci-amber' },
        red: { accent: 'accent-red', ci: 'ci-red' },
    };

    return (
        <AdminLayout breadcrumb="Dashboard">
            <Head title="Admin Dashboard" />

            <style>{`
                :root {
                    --green-950: #0e2610;
                    --green-900: #173d14;
                    --green-800: #1e5219;
                    --green-700: #2d6a27;
                    --green-600: #3d8535;
                    --green-500: #4fa344;
                    --green-400: #72bf68;
                    --green-200: #b8e0b3;
                    --green-100: #d6efd3;
                    --green-50: #edf7eb;

                    --teal-700: #0d7060;
                    --teal-100: #d0f0ea;
                    --teal-50: #e5f8f4;

                    --blue-700: #1a5fa8;
                    --blue-100: #d3e8fb;
                    --blue-50: #eaf3fd;

                    --amber-700: #b56b10;
                    --amber-100: #fde8c0;
                    --amber-50: #fef5e3;

                    --red-700: #b52c2c;
                    --red-100: #fbc9c9;
                    --red-50: #fdeaea;

                    --purple-700: #5c35a0;
                    --purple-100: #e0d5f8;
                    --purple-50: #f0eafd;

                    --lime-700: #4d7a0e;
                    --lime-100: #daedb8;
                    --lime-50: #edf7d8;

                    --gray-50: #f6f8f3;
                    --gray-100: #edf0e8;
                    --gray-200: #dde3d5;
                    --gray-300: #c4ccb8;
                    --gray-400: #9aaa8c;
                    --gray-500: #6e806a;
                    --gray-700: #3a4d36;
                    --gray-900: #1c2b19;

                    --text-primary: #1a3017;
                    --text-secondary: #5a7056;
                    --text-muted: #8fa88b;
                    --border: #dde3d5;
                    --border-hover: #b0caa8;
                    --radius-sm: 8px;
                    --radius-md: 12px;
                    --shadow-card: 0 1px 3px rgba(30,82,25,0.07), 0 1px 2px rgba(30,82,25,0.05);
                    --shadow-card-hover: 0 4px 12px rgba(30,82,25,0.1), 0 2px 4px rgba(30,82,25,0.06);
                }

                .dashboard-topbar {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 26px;
                }

                .dashboard-breadcrumb {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .dashboard-breadcrumb a {
                    color: var(--green-600);
                    text-decoration: none;
                }

                .dashboard-breadcrumb a:hover {
                    color: var(--green-800);
                }

                .dashboard-heading {
                    font-size: 26px;
                    font-family: 'Instrument Serif', serif;
                    color: var(--text-primary);
                    letter-spacing: -0.4px;
                    line-height: 1;
                }

                .dashboard-subheading {
                    font-size: 13px;
                    color: var(--text-muted);
                    margin-top: 2px;
                }

                .cards-row {
                    display: grid;
                    gap: 14px;
                    margin-bottom: 14px;
                }

                .cols-5 {
                    grid-template-columns: repeat(5, 1fr);
                }

                .cols-2 {
                    grid-template-columns: repeat(2, 1fr);
                }

                @media (max-width: 1100px) {
                    .cols-5 {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .cols-5 {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .cols-2 {
                        grid-template-columns: 1fr;
                    }
                }

                .stat-card {
                    background: white;
                    border-radius: var(--radius-md);
                    padding: 18px 16px 14px;
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-card-hover);
                    border-color: var(--border-hover);
                }

                .stat-card::after {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 3px;
                    border-radius: var(--radius-md) var(--radius-md) 0 0;
                }

                .accent-green::after { background: var(--green-600); }
                .accent-teal::after { background: var(--teal-700); }
                .accent-blue::after { background: var(--blue-700); }
                .accent-purple::after { background: var(--purple-700); }
                .accent-lime::after { background: var(--lime-700); }
                .accent-amber::after { background: var(--amber-700); }
                .accent-red::after { background: var(--red-700); }

                .card-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 14px;
                }

                .card-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .ci-green { background: var(--green-50); }
                .ci-green svg { color: var(--green-700); }
                .ci-teal { background: var(--teal-50); }
                .ci-teal svg { color: var(--teal-700); }
                .ci-blue { background: var(--blue-50); }
                .ci-blue svg { color: var(--blue-700); }
                .ci-purple { background: var(--purple-50); }
                .ci-purple svg { color: var(--purple-700); }
                .ci-lime { background: var(--lime-50); }
                .ci-lime svg { color: var(--lime-700); }
                .ci-amber { background: var(--amber-50); }
                .ci-amber svg { color: var(--amber-700); }
                .ci-red { background: var(--red-50); }
                .ci-red svg { color: var(--red-700); }

                .card-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.7px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin-bottom: 5px;
                }

                .card-value {
                    font-family: 'Instrument Serif', serif;
                    font-size: 24px;
                    color: var(--text-primary);
                    letter-spacing: -0.5px;
                    line-height: 1;
                }

                .card-trend {
                    font-size: 11px;
                    margin-top: 8px;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: var(--text-muted);
                }

                .card-trend svg {
                    width: 14px;
                    height: 14px;
                }

                .trend-up {
                    color: var(--green-600);
                }

                .trend-down {
                    color: var(--red-700);
                }

                .trend-ok {
                    color: var(--teal-700);
                }

                .topbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border);
                    background: white;
                    color: var(--text-secondary);
                    font-size: 13px;
                    font-family: 'DM Sans', sans-serif;
                    cursor: pointer;
                    transition: background 0.12s, border-color 0.12s;
                }

                .action-btn:hover {
                    background: var(--green-50);
                    border-color: var(--border-hover);
                    color: var(--green-800);
                }

                .action-btn i {
                    font-size: 16px;
                }

                .action-btn.primary {
                    background: var(--green-700);
                    border-color: var(--green-700);
                    color: white;
                }

                .action-btn.primary:hover {
                    background: var(--green-800);
                    border-color: var(--green-800);
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .stat-card {
                    animation: fadeUp 0.35s ease both;
                }

                .cards-row:nth-child(1) .stat-card:nth-child(1) { animation-delay: 0.05s; }
                .cards-row:nth-child(1) .stat-card:nth-child(2) { animation-delay: 0.10s; }
                .cards-row:nth-child(1) .stat-card:nth-child(3) { animation-delay: 0.15s; }
                .cards-row:nth-child(1) .stat-card:nth-child(4) { animation-delay: 0.20s; }
                .cards-row:nth-child(1) .stat-card:nth-child(5) { animation-delay: 0.25s; }
                .cards-row:nth-child(2) .stat-card:nth-child(1) { animation-delay: 0.30s; }
                .cards-row:nth-child(2) .stat-card:nth-child(2) { animation-delay: 0.35s; }
                .cards-row:nth-child(2) .stat-card:nth-child(3) { animation-delay: 0.40s; }
                .cards-row:nth-child(2) .stat-card:nth-child(4) { animation-delay: 0.45s; }
                .cards-row:nth-child(2) .stat-card:nth-child(5) { animation-delay: 0.50s; }
                .cards-row:nth-child(3) .stat-card:nth-child(1) { animation-delay: 0.55s; }
                .cards-row:nth-child(3) .stat-card:nth-child(2) { animation-delay: 0.60s; }
            `}</style>

            <div className="dashboard-topbar">
                <div>
                    <div className="dashboard-breadcrumb">
                        <a href="#">BSABShop</a> &rsaquo; Dashboard
                    </div>
                    <h1 className="dashboard-heading">Dashboard</h1>
                    <p className="dashboard-subheading">Full platform control — system overview</p>
                </div>
            </div>

            {/* Row 1: Sales metrics */}
            <div className="cards-row cols-5">
                {cardConfigs.slice(0, 5).map((config) => {
                    const colors = accentColors[config.accent];
                    return (
                        <div key={config.label} className={`stat-card ${colors.accent}`}>
                            <div className={`card-icon ${colors.ci}`}>{config.icon}</div>
                            <div className="card-label">{config.label}</div>
                            <div className="card-value">{config.value}</div>
                            <div className={`card-trend ${config.trend ? `trend-${config.trend}` : ''}`}>
                                {config.trend === 'up' && <TrendingUp size={14} />}
                                {config.trend === 'down' && <AlertTriangle size={14} />}
                                {config.trend === 'ok' && <CheckCircle size={14} />}
                                {!config.trend && <Minus size={14} />}
                                {config.trendText || 'No activity yet'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Row 2: Platform metrics */}
            <div className="cards-row cols-5">
                {cardConfigs.slice(5, 10).map((config) => {
                    const colors = accentColors[config.accent];
                    return (
                        <div key={config.label} className={`stat-card ${colors.accent}`}>
                            <div className={`card-icon ${colors.ci}`}>{config.icon}</div>
                            <div className="card-label">{config.label}</div>
                            <div className="card-value">{config.value}</div>
                            <div className={`card-trend ${config.trend ? `trend-${config.trend}` : ''}`}>
                                {config.trend === 'up' && <TrendingUp size={14} />}
                                {config.trend === 'down' && <AlertTriangle size={14} />}
                                {config.trend === 'ok' && <CheckCircle size={14} />}
                                {!config.trend && <Minus size={14} />}
                                {config.trendText || 'All time'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Row 3: Alerts */}
            <div className="cards-row cols-2">
                {cardConfigs.slice(10, 12).map((config) => {
                    const colors = accentColors[config.accent];
                    return (
                        <div key={config.label} className={`stat-card ${colors.accent}`}>
                            <div className={`card-icon ${colors.ci}`}>{config.icon}</div>
                            <div className="card-label">{config.label}</div>
                            <div className="card-value">{config.value}</div>
                            <div className={`card-trend ${config.trend ? `trend-${config.trend}` : ''}`}>
                                {config.trend === 'up' && <TrendingUp size={14} />}
                                {config.trend === 'down' && <AlertTriangle size={14} />}
                                {config.trend === 'ok' && <CheckCircle size={14} />}
                                {!config.trend && <Minus size={14} />}
                                {config.trendText || 'None today'}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Role breakdown */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <span className="card-title">User Role Breakdown</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                    {roleBreakdown.map((r, i) => (
                        <div
                            key={r.role}
                            style={{ padding: '20px', borderRight: i < roleBreakdown.length - 1 ? '1px solid #f0f1f3' : 'none', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-1px' }}>{r.count}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{r.role}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick actions */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <span className="card-title">Quick Actions</span>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {[
                            { icon: Users, label: 'Users', href: route('admin.users.index') },
                            { icon: Bike, label: 'Riders', href: route('admin.riders.index') },
                            { icon: ShoppingBag, label: 'Orders', href: route('admin.orders.index') },
                            { icon: Package, label: 'Products', href: route('admin.products.index') },
                            { icon: FolderOpen, label: 'Categories', href: route('admin.categories.index') },
                            { icon: Tag, label: 'Brands', href: route('admin.brands.index') },
                            { icon: CreditCard, label: 'Payments', href: route('admin.payments.index') },
                            { icon: RotateCcw, label: 'Returns', href: route('admin.returns.index') },
                            { icon: BarChart3, label: 'Reports', href: route('admin.reports.index') },
                            { icon: ClipboardList, label: 'Activity', href: route('admin.activity.index') },
                            { icon: Settings, label: 'Settings', href: route('admin.settings.index') },
                        ].map((a) => (
                            <Link key={a.label} href={a.href} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <a.icon size={16} />
                                {a.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* 7-day sales chart */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Sales — Last 7 Days</span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                            {salesChart.map((day, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 10, color: '#9ca3af' }}>
                                        ₱{day.sales > 999 ? (day.sales / 1000).toFixed(1) + 'k' : day.sales.toFixed(0)}
                                    </span>
                                    <div
                                        style={{
                                            width: '100%',
                                            background: '#2d5a27',
                                            borderRadius: '4px 4px 0 0',
                                            height: `${Math.max((day.sales / maxSales) * 100, 4)}px`,
                                            transition: 'height .3s',
                                        }}
                                    />
                                    <span style={{ fontSize: 10, color: '#9ca3af' }}>{day.date}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 12-month revenue chart */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Revenue — Last 12 Months</span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 120 }}>
                            {revenueChart.map((m, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 9, color: '#9ca3af' }}>
                                        {m.revenue > 999 ? `₱${(m.revenue / 1000).toFixed(1)}k` : `₱${m.revenue.toFixed(0)}`}
                                    </span>
                                    <div
                                        style={{
                                            width: '100%',
                                            background: '#4a7c42',
                                            borderRadius: '4px 4px 0 0',
                                            height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}px`,
                                            transition: 'height .3s',
                                        }}
                                    />
                                    <span style={{ fontSize: 9, color: '#9ca3af' }}>{m.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 24 }}>
                {/* Top products */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Top Products</span>
                    </div>
                    {topProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-text">No sales data yet</div>
                        </div>
                    ) : (
                        topProducts.map((p, i) => (
                            <div
                                key={p.id}
                                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #f0f1f3' }}
                            >
                                <span
                                    style={{
                                        width: 24,
                                        height: 24,
                                        borderRadius: '50%',
                                        background: '#e8f5e4',
                                        color: '#2d5a27',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {p.name}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.order_items_count} sold</div>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 700 }}>₱{Number(p.price).toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent activity logs */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Activity</span>
                        <Link href={route('admin.activity.index')} className="btn btn-secondary btn-sm">
                            View all →
                        </Link>
                    </div>
                    {recentLogs.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-text">No activity yet</div>
                        </div>
                    ) : (
                        recentLogs.map((log) => (
                            <div
                                key={log.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 20px',
                                    borderBottom: '1px solid #f0f1f3',
                                    gap: 12,
                                }}
                            >
                                <div style={{ minWidth: 0 }}>
                                    <div
                                        style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                    >
                                        {log.action}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                        {log.user?.name ?? 'System'} · {log.ip_address}
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{new Date(log.created_at).toLocaleTimeString()}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Recent orders */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <span className="card-title">Recent Orders</span>
                    <Link href={route('admin.orders.index')} className="btn btn-secondary btn-sm">
                        View all →
                    </Link>
                </div>
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                {['Order', 'Customer', 'Status', 'Total', 'Date', ''].map((h) => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td style={{ fontWeight: 600 }}>#{order.order_number}</td>
                                    <td style={{ color: '#6b7280' }}>{order.user?.name ?? '—'}</td>
                                    <td>
                                        <span className={`badge ${STATUS_BADGE[order.status] ?? 'badge-gray'}`}>{order.status}</span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₱{Number(order.total).toFixed(2)}</td>
                                    <td style={{ color: '#9ca3af', fontSize: 12 }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Link href={route('admin.orders.show', order.id)} className="btn btn-secondary btn-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentOrders.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-text">No orders yet</div>
                        </div>
                    )}
                </div>
            </div>

            {/* All products */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">All Products ({allProducts.length})</span>
                    <Link href={route('admin.products.create')} className="btn btn-primary btn-sm">
                        + Add Product
                    </Link>
                </div>
                <div className="card-body">
                    {allProducts.length > 0 ? (
                        <div className="grid-4">
                            {allProducts.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📦</div>
                            <div className="empty-state-title">No products yet</div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
