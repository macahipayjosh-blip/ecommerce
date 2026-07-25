import { Head, Link, useForm } from '@inertiajs/react';
import { User, MapPin, Heart, Headphones, CreditCard, Save, LoaderCircle, ArrowLeft } from 'lucide-react';
import { FormEvent } from 'react';

interface Profile {
    id: number;
    name: string;
    email: string;
    phone?: string;
    profile_picture?: string;
    customer_profile?: { loyalty_points: number; total_spent: number };
}

export default function CustomerProfileIndex({ user }: { user: Profile }) {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        name: user.name,
        phone: user.phone ?? '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        patch(route('customer.profile.update'));
    };

    const stats = [
        { label: 'Total Spent',    value: `₱${(user.customer_profile?.total_spent ?? 0).toFixed(2)}`, icon: <CreditCard className="h-5 w-5 text-green-500" /> },
        { label: 'Loyalty Points', value: user.customer_profile?.loyalty_points ?? 0,                  icon: <Heart className="h-5 w-5 text-red-500" /> },
    ];

    const quickLinks = [
        { label: 'My Orders',  href: route('customer.orders.index'),  icon: <CreditCard className="h-6 w-6 text-blue-500" /> },
        { label: 'Addresses',  href: route('customer.addresses'),      icon: <MapPin className="h-6 w-6 text-green-500" /> },
        { label: 'Favorites',  href: route('customer.wishlist'),       icon: <Heart className="h-6 w-6 text-red-500" /> },
        { label: 'Support',    href: route('customer.tickets.index'),  icon: <Headphones className="h-6 w-6 text-purple-500" /> },
    ];

    return (
        <>
            <Head title="My Profile" />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <Link href={route('dashboard')} className="inline-flex items-center gap-1.5 text-sm text-[#2d6a2d] hover:underline mb-1">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">My Profile</h1>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        {stats.map((s) => (
                            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-3">
                                    {s.icon}
                                    <div>
                                        <p className="text-xs text-gray-500">{s.label}</p>
                                        <p className="text-xl font-bold text-gray-900">{s.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Edit form */}
                    <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
                        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                            <User className="h-5 w-5 text-blue-500" /> Personal Information
                        </h2>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 cursor-not-allowed"
                            />
                            <p className="mt-1 text-xs text-gray-400">Email cannot be changed here. Use Settings → Profile.</p>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                            {recentlySuccessful && <p className="text-sm text-green-600">Saved!</p>}
                        </div>
                    </form>

                    {/* Quick links */}
                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Quick Links</h2>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {quickLinks.map((l) => (
                                <Link
                                    key={l.label}
                                    href={l.href}
                                    className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                >
                                    {l.icon}
                                    <span className="text-sm font-medium text-gray-700">{l.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
