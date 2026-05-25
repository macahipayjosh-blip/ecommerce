import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Bike,
    CheckCircle,
    CreditCard,
    Download,
    Mail,
    MapPin,
    MessageCircle,
    Package,
    Phone,
    RotateCcw,
    Send,
    Star,
    Truck,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface OrderItem {
    id: number;
    product: { id: number; name: string; price: number; images: { url: string; is_primary: boolean }[] };
    quantity: number;
    unit_price: number;
}

interface Message {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender: { id: number; name: string };
}

interface Address {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string;
    subtotal: number;
    shipping_cost: number;
    tax: number;
    discount: number;
    total: number;
    items: OrderItem[];
    address?: Address;
    rider?: { id: number; name: string; email: string; phone?: string };
    shipment?: { carrier: string; tracking_number: string; tracking_url?: string; status: string; estimated_delivery?: string };
    messages: Message[];
    created_at: string;
    proof_photo?: string;
}

const STATUS_COLOR: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800',
};

export default function CustomerOrderShow({ order, reviewedProductIds, authId }: { order: Order; reviewedProductIds: number[]; authId: number }) {
    const [returnReason, setReturnReason] = useState('');
    const [showReturn, setShowReturn] = useState(false);
    const [reviewProductId, setReviewProductId] = useState<number | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const { data: chatData, setData: setChatData, post: chatPost, processing: chatProcessing, reset: chatReset } = useForm({ message: '' });

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [order.messages]);

    function submitChat(e: React.FormEvent) {
        e.preventDefault();
        if (!chatData.message.trim()) return;

        chatPost(route('customer.orders.message', order.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                chatReset('message');

                // Reload the order props so the new message persists in the DB-backed list.
                // Note: this endpoint returns JSON, but `reload({only})` ensures Inertia fetches fresh props.
                router.reload({ only: ['order'] });
            },
        });
    }

    const submitReview = () => {
        if (!reviewProductId) return;
        router.post(
            route('customer.orders.review', order.id),
            { product_id: reviewProductId, rating, comment },
            {
                onSuccess: () => {
                    setReviewProductId(null);
                    setRating(5);
                    setComment('');
                },
            },
        );
    };

    const handleCancel = () => {
        if (confirm('Cancel this order?')) {
            router.patch(route('customer.orders.cancel', order.id));
        }
    };

    const handleReturn = () => {
        if (!returnReason.trim()) return;
        router.post(route('customer.orders.return', order.id), { reason: returnReason });
        setShowReturn(false);
    };

    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStep = steps.indexOf(order.status);

    return (
        <>
            <Head title={`Order #${order.order_number}`} />
            <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
                <div className="mx-auto max-w-4xl space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.orders.index')} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div className="flex-1">
                            <Link href={route('dashboard')} className="mb-1 inline-flex items-center gap-1 text-xs text-[#2d6a2d] hover:underline">
                                <ArrowLeft className="h-3 w-3" /> Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">Order #{order.order_number}</h1>
                            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                        </span>
                    </div>

                    {/* Progress tracker */}
                    {!['cancelled', 'refunded'].includes(order.status) && (
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                {steps.map((step, i) => (
                                    <div key={step} className="flex flex-1 items-center">
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                            >
                                                {i < currentStep ? <CheckCircle className="h-5 w-5" /> : i + 1}
                                            </div>
                                            <span className="mt-1 text-xs text-gray-500 capitalize">{step}</span>
                                        </div>
                                        {i < steps.length - 1 && (
                                            <div className={`mx-2 h-1 flex-1 rounded ${i < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Shipment */}
                    {order.shipment && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                            <div className="mb-2 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <h2 className="font-semibold text-blue-900">Tracking Information</h2>
                            </div>
                            <p className="text-sm text-blue-800">
                                <span className="font-medium">{order.shipment.carrier}</span> — {order.shipment.tracking_number}
                            </p>
                            {order.shipment.estimated_delivery && (
                                <p className="mt-1 text-sm text-blue-700">
                                    Est. delivery: {new Date(order.shipment.estimated_delivery).toLocaleDateString()}
                                </p>
                            )}
                            {order.shipment.tracking_url && (
                                <a
                                    href={order.shipment.tracking_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-sm text-blue-600 underline"
                                >
                                    Track Package →
                                </a>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Items */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Items ({order.items.length})</h2>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => {
                                    const images = item.product.images || [];
                                    const primaryImg = images.find((img: any) => img.is_primary) || images[0];
                                    return (
                                        <div key={item.id} className="flex items-center gap-4 py-3">
                                            {primaryImg?.url ? (
                                                <img src={primaryImg.url} alt={item.product.name} className="h-12 w-12 rounded-lg object-cover" />
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-900">{item.product.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × ${Number(item.unit_price).toFixed(2)}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-gray-900">${(item.quantity * Number(item.unit_price)).toFixed(2)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary + Address */}
                        <div className="space-y-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <h2 className="mb-3 font-semibold text-gray-900">Order Summary</h2>
                                <div className="space-y-2 text-sm">
                                    {[
                                        ['Subtotal', `$${Number(order.subtotal).toFixed(2)}`],
                                        ['Shipping', `$${Number(order.shipping_cost).toFixed(2)}`],
                                        ['Tax', `$${Number(order.tax).toFixed(2)}`],
                                        ...(order.discount > 0 ? [['Discount', `-$${Number(order.discount).toFixed(2)}`]] : []),
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex justify-between text-gray-600">
                                            <span>{label}</span>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>${Number(order.total).toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                                    <CreditCard className="h-4 w-4" />
                                    <span className="capitalize">
                                        {order.payment_method} — {order.payment_status}
                                    </span>
                                </div>
                            </div>

                            {order.address && (
                                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                    <h2 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                                        <MapPin className="h-4 w-4 text-gray-500" /> Shipping Address
                                    </h2>
                                    <address className="space-y-0.5 text-sm text-gray-600 not-italic">
                                        <p className="font-medium text-gray-900">{order.address.full_name}</p>
                                        <p>{order.address.address_line1}</p>
                                        {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                                        <p>
                                            {order.address.city}, {order.address.state} {order.address.postal_code}
                                        </p>
                                        <p>{order.address.country}</p>
                                    </address>
                                </div>
                            )}

                            {order.rider && (
                                <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 shadow-sm">
                                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-purple-900">
                                        <Bike className="h-4 w-4 text-purple-600" /> Rider
                                    </h2>
                                    <p className="text-sm font-medium text-gray-900">{order.rider.name}</p>
                                    <div className="mt-2 space-y-1">
                                        <a
                                            href={`mailto:${order.rider.email}`}
                                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700"
                                        >
                                            <Mail className="h-3.5 w-3.5" /> {order.rider.email}
                                        </a>
                                        {order.rider.phone && (
                                            <a
                                                href={`tel:${order.rider.phone}`}
                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-purple-700"
                                            >
                                                <Phone className="h-3.5 w-3.5" /> {order.rider.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={route('customer.orders.invoice', order.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Download className="h-4 w-4" /> Invoice
                        </Link>

                        {['pending', 'processing'].includes(order.status) && (
                            <button
                                onClick={handleCancel}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                            >
                                <X className="h-4 w-4" /> Cancel Order
                            </button>
                        )}

                        {order.status === 'delivered' && (
                            <button
                                onClick={() => !order.proof_photo && setShowReturn(!showReturn)}
                                disabled={!!order.proof_photo}
                                title={order.proof_photo ? 'Return is disabled after proof of delivery has been submitted' : undefined}
                                className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium ${
                                    order.proof_photo
                                        ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                                        : 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                            >
                                <RotateCcw className="h-4 w-4" /> Request Return
                            </button>
                        )}
                    </div>

                    {showReturn && (
                        <div className="space-y-3 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
                            <h3 className="font-semibold text-yellow-900">Return Reason</h3>
                            <textarea
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-yellow-300 px-4 py-2 text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500"
                                placeholder="Describe why you want to return this order..."
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleReturn}
                                    className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700"
                                >
                                    Submit Return
                                </button>
                                <button
                                    onClick={() => setShowReturn(false)}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Chat with Rider */}
                    {order.rider && (
                        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
                                <MessageCircle className="h-5 w-5 text-purple-600" />
                                <h2 className="font-semibold text-gray-900">Chat with Rider</h2>
                                <span className="text-sm text-gray-500">— {order.rider.name}</span>
                            </div>
                            <div style={{ height: 280, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {(order.messages ?? []).length === 0 && (
                                    <div className="mt-10 text-center text-sm text-gray-400">No messages yet. Say hello to your rider!</div>
                                )}
                                {(order.messages ?? []).map((msg) => {
                                    const isMe = msg.sender_id === authId;
                                    return (
                                        <div
                                            key={msg.id}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}
                                        >
                                            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 3 }}>
                                                {isMe ? 'You' : msg.sender?.name} ·{' '}
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <div
                                                style={{
                                                    maxWidth: '70%',
                                                    padding: '8px 12px',
                                                    fontSize: 13,
                                                    lineHeight: 1.5,
                                                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                                    background: isMe ? '#7c3aed' : '#f3f4f6',
                                                    color: isMe ? '#fff' : '#111827',
                                                }}
                                            >
                                                {msg.message}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={bottomRef} />
                            </div>
                            <form onSubmit={submitChat} style={{ display: 'flex', gap: 8, padding: '12px 24px', borderTop: '1px solid #f3f4f6' }}>
                                <input
                                    value={chatData.message}
                                    onChange={(e) => setChatData('message', e.target.value)}
                                    placeholder="Message your rider…"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            submitChat(e as any);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={chatProcessing || !chatData.message.trim()}
                                    className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Reviews — only for delivered orders */}
                    {order.status === 'delivered' && (
                        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" /> Rate Your Items
                            </h2>
                            <div className="divide-y divide-gray-100">
                                {order.items.map((item) => {
                                    const reviewed = reviewedProductIds.includes(item.product.id);
                                    return (
                                        <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                                            <p className="flex-1 truncate text-sm font-medium text-gray-800">{item.product.name}</p>
                                            {reviewed ? (
                                                <span className="text-xs font-medium text-green-600">✓ Reviewed</span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setReviewProductId(item.product.id);
                                                        setRating(5);
                                                        setComment('');
                                                    }}
                                                    className="rounded-lg border border-[#2d6a2d] px-3 py-1 text-xs font-medium text-[#2d6a2d] transition-colors hover:bg-[#e8f5e9]"
                                                >
                                                    Write a Review
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {reviewProductId !== null && (
                                <div className="space-y-4 rounded-xl border border-green-200 bg-[#f0faf0] p-5">
                                    <h3 className="text-sm font-semibold text-gray-900">
                                        Reviewing: {order.items.find((i) => i.product.id === reviewProductId)?.product.name}
                                    </h3>
                                    {/* Star rating */}
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(s)}
                                                className="p-0.5"
                                            >
                                                <Star
                                                    className={`h-6 w-6 transition-colors ${
                                                        s <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        <span className="ml-2 text-sm text-gray-500">{rating}/5</span>
                                    </div>
                                    <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={3}
                                        placeholder="Share your experience with this product..."
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2d6a2d] focus:ring-2 focus:ring-[#2d6a2d]"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={submitReview}
                                            className="rounded-lg bg-[#2d6a2d] px-4 py-2 text-sm font-medium text-white hover:bg-[#245724]"
                                        >
                                            Submit Review
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setReviewProductId(null)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
