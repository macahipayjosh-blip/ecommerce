import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Gavel, Trash2 } from 'lucide-react';

interface Bid {
    id: number;
    amount: number;
    created_at: string;
    user: { id: number; name: string };
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

interface Props {
    product: Auction;
}

const statusStyle: Record<string, { background: string; color: string }> = {
    pending: { background: '#f0f0f0', color: '#666' },
    live:    { background: '#e8f5e9', color: '#2d6a2d' },
    ended:   { background: '#fff3e0', color: '#e65100' },
    settled: { background: '#e3f2fd', color: '#1565c0' },
};

export default function AdminAuctionShow({ product }: Props) {
    const { data, setData, patch, processing } = useForm({ auction_status: product.auction_status });

    const handleStatusUpdate = () => {
        patch(route('admin.auctions.update', product.id));
    };

    const handleDelete = () => {
        if (!confirm('Delete this auction? This cannot be undone.')) return;
        router.delete(route('admin.auctions.destroy', product.id));
    };

    const primaryImage = product.images.find((i) => i.is_primary) ?? product.images[0];

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
                        <p style={{ fontSize: 12, color: '#999' }}>Auction Details</p>
                    </div>
                </div>
                <button onClick={handleDelete} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#a32d2d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    <Trash2 size={14} /> Delete Auction
                </button>
            </div>

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
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 3 }}>{label}</p>
                                <p style={{ fontSize: 13 }}>{value}</p>
                            </div>
                        ))}
                        {/* Status Update */}
                        <div>
                            <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 6 }}>STATUS</p>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                <select
                                    value={data.auction_status}
                                    onChange={(e) => setData('auction_status', e.target.value)}
                                    style={{ flex: 1, padding: '7px 10px', border: '1px solid #e8e8e4', borderRadius: 6, fontSize: 13, background: '#fff' }}
                                >
                                    {['pending', 'live', 'ended', 'settled'].map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleStatusUpdate}
                                    disabled={processing}
                                    style={{ padding: '7px 14px', background: '#0d0d0d', color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}
                                >
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
                        {[['NAME', product.seller.name], ['EMAIL', product.seller.email]].map(([label, value]) => (
                            <div key={label}>
                                <p style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 3 }}>{label}</p>
                                <p style={{ fontSize: 13 }}>{value}</p>
                            </div>
                        ))}
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
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e8e8e4', background: '#f5f5f3' }}>
                    <h2 style={{ fontSize: 13, fontWeight: 600 }}>Bids ({product.bids.length})</h2>
                </div>
                {product.bids.length === 0 ? (
                    <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>No bids yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e8e8e4', background: '#fafaf8' }}>
                                {['BIDDER', 'AMOUNT', 'TIME'].map((h) => (
                                    <th key={h} style={{ padding: 12, textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#666' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {product.bids.map((bid, idx) => (
                                <tr key={bid.id} style={{ borderBottom: '1px solid #e8e8e4', background: idx === 0 ? '#e8f5e9' : 'transparent' }}>
                                    <td style={{ padding: 12, fontSize: 13 }}>{bid.user.name}</td>
                                    <td style={{ padding: 12, fontSize: 13, fontWeight: 600, color: idx === 0 ? '#2d6a2d' : 'inherit' }}>₱{parseFloat(String(bid.amount)).toFixed(2)}</td>
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
