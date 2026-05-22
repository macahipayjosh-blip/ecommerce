import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Gavel, Pencil, Plus, Trash2 } from 'lucide-react';

interface Auction {
    id: number;
    name: string;
    reserve_price: number;
    auction_start_at: string | null;
    auction_end_at: string | null;
    auction_status: string;
    bids_count: number;
    images?: { image_path: string }[];
    created_at: string;
}

interface Props {
    auctions: { data: Auction[]; links: any[]; meta: any };
}

export default function SellerAuctionsIndex({ auctions }: Props) {
    const handleDelete = (id: number) => {
        if (!confirm('Delete this auction? This cannot be undone.')) return;
        router.delete(route('seller.auctions.destroy', id));
    };

    return (
        <SellerLayout breadcrumb="Auctions">
            <Head title="My Auctions" />

            <div className="pg-header">
                <div>
                    <div className="pg-title">My Auctions</div>
                    <div className="pg-subtitle">Review and manage your auction listings.</div>
                </div>
                <Link href={route('seller.auctions.create')} className="btn btn-primary">
                    <Plus className="h-4 w-4" /> Create Auction
                </Link>
            </div>

            <div className="card">
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                {['Auction', 'Reserve', 'Bids', 'Status', 'Start', 'End', 'Actions'].map((h) => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {auctions.data.map((auction) => (
                                <tr key={auction.id}>
                                    <td>
                                        <div className="item-cell">
                                            <div className="item-image">
                                                {auction.images?.[0]?.image_path ? (
                                                    <img src={`/storage/${auction.images[0].image_path}`} alt={auction.name} />
                                                ) : (
                                                    <Gavel className="icon-placeholder" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="item-title">{auction.name}</div>
                                                <div className="item-subtext">Listed {new Date(auction.created_at).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="strong">₱{Number(auction.reserve_price ?? 0).toFixed(2)}</td>
                                    <td>{auction.bids_count}</td>
                                    <td>
                                        <span className={`badge ${auction.auction_status === 'live' ? 'badge-green' : auction.auction_status === 'ended' ? 'badge-yellow' : auction.auction_status === 'settled' ? 'badge-blue' : 'badge-gray'}`}>
                                            {auction.auction_status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{auction.auction_start_at ? new Date(auction.auction_start_at).toLocaleString() : 'N/A'}</td>
                                    <td>{auction.auction_end_at ? new Date(auction.auction_end_at).toLocaleString() : 'N/A'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                            <Link href={route('seller.auctions.show', auction.id)} style={{ color: '#555', display: 'flex' }}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                            <Link href={route('seller.auctions.edit', auction.id)} style={{ color: '#2d6a2d', display: 'flex' }}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(auction.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a32d2d', display: 'flex', padding: 0 }}>
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {auctions.data.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Gavel className="mx-auto h-12 w-12" /></div>
                        <div className="empty-state-title">No auctions yet</div>
                        <div className="empty-state-text">Create your first auction to start receiving bids.</div>
                        <Link href={route('seller.auctions.create')} className="btn btn-primary empty-state-button">
                            <Plus className="h-4 w-4" /> Create Auction
                        </Link>
                    </div>
                )}

                {auctions.links && auctions.data.length > 0 && (
                    <div className="pagination">
                        <span className="pagination-info">Showing {auctions.meta?.from}–{auctions.meta?.to} of {auctions.meta?.total}</span>
                        <div className="pagination-links">
                            {auctions.links.map((link, i) =>
                                link.url ? (
                                    <Link key={i} href={link.url} className={link.active ? 'active' : ''} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ) : (
                                    <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
