import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import SellerLayout from '@/layouts/SellerLayout';

interface Category { id: number; name: string }
interface Brand { id: number; name: string }

const inputStyle = (hasError?: boolean) => ({
    width: '100%', border: `1px solid ${hasError ? '#a32d2d' : '#e8e8e4'}`, padding: '8px 12px',
    fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: 'none', background: '#fff',
    borderRadius: 0,
});

const labelStyle = { display: 'block', fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#6e6d67', marginBottom: 6 };

const sectionStyle = { border: '1px solid #e8e8e4', background: '#fff', marginBottom: 20 };
const sectionHead = { padding: '14px 18px', borderBottom: '1px solid #e8e8e4' };
const sectionBody = { padding: 18 };
const sectionTitle = { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 500 };

export default function CreateProduct({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
    const { data, setData, post, processing, errors } = useForm<{
        name: string; description: string; price: string; compare_at_price: string;
        cost_per_item: string; sku: string; stock_quantity: string;
        low_stock_threshold: string; category_id: string; brand_id: string;
        status: string; images: File[];
    }>({
        name: '', description: '', price: '', compare_at_price: '', cost_per_item: '',
        sku: '', stock_quantity: '', low_stock_threshold: '5',
        category_id: '', brand_id: '', status: 'active', images: [],
    });

    const [previews, setPreviews] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateSku = (name: string) => {
        const prefix = name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'SKU';
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${rand}`;
    };

    const handleImages = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, 8 - data.images.length);
        setData('images', [...data.images, ...newFiles]);
        setPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setData('images', data.images.filter((_, i) => i !== index));
        setPreviews((p) => p.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('seller.products.store'), { forceFormData: true });
    };

    return (
        <SellerLayout breadcrumb="Add Product">
            <Head title="Add New Product" />

            {/* Page header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href={route('seller.products.index')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid #e8e8e4', color: '#6e6d67', textDecoration: 'none' }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, letterSpacing: '-0.5px', marginBottom: 2 }}>Add New Product</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#b0afa8' }}>Create a new product listing</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link href={route('seller.products.index')} style={{ padding: '9px 16px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}>Cancel</Link>
                    <button type="submit" form="product-form" disabled={processing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#0d0d0d', color: '#fff', fontSize: 13, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                        <Save className="h-4 w-4" />{processing ? 'Saving…' : 'Save Product'}
                    </button>
                </div>
            </div>

            <form id="product-form" onSubmit={handleSubmit}>
                {Object.keys(errors).length > 0 && (
                    <div style={{ display: 'flex', gap: 12, border: '1px solid #e8c8c8', background: '#fdf5f5', padding: 16, marginBottom: 20 }}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#a32d2d', marginTop: 1 }} />
                        <ul style={{ fontSize: 13, color: '#a32d2d', paddingLeft: 16 }}>
                            {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                )}

                {/* Basic Info */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Basic Information</span></div>
                    <div style={{ ...sectionBody, display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Product Name <span style={{ color: '#a32d2d' }}>*</span></label>
                            <input type="text" value={data.name} onChange={(e) => {
                                const name = e.target.value;
                                setData('name', name);
                                if (!data.sku) setData('sku', generateSku(name));
                            }} required style={inputStyle(!!errors.name)} placeholder="Enter product name" />
                            {errors.name && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.name}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Description <span style={{ color: '#a32d2d' }}>*</span></label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} required style={{ ...inputStyle(!!errors.description), resize: 'vertical' }} placeholder="Describe your product…" />
                            {errors.description && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.description}</p>}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Category <span style={{ color: '#a32d2d' }}>*</span></label>
                                <select value={data.category_id} onChange={(e) => setData('category_id', e.target.value)} required style={inputStyle(!!errors.category_id)}>
                                    <option value="">Select a category</option>
                                    {categories.map((c) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.category_id}</p>}
                            </div>
                            <div>
                                <label style={labelStyle}>Brand</label>
                                <select value={data.brand_id} onChange={(e) => setData('brand_id', e.target.value)} style={inputStyle()}>
                                    <option value="">Select a brand (optional)</option>
                                    {brands.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Pricing</span></div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {[
                            { label: 'Price', key: 'price' as const, required: true },
                            { label: 'Compare at Price', key: 'compare_at_price' as const },
                            { label: 'Cost per Item', key: 'cost_per_item' as const },
                        ].map(({ label, key, required }) => (
                            <div key={key}>
                                <label style={labelStyle}>{label} {required && <span style={{ color: '#a32d2d' }}>*</span>}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#b0afa8', fontSize: 13 }}>₱</span>
                                    <input type="number" value={data[key]} onChange={(e) => setData(key, e.target.value)} step="0.01" min="0" required={required} style={{ ...inputStyle(!!errors[key]), paddingLeft: 24 }} placeholder="0.00" />
                                </div>
                                {errors[key] && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors[key]}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Inventory */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Inventory</span></div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        {[
                            { label: 'Stock Quantity', key: 'stock_quantity' as const, required: true },
                            { label: 'Low Stock Threshold', key: 'low_stock_threshold' as const },
                        ].map(({ label, key, required, type }) => (
                            <div key={key}>
                                <label style={labelStyle}>{label} {required && <span style={{ color: '#a32d2d' }}>*</span>}</label>
                                <input type={type ?? 'number'} value={data[key] as string} onChange={(e) => setData(key, e.target.value)} min={type !== 'text' ? '0' : undefined} required={required} style={inputStyle(!!errors[key])} />
                                {errors[key] && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors[key]}</p>}
                            </div>
                        ))}
                        <div>
                            <label style={labelStyle}>SKU</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                                <input type="text" value={data.sku} onChange={(e) => setData('sku', e.target.value)} style={{ ...inputStyle(!!errors.sku), flex: 1 }} placeholder="Auto-generated" />
                                <button type="button" onClick={() => setData('sku', generateSku(data.name))}
                                    style={{ padding: '8px 10px', border: '1px solid #e8e8e4', background: '#f5f5f3', fontSize: 11, fontFamily: "'DM Mono', monospace", cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    ↺ Regenerate
                                </button>
                            </div>
                            {errors.sku && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.sku}</p>}
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Product Images</span></div>
                    <div style={sectionBody}>
                        <p style={{ fontSize: 12, color: '#b0afa8', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>Upload up to 8 images. First image is primary.</p>
                        {previews.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                                {previews.map((src, i) => (
                                    <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', border: '1px solid #e8e8e4' }}>
                                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, background: '#0d0d0d', color: '#fff', fontSize: 10, padding: '2px 6px', fontFamily: "'DM Mono', monospace" }}>Primary</span>}
                                        <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 4, right: 4, background: '#a32d2d', border: 'none', color: '#fff', cursor: 'pointer', padding: 2, display: 'flex' }}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.images.length < 8 && (
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 32, border: '2px dashed #e8e8e4', background: 'none', cursor: 'pointer', color: '#b0afa8', transition: 'border-color .15s' }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0d0d0d')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e8e8e4')}>
                                <ImagePlus className="h-7 w-7" />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Click to upload images</span>
                                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}>JPEG, PNG, WebP — max 2 MB each ({data.images.length}/8)</span>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
                        {errors.images && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 8 }}>{errors.images}</p>}
                    </div>
                </div>

                {/* Status */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Product Status</span></div>
                    <div style={{ ...sectionBody, display: 'flex', gap: 24 }}>
                        {['active', 'inactive'].map((s) => (
                            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                                <input type="radio" name="status" value={s} checked={data.status === s} onChange={() => setData('status', s)} style={{ accentColor: '#0d0d0d' }} />
                                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{s}</span>
                                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, padding: '2px 8px', borderRadius: 10, background: s === 'active' ? '#0d0d0d' : '#e8e8e4', color: s === 'active' ? '#fff' : '#6e6d67' }}>
                                    {s === 'active' ? 'Visible' : 'Hidden'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 32 }}>
                    <Link href={route('seller.products.index')} style={{ padding: '10px 24px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}>Cancel</Link>
                    <button type="submit" disabled={processing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#0d0d0d', color: '#fff', fontSize: 13, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                        <Save className="h-4 w-4" />{processing ? 'Saving…' : 'Save Product'}
                    </button>
                </div>
            </form>
        </SellerLayout>
    );
}
