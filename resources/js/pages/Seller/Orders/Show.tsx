import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, CreditCard, MapPin, Package, Printer, Truck, User } from 'lucide-react';
import SellerLayout from '@/layouts/SellerLayout';

interface OrderItem { id: number; product?: { name: string; images?: { url: string; is_primary: boolean }[] }; quantity: number; unit_price: number }
interface Order {
    id: number; order_number: string; status: string; payment_status: string;
    subtotal: number; shipping_cost: number; tax: number; total: number;
    items: OrderItem[];
    customer: { name: string; email: string };
    shipping_address?: { full_name: string; address_line1: string; city: string; state: string; postal_code: string; country: string };
    rider?: never;
    created_at: string;
}

const STATUS_DOT: Record<string, string> = {
    pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444',
};

const NEXT_STATUS: Record<string, string> = {
    pending: 'confirmed', confirmed: 'shipped', shipped: 'delivered',
};

const sectionStyle = { border: '1px solid #e8e8e4', background: '#fff' };
const sectionHead = { padding: '14px 18px', borderBottom: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', gap: 8 };
const sectionBody = { padding: 18 };
const sectionTitle = { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 500 };

export default function VendorOrderShow({ order }: { order: Order }) {
    const next = NEXT_STATUS[order.status];
    const dot = STATUS_DOT[order.status] ?? '#b0afa8';

    const advance = () => {
        if (!next) return;
        router.patch(route('seller.orders.status', order.id), { status: next });
    };

    return (
        <SellerLayout breadcrumb={`Order #${order.order_number}`}>
            <Head title={`Order #${order.order_number}`} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
                <Link href={route('seller.orders.index')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid #e8e8e4', color: '#6e6d67', textDecoration: 'none', flexShrink: 0 }}>
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, letterSpacing: '-0.5px' }}>Order #{order.order_number}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#b0afa8', marginTop: 2 }}>{new Date(order.created_at).toLocaleDateString()}</div>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', padding: '4px 10px', border: `1px solid ${dot}33`, background: `${dot}11`, color: dot }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
                    {order.status}
                </span>
                <Link href={route('seller.orders.invoice', order.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#0d0d0d', color: '#fff', fontSize: 12, textDecoration: 'none', fontFamily: "'DM Mono', monospace", letterSpacing: '0.05em' }}>
                    <Printer className="h-3.5 w-3.5" /> Invoice
                </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                {/* Items */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Items</span></div>
                    <div style={sectionBody}>
                        {order.items.map((item, i) => {
                            const img = item.product?.images?.find(i => i.is_primary) ?? item.product?.images?.[0];
                            return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < order.items.length - 1 ? '1px solid #e8e8e4' : 'none' }}>
                                <div style={{ width: 44, height: 44, background: '#f5f5f3', border: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                    {img ? (
                                        <img src={img.url} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Package className="h-5 w-5" style={{ color: '#b0afa8' }} />
                                    )}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name ?? '(deleted product)'}</div>
                                    <div style={{ fontSize: 12, color: '#b0afa8', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>Qty: {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}</div>
                                </div>
                                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 600 }}>₱{(item.quantity * Number(item.unit_price)).toFixed(2)}</div>
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Side panels */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Customer */}
                    <div style={sectionStyle}>
                        <div style={sectionHead}>
                            <User className="h-4 w-4" style={{ color: '#b0afa8' }} />
                            <span style={sectionTitle}>Customer</span>
                        </div>
                        <div style={sectionBody}>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{order.customer.name}</div>
                            <div style={{ fontSize: 12, color: '#b0afa8', fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{order.customer.email}</div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={sectionStyle}>
                        <div style={sectionHead}>
                            <CreditCard className="h-4 w-4" style={{ color: '#b0afa8' }} />
                            <span style={sectionTitle}>Summary</span>
                        </div>
                        <div style={sectionBody}>
                            {[['Subtotal', `₱${Number(order.subtotal).toFixed(2)}`], ['Shipping', `₱${Number(order.shipping_cost).toFixed(2)}`], ['Tax', `₱${Number(order.tax).toFixed(2)}`]].map(([l, v]) => (
                                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6e6d67', marginBottom: 8 }}>
                                    <span>{l}</span><span style={{ fontFamily: "'DM Mono', monospace" }}>{v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, borderTop: '1px solid #e8e8e4', paddingTop: 10, marginTop: 4 }}>
                                <span>Total</span>
                                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, letterSpacing: '-0.5px' }}>₱{Number(order.total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    {order.shipping_address && (
                        <div style={sectionStyle}>
                            <div style={sectionHead}>
                                <MapPin className="h-4 w-4" style={{ color: '#b0afa8' }} />
                                <span style={sectionTitle}>Ship To</span>
                            </div>
                            <div style={sectionBody}>
                                <address style={{ fontStyle: 'normal', fontSize: 13, color: '#6e6d67', lineHeight: 1.7 }}>
                                    <div style={{ fontWeight: 500, color: '#0d0d0d' }}>{order.shipping_address.full_name}</div>
                                    <div>{order.shipping_address.address_line1}</div>
                                    <div>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</div>
                                    <div>{order.shipping_address.country}</div>
                                </address>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Advance status */}
            {next && (
                <div style={{ marginTop: 20 }}>
                    <button onClick={advance}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#0d0d0d', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer' }}>
                        {next === 'shipped' ? <Truck className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        Mark as {next.charAt(0).toUpperCase() + next.slice(1)}
                    </button>
                </div>
            )}
        </SellerLayout>
    );
}
