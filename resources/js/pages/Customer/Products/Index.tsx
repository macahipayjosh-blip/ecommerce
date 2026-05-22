import StarRating from '@/components/StarRating';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Leaf, Package, Search, ShoppingCart, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: string;
    compare_at_price?: string;
    stock_quantity: number;
    avg_rating?: number;
    reviews_count?: number;
    category?: { id: number; name: string };
    brand?: { id: number; name: string };
    images?: { image_path: string; is_primary: boolean }[];
}
interface Category {
    id: number;
    name: string;
}
interface Brand {
    id: number;
    name: string;
}
interface Filters {
    search?: string;
    category?: string;
    brand?: string;
    sort?: string;
}
interface Props {
    products: { data: Product[]; links: any[]; meta?: { total?: number } };
    categories: Category[];
    brands: Brand[];
    filters: Filters;
}

export default function CustomerProductsIndex({ products, categories, brands, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (name: string) => {
        setToast(name);
        setTimeout(() => setToast(null), 3000);
    };

    const addToCart = (productId: number, productName: string) => {
        router.post(
            route('customer.cart.add'),
            { product_id: productId, quantity: 1 },
            {
                preserveScroll: true,
                onSuccess: () => showToast(productName),
            },
        );
    };

    const applyFilters = (overrides: Partial<Filters> = {}) => {
        const params = { ...filters, search, ...overrides };
        Object.keys(params).forEach((k) => !(params as any)[k] && delete (params as any)[k]);
        router.get(route('customer.products.index'), params, { preserveState: true, replace: true });
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        applyFilters();
    };
    const clearFilter = (key: keyof Filters) => applyFilters({ [key]: '' });

    return (
        <>
            <Head title="Shop — BSABShop" />
            {/* Toast */}
            <div
                style={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    zIndex: 9999,
                    transform: toast ? 'translateY(0)' : 'translateY(120%)',
                    opacity: toast ? 1 : 0,
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: '#2d6a2d',
                    color: '#fff',
                    padding: '12px 18px',
                    borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                <CheckCircle size={18} />
                {toast} added to cart!
                <Link href={route('customer.cart.index')} style={{ color: '#a5d6a7', marginLeft: 8, fontSize: 13, textDecoration: 'underline' }}>
                    View Cart
                </Link>
            </div>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-gray-100 bg-white shadow-sm">
                    <div className="mx-auto flex h-[80px] max-w-6xl items-center gap-3 px-4">
                        <Link href={route('dashboard')} className="shrink-0 rounded-lg p-1.5 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5 text-[#2d6a2d]" />
                        </Link>
                        <Link href={route('home')} className="flex shrink-0 items-center gap-1.5">
                            <Leaf className="h-6 w-6 text-[#2d6a2d]" />
                            <span className="hidden text-base font-bold text-[#2d6a2d] sm:block">BSABShop</span>
                        </Link>
                        <form onSubmit={handleSearch} className="flex min-w-0 flex-1">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="min-w-0 flex-1 rounded-l-lg border border-r-0 border-gray-300 px-3 py-2 text-sm focus:border-[#2d6a2d] focus:ring-1 focus:ring-[#2d6a2d] focus:outline-none"
                            />
                            <button type="submit" className="rounded-r-lg bg-[#2d6a2d] px-3 text-white hover:bg-[#245724]">
                                <Search className="h-4 w-4" />
                            </button>
                        </form>
                        <Link href={route('customer.cart.index')} className="relative shrink-0 rounded-lg p-1.5 hover:bg-gray-100">
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                        </Link>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
                        <select
                            value={filters.category ?? ''}
                            onChange={(e) => applyFilters({ category: e.target.value })}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a2d] focus:ring-1 focus:ring-[#2d6a2d] focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            {categories.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {brands.length > 0 && (
                            <select
                                value={filters.brand ?? ''}
                                onChange={(e) => applyFilters({ brand: e.target.value })}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a2d] focus:ring-1 focus:ring-[#2d6a2d] focus:outline-none"
                            >
                                <option value="">All Brands</option>
                                {brands.map((b) => (
                                    <option key={b.id} value={String(b.id)}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={filters.sort ?? 'newest'}
                            onChange={(e) => applyFilters({ sort: e.target.value })}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#2d6a2d] focus:ring-1 focus:ring-[#2d6a2d] focus:outline-none"
                        >
                            <option value="newest">Newest</option>
                            <option value="price_low">Price: Low → High</option>
                            <option value="price_high">Price: High → Low</option>
                            <option value="name_asc">Name A–Z</option>
                            <option value="name_desc">Name Z–A</option>
                        </select>

                        {/* Active chips */}
                        {filters.search && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-1 text-xs font-medium text-[#2d6a2d]">
                                "{filters.search}"
                                <button onClick={() => clearFilter('search')}>
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.category && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-1 text-xs font-medium text-[#2d6a2d]">
                                {categories.find((c) => String(c.id) === filters.category)?.name}
                                <button onClick={() => clearFilter('category')}>
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {filters.brand && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e9] px-2.5 py-1 text-xs font-medium text-[#2d6a2d]">
                                {brands.find((b) => String(b.id) === filters.brand)?.name}
                                <button onClick={() => clearFilter('brand')}>
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        <span className="ml-auto text-xs text-gray-400">{products.meta?.total ?? products.data.length} products</span>
                    </div>

                    {/* Grid */}
                    {products.data.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                            {products.data.map((product) => {
                                const img = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
                                const price = parseFloat(product.price);
                                const comparePrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
                                const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
                                const outOfStock = product.stock_quantity === 0;

                                return (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <Link
                                            href={route('customer.products.show', product.id)}
                                            className="relative block aspect-square overflow-hidden bg-gray-50"
                                        >
                                            {img ? (
                                                <img
                                                    src={`/storage/${img.image_path}`}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Package className="h-12 w-12 text-gray-200" />
                                                </div>
                                            )}
                                            {discount > 0 && (
                                                <span className="absolute top-2 left-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                    -{discount}%
                                                </span>
                                            )}
                                            {outOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                        <div className="flex flex-1 flex-col p-3">
                                            {product.category && (
                                                <p className="mb-0.5 truncate text-[11px] font-medium text-[#2d6a2d]">{product.category.name}</p>
                                            )}
                                            <Link
                                                href={route('customer.products.show', product.id)}
                                                className="mb-1 line-clamp-2 text-sm leading-snug font-semibold text-gray-800 hover:text-[#2d6a2d]"
                                            >
                                                {product.name}
                                            </Link>
                                            <div className="mb-2">
                                                <StarRating rating={product.avg_rating ?? 0} count={product.reviews_count} />
                                            </div>
                                            <div className="mb-3 flex items-baseline gap-1.5">
                                                <span className="text-base font-bold text-[#2d6a2d]">₱{price.toFixed(2)}</span>
                                                {comparePrice && comparePrice > price && (
                                                    <span className="text-xs text-gray-400 line-through">₱{comparePrice.toFixed(2)}</span>
                                                )}
                                            </div>
                                            <div className="mt-auto flex gap-1.5">
                                                <button
                                                    disabled={outOfStock}
                                                    onClick={() => addToCart(product.id, product.name)}
                                                    className="flex-1 rounded-lg border border-[#2d6a2d] py-1.5 text-xs font-semibold text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9] disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Add to Cart
                                                </button>
                                                <Link
                                                    href={route('customer.products.show', product.id)}
                                                    className="flex-1 rounded-lg bg-[#f59e0b] py-1.5 text-center text-xs font-semibold text-white transition-colors hover:bg-[#d97706]"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-100 bg-white py-20 text-center">
                            <Package className="mx-auto mb-3 h-12 w-12 text-gray-200" />
                            <p className="font-medium text-gray-500">No products found.</p>
                            <button
                                onClick={() => router.get(route('customer.products.index'))}
                                className="mt-4 inline-block rounded-full bg-[#2d6a2d] px-5 py-2 text-sm font-bold text-white hover:bg-[#245724]"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {products.links && products.data.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 pt-2">
                            {products.links.map((link, i) =>
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${link.active ? 'border-[#2d6a2d] bg-[#2d6a2d] text-white' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ),
                            )}
                        </div>
                    )}
                </div>

                <footer className="mt-12 border-t border-gray-800 bg-[#111] px-4 py-6">
                    <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-gray-600">
                        <span>© 2025 CPSU BSABShop. All rights reserved.</span>
                        <span className="cursor-pointer hover:text-white">Contact Us</span>
                    </div>
                </footer>
            </div>
        </>
    );
}
