import { Head, Link, useForm, router } from '@inertiajs/react';
import { MapPin, Plus, Trash2, ArrowLeft, Home, Briefcase, LoaderCircle } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface Address {
    id: number;
    type: 'shipping' | 'billing';
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

interface User {
    name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
}

export default function Addresses({ addresses, user }: { addresses: Address[]; user: User }) {
    const [showForm, setShowForm] = useState(false);

    const defaultFullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.name;
    const defaultPhone = user.phone ?? '';

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'shipping' as 'shipping' | 'billing',
        full_name: defaultFullName, phone: defaultPhone, address_line1: '', address_line2: '',
        city: '', state: '', postal_code: '', country: 'Philippines', is_default: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('customer.addresses.store'), { onSuccess: () => { reset('address_line1', 'address_line2', 'city', 'state', 'postal_code'); setShowForm(false); } });
    };

    return (
        <>
            <Head title="My Addresses" />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <Link href={route('dashboard')} className="inline-flex items-center gap-1.5 text-sm text-[#2d6a2d] hover:underline mb-1">
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Addresses</h1>
                        </div>
                        <button onClick={() => setShowForm(!showForm)}
                            className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a2d] px-4 py-2 text-sm font-medium text-white hover:bg-[#245724] transition-colors">
                            <Plus className="h-4 w-4" /> Add Address
                        </button>
                    </div>

                    {showForm && (
                        <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h2 className="font-semibold text-gray-900">New Address</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {([
                                    ['type', 'Type', 'select'],
                                    ['full_name', 'Full Name', 'text'],
                                    ['phone', 'Phone', 'tel'],
                                    ['address_line1', 'Address Line 1', 'text'],
                                    ['address_line2', 'Address Line 2 (optional)', 'text'],
                                    ['city', 'City', 'text'],
                                    ['state', 'State / Province', 'text'],
                                    ['postal_code', 'Postal Code', 'text'],
                                    ['country', 'Country', 'text'],
                                ] as [keyof typeof data, string, string][]).map(([field, label, type]) => (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                                        {type === 'select' ? (
                                            <select value={data.type} onChange={e => setData('type', e.target.value as 'shipping' | 'billing')}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]">
                                                <option value="shipping">Shipping</option>
                                                <option value="billing">Billing</option>
                                            </select>
                                        ) : (field === 'full_name' && defaultFullName) || (field === 'phone' && defaultPhone) ? (
                                            <input type={type} value={data[field] as string} readOnly
                                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed" />
                                        ) : (
                                            <input type={type} value={data[field] as string}
                                                onChange={e => setData(field, e.target.value)}
                                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d] ${errors[field] ? 'border-red-400' : 'border-gray-300'}`} />
                                        )}
                                        {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
                                    </div>
                                ))}
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" checked={data.is_default} onChange={e => setData('is_default', e.target.checked)}
                                    className="rounded border-gray-300 text-[#2d6a2d] focus:ring-[#2d6a2d]" />
                                Set as default address
                            </label>
                            <div className="flex gap-3">
                                <button type="submit" disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#2d6a2d] px-5 py-2 text-sm font-medium text-white hover:bg-[#245724] disabled:opacity-50">
                                    {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                    Save Address
                                </button>
                                <button type="button" onClick={() => { setData({ type: 'shipping', full_name: defaultFullName, phone: defaultPhone, address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'Philippines', is_default: false }); setShowForm(false); }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {addresses.length > 0 ? (
                        <div className="space-y-4">
                            {addresses.map((address) => (
                                <div key={address.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5 p-2 rounded-lg bg-[#e8f5e9]">
                                            {address.type === 'shipping' ? <Home className="h-5 w-5 text-[#2d6a2d]" /> : <Briefcase className="h-5 w-5 text-[#2d6a2d]" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-semibold text-gray-900 capitalize">{address.type}</span>
                                                {address.is_default && (
                                                    <span className="text-xs bg-[#e8f5e9] text-[#2d6a2d] font-medium px-2 py-0.5 rounded-full">Default</span>
                                                )}
                                            </div>
                                            <p className="font-medium text-gray-800">{address.full_name}</p>
                                            <p className="text-sm text-gray-500">{address.phone}</p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br />
                                                {address.city}, {address.state} {address.postal_code}<br />
                                                {address.country}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => { if (confirm('Delete this address?')) router.delete(route('customer.addresses.destroy', address.id)); }}
                                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                            <MapPin className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                            <p className="text-gray-500 font-medium">No addresses saved yet.</p>
                            <button onClick={() => setShowForm(true)}
                                className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-[#2d6a2d] text-white rounded-full text-sm font-bold hover:bg-[#245724] transition-colors">
                                <Plus className="h-4 w-4" /> Add Your First Address
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
