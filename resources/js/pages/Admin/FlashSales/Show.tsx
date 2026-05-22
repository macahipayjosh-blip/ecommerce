import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

interface FlashSale {
    id: number;
    title: string;
    description: string;
    discount_type: string;
    discount_value: number;
    start_time: string;
    end_time: string;
    applicable_products: string[];
    active: boolean;
    created_by: number;
    creator: {
        name: string;
    };
    products: Array<{
        id: number;
        name: string;
    }>;
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

const Field = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="field-row">
        <span className="field-label">{label}</span>
        <span className="field-value">{value || '—'}</span>
    </div>
);

export default function FlashSaleShow({ flashSale }: { flashSale: FlashSale }) {
    const status = getStatus(flashSale);
    const startDate = new Date(flashSale.start_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const endDate = new Date(flashSale.end_time).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <AdminLayout breadcrumb="Flash Sale">
            <Head title={`Flash Sale: ${flashSale.title}`} />

            {/* Page Header */}
            <div className="pg-header">
                <div>
                    <Link href={route('admin.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">{flashSale.title}</div>
                    <div className="pg-subtitle">
                        {startDate} to {endDate}
                    </div>
                </div>
                <span className={`badge ${STATUS_BADGE[status] ?? 'badge-gray'} status-badge-header`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            </div>

            {/* Stat Cards */}
            <div className="stat-grid">
                {[
                    { label: 'Discount', value: formatDiscount(flashSale), icon: '💵' },
                    { label: 'Type', value: flashSale.discount_type.charAt(0).toUpperCase() + flashSale.discount_type.slice(1), icon: '🎟' },
                    {
                        label: 'Status',
                        value: status.charAt(0).toUpperCase() + status.slice(1),
                        icon: isActive(flashSale) ? '✏️' : isExpired(flashSale) ? '✅' : '⏳',
                    },
                    { label: 'Active', value: flashSale.active ? 'Yes' : 'No', icon: '🔄' },
                ].map((s) => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value stat-value-sm">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid-2">
                {/* Left Column */}
                <div className="grid-column">
                    {/* Flash Sale Details */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Flash Sale Details</span>
                        </div>
                        <div className="card-body">
                            <Field label="Title" value={flashSale.title} />
                            <Field label="Description" value={flashSale.description} />
                            <Field label="Discount Type" value={flashSale.discount_type.charAt(0).toUpperCase() + flashSale.discount_type.slice(1)} />
                            <Field label="Discount Value" value={formatDiscount(flashSale)} />
                            <Field label="Start Time" value={new Date(flashSale.start_time).toLocaleString()} />
                            <Field label="End Time" value={new Date(flashSale.end_time).toLocaleString()} />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="grid-column">
                    {/* Metadata */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Metadata</span>
                        </div>
                        <div>
                            {[
                                ['Status', status.charAt(0).toUpperCase() + status.slice(1)],
                                ['Active', flashSale.active ? 'Yes' : 'No'],
                                ['Created By', flashSale.creator?.name],
                                ['Created At', new Date(flashSale.start_time).toLocaleString()],
                            ].map(([label, value]) => (
                                <div key={label as string} className="metadata-row">
                                    <span className="metadata-label">{label as string}</span>
                                    <span className="metadata-value">{value as string}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Applicable Products */}
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Applicable Products</span>
                        </div>
                        <div className="card-body">
                            {flashSale.products && flashSale.products.length > 0 ? (
                                <div>
                                    {flashSale.products.map((product) => (
                                        <div key={product.id} className="product-item">
                                            {product.name}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-muted">Applies to all products</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
                <Link href={route('admin.flash-sales.edit', flashSale.id)} className="btn btn-primary">
                    ✏️ Edit Flash Sale
                </Link>
                <Link href={route('admin.flash-sales.index')} className="btn btn-secondary">
                    Back to Flash Sales
                </Link>
            </div>
        </AdminLayout>
    );
}
