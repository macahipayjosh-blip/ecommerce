import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, ChevronRight, Clock, Eye, Gavel, Package, ShoppingCart, Truck, X } from 'lucide-react';
import { useState } from 'react';

interface Product { id: number; name: string; price: string | number; is_auction?: boolean; images?: { url: string; is_primary: boolean }[] }
interface OrderItem { id: number; product: Product; quantity: number; unit_price: string | number }
interface OrderUser { id: number; name: string; email: string }
interface Order {
    id: number; order_number: string; status: string; payment_method: string;
    total: string | number; user?: OrderUser; items: OrderItem[]; created_at: string;
}
interface PaginationLink { url: string | null; label: string; active: boolean }
interface Paginated { data: Order[]; links: PaginationLink[]; meta: { total: number; from: number; to: number; current_page: number; last_page: number } }
interface Props {
    orders: Paginated;
    statusCounts: Record<string, number>;
    auctionOrders: Paginated;
    auctionStatusCounts: Record<string, number>;
}

const STATUS_DOT: Record<string, string> = {
    pending: '#f59e0b', confirmed: '#3b82f6', shipped: '#8b5cf6',
    delivered: '#22c55e', cancelled: '#ef4444', paid: '#6366f1',
};

const NEXT_STATUS: Record<string, { label: string; value: string }> = {
    pending:   { label: 'Confirm Order',   value: 'confirmed' },
    confirmed: { label: 'Mark as Shipped', value: 'shipped' },
    shipped:   { label: 'Mark Delivered',  value: 'delivered' },
};

const REGULAR_TABS = [
    { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' }, { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }, { key: 'cancelled', label: 'Cancelled' },
];

const AUCTION_TABS = [
    { key: 'all', label: 'All' }, { key: 'confirmed', label: 'Confirmed' },
    { key: 'shipped', label: 'Shipped' }, { key: 'delivered', label: 'Delivered' },
    { key: 'cancelled', label: 'Cancelled' },
];

function OrderCard({ order, onAdvance, advancing }: { order: Order; onAdvance: (o: Order, s: string) => void; advancing: number | null }) {
    const next = NEXT_STATUS[order.status];
    const isAdvancing = advancing === order.id;
    const dot = STATUS_DOT[order.status] ?? '#6b7e68';
    const isAuction = order.payment_method === 'auction';

    return (
        <div className="card">
            <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>#{order.order_number}</span>
                            {isAuction && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, padding: '2px 7px', borderRadius: 20, background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc8044', fontWeight: 700 }}>
                                    <Gavel size={10} /> AUCTION
                                </span>
                            )}
                        </div>
                        <div style={{ fontSize: 11, color: '#6b7e68', marginTop: 2 }}>
                            {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '3px 9px', borderRadius: 20, border: `1px solid ${dot}44`, background: `${dot}18`, color: dot, fontWeight: 600 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                        {order.status}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#1a2e1a' }}>₱{Number(order.total).toFixed(2)}</div>
                        {order.user && <div style={{ fontSize: 11, color: '#6b7e68' }}>{order.user.name}</div>}
                    </div>
                    <Link href={route('seller.orders.show', order.id)} className="btn btn-secondary btn-sm">
                        <Eye className="h-3.5 w-3.5" /> View <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                </div>
            </div>

            <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {order.items.slice(0, 4).map((item) => {
                    const img = item.product?.images?.find(i => i.is_primary) ?? item.product?.images?.[0];
                    return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #d4ddd2', padding: '6px 10px', background: '#f4f8f3', borderRadius: 6 }}>
                            <div style={{ width: 28, height: 28, background: '#fff', border: '1px solid #d4ddd2', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                                {img ? (
                                    <img src={img.url} alt={item.product?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Package className="h-3.5 w-3.5" style={{ color: '#6b7e68' }} />
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: 12, fontWeight: 500, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product?.name ?? 'Product'}</div>
                                <div style={{ fontSize: 11, color: '#6b7e68' }}>{item.quantity} × ₱{Number(item.unit_price).toFixed(2)}</div>
                            </div>
                        </div>
                    );
                })}
                {order.items.length > 4 && (
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px dashed #d4ddd2', padding: '6px 10px', fontSize: 12, color: '#6b7e68', borderRadius: 6 }}>
                        +{order.items.length - 4} more
                    </div>
                )}
            </div>

            {(next || order.status === 'pending') && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderTop: '1px solid #e8f0e6', background: '#f4f8f3', flexWrap: 'wrap', gap: 8 }}>
                    <span style={{ fontSize: 11, color: '#6b7e68' }}>
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}{order.user?.email ? ` · ${order.user.email}` : ''}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                        {order.status === 'pending' && (
                            <button onClick={() => onAdvance(order, 'cancelled')} disabled={isAdvancing} className="btn btn-danger btn-sm">
                                <X className="h-3.5 w-3.5" /> Cancel
                            </button>
                        )}
                        {next && (
                            <button onClick={() => onAdvance(order, next.value)} disabled={isAdvancing} className="btn btn-primary btn-sm">
                                {next.value === 'confirmed' && <CheckCircle className="h-3.5 w-3.5" />}
                                {next.value === 'shipped'   && <Truck className="h-3.5 w-3.5" />}
                                {next.value === 'delivered' && <CheckCircle className="h-3.5 w-3.5" />}
                                {isAdvancing ? 'Updating…' : next.label}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function PaginationBar({ paginatedData, paramKey }: { paginatedData: Paginated; paramKey: string }) {
    if ((paginatedData.meta?.last_page ?? 1) <= 1) return null;
    return (
        <div className="pagination" style={{ marginTop: 16 }}>
            <span className="pagination-info">Showing {paginatedData.meta?.from}–{paginatedData.meta?.to} of {paginatedData.meta?.total}</span>
            <div className="pagination-links">
                {paginatedData.links.map((link, i) =>
                    link.url ? (
                        <Link key={i} href={link.url} className={link.active ? 'active' : ''} dangerouslySetInnerHTML={{ __html: link.label }} />
                    ) : (
                        <span key={i} dangerouslySetInnerHTML={{ __html: link.label }} />
                    )
                )}
            </div>
        </div>
    );
}

export default function VendorOrdersIndex({ orders, statusCounts, auctionOrders, auctionStatusCounts }: Props) {
    const [advancing, setAdvancing] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'regular' | 'auction'>('regular');

    const urlParams = new URLSearchParams(window.location.search);
    const activeFilter        = urlParams.get('status') ?? 'all';
    const activeAuctionFilter = urlParams.get('auction_status') ?? 'all';

    const applyFilter = (status: string) => {
        const params: Record<string, string> = {};
        if (activeAuctionFilter !== 'all') params.auction_status = activeAuctionFilter;
        if (status !== 'all') params.status = status;
        router.get(route('seller.orders.index'), params, { preserveScroll: true, replace: true });
    };

    const applyAuctionFilter = (status: string) => {
        const params: Record<string, string> = {};
        if (activeFilter !== 'all') params.status = activeFilter;
        if (status !== 'all') params.auction_status = status;
        router.get(route('seller.orders.index'), params, { preserveScroll: true, replace: true });
    };

    const advanceStatus = (order: Order, next: string) => {
        setAdvancing(order.id);
        router.patch(route('seller.orders.status', order.id), { status: next }, { onFinish: () => setAdvancing(null) });
    };

    const totalRevenue        = orders.data.reduce((s, o) => s + Number(o.total), 0);
    const auctionTotalRevenue = auctionOrders.data.reduce((s, o) => s + Number(o.total), 0);

    return (
        <SellerLayout breadcrumb="Orders">
            <Head title="Orders" />

            <div className="pg-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <div className="pg-title">Orders</div>
                    <div className="pg-subtitle">Manage and fulfil customer orders</div>
                </div>
                <Link href={route('seller.products.index')} className="btn btn-secondary">
                    <Package className="h-4 w-4" /> My Products
                </Link>
            </div>

            {/* Top-level tab switcher */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #e8f0e6' }}>
                <button
                    onClick={() => setActiveTab('regular')}
                    style={{
                        padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'regular' ? '2px solid #2d6a2d' : '2px solid transparent',
                        color: activeTab === 'regular' ? '#2d6a2d' : '#6b7e68',
                        marginBottom: -2, display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    <ShoppingCart size={15} />
                    Regular Orders
                    <span style={{ fontSize: 11, background: activeTab === 'regular' ? '#2d6a2d' : '#d4ddd2', color: activeTab === 'regular' ? '#fff' : '#6b7e68', borderRadius: 20, padding: '1px 7px', fontWeight: 700 }}>
                        {statusCounts.all ?? 0}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('auction')}
                    style={{
                        padding: '10px 20px', fontSize: 14, fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer',
                        borderBottom: activeTab === 'auction' ? '2px solid #e65100' : '2px solid transparent',
                        color: activeTab === 'auction' ? '#e65100' : '#6b7e68',
                        marginBottom: -2, display: 'flex', alignItems: 'center', gap: 6,
                    }}
                >
                    <Gavel size={15} />
                    Auction Orders
                    <span style={{ fontSize: 11, background: activeTab === 'auction' ? '#e65100' : '#d4ddd2', color: activeTab === 'auction' ? '#fff' : '#6b7e68', borderRadius: 20, padding: '1px 7px', fontWeight: 700 }}>
                        {auctionStatusCounts.all ?? 0}
                    </span>
                </button>
            </div>

            {/* ── Regular Orders ── */}
            {activeTab === 'regular' && (
                <>
                    <div className="stat-grid" style={{ marginBottom: 20 }}>
                        {[
                            { label: 'Total Orders', value: statusCounts.all ?? 0,            icon: <ShoppingCart className="h-5 w-5" /> },
                            { label: 'Pending',      value: statusCounts.pending ?? 0,        icon: <Clock className="h-5 w-5" /> },
                            { label: 'Shipped',      value: statusCounts.shipped ?? 0,        icon: <Truck className="h-5 w-5" /> },
                            { label: 'Revenue',      value: `₱${totalRevenue.toFixed(2)}`,   icon: <span style={{ fontSize: 14, fontWeight: 700 }}>₱</span> },
                        ].map((s) => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-icon" style={{ background: '#e8f5e4' }}>{s.icon}</div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {REGULAR_TABS.map((tab) => {
                            const count = tab.key === 'all' ? (statusCounts.all ?? 0) : (statusCounts[tab.key] ?? 0);
                            const active = activeFilter === tab.key;
                            return (
                                <button key={tab.key} onClick={() => applyFilter(tab.key)}
                                    className={active ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}>
                                    {tab.label} <span style={{ opacity: 0.7 }}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {orders.data.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon"><ShoppingCart className="mx-auto h-12 w-12" style={{ color: '#d4ddd2' }} /></div>
                                <div className="empty-state-title">No orders found</div>
                                <div className="empty-state-text">{activeFilter === 'all' ? "You haven't received any orders yet." : `No ${activeFilter} orders.`}</div>
                                {activeFilter !== 'all' && <button onClick={() => applyFilter('all')} className="btn btn-secondary" style={{ marginTop: 12 }}>View all orders</button>}
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {orders.data.map((order) => (
                                <OrderCard key={order.id} order={order} onAdvance={advanceStatus} advancing={advancing} />
                            ))}
                        </div>
                    )}
                    <PaginationBar paginatedData={orders} paramKey="page" />
                </>
            )}

            {/* ── Auction Orders ── */}
            {activeTab === 'auction' && (
                <>
                    <div style={{ marginBottom: 16, padding: '12px 16px', background: '#fff8f4', border: '1px solid #ffcc8066', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#7a3a00' }}>
                        <Gavel size={15} />
                        These orders were automatically created when your auctions ended and a winning bid was confirmed.
                    </div>

                    <div className="stat-grid" style={{ marginBottom: 20 }}>
                        {[
                            { label: 'Total',     value: auctionStatusCounts.all ?? 0,              icon: <Gavel className="h-5 w-5" /> },
                            { label: 'Confirmed', value: auctionStatusCounts.confirmed ?? 0,        icon: <CheckCircle className="h-5 w-5" /> },
                            { label: 'Shipped',   value: auctionStatusCounts.shipped ?? 0,          icon: <Truck className="h-5 w-5" /> },
                            { label: 'Revenue',   value: `₱${auctionTotalRevenue.toFixed(2)}`,     icon: <span style={{ fontSize: 14, fontWeight: 700 }}>₱</span> },
                        ].map((s) => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-icon" style={{ background: '#fff3e0' }}>{s.icon}</div>
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                        {AUCTION_TABS.map((tab) => {
                            const count = tab.key === 'all' ? (auctionStatusCounts.all ?? 0) : (auctionStatusCounts[tab.key] ?? 0);
                            const active = activeAuctionFilter === tab.key;
                            return (
                                <button key={tab.key} onClick={() => applyAuctionFilter(tab.key)}
                                    style={{
                                        padding: '5px 12px', fontSize: 12, fontWeight: 600, borderRadius: 20, cursor: 'pointer', border: 'none',
                                        background: active ? '#e65100' : '#f5ede8',
                                        color: active ? '#fff' : '#7a3a00',
                                    }}>
                                    {tab.label} <span style={{ opacity: 0.75 }}>({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {auctionOrders.data.length === 0 ? (
                        <div className="card">
                            <div className="empty-state">
                                <div className="empty-state-icon"><Gavel className="mx-auto h-12 w-12" style={{ color: '#d4ddd2' }} /></div>
                                <div className="empty-state-title">No auction orders yet</div>
                                <div className="empty-state-text">Orders will appear here once your auctions are settled.</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {auctionOrders.data.map((order) => (
                                <OrderCard key={order.id} order={order} onAdvance={advanceStatus} advancing={advancing} />
                            ))}
                        </div>
                    )}
                    <PaginationBar paginatedData={auctionOrders} paramKey="auction_page" />
                </>
            )}
        </SellerLayout>
    );
}
