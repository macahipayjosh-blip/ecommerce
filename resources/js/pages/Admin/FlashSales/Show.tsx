import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';

interface FlashSale {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    active: boolean;
    creator: { name: string };
}

interface Submission {
    id: number;
    flash_price: string;
    flash_stock: number;
    sold_count: number;
    max_per_customer: number;
    status: 'pending' | 'approved' | 'rejected';
    product: { id: number; name: string; price: string };
    seller: { id: number; name: string };
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
};

const isActive = (fs: FlashSale) => {
    const now = new Date();
    return fs.active && now >= new Date(fs.start_time) && now <= new Date(fs.end_time);
};

const isExpired = (fs: FlashSale) => new Date() > new Date(fs.end_time);

const getStatus = (fs: FlashSale) => {
    if (!fs.active) return 'inactive';
    if (isExpired(fs)) return 'expired';
    if (isActive(fs)) return 'active';
    return 'scheduled';
};

const FS_BADGE: Record<string, string> = {
    active: 'badge-green',
    scheduled: 'badge-yellow',
    expired: 'badge-red',
    inactive: 'badge-gray',
};

export default function FlashSaleShow({
    flashSale,
    submissions,
}: {
    flashSale: FlashSale;
    submissions: Submission[];
}) {
    const status = getStatus(flashSale);

    const approve = (id: number) => router.post(route('admin.flash-sales.approve', { flashSaleProduct: id }));
    const reject = (id: number) => router.post(route('admin.flash-sales.reject', { flashSaleProduct: id }));
    const remove = (id: number) => {
        if (confirm('Remove this listing?')) router.delete(route('admin.flash-sales.remove', { flashSaleProduct: id }));
    };

    const pending = submissions.filter((s) => s.status === 'pending').length;
    const approved = submissions.filter((s) => s.status === 'approved').length;

    return (
        <AdminLayout breadcrumb="Flash Sale">
            <Head title={`Flash Sale: ${flashSale.title}`} />

            <div className="pg-header">
                <div>
                    <Link href={route('admin.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">{flashSale.title}</div>
                    <div className="pg-subtitle">
                        {new Date(flashSale.start_time).toLocaleString()} → {new Date(flashSale.end_time).toLocaleString()}
                    </div>
                </div>
                <span className={`badge ${FS_BADGE[status] ?? 'badge-gray'} status-badge-header`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            {/* Stats */}
            <div className="stat-grid">
                {[
                    { label: 'Total Submissions', value: submissions.length, icon: '📋' },
                    { label: 'Pending Approval', value: pending, icon: '⏳' },
                    { label: 'Approved', value: approved, icon: '✅' },
                    { label: 'Created By', value: flashSale.creator?.name, icon: '👤' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value stat-value-sm">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Details */}
            <div className="card mb-6">
                <div className="card-header">
                    <span className="card-title">Flash Sale Details</span>
                    <Link href={route('admin.flash-sales.edit', { flash_sale: flashSale.id })} className="btn btn-secondary btn-sm">
                        ✎ Edit
                    </Link>
                </div>
                <div className="card-body">
                    {flashSale.description && <p className="text-sm text-muted mb-2">{flashSale.description}</p>}
                    <div className="field-row">
                        <span className="field-label">Active</span>
                        <span className="field-value">{flashSale.active ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="field-row">
                        <span className="field-label">Start</span>
                        <span className="field-value">{new Date(flashSale.start_time).toLocaleString()}</span>
                    </div>
                    <div className="field-row">
                        <span className="field-label">End</span>
                        <span className="field-value">{new Date(flashSale.end_time).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Seller Submissions */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Seller Submissions</span>
                    {pending > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    if (confirm(`Approve all ${pending} pending submission(s)?`))
                                        router.post(route('admin.flash-sales.approve-all', { flashSale: flashSale.id }));
                                }}
                                className="btn btn-primary btn-sm"
                            >
                                ✓ Approve All ({pending})
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm(`Reject all ${pending} pending submission(s)?`))
                                        router.post(route('admin.flash-sales.reject-all', { flashSale: flashSale.id }));
                                }}
                                className="btn btn-secondary btn-sm"
                            >
                                ✗ Reject All ({pending})
                            </button>
                        </div>
                    )}
                </div>
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Seller</th>
                                <th>Product</th>
                                <th>Normal Price</th>
                                <th>Flash Price</th>
                                <th>Stock</th>
                                <th>Sold</th>
                                <th>Limit/Customer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.length > 0 ? (
                                submissions.map((s) => (
                                    <tr key={s.id}>
                                        <td className="text-sm">{s.seller.name}</td>
                                        <td className="text-sm font-medium">{s.product.name}</td>
                                        <td className="text-sm text-muted">₱{parseFloat(s.product.price).toFixed(2)}</td>
                                        <td className="text-sm font-semibold text-green-700">₱{parseFloat(s.flash_price).toFixed(2)}</td>
                                        <td className="text-sm">{s.flash_stock}</td>
                                        <td className="text-sm">{s.sold_count}</td>
                                        <td className="text-sm">{s.max_per_customer === 0 ? '—' : s.max_per_customer}</td>
                                        <td>
                                            <span className={`badge ${STATUS_BADGE[s.status] ?? 'badge-gray'}`}>
                                                <span className="badge-dot" />
                                                {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                {s.status === 'pending' && (
                                                    <>
                                                        <button onClick={() => approve(s.id)} className="btn btn-primary btn-sm">
                                                            ✓ Approve
                                                        </button>
                                                        <button onClick={() => reject(s.id)} className="btn btn-secondary btn-sm">
                                                            ✗ Reject
                                                        </button>
                                                    </>
                                                )}
                                                {s.status === 'rejected' && (
                                                    <button onClick={() => approve(s.id)} className="btn btn-primary btn-sm">
                                                        ✓ Approve
                                                    </button>
                                                )}
                                                <button onClick={() => remove(s.id)} className="btn btn-danger btn-sm">
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">📋</div>
                                            <div className="empty-state-title">No submissions yet</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
