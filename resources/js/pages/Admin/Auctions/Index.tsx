import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Gavel, Trash2 } from 'lucide-react';

interface Auction {
    id: number;
    name: string;
    reserve_price: number;
    auction_start_at: string;
    auction_end_at: string;
    auction_status: 'pending' | 'live' | 'ended' | 'settled';
    breed: string;
    age: string;
    seller: { id: number; name: string; email: string };
    bids: { id: number }[];
    images: { image_path: string }[];
}

interface Props {
    auctions: { data: Auction[]; links: any[]; meta?: { total?: number; from?: number; to?: number } };
}

const statusStyle: Record<string, { background: string; color: string }> = {
    pending: { background: '#f0f0f0', color: '#666' },
    live:    { background: '#e8f5e9', color: '#2d6a2d' },
    ended:   { background: '#fff3e0', color: '#e65100' },
    settled: { background: '#e3f2fd', color: '#1565c0' },
};

export default function AdminAuctionsIndex({ auctions }: Props) {
    const handleDelete = (id: number) => {
        if (!confirm('Delete this auction? This cannot be undone.')) return;
        router.delete(route('admin.auctions.destroy', id));
    };

    return (
        <AdminLayout breadcrumb="Auctions">
            <Head title="Auctions" />
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 4 }}>Livestock Auctions</h1>
                <p style={{ fontSize: 13, color: '#666' }}>Monitor and manage active auctions</p>
            </div>

            {auctions.data.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', border: '1px solid #e8e8e4', borderRadius: 8 }}>
                    <Gavel style={{ height: 48, width: 48, color: '#ccc', margin: '0 auto 16px' }} />
                    <p style={{ fontSize: 14, color: '#666' }}>No auctions found.</p>
                </div>
            ) : (
                <div style={{ border: '1px solid #e8e8e4', borderRadius: 8, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f5f5f3', borderBottom: '1px solid #e8e8e4' }}>
                                {['Livestock', 'Seller', 'Reserve', 'Bids', 'Status', 'Ends', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: 12, textAlign: h === 'Actions' ? 'center' : 'left', fontSize: 12, fontWeight: 600, color: '#666' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {auctions.data.map((auction) => (
                                <tr key={auction.id} style={{ borderBottom: '1px solid #e8e8e4' }}>
                                    <td style={{ padding: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', border: '1px solid #e8e8e4', flexShrink: 0, background: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {auction.images?.[0]?.image_path ? (
                                                    <img src={`/storage/${auction.images[0].image_path}`} alt={auction.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Gavel size={18} style={{ color: '#ccc' }} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 13, fontWeight: 500 }}>{auction.name}</div>
                                                <div style={{ fontSize: 11, color: '#999' }}>{auction.breed} • {auction.age}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: 12, fontSize: 13 }}>{auction.seller.name}</td>
                                    <td style={{ padding: 12, fontSize: 13, fontWeight: 500 }}>₱{parseFloat(String(auction.reserve_price)).toFixed(2)}</td>
                                    <td style={{ padding: 12, fontSize: 13 }}>{auction.bids.length}</td>
                                    <td style={{ padding: 12 }}>
                                        <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, ...(statusStyle[auction.auction_status] ?? {}) }}>
                                            {auction.auction_status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: 12, fontSize: 12, color: '#666' }}>{new Date(auction.auction_end_at).toLocaleDateString()}</td>
                                    <td style={{ padding: 12, textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                            <Link href={route('admin.auctions.show', auction.id)} style={{ display: 'flex', alignItems: 'center', color: '#0d0d0d', textDecoration: 'none' }}>
                                                <Eye size={15} />
                                            </Link>
                                            <button onClick={() => handleDelete(auction.id)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#a32d2d', padding: 0 }}>
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {auctions.meta && auctions.data.length > 0 && (
                        <div style={{ padding: '12px 16px', borderTop: '1px solid #e8e8e4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
                            <span>Showing {auctions.meta.from}–{auctions.meta.to} of {auctions.meta.total}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {auctions.links.map((link, i) =>
                                    link.url ? (
                                        <Link key={i} href={link.url} style={{ padding: '4px 8px', border: '1px solid #e8e8e4', borderRadius: 4, textDecoration: 'none', color: link.active ? '#fff' : '#333', background: link.active ? '#0d0d0d' : '#fff', fontSize: 12 }} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ) : (
                                        <span key={i} style={{ padding: '4px 8px', color: '#ccc', fontSize: 12 }} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
