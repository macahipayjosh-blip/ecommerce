import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

export default function FlashSaleCreate() {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        active: true,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.flash-sales.store'));
    };

    return (
        <AdminLayout breadcrumb="Create Flash Sale">
            <Head title="Create Flash Sale" />

            <div className="pg-header">
                <div>
                    <Link href={route('admin.flash-sales.index')} className="breadcrumb-link">
                        ← Back to Flash Sales
                    </Link>
                    <div className="pg-title">Create Flash Sale</div>
                    <div className="pg-subtitle">Set up a new limited-time sale event</div>
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
                                placeholder="e.g. 6.6 Midnight Sale"
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
                                placeholder="Optional description"
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
                    <Link href={route('admin.flash-sales.index')} className="btn btn-secondary">
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className="btn btn-primary" style={{ opacity: processing ? 0.5 : 1 }}>
                        {processing ? 'Creating...' : '+ Create Flash Sale'}
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
