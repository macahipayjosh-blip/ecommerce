import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';

interface Order {
    id: number; order_number: string; status: string; payment_status: string;
    payment_method: string; total: number; discount: number; created_at: string;
    user?: { name: string; email: string };
    items: any[];
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-yellow', confirmed: 'badge-blue', paid: 'badge-purple',
    shipped: 'badge-purple', delivered: 'badge-green', cancelled: 'badge-red', refunded: 'badge-gray',
};
const PAY_BADGE: Record<string, string> = {
    paid: 'badge-green', pending: 'badge-yellow', failed: 'badge-red', refunded: 'badge-gray',
};

export default function AdminOrders({ orders, filterType }: {
    orders: { data: Order[]; links: any[]; meta: any };
    filterType?: string;
}) {
    const updateStatus = (id: number, status: string) => router.patch(route('admin.orders.status', id), { status });

    const pending   = orders.data.filter(o => o.status === 'pending').length;
    const shipped   = orders.data.filter(o => o.status === 'shipped').length;
    const delivered = orders.data.filter(o => o.status === 'delivered').length;
    const revenue   = orders.data.reduce((s, o) => s + Number(o.total), 0);

    return (
        <AdminLayout breadcrumb="Orders">
            <Head title="Order Management" />

            <div className="pg-header">
                <div className="pg-title">Order Management</div>
                <div className="pg-subtitle">Monitor and manage all customer orders</div>
            </div>

            <div className="stat-grid">
                {[
                    { label: 'Total Orders', value: orders.meta?.total ?? orders.data.length, icon: '🛒' },
                    { label: 'Pending',      value: pending,                                  icon: '⏳' },
                    { label: 'Shipped',      value: shipped,                                  icon: '🚚' },
                    { label: 'Delivered',    value: delivered,                                icon: '✅' },
                    { label: 'Revenue',      value: `₱${revenue.toFixed(2)}`,                icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: '#f1f3f7' }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="card">
                <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Link href={route('admin.orders.index')} className={`btn ${(!filterType || filterType === 'all') ? 'btn-primary' : 'btn-outline'}`}>All Orders</Link>
                        <Link href={route('admin.orders.index', { type: 'auction' })} className={`${filterType === 'auction' ? 'btn-primary' : 'btn-outline'}`}>Auction Orders</Link>
                    </div>
                    <span className="card-title">{filterType === 'auction' ? 'Auction Orders' : 'All Orders'}</span>
                </div>
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                {['Order', 'Customer', 'Status', 'Payment', 'Total', 'Date', 'Actions'].map(h => <th key={h}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.data.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>#{order.order_number}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{order.items?.length ?? 0} item(s)</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{order.user?.name ?? '—'}</div>
                                        <div style={{ fontSize: 11, color: '#9ca3af' }}>{order.user?.email}</div>
                                    </td>
                                    <td>
                                        <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)}
                                            className={`badge ${STATUS_BADGE[order.status] ?? 'badge-gray'}`}
                                            style={{ border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                            {['pending','confirmed','paid','shipped','delivered','cancelled','refunded'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <span className={`badge ${PAY_BADGE[order.payment_status] ?? 'badge-gray'}`}>{order.payment_status}</span>
                                        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{order.payment_method}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 700 }}>₱{Number(order.total).toFixed(2)}</div>
                                        {Number(order.discount) > 0 && <div style={{ fontSize: 11, color: '#16a34a' }}>-₱{Number(order.discount).toFixed(2)}</div>}
                                    </td>
                                    <td style={{ fontSize: 12, color: '#9ca3af' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td><Link href={route('admin.orders.show', order.id)} className="btn btn-secondary btn-sm">View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.data.length === 0 && <div className="empty-state"><div className="empty-state-icon">🛒</div><div className="empty-state-title">No orders found</div></div>}
                </div>
                {orders.links && (
                    <div className="pagination">
                        <span className="pagination-info">Showing {orders.meta?.from}–{orders.meta?.to} of {orders.meta?.total}</span>
                        <div className="pagination-links">
                            {orders.links.map((l: any, i: number) => l.url
                                ? <Link key={i} href={l.url} className={l.active ? 'active' : ''} dangerouslySetInnerHTML={{ __html: l.label }} />
                                : <span key={i} dangerouslySetInnerHTML={{ __html: l.label }} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
