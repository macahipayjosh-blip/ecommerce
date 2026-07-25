import { Link, useForm } from '@inertiajs/react';
import SellerLayout from '@/layouts/SellerLayout';

interface Coupon {
    id?: number; code?: string; type?: string; value?: number;
    valid_from?: string; valid_to?: string; usage_limit?: number; active?: boolean;
}
interface Props {
    coupon?: Coupon;
    submitRoute: string;
    method?: 'post' | 'put';
    breadcrumb: string;
    title: string;
}

const M = { fontFamily: "'DM Mono', monospace" };
const S = { fontFamily: "'DM Serif Display', serif" };

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}>
        <label style={{ ...M, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6e6d67', display: 'block', marginBottom: 6 }}>{label}</label>
        {children}
        {error && <div style={{ color: '#a32d2d', fontSize: 12, marginTop: 4 }}>{error}</div>}
    </div>
);

const inputStyle = { width: '100%', border: '1px solid #e8e8e4', padding: '9px 12px', fontSize: 14, outline: 'none' };

const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const rand = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${rand(4)}-${rand(4)}`;
};

export default function PromotionForm({ coupon, submitRoute, method = 'post', breadcrumb, title }: Props) {
    const { data, setData, submit, processing, errors } = useForm({
        code:        coupon?.code ?? generateCode(),
        type:        coupon?.type ?? 'percentage',
        value:       coupon?.value ?? '',
        valid_from:  coupon?.valid_from ? coupon.valid_from.slice(0, 10) : '',
        valid_to:    coupon?.valid_to ? coupon.valid_to.slice(0, 10) : '',
        usage_limit: coupon?.usage_limit ?? '',
        active:      coupon?.active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit(method, submitRoute);
    };

    return (
        <SellerLayout breadcrumb={breadcrumb}>
            <div style={{ marginBottom: 24 }}>
                <Link href={route('seller.promotions.index')} style={{ ...M, fontSize: 12, color: '#b0afa8', textDecoration: 'none' }}>← Vouchers</Link>
                <div style={{ ...S, fontSize: 26, letterSpacing: '-0.5px', marginTop: 8 }}>{title}</div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
                <Field label="Voucher Code" error={errors.code}>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())}
                            style={{ ...inputStyle, ...M, letterSpacing: '0.1em', flex: 1 }} />
                        <button type="button" onClick={() => setData('code', generateCode())}
                            style={{ padding: '9px 12px', border: '1px solid #e8e8e4', background: '#f5f5f3', fontSize: 11, ...M, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            ↺ Regenerate
                        </button>
                    </div>
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Discount Type" error={errors.type}>
                        <select value={data.type} onChange={e => setData('type', e.target.value)}
                            style={{ ...inputStyle, background: '#fff' }}>
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₱)</option>
                        </select>
                    </Field>
                    <Field label="Value" error={errors.value}>
                        <input type="number" min={0} step="0.01" value={data.value}
                            onChange={e => setData('value', e.target.value as any)}
                            placeholder={data.type === 'percentage' ? '20' : '50.00'}
                            style={inputStyle} />
                    </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Field label="Valid From" error={errors.valid_from}>
                        <input type="date" value={data.valid_from} onChange={e => setData('valid_from', e.target.value)} style={inputStyle} />
                    </Field>
                    <Field label="Valid To" error={errors.valid_to}>
                        <input type="date" value={data.valid_to} onChange={e => setData('valid_to', e.target.value)} style={inputStyle} />
                    </Field>
                </div>

                <Field label="Usage Limit (optional)" error={errors.usage_limit}>
                    <input type="number" min={1} value={data.usage_limit}
                        onChange={e => setData('usage_limit', e.target.value as any)}
                        placeholder="Leave blank for unlimited" style={inputStyle} />
                </Field>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                    <input type="checkbox" id="active" checked={!!data.active} onChange={e => setData('active', e.target.checked)}
                        style={{ width: 16, height: 16, cursor: 'pointer' }} />
                    <label htmlFor="active" style={{ fontSize: 14, cursor: 'pointer' }}>Active</label>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" disabled={processing}
                        style={{ padding: '10px 24px', background: '#0d0d0d', color: '#fff', border: 'none', fontSize: 13, cursor: 'pointer', opacity: processing ? 0.6 : 1 }}>
                        {processing ? 'Saving…' : 'Save Voucher'}
                    </button>
                    <Link href={route('seller.promotions.index')}
                        style={{ padding: '10px 24px', border: '1px solid #e8e8e4', fontSize: 13, color: '#6e6d67', textDecoration: 'none' }}>
                        Cancel
                    </Link>
                </div>
            </form>
        </SellerLayout>
    );
}
