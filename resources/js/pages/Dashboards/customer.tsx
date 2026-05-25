import StarRating from '@/components/StarRating';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Clock, CreditCard, Gift, Gavel, Leaf, Menu, Package, ShoppingBag, ShoppingCart, Store, Tag, Truck, User, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Stats {
    totalOrders: number;
    pendingOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
}

interface Product {
    id: number;
    name: string;
    price: string;
    compare_at_price?: string;
    stock_quantity?: number;
    reviews_avg_rating?: number;
    reviews_count?: number;
    category?: { id: number; name: string };
    images?: { image_path: string; is_primary: boolean }[];
}

function ProductCard({ product }: { product: Product }) {
    const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
    const price = parseFloat(product.price);
    const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
    const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

    return (
        <div className="group overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-200 hover:shadow-lg">
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gray-50">
                {img ? (
                    <img
                        src={`/storage/${img.image_path}`}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <Package className="h-14 w-14 text-gray-200" />
                )}
                {discount > 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>
                )}
                {product.stock_quantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white">Out of Stock</span>
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="mb-0.5 text-xs font-medium text-[#2d6a2d]">{product.category?.name}</p>
                <Link
                    href={route('customer.products.show', product.id)}
                    className="mb-1 line-clamp-2 block text-sm font-semibold text-gray-800 transition-colors hover:text-[#2d6a2d]"
                >
                    {product.name}
                </Link>
                <div className="mb-2">
                    <StarRating rating={product.reviews_avg_rating ?? 0} count={product.reviews_count} />
                </div>
                <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold text-[#2d6a2d]">₱{price.toFixed(2)}</span>
                    {comparePrice && comparePrice > price && (
                        <span className="text-xs text-gray-400 line-through">₱{comparePrice.toFixed(2)}</span>
                    )}
                </div>
                <div className="flex gap-1.5">
                    <Link
                        href={route('customer.cart.index')}
                        className="flex-1 rounded-lg border border-[#2d6a2d] py-1.5 text-center text-xs font-medium text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9]"
                    >
                        Add to Cart
                    </Link>
                    <Link
                        href={route('customer.products.show', product.id)}
                        className="flex-1 rounded-lg bg-[#f59e0b] py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-[#d97706]"
                    >
                        Buy Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

interface Category {
    id: number;
    name: string;
    image?: string;
    products_count: number;
}

interface FlashSale {
    id: number;
    title: string;
    description?: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string | number;
    start_time: string;
    end_time: string;
    active: boolean;
}

interface OrderItem {
    id: number;
    product?: {
        name: string;
        images?: { url: string; is_primary: boolean }[];
    };
}
interface Order {
    id: number;
    order_number: string;
    status: string;
    total: number;
    items: OrderItem[];
    created_at: string;
}

interface Auction {
    id: number;
    name: string;
    reserve_price: string;
    auction_end_at: string;
    auction_status: string;
    breed: string;
    age: string;
    bids_count: number;
    images?: { image_path: string; is_primary: boolean }[];
}

interface Voucher {
    id: number;
    code: string;
    type: string;
    value: number;
    min_order_amount?: number;
    valid_to?: string;
    claim_limit?: number;
    claimed_count: number;
}

function Countdown({ endTime }: { endTime: string }) {
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)));

    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const seconds = String(secondsLeft % 60).padStart(2, '0');

    return (
        <span className="font-mono font-bold">
            {hours}:{minutes}:{seconds}
        </span>
    );
}

export default function CustomerDashboard({
    stats,
    recentOrders,
    isApprovedSeller,
    settings,
    availableVouchers,
    flashSale,
    flashSaleProducts,
    liveAuctions,
    featuredCategories = [],
    latestProducts = [],
}: {
    stats: Stats;
    recentOrders: Order[];
    isApprovedSeller: boolean;
    settings: Record<string, string>;
    availableVouchers: Voucher[];
    flashSale?: FlashSale | null;
    flashSaleProducts?: Product[];
    liveAuctions?: Auction[];
    featuredCategories?: Category[];
    latestProducts?: Product[];
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [switching, setSwitching] = useState(false);
    const [voucherPopup, setVoucherPopup] = useState(false);
    const [claiming, setClaiming] = useState<number | null>(null);
    const [claimedIds, setClaimedIds] = useState<number[]>([]);

    useEffect(() => {
        if (availableVouchers.length > 0) {
            const timer = setTimeout(() => setVoucherPopup(true), 800);
            return () => clearTimeout(timer);
        }
    }, []);

    const claim = (id: number) => {
        setClaiming(id);
        router.post(
            route('customer.vouchers.claim'),
            { coupon_id: id },
            {
                preserveScroll: true,
                onSuccess: () => setClaimedIds((prev) => [...prev, id]),
                onFinish: () => setClaiming(null),
            },
        );
    };

    const visibleVouchers = availableVouchers.filter((v) => !claimedIds.includes(v.id));

    const s = settings ?? {};
    const dashBg = s.banner_image ? `/storage/${s.banner_image}` : null;

    const switchToSeller = () => {
        setSwitching(true);
        router.post(route('role.switch'), {}, { onFinish: () => setSwitching(false) });
    };

    const navLinks = [
        { label: 'Dashboard', href: route('dashboard') },
        { label: 'Products', href: route('customer.products.index') },
        { label: 'My Orders', href: route('customer.orders.index') },
        { label: 'Favorites', href: route('customer.wishlist') },
        { label: 'Addresses', href: route('customer.addresses') },
    ];

    const statusColor: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        paid: 'bg-indigo-100 text-indigo-800',
        shipped: 'bg-purple-100 text-purple-800',
        delivered: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const statusIcon: Record<string, JSX.Element> = {
        pending: <Clock className="h-4 w-4" />,
        confirmed: <Package className="h-4 w-4" />,
        shipped: <Truck className="h-4 w-4" />,
        delivered: <CheckCircle className="h-4 w-4" />,
        cancelled: <X className="h-4 w-4" />,
    };

    return (
        <>
            <Head title="My Dashboard" />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white shadow-sm">
                    <div className="mx-auto flex h-[80px] max-w-6xl items-center gap-3 px-4">
                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="shrink-0 rounded-lg p-1.5 text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9] sm:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>

                        <Link href={route('home')} className="flex shrink-0 items-center gap-2">
                            <Leaf className="h-7 w-7 text-[#2d6a2d] sm:h-8 sm:w-8" />
                            <span className="text-base font-bold text-[#2d6a2d] sm:text-xl">BSABShop</span>
                        </Link>

                        {/* Nav links — desktop only */}
                        <nav className="hidden flex-1 items-center justify-center gap-1 overflow-x-auto sm:flex">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9] hover:text-[#1a4d1a]"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        <div className="ml-auto flex shrink-0 items-center gap-2 sm:ml-0">
                            <Link href={route('customer.cart.index')} className="relative p-1">
                                <ShoppingCart className="h-5 w-5 text-gray-600" />
                            </Link>
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen((o) => !o)}
                                    className="flex items-center gap-1.5 rounded-lg p-1.5 text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9]"
                                >
                                    <User className="h-5 w-5" />
                                </button>
                                {dropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                                        <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                                            <Link
                                                href={route('profile.show')}
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2d6a2d] hover:bg-[#e8f5e9]"
                                            >
                                                <User className="h-4 w-4" /> My Account
                                            </Link>
                                            <div className="my-1 border-t border-gray-100" />
                                            {isApprovedSeller ? (
                                                <button
                                                    onClick={() => {
                                                        setDropdownOpen(false);
                                                        switchToSeller();
                                                    }}
                                                    disabled={switching}
                                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-[#2d6a2d] hover:bg-[#e8f5e9] disabled:opacity-50"
                                                >
                                                    <Store className="h-4 w-4" />
                                                    {switching ? 'Switching…' : 'Switch to Seller'}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={route('seller.application.create')}
                                                    onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#2d6a2d] hover:bg-[#e8f5e9]"
                                                >
                                                    <Store className="h-4 w-4" /> Become a Seller
                                                </Link>
                                            )}
                                            <div className="my-1 border-t border-gray-100" />
                                            <Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                                            >
                                                Logout
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mobile Sidebar Backdrop */}
                {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" onClick={() => setSidebarOpen(false)} />}

                {/* Mobile Sidebar Drawer */}
                <aside
                    className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 sm:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div className="flex items-center gap-2">
                            <Leaf className="h-7 w-7 text-[#2d6a2d]" />
                            <span className="text-lg font-bold text-[#2d6a2d]">BSABShop</span>
                        </div>
                        <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-[#e8f5e9] px-5 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2d6a2d] text-white">
                            <User className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900">My Account</p>
                    </div>
                    <nav className="flex flex-col py-3">
                        {navLinks.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-[#e8f5e9] hover:text-[#2d6a2d]"
                            >
                                {item.label}
                            </Link>
                        ))}
                        {/* Products section */}
                        <div className="mt-1 border-t border-gray-100 px-5 pt-3 pb-1">
                            <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Products</p>
                        </div>
                        <Link
                            href={route('customer.products.index')}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 bg-[#f0faf0] px-5 py-2.5 text-sm font-medium text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9]"
                        >
                            <ShoppingBag className="h-4 w-4 text-[#2d6a2d]" /> All Products
                        </Link>
                        <Link
                            href={route('customer.products.index') + '?sort=newest'}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-[#e8f5e9] hover:text-[#2d6a2d]"
                        >
                            <span className="text-base">🆕</span> Newest Arrivals
                        </Link>
                        <Link
                            href={route('customer.products.index') + '?sort=price_low'}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-[#e8f5e9] hover:text-[#2d6a2d]"
                        >
                            <span className="text-base">💰</span> Price: Low to High
                        </Link>
                        <Link
                            href={route('customer.products.index') + '?sort=price_high'}
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-5 py-2.5 text-sm text-gray-600 transition-colors hover:bg-[#e8f5e9] hover:text-[#2d6a2d]"
                        >
                            <span className="text-base">⭐</span> Price: High to Low
                        </Link>
                    </nav>
                    <div className="absolute right-0 bottom-0 left-0 border-t border-gray-100 px-5 py-4">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="flex w-full items-center justify-center rounded-xl bg-red-50 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                        >
                            Logout
                        </Link>
                    </div>
                </aside>

                <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:space-y-8 sm:px-4 sm:py-6">
                    {/* Hero Banner */}
                    <div
                        className="relative flex items-center overflow-hidden rounded-2xl p-5 text-white sm:p-8 min-h-[400px] "
                        style={
                            dashBg
                                ? { backgroundImage: `url(${dashBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                : { background: 'linear-gradient(to right, #1a4d1a, #2d6a2d, #4a9e4a)' }
                        }
                    >
                        {dashBg && <div className="absolute inset-0 bg-black/40" />}
                        <div className="relative z-10  ">
                            <p className="mb-1 text-xs font-medium tracking-wider text-green-200 uppercase sm:text-sm">
                                {s.dashboard_banner_subtitle || 'Welcome back'}
                            </p>
                            <h1 className="mb-1 text-xl font-bold sm:mb-2 sm:text-3xl">{s.dashboard_banner_title || 'My Dashboard'}</h1>
                            <p className="mb-4 text-sm text-green-100 sm:mb-5">
                                {s.dashboard_banner_description || 'Track your orders, favorites, and more.'}
                            </p>
                            <Link
                                href={route('customer.products.index')}
                                className="inline-block rounded-full bg-[#f59e0b] px-4 py-1.5 text-xs font-bold text-white shadow-lg transition-colors hover:bg-[#d97706] sm:px-5 sm:py-2 sm:text-sm"
                            >
                                {s.dashboard_banner_btn || 'Shop Now →'}
                            </Link>
                        </div>
                        {!dashBg && (
                            <div className="absolute top-0 right-0 bottom-0 flex w-1/3 items-center justify-center text-[80px] opacity-10 select-none sm:text-[160px]">
                                🌾
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {[
                            {
                                label: 'Total Orders',
                                value: stats.totalOrders,
                                icon: <ShoppingBag className="h-5 w-5 text-[#2d6a2d] sm:h-6 sm:w-6" />,
                                color: 'text-[#2d6a2d]',
                            },
                            {
                                label: 'Pending',
                                value: stats.pendingOrders,
                                icon: <Clock className="h-5 w-5 text-yellow-500 sm:h-6 sm:w-6" />,
                                color: 'text-yellow-600',
                            },
                            {
                                label: 'Total Spent',
                                value: `₱${stats.totalSpent.toFixed(2)}`,
                                icon: <CreditCard className="h-5 w-5 text-[#4a9e4a] sm:h-6 sm:w-6" />,
                                color: 'text-[#4a9e4a]',
                            },
                            {
                                label: 'Points',
                                value: stats.loyaltyPoints,
                                icon: <Gift className="h-5 w-5 text-[#f59e0b] sm:h-6 sm:w-6" />,
                                color: 'text-[#f59e0b]',
                            },
                        ].map((s) => (
                            <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm sm:p-5">
                                <div className="mb-2 flex items-center justify-between sm:mb-3">
                                    <span className="text-xs font-medium text-gray-500 sm:text-sm">{s.label}</span>
                                    {s.icon}
                                </div>
                                <p className={`truncate text-lg font-bold sm:text-2xl ${s.color}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Flash Sale */}
                    {flashSale && flashSaleProducts && flashSaleProducts.length > 0 ? (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">⚡</span>
                                        <h2 className="text-base font-bold text-gray-800 sm:text-lg">{flashSale.title || 'Flash Sale'}</h2>
                                    </div>
                                    {flashSale.description && <p className="text-xs text-gray-600 sm:text-sm">{flashSale.description}</p>}
                                </div>
                                <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-2 text-xs whitespace-nowrap text-red-600 sm:text-sm">
                                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    Ends in <Countdown endTime={flashSale.end_time} />
                                    <span className="ml-1 rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold text-red-700">
                                        {flashSale.discount_type === 'percentage'
                                            ? `-${Number(flashSale.discount_value)}%`
                                            : `-₱${Number(flashSale.discount_value).toFixed(0)}`}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-center gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-4 sm:justify-items-stretch sm:overflow-visible sm:pb-0">
                                {flashSaleProducts.map((p) => {
                                    const img = p.images?.find((i) => i.is_primary) ?? p.images?.[0];
                                    return (
                                        <Link
                                            key={p.id}
                                            href={route('customer.products.show', p.id)}
                                            className="w-[140px] shrink-0 overflow-hidden rounded-lg border border-gray-100 transition-shadow hover:shadow-md sm:w-auto"
                                        >
                                            <div className="flex h-24 items-center justify-center overflow-hidden bg-gray-50 sm:h-28">
                                                {img ? (
                                                    <img src={`/storage/${img.image_path}`} alt={p.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Package className="h-8 w-8 text-gray-200" />
                                                )}
                                            </div>
                                            <div className="p-2 sm:p-2.5">
                                                <p className="truncate text-xs font-medium text-gray-700 sm:text-sm">{p.name}</p>
                                                <p className="text-xs font-bold text-[#2d6a2d] sm:text-sm">₱{parseFloat(p.price).toFixed(2)}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}

                    {/* Live Auctions */}
                    {liveAuctions && liveAuctions.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center justify-between sm:mb-5">
                                <div className="flex items-center gap-2">
                                    <Gavel className="h-5 w-5 text-[#2d6a2d]" />
                                    <h2 className="text-base font-bold text-gray-800 sm:text-lg">Live Auctions</h2>
                                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600 animate-pulse">LIVE</span>
                                </div>
                                <Link href={route('auctions.show', liveAuctions[0].id)} className="text-xs font-medium text-[#2d6a2d] hover:underline sm:text-sm">
                                    View all →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {liveAuctions.map((auction) => {
                                    const img = auction.images?.find((i) => i.is_primary) ?? auction.images?.[0];
                                    const endsIn = Math.max(0, Math.floor((new Date(auction.auction_end_at).getTime() - Date.now()) / 1000));
                                    const h = String(Math.floor(endsIn / 3600)).padStart(2, '0');
                                    const m = String(Math.floor((endsIn % 3600) / 60)).padStart(2, '0');
                                    return (
                                        <Link
                                            key={auction.id}
                                            href={route('auctions.show', auction.id)}
                                            className="overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
                                        >
                                            <div className="relative flex h-28 items-center justify-center overflow-hidden bg-gray-50 sm:h-32">
                                                {img ? (
                                                    <img src={`/storage/${img.image_path}`} alt={auction.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <Gavel className="h-8 w-8 text-gray-200" />
                                                )}
                                                <span className="absolute top-2 left-2 rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                                                    {h}:{m} left
                                                </span>
                                            </div>
                                            <div className="p-2 sm:p-2.5">
                                                <p className="truncate text-xs font-semibold text-gray-800 sm:text-sm">{auction.name}</p>
                                                <p className="text-[10px] text-gray-400">{auction.breed} • {auction.age}</p>
                                                <div className="mt-1 flex items-center justify-between">
                                                    <p className="text-xs font-bold text-[#2d6a2d]">₱{parseFloat(auction.reserve_price).toFixed(2)}</p>
                                                    <span className="text-[10px] text-gray-400">{auction.bids_count} bid{auction.bids_count !== 1 ? 's' : ''}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Featured Categories */}
                    {featuredCategories.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-800 sm:text-lg">Featured Categories</h2>
                                <Link href={route('customer.products.index')} className="text-xs font-medium text-[#2d6a2d] hover:underline sm:text-sm">
                                    Browse all →
                                </Link>
                            </div>
                            {/* mobile: horizontal scroll  |  sm+: centered wrap */}
                            <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center sm:overflow-visible sm:pb-0">
                                {featuredCategories.map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={route('customer.products.index') + `?category=${cat.id}`}
                                        className="w-[120px] shrink-0 overflow-hidden rounded-lg border border-gray-100 transition-shadow hover:shadow-md sm:w-[140px]"
                                    >
                                        <div className="flex h-24 items-center justify-center overflow-hidden bg-gray-50 sm:h-28">
                                            {cat.image ? (
                                                <img src={`/storage/${cat.image}`} alt={cat.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ShoppingBag className="h-10 w-10 text-gray-200" />
                                            )}
                                        </div>
                                        <div className="p-2 sm:p-2.5">
                                            <p className="truncate text-xs font-medium text-gray-700 sm:text-sm">{cat.name}</p>
                                            <p className="text-[10px] text-gray-400">{cat.products_count} items</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Latest Products */}
                    {latestProducts.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-base font-bold text-gray-800 sm:text-lg">Latest Products</h2>
                                <Link href={route('customer.products.index') + '?sort=newest'} className="text-xs font-medium text-[#2d6a2d] hover:underline sm:text-sm">
                                    View all →
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                                {latestProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Orders */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
                        <div className="mb-4 flex items-center justify-between sm:mb-5">
                            <h2 className="text-base font-bold text-gray-800 sm:text-lg">Recent Orders</h2>
                            <Link
                                href={route('customer.orders.index')}
                                className="flex items-center gap-1 text-xs font-medium text-[#2d6a2d] hover:underline sm:text-sm"
                            >
                                View all →
                            </Link>
                        </div>
                        {recentOrders.length > 0 ? (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition-colors hover:bg-[#e8f5e9] sm:flex-row sm:items-center sm:justify-between sm:p-4"
                                    >
                                        {/* Left: image + order info */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e8f5e9]">
                                                {(() => {
                                                    const firstImg =
                                                        order.items[0]?.product?.images?.find((i) => i.is_primary) ??
                                                        order.items[0]?.product?.images?.[0];
                                                    return firstImg ? (
                                                        <img src={firstImg.url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package className="h-5 w-5 text-[#2d6a2d]" />
                                                    );
                                                })()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-gray-900">Order #{order.order_number}</p>
                                                <p className="text-xs text-gray-500">
                                                    {order.items?.length ?? 0} items • {new Date(order.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Right: status + price + view */}
                                        <div className="flex items-center justify-between gap-2 sm:justify-end sm:gap-3">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 ${statusColor[order.status] ?? 'bg-gray-100 text-gray-800'}`}
                                            >
                                                {statusIcon[order.status]}
                                                <span className="capitalize">{order.status}</span>
                                            </span>
                                            <span className="text-sm font-bold text-[#2d6a2d]">₱{Number(order.total).toFixed(2)}</span>
                                            <Link
                                                href={route('customer.orders.show', order.id)}
                                                className="rounded-lg bg-[#2d6a2d] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#245724]"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-10 text-center sm:py-12">
                                <Package className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                                <p className="font-medium text-gray-500">No orders yet.</p>
                                <Link
                                    href={route('customer.products.index')}
                                    className="mt-4 inline-block rounded-full bg-[#2d6a2d] px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#245724]"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Voucher Widget */}
                {visibleVouchers.length > 0 && (
                    <div className="fixed right-6 bottom-6 z-50 flex flex-col items-end gap-3">
                        {/* Slide-up panel */}
                        <div
                            style={{
                                transition: 'transform 0.3s ease, opacity 0.3s ease',
                                transform: voucherPopup ? 'translateY(0)' : 'translateY(16px)',
                                opacity: voucherPopup ? 1 : 0,
                                pointerEvents: voucherPopup ? 'auto' : 'none',
                            }}
                            className="w-80 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl"
                        >
                            {/* Panel header */}
                            <div className="flex items-center justify-between bg-gradient-to-r from-[#1a4d1a] to-[#2d6a2d] px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Tag className="h-4 w-4 text-white" />
                                    <span className="text-sm font-bold text-white">Vouchers for you</span>
                                    <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                        {visibleVouchers.length}
                                    </span>
                                </div>
                                <button onClick={() => setVoucherPopup(false)} className="text-white/70 transition-colors hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Voucher rows */}
                            <div className="max-h-64 divide-y divide-gray-100 overflow-y-auto">
                                {visibleVouchers.map((v) => (
                                    <div key={v.id} className="flex items-center gap-3 px-4 py-3">
                                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[#e8f5e9] text-[#2d6a2d]">
                                            <span className="text-sm leading-none font-extrabold">
                                                {v.type === 'percentage' ? `${v.value}%` : `₱${Number(v.value).toFixed(0)}`}
                                            </span>
                                            <span className="text-[8px] font-bold tracking-wide uppercase">OFF</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold tracking-wider text-gray-900">{v.code}</p>
                                            {v.min_order_amount && (
                                                <p className="text-[10px] text-gray-400">Min. ₱{Number(v.min_order_amount).toFixed(0)}</p>
                                            )}
                                            <div className="mt-0.5 flex items-center gap-1.5">
                                                {v.valid_to && (
                                                    <span className="text-[10px] text-gray-400">
                                                        Exp. {new Date(v.valid_to).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {v.claim_limit && (
                                                    <span className="text-[10px] font-semibold text-amber-500">
                                                        {v.claim_limit - v.claimed_count} left
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => claim(v.id)}
                                            disabled={claiming === v.id}
                                            className="shrink-0 rounded-lg bg-[#2d6a2d] px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-[#245724] disabled:opacity-60"
                                        >
                                            {claiming === v.id ? '...' : 'Claim'}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Panel footer */}
                            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2">
                                <Link
                                    href={route('customer.vouchers.index')}
                                    onClick={() => setVoucherPopup(false)}
                                    className="text-[11px] font-medium text-[#2d6a2d] hover:underline"
                                >
                                    View all
                                </Link>
                                <button onClick={() => setVoucherPopup(false)} className="text-[11px] text-gray-400 hover:text-gray-600">
                                    Dismiss
                                </button>
                            </div>
                        </div>

                        {/* Floating circle button */}
                        <button
                            onClick={() => setVoucherPopup((o) => !o)}
                            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#2d6a2d] text-white shadow-lg transition-colors hover:bg-[#245724]"
                            title="Vouchers available"
                        >
                            <Tag className="h-6 w-6" />
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {visibleVouchers.length}
                            </span>
                        </button>
                    </div>
                )}

                {/* Footer */}
                <footer className="mt-8 bg-[#111] px-4 py-8 text-gray-400 sm:mt-12 sm:py-10">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-sm sm:grid-cols-4 sm:gap-8">
                        <div className="col-span-2 sm:col-span-1">
                            <div className="mb-3 flex items-center gap-2">
                                <Leaf className="h-5 w-5 text-[#4a9e4a]" />
                                <p className="font-bold text-white">CPSU BSABShop</p>
                            </div>
                            <p className="text-xs leading-relaxed text-gray-500">A modern e-commerce platform for CPSU-BSAB students and faculty.</p>
                        </div>
                        <div>
                            <p className="mb-3 font-bold text-white">About Us</p>
                            {['About Us', 'Track Order', 'FAQ'].map((l) => (
                                <p key={l} className="cursor-pointer py-1 text-xs transition-colors hover:text-white">
                                    {l}
                                </p>
                            ))}
                        </div>
                        <div>
                            <p className="mb-3 font-bold text-white">Payments</p>
                            {['GCash', 'PayMaya', 'COD'].map((l) => (
                                <p key={l} className="cursor-pointer py-1 text-xs transition-colors hover:text-white">
                                    {l}
                                </p>
                            ))}
                        </div>
                        <div>
                            <p className="mb-3 font-bold text-white">Follow Us</p>
                            <div className="flex gap-3">
                                {['📘', '📷', '▶️', '🎵'].map((s, i) => (
                                    <span key={i} className="cursor-pointer text-xl transition-transform hover:scale-110">
                                        {s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mx-auto mt-8 flex max-w-6xl justify-between border-t border-gray-800 pt-4 text-xs text-gray-600">
                        <span>© 2026 CPSU BSABShop. All rights reserved.</span>
                        <span className="cursor-pointer transition-colors hover:text-white">Contact Us</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
