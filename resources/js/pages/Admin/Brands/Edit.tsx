import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { FormEvent } from 'react';

interface Brand {
    id: number;
    name: string;
    logo?: string;
}

export default function BrandEdit({ brand }: { brand: Brand }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: brand.name,
        logo: null as File | null,
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.brands.update', brand.id), { forceFormData: true });
    };

    return (
        <>
            <Head title="Edit Brand" />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-6 flex items-center gap-4">
                        <Link href={route('admin.brands.index')} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Brand</h1>
                            <p className="text-sm text-gray-500">Update brand information</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Tag className="h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-900">Brand Details</h2>
                        </div>

                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                Brand Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        {brand.logo && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Current Logo</p>
                                <img src={`/storage/${brand.logo}`} alt={brand.name} className="h-20 w-20 rounded-lg object-contain border border-gray-200 p-1" />
                            </div>
                        )}

                        <div>
                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                                {brand.logo ? 'Replace Logo' : 'Logo'}
                            </label>
                            <input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    if (file && file.size > 2048 * 1024) {
                                        e.target.value = '';
                                        alert('The logo must not be greater than 2MB.');
                                        return;
                                    }
                                    setData('logo', file);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-blue-700"
                            />
                            {errors.logo && <p className="mt-1 text-sm text-red-500">{errors.logo}</p>}
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                            <Link
                                href={route('admin.brands.index')}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 text-center hover:bg-gray-50"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Update Brand'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
