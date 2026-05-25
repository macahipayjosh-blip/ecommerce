import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Package } from 'lucide-react';

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: number;
    total_price: number;
    product: {
        id: number;
        name: string;
        sku?: string;
        images?: { url: string; is_primary: boolean }[];
    };
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_method: string;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    notes?: string;
    created_at: string;
    items: OrderItem[];
    user?: { name: string; email: string; phone?: string };
    seller?: { name: string; email: string };
    address?: {
        full_name?: string;
        address_line1?: string;
        address_line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
        phone?: string;
    };
    shipment?: { carrier?: string; tracking_number?: string; status?: string };
}

const STATUS_BADGE: Record<string, string> = {
    pending:   'badge-yellow',
    confirmed: 'badge-blue',
    paid:      'badge-blue',
    shipped:   'badge-purple',
    delivered: 'badge-green',
    cancelled: 'badge-red',
    refunded:  'badge-gray',
};

const STATUSES = ['pending', 'confirmed', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];

const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="field-row">
        <span className="field-label">{label}</span>
        <span className="field-value">{value || '—'}</span>
    </div>
);

export default function AdminOrderShow({ order }: { order: Order }) {
    const updateStatus = (status: string) =>
        router.patch(route('admin.orders.status', { order: order.id }), { status });

    const refund = () => {
        if (confirm('Process a refund for this order?'))
            router.post(route('admin.orders.refund', { order: order.id }));
    };

    const itemCount = order.items?.length ?? 0;
    const status = order.status ?? 'pending';

    return (
        <AdminLayout breadcrumb={`Order #${order.order_number}`}>
            <Head title={`Order #${order.order_number}`} />

            {/* Page Header */}
            <div className="pg-header">
                <div>
                    <Link href={route('admin.orders.index')} className="breadcrumb-link">
                        ← Back to Orders
                    </Link>
                    <div className="pg-title">Order #{order.order_number}</div>
                    <div className="pg-subtitle">{new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-2 items-center">
                    <span className={`badge ${STATUS_BADGE[status] ?? 'badge-gray'}`}>
                        <span className="badge-dot" />
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {[
                    { label: 'Items',          value: itemCount,                                          icon: '📦' },
                    { label: 'Subtotal',        value: `₱${Number(order.subtotal).toFixed(2)}`,           icon: '🧾' },
                    { label: 'Total',           value: `₱${Number(order.total).toFixed(2)}`,              icon: '💰' },
                    { label: 'Payment Method',  value: order.payment_method?.toUpperCase() ?? '—',        icon: '💳' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon" style={{ background: '#f1f3f7' }}>{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value stat-value-sm">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Update Status + Refund */}
            <div className="card mb-6">
                <div className="card-header">
                    <span className="card-title">Update Status</span>
                </div>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <select
                        value={status}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="form-input"
                        style={{ width: 'auto', minWidth: 180 }}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                        ))}
                    </select>
                    {status !== 'refunded' && status !== 'cancelled' && (
                        <button onClick={refund} className="btn btn-danger btn-sm">
                            ↩ Refund
                        </button>
                    )}
                </div>
            </div>

            <div className="grid-2">
                {/* Left column */}
                <div className="grid-column" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Order Items */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Items ({itemCount})</span>
                        </div>
                        <div className="table-wrap">
                            <table className="ap-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Unit Price</th>
                                        <th>Qty</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item) => {
                                        const img = item.product.images?.find((i) => i.is_primary) ?? item.product.images?.[0];
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#f1f3f7', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {img
                                                                ? <img src={img.url} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                : <Package size={18} color="#9ca3af" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 500, fontSize: 13 }}>{item.product.name}</div>
                                                            {item.product.sku && <div style={{ fontSize: 11, color: '#9ca3af' }}>SKU: {item.product.sku}</div>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-sm">₱{Number(item.unit_price).toFixed(2)}</td>
                                                <td className="text-sm">{item.quantity}</td>
                                                <td className="text-sm font-semibold">₱{Number(item.total_price ?? item.quantity * item.unit_price).toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        {/* Totals */}
                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            {[
                                ['Subtotal', `₱${Number(order.subtotal).toFixed(2)}`],
                                ['Shipping', `₱${Number(order.shipping ?? 0).toFixed(2)}`],
                                ['Tax',      `₱${Number(order.tax ?? 0).toFixed(2)}`],
                            ].map(([l, v]) => (
                                <div key={l} className="field-row" style={{ width: 220, justifyContent: 'space-between' }}>
                                    <span className="field-label">{l}</span>
                                    <span className="field-value">{v}</span>
                                </div>
                            ))}
                            <div style={{ width: 220, display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--border)', fontWeight: 700, fontSize: 14 }}>
                                <span>Total</span>
                                <span>₱{Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">Notes</span></div>
                            <div className="card-body">
                                <p className="text-sm text-muted">{order.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right column */}
                <div className="grid-column" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                    {/* Customer */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">👤 Customer</span></div>
                        <div className="card-body">
                            <Field label="Name"  value={order.user?.name} />
                            <Field label="Email" value={order.user?.email} />
                            <Field label="Phone" value={order.user?.phone} />
                        </div>
                    </div>

                    {/* Seller */}
                    {order.seller && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">🏪 Seller</span></div>
                            <div className="card-body">
                                <Field label="Name"  value={order.seller.name} />
                                <Field label="Email" value={order.seller.email} />
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    {order.address && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">📍 Shipping Address</span></div>
                            <div className="card-body">
                                <Field label="Name"    value={order.address.full_name} />
                                <Field label="Address" value={order.address.address_line1} />
                                {order.address.address_line2 && <Field label="" value={order.address.address_line2} />}
                                <Field label="City"    value={[order.address.city, order.address.state, order.address.postal_code].filter(Boolean).join(', ')} />
                                <Field label="Country" value={order.address.country} />
                                <Field label="Phone"   value={order.address.phone} />
                            </div>
                        </div>
                    )}

                    {/* Shipment */}
                    {order.shipment && (
                        <div className="card">
                            <div className="card-header"><span className="card-title">🚚 Shipment</span></div>
                            <div className="card-body">
                                <Field label="Carrier"  value={order.shipment.carrier} />
                                <Field label="Tracking" value={order.shipment.tracking_number} />
                                <Field label="Status"   value={order.shipment.status} />
                            </div>
                        </div>
                    )}

                    {/* Payment */}
                    <div className="card">
                        <div className="card-header"><span className="card-title">💳 Payment</span></div>
                        <div className="card-body">
                            <Field label="Method" value={order.payment_method?.toUpperCase()} />
                            <Field label="Status" value={status.charAt(0).toUpperCase() + status.slice(1)} />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
