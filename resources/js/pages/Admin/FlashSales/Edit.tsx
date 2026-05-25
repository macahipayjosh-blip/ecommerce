import AdminLayout from '@/layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface FlashSale {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    active: boolean;
}

export default function FlashSaleEdit({ flashSale }: { flashSale: FlashSale }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: flashSale.title,
        description: flashSale.description || '',
        start_time: flashSale.start_time.slice(0, 16),
        end_time: flashSale.end_time.slice(0, 16),
        active: flashSale.active,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.flash-sales.update', { flash_sale: flashSale.id }));
    };

    return (
        <AdminLayout breadcrumb="Edit Flash Sale">
            <Head title={`Edit Flash Sale: ${flashSale.title}`} />

            <div className="pg-header">
                <div>
                    <Link href={route('admin.flash-sales.show', { flash_sale: flashSale.id })} className="breadcrumb-link">
                        ← Back to Flash Sale
                    </Link>
                    <div className="pg-title">Edit Flash Sale</div>
                    <div className="pg-subtitle">{flashSale.title}</div>
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ maxWidth: 640, display: 'grid', gap: 24 }}>
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Flash Sale Details</span>
                    </div>
                    <div className="card-body" style={{ display: 'grid', gap: 18 }}>
                        <div>
                            <label className="form-label">
                                Title <span className="form-required">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="form-input"
                                required
                            />
                            {errors.title && <p className="form-error">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="form-label">Description</label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="form-textarea"
                                rows={3}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="form-label">
                                    Start Time <span className="form-required">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.start_time && <p className="form-error">{errors.start_time}</p>}
                            </div>
                            <div>
                                <label className="form-label">
                                    End Time <span className="form-required">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    className="form-input"
                                    required
                                />
                                {errors.end_time && <p className="form-error">{errors.end_time}</p>}
                            </div>
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
                                Active (sellers can submit products)
                            </label>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <Link href={route('admin.flash-sales.show', { flash_sale: flashSale.id })} className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className="btn btn-primary" style={{ opacity: processing ? 0.5 : 1 }}>
                        {processing ? 'Updating...' : '✎ Update Flash Sale'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
