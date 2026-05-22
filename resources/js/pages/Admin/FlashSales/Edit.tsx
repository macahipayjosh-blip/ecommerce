import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

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
}

interface Product {
    id: number;
    name: string;
}

export default function FlashSaleEdit({ flashSale, products }: { flashSale: FlashSale; products: Product[] }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: flashSale.title,
        description: flashSale.description || '',
        discount_type: flashSale.discount_type,
        discount_value: flashSale.discount_value.toString(),
        start_time: flashSale.start_time.slice(0, 16),
        end_time: flashSale.end_time.slice(0, 16),
        applicable_products: flashSale.applicable_products || [],
        active: flashSale.active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.flash-sales.update', flashSale.id));
    };

    const handleProductToggle = (productId: string) => {
        const currentProducts = data.applicable_products || [];
        if (currentProducts.includes(productId)) {
            setData(
                'applicable_products',
                currentProducts.filter((id) => id !== productId),
            );
        } else {
            setData('applicable_products', [...currentProducts, productId]);
        }
    };

    return (
        <AdminLayout breadcrumb="Edit Flash Sale">
            <Head title={`Edit Flash Sale: ${flashSale.title}`} />

            {/* Page Header */}
            <div className="pg-header">
                <div>
                    <Link href={route('admin.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">Edit Flash Sale</div>
                    <div className="pg-subtitle">{flashSale.title}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="form-grid">
                {/* Basic Info */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Flash Sale Details</span>
                    </div>
                    <div className="card-body form-card-body">
                        <div>
                            <label htmlFor="title" className="form-label">
                                Title <span className="form-required">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className={`form-input${errors.title ? 'error' : ''}`}
                                placeholder="Black Friday Sale"
                                required
                            />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>

                        <div>
                            <label htmlFor="discount_type" className="form-label">
                                Discount Type <span className="form-required">*</span>
                            </label>
                            <select
                                id="discount_type"
                                value={data.discount_type}
                                onChange={(e) => setData('discount_type', e.target.value)}
                                className="form-input"
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (₱)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="discount_value" className="form-label">
                                Discount Value <span className="form-required">*</span>
                            </label>
                            <input
                                id="discount_value"
                                type="number"
                                value={data.discount_value}
                                onChange={(e) => setData('discount_value', e.target.value)}
                                min="0"
                                step="0.01"
                                className={`form-input${errors.discount_value ? 'error' : ''}`}
                                placeholder={data.discount_type === 'percentage' ? '20' : '100.00'}
                                required
                            />
                            {errors.discount_value && <p className="form-error">{errors.discount_value}</p>}
                        </div>

                        <div>
                            <label htmlFor="start_time" className="form-label">
                                Start Time <span className="form-required">*</span>
                            </label>
                            <input
                                id="start_time"
                                type="datetime-local"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                                className={`form-input${errors.start_time ? 'error' : ''}`}
                                required
                            />
                            {errors.start_time && <p className="form-error">{errors.start_time}</p>}
                        </div>

                        <div>
                            <label htmlFor="end_time" className="form-label">
                                End Time <span className="form-required">*</span>
                            </label>
                            <input
                                id="end_time"
                                type="datetime-local"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                className={`form-input${errors.end_time ? 'error' : ''}`}
                                required
                            />
                            {errors.end_time && <p className="form-error">{errors.end_time}</p>}
                        </div>

                        <div className="form-checkbox-row">
                            <input
                                type="checkbox"
                                id="active"
                                checked={data.active}
                                onChange={(e) => setData('active', e.target.checked)}
                                className="form-checkbox"
                            />
                            <label htmlFor="active" className="form-label form-checkbox-label">
                                Active
                            </label>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Description</span>
                    </div>
                    <div className="card-body">
                        <label htmlFor="description" className="form-label">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                            className="form-textarea"
                            placeholder="Optional description for this flash sale"
                        />
                    </div>
                </div>

                {/* Applicable Products */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Applicable Products</span>
                    </div>
                    <div className="card-body">
                        <p className="form-help-text">Select specific products. Leave empty to apply to all.</p>
                        <div className="product-checkbox-list">
                            {products.map((product) => (
                                <label key={product.id} className="product-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={data.applicable_products?.includes(product.id.toString()) || false}
                                        onChange={() => handleProductToggle(product.id.toString())}
                                        className="form-checkbox"
                                    />
                                    {product.name}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                    <Link href={route('admin.flash-sales.index')} className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className={`btn btn-primary${processing ? 'btn-disabled' : ''}`}>
                        {processing ? 'Updating...' : '✏️ Update Flash Sale'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
