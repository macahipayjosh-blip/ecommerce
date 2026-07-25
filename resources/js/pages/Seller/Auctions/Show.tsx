import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Clock, Gavel, Package, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Bid {
    id: number;
    amount: string;
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
    reserve_price: string;
    auction_start_at: string;
    auction_end_at: string;
    auction_status: string;
    bids: Bid[];
    images: ProductImage[];
}

interface Props {
    auction: Auction;
    order: { id: number; order_number: string; status: string; total: string; user_id: number; created_at: string; user: { id: number; name: string; email: string } } | null;
}

function Countdown({ endTime }: { endTime: string }) {
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)));
    useEffect(() => {
        const t = setInterval(() => setSecondsLeft((p) => Math.max(0, p - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    if (secondsLeft === 0) return <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a32d2d' }}>Ended</span>;
    const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');
    return (
        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a32d2d' }}>
            {h}:{m}:{s}
        </span>
    );
}

const statusColors: Record<string, { bg: string; color: string }> = {
    pending: { bg: '#f0f0f0', color: '#666' },
    live: { bg: '#e8f5e9', color: '#2d6a2d' },
    ended: { bg: '#fff3e0', color: '#e65100' },
    settled: { bg: '#e3f2fd', color: '#1565c0' },
};

export default function SellerAuctionShow({ auction, order }: Props) {
    const highestBid = auction.bids[0] ?? null;
    const isActive = ['live', 'pending'].includes(auction.auction_status) && new Date(auction.auction_end_at) > new Date();
    const primaryImg = auction.images.find((i) => i.is_primary) ?? auction.images[0];
    const sc = statusColors[auction.auction_status] ?? statusColors.pending;

    const totalBidders = new Set(auction.bids.map((b) => b.user.id)).size;
    const avgBid = auction.bids.length ? auction.bids.reduce((sum, b) => sum + parseFloat(b.amount), 0) / auction.bids.length : 0;

    return (
        <SellerLayout breadcrumb={auction.name}>
            <Head title={`Auction — ${auction.name}`} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link
                        href={route('seller.auctions.index')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            border: '1px solid #e8e8e4',
                            color: '#6e6d67',
                            textDecoration: 'none',
                        }}
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, letterSpacing: '-0.5px' }}>{auction.name}</div>
                        <div style={{ fontSize: 12, color: '#b0afa8', fontFamily: "'DM Mono', monospace" }}>Auction Monitor</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                        href={route('seller.auctions.edit', auction.id)}
                        style={{ padding: '8px 14px', border: '1px solid #e8e8e4', fontSize: 13, color: '#333', textDecoration: 'none' }}
                    >
                        Edit
                    </Link>
                    {auction.auction_status === 'settled' && order && (
                        <Link
                            href={route('seller.orders.show', order.id)}
                            style={{
                                padding: '8px 14px',
                                background: '#2d6a2d',
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 600,
                                textDecoration: 'none',
                                borderRadius: 4,
                            }}
                        >
                            View Order #{order.order_number}
                        </Link>
                    )}
                    <span
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 14px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            ...sc,
                        }}
                    >
                        {auction.auction_status.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Settled order banner */}
            {auction.auction_status === 'settled' && order && (
                <div style={{ marginBottom: 20, padding: '14px 18px', background: '#f0faf0', border: '1px solid #a8d8a8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2d6a2d' }}>✓ Auction settled — order automatically placed</div>
                        <div style={{ fontSize: 12, color: '#4a7a4a', marginTop: 2 }}>
                            Winner: <strong>{order.user.name}</strong> ({order.user.email}) · ₱{parseFloat(order.total).toFixed(2)} · {new Date(order.created_at).toLocaleString()}
                        </div>
                    </div>
                    <Link href={route('seller.orders.show', order.id)}
                        style={{ fontSize: 13, fontWeight: 600, color: '#2d6a2d', textDecoration: 'underline' }}>
                        View Order #{order.order_number}
                    </Link>
                </div>
            )}
            {auction.auction_status === 'settled' && !order && (
                <div style={{ marginBottom: 20, padding: '14px 18px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 8, fontSize: 13, color: '#7a5a00' }}>
                    Auction ended with no valid bids meeting the reserve price. No order was created.
                </div>
            )}

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    {
                        icon: <TrendingUp size={18} color="#2d6a2d" />,
                        label: 'Highest Bid',
                        value: highestBid ? `₱${parseFloat(highestBid.amount).toFixed(2)}` : '—',
                        highlight: true,
                    },
                    { icon: <Gavel size={18} color="#555" />, label: 'Total Bids', value: auction.bids.length },
                    { icon: <Users size={18} color="#555" />, label: 'Bidders', value: totalBidders },
                    {
                        icon: <Clock size={18} color="#a32d2d" />,
                        label: isActive ? 'Time Left' : 'Ended',
                        value: isActive ? <Countdown endTime={auction.auction_end_at} /> : new Date(auction.auction_end_at).toLocaleDateString(),
                    },
                ].map((s, i) => (
                    <div key={i} style={{ border: '1px solid #e8e8e4', background: '#fff', padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            {s.icon}
                            <span
                                style={{
                                    fontSize: 11,
                                    color: '#999',
                                    fontFamily: "'DM Mono', monospace",
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                }}
                            >
                                {s.label}
                            </span>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: s.highlight ? '#2d6a2d' : '#0d0d0d' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
                {/* Left — image + details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ border: '1px solid #e8e8e4', background: '#fff', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: 220,
                                overflow: 'hidden',
                                background: '#f5f5f3',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {primaryImg ? (
                                <img
                                    src={`/storage/${primaryImg.image_path}`}
                                    alt={auction.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <Package size={48} color="#ccc" />
                            )}
                        </div>
                        {auction.images.length > 1 && (
                            <div style={{ display: 'flex', gap: 6, padding: 10, overflowX: 'auto' }}>
                                {auction.images.map((img) => (
                                    <img
                                        key={img.id}
                                        src={`/storage/${img.image_path}`}
                                        alt=""
                                        style={{
                                            width: 48,
                                            height: 48,
                                            objectFit: 'cover',
                                            border: img.is_primary ? '2px solid #0d0d0d' : '1px solid #e8e8e4',
                                            flexShrink: 0,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ border: '1px solid #e8e8e4', background: '#fff' }}>
                        <div
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #e8e8e4',
                                fontSize: 11,
                                fontFamily: "'DM Mono', monospace",
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#666',
                            }}
                        >
                            Details
                        </div>
                        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                ['Breed', auction.breed],
                                ['Age', auction.age],
                                ['Weight', `${auction.weight} ${auction.weight_unit}`],
                                ['Reserve Price', `₱${parseFloat(auction.reserve_price ?? '0').toFixed(2)}`],
                                ['Avg Bid', auction.bids.length ? `₱${avgBid.toFixed(2)}` : '—'],
                                ['Start', new Date(auction.auction_start_at).toLocaleString()],
                                ['End', new Date(auction.auction_end_at).toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#999' }}>{label}</span>
                                    <span style={{ fontWeight: 500 }}>{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right — bid history */}
                <div style={{ border: '1px solid #e8e8e4', background: '#fff' }}>
                    <div
                        style={{
                            padding: '14px 18px',
                            borderBottom: '1px solid #e8e8e4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span
                            style={{
                                fontSize: 11,
                                fontFamily: "'DM Mono', monospace",
                                textTransform: 'uppercase',
                                letterSpacing: '0.08em',
                                color: '#666',
                            }}
                        >
                            Bid History
                        </span>
                        <span style={{ fontSize: 12, color: '#999' }}>
                            {auction.bids.length} bid{auction.bids.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {auction.bids.length === 0 ? (
                        <div style={{ padding: 48, textAlign: 'center', color: '#b0afa8', fontSize: 13 }}>
                            <Gavel size={32} style={{ margin: '0 auto 12px', color: '#e8e8e4' }} />
                            No bids yet. Share your auction to attract bidders.
                        </div>
                    ) : (
                        <div style={{ overflowY: 'auto', maxHeight: 520 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#fafaf8', borderBottom: '1px solid #e8e8e4' }}>
                                        {['#', 'Bidder', 'Email', 'Amount', 'Time'].map((h) => (
                                            <th
                                                key={h}
                                                style={{
                                                    padding: '10px 14px',
                                                    textAlign: 'left',
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: '#999',
                                                    fontFamily: "'DM Mono', monospace",
                                                    textTransform: 'uppercase',
                                                }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {auction.bids.map((bid, idx) => (
                                        <tr
                                            key={bid.id}
                                            style={{ borderBottom: '1px solid #f0f0f0', background: idx === 0 ? '#f0faf0' : 'transparent' }}
                                        >
                                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#999' }}>#{auction.bids.length - idx}</td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div
                                                        style={{
                                                            width: 28,
                                                            height: 28,
                                                            borderRadius: '50%',
                                                            background: idx === 0 ? '#2d6a2d' : '#e8e8e4',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            color: idx === 0 ? '#fff' : '#666',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {bid.user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{bid.user.name}</div>
                                                        {idx === 0 && <div style={{ fontSize: 10, color: '#2d6a2d', fontWeight: 600 }}>HIGHEST</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#999' }}>{bid.user.email}</td>
                                            <td
                                                style={{
                                                    padding: '10px 14px',
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    color: idx === 0 ? '#2d6a2d' : '#0d0d0d',
                                                }}
                                            >
                                                ₱{parseFloat(bid.amount).toFixed(2)}
                                            </td>
                                            <td style={{ padding: '10px 14px', fontSize: 12, color: '#999' }}>
                                                {new Date(bid.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
}
