import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface FlashSaleProduct {
    id: number;
    flash_price: string;
    flash_stock: number;
    max_per_customer: number;
    status: string;
    flash_sale: { id: number; title: string; start_time: string; end_time: string };
    product: { id: number; name: string; price: string; stock_quantity: number };
}

export default function SellerFlashSaleEdit({ flashSaleProduct }: { flashSaleProduct: FlashSaleProduct }) {
    const { data, setData, put, processing, errors } = useForm({
        flash_price: flashSaleProduct.flash_price,
        flash_stock: String(flashSaleProduct.flash_stock),
        max_per_customer: String(flashSaleProduct.max_per_customer),
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        put(route('seller.flash-sales.update', { flashSaleProduct: flashSaleProduct.id }));
    };

    const p = flashSaleProduct.product;
    const fs = flashSaleProduct.flash_sale;

    return (
        <SellerLayout breadcrumb="Edit Flash Sale Submission">
            <Head title="Edit Flash Sale Submission" />

            <div className="pg-header">
                <div>
                    <Link href={route('seller.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">Edit Submission</div>
                    <div className="pg-subtitle">
                        {fs.title} · {new Date(fs.start_time).toLocaleString()} → {new Date(fs.end_time).toLocaleString()}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">
                            {p.name}
                            <span className="text-muted text-xs ml-2">Normal price: ₱{parseFloat(p.price).toFixed(2)} · Stock: {p.stock_quantity}</span>
                        </span>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gap: 18 }}>
                        <div>
                            <label className="form-label">
                                Flash Sale Price (₱) <span className="form-required">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.flash_price}
                                onChange={(e) => setData('flash_price', e.target.value)}
                                className="form-input"
                                min="0"
                                step="0.01"
                                required
                            />
                            {errors.flash_price && <p className="form-error">{errors.flash_price}</p>}
                        </div>

                        <div>
                            <label className="form-label">
                                Flash Sale Stock <span className="form-required">*</span>
                            </label>
                            <p className="text-xs text-muted mb-1">Available stock: {p.stock_quantity}</p>
                            <input
                                type="number"
                                value={data.flash_stock}
                                onChange={(e) => setData('flash_stock', e.target.value)}
                                className="form-input"
                                min="1"
                                max={p.stock_quantity}
                                required
                            />
                            {errors.flash_stock && <p className="form-error">{errors.flash_stock}</p>}
                        </div>

                        <div>
                            <label className="form-label">Max per Customer</label>
                            <p className="text-xs text-muted mb-1">Leave 0 for no limit</p>
                            <input
                                type="number"
                                value={data.max_per_customer}
                                onChange={(e) => setData('max_per_customer', e.target.value)}
                                className="form-input"
                                min="0"
                            />
                            {errors.max_per_customer && <p className="form-error">{errors.max_per_customer}</p>}
                        </div>
                    </div>
                </div>

                <div className="form-actions mt-4">
                    <Link href={route('seller.flash-sales.index')} className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className="btn btn-primary" style={{ opacity: processing ? 0.5 : 1 }}>
                        {processing ? 'Saving...' : '✎ Save Changes'}
                    </button>
                </div>
            </form>
        </SellerLayout>
    );
}
