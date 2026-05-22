import StarRating from '@/components/StarRating';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Heart, Leaf, Minus, Package, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    compare_at_price?: number;
    sku?: string;
    stock_quantity: number;
    weight?: number;
    weight_unit?: string;
    category: { id: number; name: string };
    brand: { id: number; name: string };
    seller?: { id: number; name: string; store_name?: string };
    images?: { image_path: string; is_primary: boolean; url: string }[];
    in_wishlist?: boolean;
    avg_rating?: number;
    reviews_count?: number;
}

export default function CustomerProductShow({ product }: { product: Product }) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(product.in_wishlist ?? false);
    const [toast, setToast] = useState(false);

    const showToast = () => {
        setToast(true);
        setTimeout(() => setToast(false), 3000);
    };

    const images = product.images ?? [];
    const price = Number(product.price);
    const comparePrice = product.compare_at_price ? Number(product.compare_at_price) : null;
    const discount = comparePrice && comparePrice > price ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

    const addToCart = (redirect = false) => {
        setAdding(true);
        router.post(
            route('customer.cart.add'),
            { product_id: product.id, quantity },
            {
                onSuccess: () => {
                    if (redirect) router.visit(route('customer.cart.index'));
                    else showToast();
                },
                onFinish: () => setAdding(false),
            },
        );
    };

    const toggleWishlist = () => {
        setWishlisted((w) => !w);
        router.post(route('customer.wishlist.toggle', product.id), {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title={product.name} />
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
                {product.name} added to cart!
                <Link href={route('customer.cart.index')} style={{ color: '#a5d6a7', marginLeft: 8, fontSize: 13, textDecoration: 'underline' }}>
                    View Cart
                </Link>
            </div>
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white shadow-sm">
                    <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
                        <Link href={route('customer.products.index')} className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5 text-[#2d6a2d]" />
                        </Link>
                        <Link href={route('home')} className="flex shrink-0 items-center gap-2">
                            <Leaf className="h-7 w-7 text-[#2d6a2d]" />
                            <span className="text-lg font-bold text-[#2d6a2d]">BSABShop</span>
                        </Link>
                        <div className="flex-1" />
                        <Link href={route('customer.cart.index')} className="relative shrink-0 p-1">
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                        </Link>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="mx-auto max-w-6xl px-4 py-3">
                    <nav className="flex items-center gap-2 text-xs text-gray-500">
                        <Link href={route('dashboard')} className="hover:text-[#2d6a2d]">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <Link href={route('customer.products.index')} className="hover:text-[#2d6a2d]">
                            Products
                        </Link>
                        <span>/</span>
                        <Link href={route('customer.products.index') + `?category=${product.category.id}`} className="hover:text-[#2d6a2d]">
                            {product.category.name}
                        </Link>
                        <span>/</span>
                        <span className="truncate font-medium text-gray-800">{product.name}</span>
                    </nav>
                </div>

                <div className="mx-auto max-w-6xl space-y-8 px-4 pb-12">
                    {/* Main Product Section */}
                    <div className="grid grid-cols-1 gap-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:grid-cols-2">
                        {/* Images */}
                        <div className="space-y-3">
                            <div className="relative flex h-80 items-center justify-center overflow-hidden rounded-xl bg-gray-50">
                                {images.length > 0 ? (
                                    <img src={images[selectedImage]?.url} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Package className="h-24 w-24 text-gray-200" />
                                )}
                                {discount > 0 && (
                                    <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
                                        -{discount}%
                                    </span>
                                )}
                                {product.stock_quantity === 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="rounded-full bg-black/60 px-4 py-2 font-semibold text-white">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedImage(i)}
                                            className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${i === selectedImage ? 'border-[#2d6a2d]' : 'border-gray-200 hover:border-[#4a9e4a]'}`}
                                        >
                                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="space-y-5">
                            <div>
                                <p className="mb-1 text-xs font-medium text-[#2d6a2d]">
                                    {product.brand.name} · {product.category.name}
                                </p>
                                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                                {product.seller?.store_name && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Sold by <span className="font-medium">{product.seller.store_name}</span>
                                    </p>
                                )}
                            </div>

                            {/* Rating */}
                            <StarRating rating={product.avg_rating ?? 0} count={product.reviews_count} size="md" />

                            {/* Price */}
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-[#2d6a2d]">₱{price.toFixed(2)}</span>
                                {comparePrice && comparePrice > price && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">₱{comparePrice.toFixed(2)}</span>
                                        <span className="text-sm font-medium text-green-600">Save ₱{(comparePrice - price).toFixed(2)}</span>
                                    </>
                                )}
                            </div>

                            {/* Stock */}
                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
                                </span>
                            </div>

                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}

                            {/* Quantity + Actions */}
                            {product.stock_quantity > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-gray-700">Qty:</span>
                                        <div className="flex items-center overflow-hidden rounded-lg border border-gray-300">
                                            <button
                                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                className="px-3 py-2 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </button>
                                            <span className="min-w-[3rem] px-4 py-2 text-center font-semibold text-gray-900">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                                                className="px-3 py-2 transition-colors hover:bg-gray-100 disabled:opacity-40"
                                                disabled={quantity >= product.stock_quantity}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={addToCart}
                                            disabled={adding}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2d6a2d] py-3 font-semibold text-white transition-colors hover:bg-[#245724] disabled:opacity-50"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            {adding ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                        <button
                                            onClick={toggleWishlist}
                                            className={`rounded-xl border px-4 py-3 transition-colors ${
                                                wishlisted ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                                            }`}
                                        >
                                            <Heart
                                                className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                                            />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => addToCart(true)}
                                        className="w-full rounded-xl bg-[#f59e0b] py-3 font-semibold text-white transition-colors hover:bg-[#d97706]"
                                    >
                                        Buy Now
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h2 className="mb-3 text-lg font-bold text-gray-800">Product Description</h2>
                        <p className="leading-relaxed whitespace-pre-line text-gray-600">{product.description}</p>

                        {(product.weight || product.sku) && (
                            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 text-sm sm:grid-cols-3">
                                {product.sku && (
                                    <div>
                                        <span className="text-gray-500">SKU</span>
                                        <p className="font-medium text-gray-900">{product.sku}</p>
                                    </div>
                                )}
                                {product.weight && (
                                    <div>
                                        <span className="text-gray-500">Weight</span>
                                        <p className="font-medium text-gray-900">
                                            {product.weight} {product.weight_unit ?? 'kg'}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-500">Brand</span>
                                    <p className="font-medium text-gray-900">{product.brand.name}</p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Category</span>
                                    <p className="font-medium text-gray-900">{product.category.name}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
