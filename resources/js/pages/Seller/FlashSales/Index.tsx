import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, router } from '@inertiajs/react';

interface FlashSale {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    active: boolean;
}

interface Submission {
    id: number;
    flash_price: string;
    flash_stock: number;
    sold_count: number;
    max_per_customer: number;
    status: 'pending' | 'approved' | 'rejected';
    flash_sale: FlashSale;
    product: { id: number; name: string; price: string };
}

const STATUS_BADGE: Record<string, string> = {
    pending: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
};

export default function SellerFlashSalesIndex({
    submissions,
    openSales,
}: {
    submissions: { data: Submission[]; links: any[]; meta: any };
    openSales: FlashSale[];
}) {
    const canRemove = (s: Submission) => {
        if (s.status === 'approved') {
            const now = new Date();
            return !(now >= new Date(s.flash_sale.start_time) && now <= new Date(s.flash_sale.end_time));
        }
        return true;
    };

    return (
        <SellerLayout breadcrumb="Flash Sales">
            <Head title="Flash Sales" />

            <div className="pg-header">
                <div className="pg-title">Flash Sales</div>
                <div className="pg-subtitle">Submit products to active flash sale events</div>
            </div>

            {/* Open sales to join */}
            {openSales.length > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <span className="card-title">⚡ Open Flash Sales — Submit Your Products</span>
                    </div>
                    <div className="card-body">
                        {openSales.map((fs) => (
                            <div key={fs.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div>
                                    <div className="font-semibold text-sm">{fs.title}</div>
                                    <div className="text-xs text-muted">
                                        {new Date(fs.start_time).toLocaleString()} → {new Date(fs.end_time).toLocaleString()}
                                    </div>
                                </div>
                                <Link href={route('seller.flash-sales.create', { flashSale: fs.id })} className="btn btn-primary btn-sm">
                                    + Submit Product
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My submissions */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">My Submissions</span>
                </div>
                <div className="table-wrap">
                    <table className="ap-table">
                        <thead>
                            <tr>
                                <th>Flash Sale</th>
                                <th>Product</th>
                                <th>Normal Price</th>
                                <th>Flash Price</th>
                                <th>Stock</th>
                                <th>Sold</th>
                                <th>Limit/Customer</th>
                                <th>Status</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.data.length > 0 ? (
                                submissions.data.map((s) => (
                                    <tr key={s.id}>
                                        <td className="text-sm font-medium">{s.flash_sale.title}</td>
                                        <td className="text-sm">{s.product.name}</td>
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
                                                {s.status !== 'approved' && (
                                                    <Link href={route('seller.flash-sales.edit', { flashSaleProduct: s.id })} className="btn btn-secondary btn-sm">
                                                        ✎ Edit
                                                    </Link>
                                                )}
                                                {canRemove(s) && (
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Remove this submission?')) {
                                                                router.delete(route('seller.flash-sales.destroy', { flashSaleProduct: s.id }));
                                                            }
                                                        }}
                                                        className="btn btn-danger btn-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9}>
                                        <div className="empty-state">
                                            <div className="empty-state-icon">⚡</div>
                                            <div className="empty-state-title">No submissions yet</div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </SellerLayout>
    );
}
