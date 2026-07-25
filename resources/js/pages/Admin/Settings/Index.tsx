import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertCircle, ArrowLeft, Save,
    Globe, Image, LayoutDashboard, Tag, AlignLeft, CreditCard, Smartphone,
} from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';

type Settings = Record<string, string>;

export default function AdminSettings({ settings }: { settings: Settings }) {
    const { data, setData, post, processing, errors } = useForm<Settings & {
        banner_image: File | null;
        gcash_qr_image: File | null;
        site_logo: File | null;
    }>({
        ...settings,
        banner_image: null,
        gcash_qr_image: null,
        site_logo: null,
    });

    const [bannerPreview, setBannerPreview] = useState<string | null>(
        settings.banner_image ? `/storage/${settings.banner_image}` : null,
    );
    const [gcashPreview, setGcashPreview] = useState<string | null>(
        settings.gcash_qr_image ? `/storage/${settings.gcash_qr_image}` : null,
    );
    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.site_logo ? `/storage/${settings.site_logo}` : null,
    );

    const bannerRef = useRef<HTMLInputElement>(null);
    const gcashRef  = useRef<HTMLInputElement>(null);
    const logoRef   = useRef<HTMLInputElement>(null);

    function handleBanner(files: FileList | null) {
        if (!files?.[0]) return;
        setData('banner_image', files[0]);
        setBannerPreview(URL.createObjectURL(files[0]));
    }

    function handleGcash(files: FileList | null) {
        if (!files?.[0]) return;
        setData('gcash_qr_image', files[0]);
        setGcashPreview(URL.createObjectURL(files[0]));
    }

    function handleLogo(files: FileList | null) {
        if (!files?.[0]) return;
        setData('site_logo', files[0]);
        setLogoPreview(URL.createObjectURL(files[0]));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        post(route('admin.settings.update'), { forceFormData: true });
    }

    function field(key: string, label: string, required = false) {
        return (
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type="text"
                    value={(data[key] as string) ?? ''}
                    onChange={e => setData(key, e.target.value)}
                    className={`w-full rounded-lg border px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${errors[key] ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors[key] && <p className="mt-1 text-sm text-red-500">{errors[key]}</p>}
            </div>
        );
    }

    function imageUpload(
        label: string,
        preview: string | null,
        inputRef: React.RefObject<HTMLInputElement>,
        onChange: (f: FileList | null) => void,
        errorKey: string,
    ) {
        return (
            <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
                {preview && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-gray-200">
                        <img src={preview} alt={label} className="h-36 w-full object-cover" />
                    </div>
                )}
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-gray-500 hover:border-blue-400 hover:text-blue-500"
                >
                    <Image className="h-7 w-7" />
                    <span className="text-sm font-medium">{preview ? 'Replace image' : 'Click to upload'}</span>
                    <span className="text-xs text-gray-400">JPEG, PNG, WebP — max 4MB</span>
                </button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => onChange(e.target.files)} />
                {errors[errorKey] && <p className="mt-1 text-sm text-red-500">{errors[errorKey]}</p>}
            </div>
        );
    }

    return (
        <>
            <Head title="Site Settings" />
            <div className="min-h-screen bg-gray-50">

                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
                    <div className="flex items-center">
                        <Link href={route('dashboard')} className="mr-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
                            <p className="text-sm text-gray-500">Manage your store's content and appearance</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Link href={route('dashboard')} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            Cancel
                        </Link>
                        <button type="submit" form="settings-form" disabled={processing}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            <Save className="mr-2 h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>

                <div className="mx-auto max-w-4xl px-8 py-8">
                    <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">

                        {/* Validation errors */}
                        {Object.keys(errors).length > 0 && (
                            <div className="flex items-start rounded-lg border border-red-200 bg-red-50 p-4">
                                <AlertCircle className="mt-0.5 mr-3 h-5 w-5 shrink-0 text-red-500" />
                                <ul className="list-inside list-disc text-sm text-red-600">
                                    {Object.values(errors).map((error, i) => <li key={i}>{error}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* General */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <Globe className="mr-2 h-5 w-5 text-blue-500" /> General
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                {field('site_name', 'Site Name', true)}
                                {field('site_tagline', 'Site Tagline')}
                            </div>
                            <div className="mt-6">
                                {imageUpload('Site Logo', logoPreview, logoRef, handleLogo, 'site_logo')}
                            </div>
                        </div>

                        {/* Hero Banner */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <Image className="mr-2 h-5 w-5 text-blue-500" /> Hero Banner
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('banner_subtitle', 'Subtitle')}
                                    {field('banner_title', 'Title')}
                                </div>
                                {field('banner_description', 'Description')}
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('banner_badge', 'Badge Text')}
                                    {field('banner_shop_btn', 'Button Text')}
                                </div>
                                {imageUpload('Banner Image', bannerPreview, bannerRef, handleBanner, 'banner_image')}
                            </div>
                        </div>

                        {/* Dashboard Banner */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <LayoutDashboard className="mr-2 h-5 w-5 text-blue-500" /> Dashboard Banner
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('dashboard_banner_title', 'Title')}
                                    {field('dashboard_banner_subtitle', 'Subtitle')}
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('dashboard_banner_description', 'Description')}
                                    {field('dashboard_banner_btn', 'Button Text')}
                                </div>
                            </div>
                        </div>

                        {/* Section Titles */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <Tag className="mr-2 h-5 w-5 text-blue-500" /> Section Titles
                            </h2>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                {field('flash_title', 'Flash Sale Title')}
                                {field('categories_title', 'Categories Title')}
                                {field('products_title', 'Products Title')}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <AlignLeft className="mr-2 h-5 w-5 text-blue-500" /> Footer
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('footer_brand', 'Brand Name')}
                                    {field('footer_tagline', 'Tagline')}
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    {field('footer_col2_title', 'Quick Links Column Title')}
                                    {field('footer_col3_title', 'Payments Column Title')}
                                    {field('footer_col4_title', 'Follow Us Column Title')}
                                </div>
                                <div>
                                    {field('footer_quick_links', 'Quick Links (comma-separated)')}
                                    <p className="mt-1 text-xs text-gray-400">e.g. About Us,Track Order,FAQ</p>
                                </div>
                                <div>
                                    {field('footer_payments', 'Payment Methods (comma-separated)')}
                                    <p className="mt-1 text-xs text-gray-400">e.g. GCash,PayMaya,COD</p>
                                </div>
                                <div>
                                    {field('footer_social_links', 'Social Media Links (label|url, comma-separated)')}
                                    <p className="mt-1 text-xs text-gray-400">e.g. 📘 Facebook|https://facebook.com,📷 Instagram|https://instagram.com</p>
                                </div>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('footer_copyright', 'Copyright Text')}
                                    {field('footer_contact', 'Contact Label')}
                                </div>
                            </div>
                        </div>

                        {/* GCash */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="mb-6 flex items-center text-lg font-semibold text-gray-900">
                                <Smartphone className="mr-2 h-5 w-5 text-blue-500" /> GCash
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {field('gcash_number', 'GCash Number')}
                                    {field('gcash_name', 'GCash Account Name')}
                                </div>
                                {imageUpload('GCash QR Code', gcashPreview, gcashRef, handleGcash, 'gcash_qr_image')}
                            </div>
                        </div>

                        {/* Bottom actions */}
                        <div className="flex justify-end gap-3 pb-8">
                            <Link href={route('dashboard')} className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                Cancel
                            </Link>
                            <button type="submit" disabled={processing}
                                className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}
