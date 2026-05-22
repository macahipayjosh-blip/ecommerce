import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

interface ProductImage { id: number; image_path: string; is_primary: boolean; }
interface Auction {
    id: number; name: string; description: string; breed: string; age: string;
    weight: string; weight_unit: string; reserve_price: string;
    auction_start_at: string; auction_end_at: string; auction_status: string;
    images: ProductImage[];
}
interface Props { auction: Auction; }

const inputStyle = (hasError?: boolean) => ({
    width: '100%', border: `1px solid ${hasError ? '#a32d2d' : '#e8e8e4'}`,
    padding: '8px 12px', fontSize: 13, outline: 'none', background: '#fff', borderRadius: 0,
});
const labelStyle = { display: 'block', fontSize: 12, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#6e6d67', marginBottom: 6 };
const sectionStyle = { border: '1px solid #e8e8e4', background: '#fff', marginBottom: 20 };
const sectionHead = { padding: '14px 18px', borderBottom: '1px solid #e8e8e4' };
const sectionBody = { padding: 18 };
const sectionTitle = { fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 500 };

export default function EditAuction({ auction }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: auction.name,
        description: auction.description,
        breed: auction.breed,
        age: auction.age,
        weight: auction.weight,
        weight_unit: auction.weight_unit,
        reserve_price: auction.reserve_price ?? '',
        auction_start_at: auction.auction_start_at ? auction.auction_start_at.slice(0, 16) : '',
        auction_end_at: auction.auction_end_at ? auction.auction_end_at.slice(0, 16) : '',
        images: [] as File[],
        deleted_images: [] as number[],
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [existingImages, setExistingImages] = useState<ProductImage[]>(auction.images);
    const [newPreviews, setNewPreviews] = useState<string[]>([]);

    const handleImages = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, 8 - existingImages.length - data.images.length);
        setData('images', [...data.images, ...newFiles]);
        setNewPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
    };

    const removeExisting = (img: ProductImage) => {
        setExistingImages((prev) => prev.filter((i) => i.id !== img.id));
        setData('deleted_images', [...data.deleted_images, img.id]);
    };

    const removeNew = (index: number) => {
        URL.revokeObjectURL(newPreviews[index]);
        setData('images', data.images.filter((_, i) => i !== index));
        setNewPreviews((p) => p.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('seller.auctions.update', auction.id), { forceFormData: true });
    };

    return (
        <SellerLayout breadcrumb="Edit Auction">
            <Head title="Edit Auction" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link href={route('seller.auctions.index')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid #e8e8e4', color: '#6e6d67', textDecoration: 'none' }}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, letterSpacing: '-0.5px', marginBottom: 2 }}>Edit Auction</div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#b0afa8' }}>{auction.name}</div>
                    </div>
                </div>
                <button type="submit" form="edit-auction-form" disabled={processing}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', background: '#0d0d0d', color: '#fff', fontSize: 13, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                    <Save className="h-4 w-4" />
                    {processing ? 'Saving…' : 'Save Changes'}
                </button>
            </div>

            <form id="edit-auction-form" onSubmit={handleSubmit}>
                {Object.keys(errors).length > 0 && (
                    <div style={{ display: 'flex', gap: 12, border: '1px solid #e8c8c8', background: '#fdf5f5', padding: 16, marginBottom: 20 }}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#a32d2d', marginTop: 1 }} />
                        <ul style={{ fontSize: 13, color: '#a32d2d', paddingLeft: 16 }}>
                            {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
                        </ul>
                    </div>
                )}

                {/* Auction Details */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Auction Details</span></div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Name <span style={{ color: '#a32d2d' }}>*</span></label>
                            <input type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} required style={inputStyle(!!errors.name)} />
                            {errors.name && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.name}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Breed <span style={{ color: '#a32d2d' }}>*</span></label>
                            <input type="text" value={data.breed} onChange={(e) => setData('breed', e.target.value)} required style={inputStyle(!!errors.breed)} />
                            {errors.breed && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.breed}</p>}
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>Description <span style={{ color: '#a32d2d' }}>*</span></label>
                            <textarea value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} required style={{ ...inputStyle(!!errors.description), resize: 'vertical' }} />
                            {errors.description && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.description}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Age <span style={{ color: '#a32d2d' }}>*</span></label>
                            <input type="text" value={data.age} onChange={(e) => setData('age', e.target.value)} required style={inputStyle(!!errors.age)} />
                        </div>
                        <div>
                            <label style={labelStyle}>Weight</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input type="number" min="0" value={data.weight} onChange={(e) => setData('weight', e.target.value)} style={{ ...inputStyle(), flex: 1 }} />
                                <select value={data.weight_unit} onChange={(e) => setData('weight_unit', e.target.value)} style={{ ...inputStyle(), width: 120 }}>
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Auction Settings */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Auction Settings</span></div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Reserve Price</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#b0afa8', fontSize: 13 }}>₱</span>
                                <input type="number" min="0" step="0.01" value={data.reserve_price} onChange={(e) => setData('reserve_price', e.target.value)} style={{ ...inputStyle(), paddingLeft: 24 }} placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label style={labelStyle}>Start At</label>
                            <input type="datetime-local" value={data.auction_start_at} onChange={(e) => setData('auction_start_at', e.target.value)} style={inputStyle()} />
                        </div>
                        <div>
                            <label style={labelStyle}>End At</label>
                            <input type="datetime-local" value={data.auction_end_at} onChange={(e) => setData('auction_end_at', e.target.value)} style={inputStyle()} />
                        </div>
                    </div>
                </div>

                {/* Images */}
                <div style={sectionStyle}>
                    <div style={sectionHead}><span style={sectionTitle}>Images</span></div>
                    <div style={sectionBody}>
                        {(existingImages.length > 0 || newPreviews.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                                {existingImages.map((img) => (
                                    <div key={img.id} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', border: `2px solid ${img.is_primary ? '#0d0d0d' : '#e8e8e4'}` }}>
                                        <img src={`/storage/${img.image_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {img.is_primary && <span style={{ position: 'absolute', top: 4, left: 4, background: '#0d0d0d', color: '#fff', fontSize: 10, padding: '2px 6px' }}>Primary</span>}
                                        <button type="button" onClick={() => removeExisting(img)} style={{ position: 'absolute', top: 4, right: 4, background: '#a32d2d', border: 'none', color: '#fff', cursor: 'pointer', padding: 2, display: 'flex' }}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                {newPreviews.map((src, i) => (
                                    <div key={`new-${i}`} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', border: '1px solid #e8e8e4' }}>
                                        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => removeNew(i)} style={{ position: 'absolute', top: 4, right: 4, background: '#a32d2d', border: 'none', color: '#fff', cursor: 'pointer', padding: 2, display: 'flex' }}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {existingImages.length + data.images.length < 8 && (
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: 32, border: '2px dashed #e8e8e4', background: 'none', cursor: 'pointer', color: '#b0afa8' }}>
                                <ImagePlus className="h-7 w-7" />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Upload more images</span>
                                <span style={{ fontSize: 11 }}>({existingImages.length + data.images.length}/8)</span>
                            </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 32 }}>
                    <Link href={route('seller.auctions.index')} style={{ padding: '10px 24px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}>Cancel</Link>
                    <button type="submit" disabled={processing}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#0d0d0d', color: '#fff', fontSize: 13, border: 'none', cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? 0.6 : 1 }}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </SellerLayout>
    );
}
