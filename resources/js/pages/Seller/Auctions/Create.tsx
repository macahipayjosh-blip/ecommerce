import SellerLayout from '@/layouts/SellerLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

const inputStyle = (hasError?: boolean) => ({
    width: '100%',
    border: `1px solid ${hasError ? '#a32d2d' : '#e8e8e4'}`,
    padding: '8px 12px',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    background: '#fff',
    borderRadius: 0,
});

const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: '#6e6d67',
    marginBottom: 6,
};
const sectionStyle = { border: '1px solid #e8e8e4', background: '#fff', marginBottom: 20 };
const sectionHead = { padding: '14px 18px', borderBottom: '1px solid #e8e8e4' };
const sectionBody = { padding: 18 };
const sectionTitle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontWeight: 500,
};

export default function CreateAuction() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        breed: '',
        age: '',
        weight: '',
        weight_unit: 'kg',
        reserve_price: '',
        auction_duration: '1_day',
        auction_start_at: '',
        images: [],
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleImages = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, 8 - data.images.length);
        setData('images', [...data.images, ...newFiles]);
        setPreviews((p) => [...p, ...newFiles.map((f) => URL.createObjectURL(f))]);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index]);
        setData(
            'images',
            data.images.filter((_, i) => i !== index),
        );
        setPreviews((p) => p.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('seller.auctions.store'), {
            forceFormData: true,
            onSuccess: () => router.visit(route('seller.auctions.index')),
        });
    };

    return (
        <SellerLayout breadcrumb="Create Auction">
            <Head title="Create Auction" />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Link
                        href={route('seller.auctions.index')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 34,
                            height: 34,
                            border: '1px solid #e8e8e4',
                            color: '#6e6d67',
                            textDecoration: 'none',
                        }}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, letterSpacing: '-0.5px', marginBottom: 2 }}>
                            Create Auction
                        </div>
                        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: '#b0afa8' }}>Create a new auction listing</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <Link
                        href={route('seller.auctions.index')}
                        style={{ padding: '9px 16px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        form="auction-form"
                        disabled={processing}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '9px 16px',
                            background: '#0d0d0d',
                            color: '#fff',
                            fontSize: 13,
                            border: 'none',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            opacity: processing ? 0.6 : 1,
                        }}
                    >
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : 'Save Auction'}
                    </button>
                </div>
            </div>

            <form id="auction-form" onSubmit={handleSubmit}>
                {Object.keys(errors).length > 0 && (
                    <div style={{ display: 'flex', gap: 12, border: '1px solid #e8c8c8', background: '#fdf5f5', padding: 16, marginBottom: 20 }}>
                        <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#a32d2d', marginTop: 1 }} />
                        <ul style={{ fontSize: 13, color: '#a32d2d', paddingLeft: 16 }}>
                            {Object.values(errors).map((e, i) => (
                                <li key={i}>{e}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <div style={sectionStyle}>
                    <div style={sectionHead}>
                        <span style={sectionTitle}>Auction Details</span>
                    </div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>
                                Name <span style={{ color: '#a32d2d' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                style={inputStyle(!!errors.name)}
                                placeholder="Enter auction title"
                            />
                            {errors.name && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.name}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>
                                Breed <span style={{ color: '#a32d2d' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={data.breed}
                                onChange={(e) => setData('breed', e.target.value)}
                                required
                                style={inputStyle(!!errors.breed)}
                                placeholder="Enter breed"
                            />
                            {errors.breed && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.breed}</p>}
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={labelStyle}>
                                Description <span style={{ color: '#a32d2d' }}>*</span>
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={4}
                                required
                                style={{ ...inputStyle(!!errors.description), resize: 'vertical' }}
                                placeholder="Describe the auction item"
                            />
                            {errors.description && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.description}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>
                                Age <span style={{ color: '#a32d2d' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={data.age}
                                onChange={(e) => setData('age', e.target.value)}
                                required
                                style={inputStyle(!!errors.age)}
                                placeholder="e.g. 2 years"
                            />
                            {errors.age && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.age}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Weight</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input
                                    type="number"
                                    min="0"
                                    value={data.weight}
                                    onChange={(e) => setData('weight', e.target.value)}
                                    style={{ ...inputStyle(!!errors.weight), flex: 1 }}
                                    placeholder="Weight"
                                />
                                <select
                                    value={data.weight_unit}
                                    onChange={(e) => setData('weight_unit', e.target.value)}
                                    style={{ ...inputStyle(), width: 120 }}
                                >
                                    <option value="kg">kg</option>
                                    <option value="lb">lb</option>
                                </select>
                            </div>
                            {errors.weight && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.weight}</p>}
                        </div>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={sectionHead}>
                        <span style={sectionTitle}>Auction Settings</span>
                    </div>
                    <div style={{ ...sectionBody, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                        <div>
                            <label style={labelStyle}>Reserve Price</label>
                            <div style={{ position: 'relative' }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: 10,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#b0afa8',
                                        fontSize: 13,
                                    }}
                                >
                                    ₱
                                </span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.reserve_price}
                                    onChange={(e) => setData('reserve_price', e.target.value)}
                                    style={{ ...inputStyle(!!errors.reserve_price), paddingLeft: 24 }}
                                    placeholder="0.00"
                                />
                            </div>
                            {errors.reserve_price && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 4 }}>{errors.reserve_price}</p>}
                        </div>
                        <div>
                            <label style={labelStyle}>Auction Duration</label>
                            <select value={data.auction_duration} onChange={(e) => setData('auction_duration', e.target.value)} style={inputStyle()}>
                                <option value="1_day">1 day</option>
                                <option value="3_days">3 days</option>
                                <option value="1_week">1 week</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Start At</label>
                            <input
                                type="datetime-local"
                                value={data.auction_start_at}
                                onChange={(e) => setData('auction_start_at', e.target.value)}
                                style={inputStyle()}
                            />
                        </div>
                    </div>
                </div>

                <div style={sectionStyle}>
                    <div style={sectionHead}>
                        <span style={sectionTitle}>Images</span>
                    </div>
                    <div style={sectionBody}>
                        <p style={{ fontSize: 12, color: '#b0afa8', fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>
                            Upload up to 8 images. First image will be primary.
                        </p>
                        {previews.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 14 }}>
                                {previews.map((src, i) => (
                                    <div key={i} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', border: '1px solid #e8e8e4' }}>
                                        <img src={src} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        {i === 0 && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    left: 4,
                                                    background: '#0d0d0d',
                                                    color: '#fff',
                                                    fontSize: 10,
                                                    padding: '2px 6px',
                                                    fontFamily: "'DM Mono', monospace",
                                                }}
                                            >
                                                Primary
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                background: '#a32d2d',
                                                border: 'none',
                                                color: '#fff',
                                                cursor: 'pointer',
                                                padding: 2,
                                                display: 'flex',
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {data.images.length < 8 && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8,
                                    width: '100%',
                                    padding: 32,
                                    border: '2px dashed #e8e8e4',
                                    background: 'none',
                                    cursor: 'pointer',
                                    color: '#b0afa8',
                                }}
                            >
                                <ImagePlus className="h-7 w-7" />
                                <span style={{ fontSize: 13, fontWeight: 500 }}>Upload images</span>
                                <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                                    JPEG, PNG, WebP — max 2 MB each ({data.images.length}/8)
                                </span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={(e) => handleImages(e.target.files)}
                        />
                        {errors.images && <p style={{ fontSize: 12, color: '#a32d2d', marginTop: 8 }}>{errors.images}</p>}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingBottom: 32 }}>
                    <Link
                        href={route('seller.auctions.index')}
                        style={{ padding: '10px 24px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '10px 24px',
                            background: '#0d0d0d',
                            color: '#fff',
                            fontSize: 13,
                            border: 'none',
                            cursor: processing ? 'not-allowed' : 'pointer',
                            opacity: processing ? 0.6 : 1,
                        }}
                    >
                        <Save className="h-4 w-4" />
                        {processing ? 'Saving…' : 'Save Auction'}
                    </button>
                </div>
            </form>
        </SellerLayout>
    );
}
