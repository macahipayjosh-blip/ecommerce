import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Trash2 } from 'lucide-react';

interface FlashSale {
    id: number;
    title: string;
    discount_type: string;
    discount_value: number;
    start_time: string;
    end_time: string;
    active: boolean;
    created_by: number;
    creator: {
        name: string;
    };
}

const isActive = (fs: FlashSale) => {
    const now = new Date();
    return fs.active && now >= new Date(fs.start_time) && now <= new Date(fs.end_time);
};

const isExpired = (fs: FlashSale) => new Date() > new Date(fs.end_time);

const STATUS_BADGE: Record<string, string> = {
    active: 'badge-green',
    scheduled: 'badge-yellow',
    expired: 'badge-red',
    inactive: 'badge-gray',
};

const getStatus = (fs: FlashSale) => {
    if (!fs.active) return 'inactive';
    if (isExpired(fs)) return 'expired';
    if (isActive(fs)) return 'active';
    return 'scheduled';
};

const formatDiscount = (fs: FlashSale) => (fs.discount_type === 'percentage' ? `${fs.discount_value}%` : `₱${fs.discount_value}`);

export default function FlashSalesIndex({ flashSales }: { flashSales: { data: FlashSale[]; links: any[]; meta: any } }) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this flash sale?')) {
            router.delete(route('admin.flash-sales.destroy', id));
        }
    };

    const total = flashSales.meta?.total ?? flashSales.data.length;
    const active = flashSales.data.filter(isActive).length;
    const expired = flashSales.data.filter(isExpired).length;

    return (
        <AdminLayout breadcrumb="Flash Sales">
            <Head title="Flash Sales" />

            {/* Page Header */}
            <div className="pg-header">
                <div className="pg-title">Flash Sales</div>
                <div className="pg-subtitle">{total} total flash sales</div>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {[
                    { label: 'Total Flash Sales', value: total, icon: '⚡' },
                    { label: 'Active', value: active, icon: '🟢' },
                    { label: 'Expired', value: expired, icon: '❌' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="mb-6">
                <Link href={route('admin.flash-sales.create')} className="btn btn-primary">
                    + New Flash Sale
                </Link>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Discount</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Created By</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {flashSales.data.length > 0 ? (
                                flashSales.data.map((fs) => (
                                    <tr key={fs.id}>
                                        <td>
                                            <div className="text-primary font-semibold">{fs.title}</div>
                                        </td>
                                        <td className="text-secondary">{formatDiscount(fs)}</td>
                                        <td className="text-muted text-sm">
                                            {new Date(fs.start_time).toLocaleDateString('en-GB')} -{' '}
                                            {new Date(fs.end_time).toLocaleDateString('en-GB')}
                                        </td>
                                        <td>
                                            <span className={`badge ${STATUS_BADGE[getStatus(fs)] ?? 'badge-gray'}`}>
                                                <span className="badge-dot" />
                                                {getStatus(fs).charAt(0).toUpperCase() + getStatus(fs).slice(1)}
                                            </span>
                                        </td>
                                        <td className="text-muted text-sm">{fs.creator?.name}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Link href={route('admin.flash-sales.show', fs.id)} className="btn btn-secondary btn-sm">
                                                    <Eye size={13} /> View
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        router.get(route('admin.flash-sales.edit', fs.id));
                                                    }}
                                                    className="btn btn-secondary btn-sm"
                                                >
                                                    ✎ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fs.id)}
                                                    className="btn btn-danger btn-sm"
                                                    title="Delete flash sale"
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">⚡</div>
                                            <div className="empty-state-title">No flash sales yet</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {flashSales.links && flashSales.data.length > 0 && (
                    <div className="pagination">
                        <span className="pagination-info">
                            Showing {flashSales.meta?.from}–{flashSales.meta?.to} of {flashSales.meta?.total} results
                        </span>
                        <div className="pagination-links">
                            {flashSales.links.map((l: any, i: number) =>
                                l.url ? (
                                    <Link key={i} href={l.url} className={l.active ? 'active' : ''} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ) : (
                                    <span key={i} dangerouslySetInnerHTML={{ __html: l.label }} />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
