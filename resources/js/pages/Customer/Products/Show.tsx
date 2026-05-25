import StarRating from '@/components/StarRating';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Heart, Leaf, MessageCircle, Minus, Package, Plus, Send, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Message {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
}

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
    vendor_id?: number;
    category: { id: number; name: string };
    brand: { id: number; name: string };
    seller?: { id: number; name: string; store_name?: string };
    images?: { image_path: string; is_primary: boolean; url: string }[];
    in_wishlist?: boolean;
    avg_rating?: number;
    reviews_count?: number;
}

interface SimilarProduct {
    id: number;
    name: string;
    price: number;
    compare_at_price?: number;
    avg_rating?: number;
    image?: string;
}

export default function CustomerProductShow({
    product,
    messages: initialMessages = [],
    similarProducts = [],
}: {
    product: Product;
    messages?: Message[];
    similarProducts?: SimilarProduct[];
}) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [wishlisted, setWishlisted] = useState(product.in_wishlist ?? false);
    const [toast, setToast] = useState(false);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [msgText, setMsgText] = useState('');
    const [sending, setSending] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { auth } = usePage<{ auth: { user: { id: number } } }>().props;

    useEffect(() => { setMessages(initialMessages); }, [initialMessages]);

    useEffect(() => {
        if (chatOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatOpen]);

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

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msgText.trim()) return;
        setSending(true);
        router.post(
            route('customer.products.message', product.id),
            { message: msgText, receiver_id: product.vendor_id },
            {
                onSuccess: () => setMsgText(''),
                onFinish: () => setSending(false),
            },
        );
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
                        <Link href={route('dashboard')} className="hover:text-[#2d6a2d]">Dashboard</Link>
                        <span>/</span>
                        <Link href={route('customer.products.index')} className="hover:text-[#2d6a2d]">Products</Link>
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

                            <StarRating rating={product.avg_rating ?? 0} count={product.reviews_count} size="md" />

                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-[#2d6a2d]">₱{price.toFixed(2)}</span>
                                {comparePrice && comparePrice > price && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">₱{comparePrice.toFixed(2)}</span>
                                        <span className="text-sm font-medium text-green-600">Save ₱{(comparePrice - price).toFixed(2)}</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`h-2.5 w-2.5 rounded-full ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                    {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
                                </span>
                            </div>

                            {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}

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
                                            onClick={() => addToCart()}
                                            disabled={adding}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2d6a2d] py-3 font-semibold text-white transition-colors hover:bg-[#245724] disabled:opacity-50"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            {adding ? 'Adding...' : 'Add to Cart'}
                                        </button>
                                        <button
                                            onClick={toggleWishlist}
                                            className={`rounded-xl border px-4 py-3 transition-colors ${wishlisted ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-red-400 hover:bg-red-50'}`}
                                        >
                                            <Heart className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
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

                    {/* Messenger */}
                    {product.vendor_id && (
                        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                            <button
                                onClick={() => setChatOpen((o) => !o)}
                                className="flex w-full items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <MessageCircle className="h-5 w-5 text-[#2d6a2d]" />
                                <span className="font-bold text-gray-800">Message Seller</span>
                                {messages.length > 0 && (
                                    <span className="rounded-full bg-[#2d6a2d] px-2 py-0.5 text-xs text-white">{messages.length}</span>
                                )}
                                <span className="ml-auto text-gray-400">
                                    {chatOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </span>
                            </button>

                            {chatOpen && (
                                <div className="border-t border-gray-100 px-6 pb-5">
                                    <div className="mb-3 flex h-64 flex-col gap-2 overflow-y-auto py-3">
                                        {messages.length === 0 ? (
                                            <p className="text-center text-sm text-gray-400 mt-auto mb-auto">No messages yet. Start the conversation!</p>
                                        ) : (
                                            messages.map((m) => {
                                                const isMe = m.sender_id === auth.user.id;
                                                return (
                                                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#2d6a2d] text-white' : 'bg-gray-100 text-gray-800'}`}>
                                                            {m.message}
                                                            <p className={`mt-1 text-[10px] ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <form onSubmit={sendMessage} className="flex gap-2">
                                        <input
                                            value={msgText}
                                            onChange={(e) => setMsgText(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm outline-none focus:border-[#2d6a2d]"
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !msgText.trim()}
                                            className="flex items-center gap-1 rounded-xl bg-[#2d6a2d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#245724] disabled:opacity-50"
                                        >
                                            <Send className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}

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
                    {/* Similar Products */}
                    {similarProducts.length > 0 && (
                        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-bold text-gray-800">You May Also Like</h2>
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {similarProducts.map((p) => {
                                    const price = Number(p.price);
                                    const compare = p.compare_at_price ? Number(p.compare_at_price) : null;
                                    const disc = compare && compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
                                    return (
                                        <Link
                                            key={p.id}
                                            href={route('customer.products.show', p.id)}
                                            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 transition-shadow hover:shadow-md"
                                        >
                                            <div className="relative h-36 bg-gray-50">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Package className="h-10 w-10 text-gray-200" />
                                                    </div>
                                                )}
                                                {disc > 0 && (
                                                    <span className="absolute top-2 left-2 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                        -{disc}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-1 flex-col gap-1 p-3">
                                                <p className="line-clamp-2 text-xs font-medium text-gray-800 group-hover:text-[#2d6a2d]">{p.name}</p>
                                                <div className="mt-auto flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-[#2d6a2d]">₱{price.toFixed(2)}</span>
                                                    {compare && compare > price && (
                                                        <span className="text-xs text-gray-400 line-through">₱{compare.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
