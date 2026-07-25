import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Gavel, Package, Trash2, Trophy, User } from 'lucide-react';

interface Bid {
    id: number;
    amount: number;
    created_at: string;
    user: { id: number; name: string; email: string };
}

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Auction {
    id: number;
    name: string;
    description: string;
    breed: string;
    age: string;
    weight: number;
    weight_unit: string;
    reserve_price: number;
    auction_start_at: string;
    auction_end_at: string;
    auction_status: string;
    seller: { id: number; name: string; email: string };
    bids: Bid[];
    images: ProductImage[];
}

interface OrderAddress {
    street?: string; city?: string; province?: string; zip?: string;
}

interface AuctionOrder {
    id: number;
    order_number: string;
    status: string;
    subtotal: string;
    auction_fee: string;
    total: string;
    payment_method: string;
    created_at: string;
    user: { id: number; name: string; email: string };
    address: OrderAddress | null;
}

interface Props {
    product: Auction;
    winner: { id: number; name: string; email: string } | null;
    order: AuctionOrder | null;
}

const statusStyle: Record<string, { background: string; color: string }> = {
    pending: { background: '#f0f0f0', color: '#666' },
    live:    { background: '#e8f5e9', color: '#2d6a2d' },
    ended:   { background: '#fff3e0', color: '#e65100' },
    settled: { background: '#e3f2fd', color: '#1565c0' },
};

export default function AdminAuctionShow({ product, winner, order }: Props) {
    const { data, setData, patch, processing } = useForm({ auction_status: product.auction_status });

    const handleStatusUpdate = () => patch(route('admin.auctions.update', product.id));
    const handleDelete = () => {
        if (!confirm('Delete this auction? This cannot be undone.')) return;
        router.delete(route('admin.auctions.destroy', product.id));
    };

    const highestBid = product.bids[0] ?? null;
    const ss = statusStyle[product.auction_status] ?? statusStyle.pending;

    return (
        <AdminLayout breadcrumb={product.name}>
            <Head title={product.name} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href={route('admin.auctions.index')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid #e8e8e4', textDecoration: 'none', color: '#666' }}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>{product.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontSize: 12, color: '#999' }}>Auction Details</p>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, ...ss }}>
                                {product.auction_status.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
                <button onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#a32d2d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete Auction
                </button>
            </div>

            {/* ── Winner + Order banner (settled) ── */}
            {product.auction_status === 'settled' && winner && order && (
                <div style={{ marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid #a8d8a8' }}>
                    <div style={{ padding: '12px 20px', background: '#2d6a2d', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Trophy size={16} color="#fff" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Auction Settled — Winner &amp; Order</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f0faf0' }}>
                        {/* Winner */}
                        <div style={{ padding: '18px 20px', borderRight: '1px solid #c8e8c8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2d6a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 15 }}>
                                    {winner.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1a4a1a' }}>{winner.name}</div>
                                    <div style={{ fontSize: 11, color: '#4a7a4a' }}>{winner.email}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Row label="Winning Bid" value={`₱${parseFloat(String(highestBid?.amount ?? 0)).toFixed(2)}`} highlight />
                                <Row label="Auction Fee (8%)" value={`₱${parseFloat(order.auction_fee).toFixed(2)}`} />
                                <Row label="Total Paid" value={`₱${parseFloat(order.total).toFixed(2)}`} highlight />
                                {order.address && (
                                    <Row label="Ship To" value={[
                                        order.address.street,
                                        order.address.city,
                                        order.address.province,
                                        order.address.zip,
                                    ].filter(Boolean).join(', ')} />
                                )}
                            </div>
                        </div>
                        {/* Order */}
                        <div style={{ padding: '18px 20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <CheckCircle size={16} color="#2d6a2d" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a4a1a' }}>Order #{order.order_number}</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <Row label="Status" value={order.status.toUpperCase()} />
                                <Row label="Payment" value={order.payment_method.toUpperCase()} />
                                <Row label="Placed On" value={new Date(order.created_at).toLocaleString()} />
                            </div>
                            <Link
                                href={route('admin.orders.show', order.id)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, padding: '7px 14px', background: '#2d6a2d', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                            >
                                <Package size={13} /> View Full Order
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {product.auction_status === 'settled' && !order && (
                <div style={{ marginBottom: 20, padding: '14px 18px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, fontSize: 13, color: '#7a5a00' }}>
                    Auction ended with no valid bids meeting the reserve price. No order was created.
                </div>
            )}

            {/* Images */}
            {product.images.length > 0 && (
                <div style={{ marginBottom: 20, border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 600 }}>Images ({product.images.length})</h2>
                    </div>
                    <div style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {product.images.map((img) => (
                            <div key={img.id} style={{ position: 'relative', width: 120, height: 120, borderRadius: 6, overflow: 'hidden', border: `2px solid ${img.is_primary ? '#0d0d0d' : '#e8e8e4'}` }}>
                                <img src={`/storage/${img.image_path}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {img.is_primary && (
                                    <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#0d0d0d', color: '#fff', fontSize: 9, padding: '2px 5px', borderRadius: 3 }}>PRIMARY</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Auction Info */}
                <div style={{ border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 600 }}>Auction Information</h2>
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[
                            ['BREED', product.breed],
                            ['AGE', product.age],
                            ['WEIGHT', `${product.weight} ${product.weight_unit}`],
                            ['RESERVE PRICE', `₱${parseFloat(String(product.reserve_price)).toFixed(2)}`],
                            ['TOTAL BIDS', product.bids.length],
                            ['HIGHEST BID', highestBid ? `₱${parseFloat(String(highestBid.amount)).toFixed(2)}` : '—'],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 3 }}>{label}</p>
                                <p style={{ fontSize: 13 }}>{value}</p>
                            </div>
                        ))}
                        <div>
                            <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 6 }}>STATUS</p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select value={data.auction_status} onChange={(e) => setData('auction_status', e.target.value)}
                                    style={{ flex: 1, padding: '7px 10px', border: '1px solid #e8e8e4', borderRadius: 6, fontSize: 13, background: '#fff' }}>
                                    {['pending', 'live', 'ended', 'settled'].map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                                <button onClick={handleStatusUpdate} disabled={processing}
                                    style={{ padding: '7px 14px', background: '#0d0d0d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seller Info */}
                <div style={{ border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                        <h2 style={{ fontSize: 13, fontWeight: 600 }}>Seller Information</h2>
                    </div>
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                                {product.seller.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{product.seller.name}</div>
                                <div style={{ fontSize: 11, color: '#999' }}>{product.seller.email}</div>
                            </div>
                        </div>
                        <Link href={route('admin.users.show', product.seller.id)}
                            style={{ fontSize: 12, color: '#1565c0', textDecoration: 'underline' }}>
                            View Seller Profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div style={{ marginTop: 20, border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600 }}>Auction Timeline</h2>
                </div>
                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {[['STARTS', product.auction_start_at], ['ENDS', product.auction_end_at]].map(([label, val]) => (
                        <div key={label}>
                            <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 3 }}>{label}</p>
                            <p style={{ fontSize: 13 }}>{new Date(val).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bids */}
            <div style={{ marginTop: 20, border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600 }}>Bid History ({product.bids.length})</h2>
                    {highestBid && (
                        <span style={{ fontSize: 12, color: '#2d6a2d', fontWeight: 700 }}>
                            Highest: ₱{parseFloat(String(highestBid.amount)).toFixed(2)} — {highestBid.user.name}
                        </span>
                    )}
                </div>
                {product.bids.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>No bids yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e8e8e4', background: '#fafaf8' }}>
                                {['#', 'BIDDER', 'EMAIL', 'AMOUNT', 'TIME'].map((h) => (
                                    <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#666' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {product.bids.map((bid, idx) => (
                                <tr key={bid.id} style={{ borderBottom: '1px solid #e8e8e4', background: idx === 0 ? '#e8f5e9' : 'transparent' }}>
                                    <td style={{ padding: 12, fontSize: 12, color: '#999' }}>#{product.bids.length - idx}</td>
                                    <td style={{ padding: 12, fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: idx === 0 ? '#2d6a2d' : '#e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: idx === 0 ? '#fff' : '#666', flexShrink: 0 }}>
                                                {bid.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{bid.user.name}</div>
                                                {idx === 0 && <div style={{ fontSize: 10, color: '#2d6a2d', fontWeight: 700 }}>WINNER</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: 12, fontSize: 12, color: '#999' }}>{bid.user.email}</td>
                                    <td style={{ padding: 12, fontSize: 13, fontWeight: 700, color: idx === 0 ? '#2d6a2d' : '#0d0d0d' }}>₱{parseFloat(String(bid.amount)).toFixed(2)}</td>
                                    <td style={{ padding: 12, fontSize: 12, color: '#999' }}>{new Date(bid.created_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Description */}
            <div style={{ marginTop: 20, border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600 }}>Description</h2>
                </div>
                <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#444' }}>{product.description}</p>
                </div>
            </div>
        </AdminLayout>
    );
}

function Row({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#4a7a4a' }}>{label}</span>
            <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? '#1a4a1a' : '#2a5a2a' }}>{value}</span>
        </div>
    );
}
