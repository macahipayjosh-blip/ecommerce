import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface FlashSale {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    stock_quantity: number;
}

export default function SellerFlashSaleSubmit({
    flashSale,
    products,
}: {
    flashSale: FlashSale;
    products: Product[];
}) {
    // ── Single product form ──────────────────────────────────────────────────
    const single = useForm({
        product_id: '',
        flash_price: '',
        flash_stock: '',
        max_per_customer: '',
    });

    const selectedProduct = products.find((p) => p.id === Number(single.data.product_id));

    const handleSingle = (e: FormEvent) => {
        e.preventDefault();
        single.post(route('seller.flash-sales.store', { flashSale: flashSale.id }));
    };

    // ── Bulk / all-products form ─────────────────────────────────────────────
    const bulk = useForm({
        discount_percent: '',
        flash_stock_mode: 'all',
        stock_percent: '100',
        max_per_customer: '',
    });

    const handleBulk = (e: FormEvent) => {
        e.preventDefault();
        bulk.post(route('seller.flash-sales.store-all', { flashSale: flashSale.id }));
    };

    // Preview: compute discounted prices for all products
    const discountPct = parseFloat(bulk.data.discount_percent) || 0;
    const preview = products.map((p) => ({
        ...p,
        flashPrice: discountPct > 0 ? (parseFloat(p.price) * (1 - discountPct / 100)).toFixed(2) : null,
    }));

    return (
        <SellerLayout breadcrumb="Submit to Flash Sale">
            <Head title="Submit Product to Flash Sale" />

            <div className="pg-header">
                <div>
                    <Link href={route('seller.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">Submit to Flash Sale</div>
                    <div className="pg-subtitle">
                        {flashSale.title} · {new Date(flashSale.start_time).toLocaleString()} → {new Date(flashSale.end_time).toLocaleString()}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

                {/* ── Card 1: Single Product ─────────────────────────────── */}
                <form onSubmit={handleSingle}>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Product Details</span>
                            <span className="text-xs text-muted">Submit one product manually</span>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: 16 }}>
                            <div>
                                <label className="form-label">
                                    Product <span className="form-required">*</span>
                                </label>
                                <select
                                    value={single.data.product_id}
                                    onChange={(e) => single.setData('product_id', e.target.value)}
                                    className="form-input"
                                    required
                                >
                                    <option value="">— Select a product —</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (₱{parseFloat(p.price).toFixed(2)}, Stock: {p.stock_quantity})
                                        </option>
                                    ))}
                                </select>
                                {single.errors.product_id && <p className="form-error">{single.errors.product_id}</p>}
                            </div>

                            <div>
                                <label className="form-label">
                                    Flash Sale Price (₱) <span className="form-required">*</span>
                                </label>
                                {selectedProduct && (
                                    <p className="text-xs text-muted mb-1">
                                        Normal: ₱{parseFloat(selectedProduct.price).toFixed(2)}
                                    </p>
                                )}
                                <input
                                    type="number"
                                    value={single.data.flash_price}
                                    onChange={(e) => single.setData('flash_price', e.target.value)}
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    placeholder="e.g. 299.00"
                                    required
                                />
                                {single.errors.flash_price && <p className="form-error">{single.errors.flash_price}</p>}
                            </div>

                            <div>
                                <label className="form-label">
                                    Flash Sale Stock <span className="form-required">*</span>
                                </label>
                                {selectedProduct && (
                                    <p className="text-xs text-muted mb-1">
                                        Available: {selectedProduct.stock_quantity}
                                    </p>
                                )}
                                <input
                                    type="number"
                                    value={single.data.flash_stock}
                                    onChange={(e) => single.setData('flash_stock', e.target.value)}
                                    className="form-input"
                                    min="1"
                                    max={selectedProduct?.stock_quantity}
                                    placeholder="e.g. 20"
                                    required
                                />
                                {single.errors.flash_stock && <p className="form-error">{single.errors.flash_stock}</p>}
                            </div>

                            <div>
                                <label className="form-label">Max per Customer</label>
                                <p className="text-xs text-muted mb-1">0 = no limit</p>
                                <input
                                    type="number"
                                    value={single.data.max_per_customer}
                                    onChange={(e) => single.setData('max_per_customer', e.target.value)}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                            <Link href={route('seller.flash-sales.index')} className="btn btn-secondary">Cancel</Link>
                            <button type="submit" disabled={single.processing} className="btn btn-primary" style={{ opacity: single.processing ? 0.5 : 1 }}>
                                {single.processing ? 'Submitting...' : 'Submit for Approval'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── Card 2: Submit All Products with % Discount ────────── */}
                <form onSubmit={handleBulk}>
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Submit All Products</span>
                            <span className="text-xs text-muted">Apply a % discount to all your products at once</span>
                        </div>
                        <div className="card-body" style={{ display: 'grid', gap: 16 }}>
                            <div>
                                <label className="form-label">
                                    Discount % <span className="form-required">*</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="number"
                                        value={bulk.data.discount_percent}
                                        onChange={(e) => bulk.setData('discount_percent', e.target.value)}
                                        className="form-input"
                                        min="1"
                                        max="99"
                                        step="0.1"
                                        placeholder="e.g. 20"
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <span className="text-sm font-semibold text-muted">%</span>
                                </div>
                                {bulk.errors.discount_percent && <p className="form-error">{bulk.errors.discount_percent}</p>}
                            </div>

                            <div>
                                <label className="form-label">Flash Stock</label>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            value="all"
                                            checked={bulk.data.flash_stock_mode === 'all'}
                                            onChange={() => bulk.setData('flash_stock_mode', 'all')}
                                        />
                                        All stock
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                                        <input
                                            type="radio"
                                            value="custom"
                                            checked={bulk.data.flash_stock_mode === 'custom'}
                                            onChange={() => bulk.setData('flash_stock_mode', 'custom')}
                                        />
                                        % of stock
                                    </label>
                                </div>
                                {bulk.data.flash_stock_mode === 'custom' && (
                                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <input
                                            type="number"
                                            value={bulk.data.stock_percent}
                                            onChange={(e) => bulk.setData('stock_percent', e.target.value)}
                                            className="form-input"
                                            min="1"
                                            max="100"
                                            placeholder="50"
                                            style={{ flex: 1 }}
                                        />
                                        <span className="text-sm text-muted">% of each product's stock</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="form-label">Max per Customer</label>
                                <p className="text-xs text-muted mb-1">0 = no limit, applies to all products</p>
                                <input
                                    type="number"
                                    value={bulk.data.max_per_customer}
                                    onChange={(e) => bulk.setData('max_per_customer', e.target.value)}
                                    className="form-input"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>

                            {/* Live preview */}
                            {discountPct > 0 && products.length > 0 && (
                                <div>
                                    <p className="text-xs font-semibold text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Preview — {discountPct}% off
                                    </p>
                                    <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
                                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--border)' }}>
                                                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                                                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600 }}>Normal</th>
                                                    <th style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--green-700)' }}>Flash</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {preview.map((p) => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <td style={{ padding: '6px 10px' }}>{p.name}</td>
                                                        <td style={{ padding: '6px 10px', textAlign: 'right', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                                            ₱{parseFloat(p.price).toFixed(2)}
                                                        </td>
                                                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: 'var(--green-700)' }}>
                                                            ₱{p.flashPrice}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {products.length === 0 && (
                                <p className="text-sm text-muted">No eligible products to submit (all already submitted or no active products).</p>
                            )}
                        </div>
                        <div className="card-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
                            <button
                                type="submit"
                                disabled={bulk.processing || products.length === 0}
                                className="btn btn-primary"
                                style={{ opacity: bulk.processing || products.length === 0 ? 0.5 : 1 }}
                            >
                                {bulk.processing ? 'Submitting...' : `Submit All ${products.length} Product(s)`}
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </SellerLayout>
    );
}
