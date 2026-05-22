import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, Gavel, Package, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Bid {
    id: number;
    amount: string;
    created_at: string;
    user: { id: number; name: string };
}

interface ProductImage {
    id: number;
    image_path: string;
    is_primary: boolean;
}

interface Auction {
    id: number;
    name: string;
    description: string;
    breed: string;
    age: string;
    weight: number;
    weight_unit: string;
    reserve_price: string;
    auction_start_at: string;
    auction_end_at: string;
    auction_status: string;
    seller: { id: number; name: string };
    bids: Bid[];
    images: ProductImage[];
}

interface Props {
    product: Auction;
}

function Countdown({ endTime }: { endTime: string }) {
    const [secondsLeft, setSecondsLeft] = useState(() =>
        Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000)),
    );

    useEffect(() => {
        const t = setInterval(() => setSecondsLeft((p) => Math.max(0, p - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    if (secondsLeft === 0) return <span className="font-mono font-bold text-red-500">Ended</span>;

    const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
    const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
    const s = String(secondsLeft % 60).padStart(2, '0');

    return (
        <span className="font-mono font-bold text-red-600">
            {h}:{m}:{s}
        </span>
    );
}

export default function AuctionShow({ product }: Props) {
    const { auth, errors: pageErrors, flash } = usePage().props as any;
    const [activeImg, setActiveImg] = useState(
        product.images.find((i) => i.is_primary) ?? product.images[0] ?? null,
    );

    const highestBid = product.bids[0] ?? null;
    const minBid = Math.max(parseFloat(product.reserve_price ?? '0'), parseFloat(highestBid?.amount ?? '0')) + 1;
    const isLive = ['live', 'pending'].includes(product.auction_status) && new Date(product.auction_end_at) > new Date();

    const { data, setData, post, processing, errors, reset } = useForm({ amount: '' });

    const placeBid = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('auctions.bid', product.id), {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const statusStyle: Record<string, string> = {
        pending: 'bg-gray-100 text-gray-600',
        live:    'bg-green-100 text-green-700',
        ended:   'bg-orange-100 text-orange-700',
        settled: 'bg-blue-100 text-blue-700',
    };

    return (
        <>
            <Head title={product.name} />
            <div className="min-h-screen bg-gray-50">
                {/* Simple top bar */}
                <header className="sticky top-0 z-40 bg-white shadow-sm">
                    <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4">
                        <Link href={route('dashboard')} className="flex items-center justify-center rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-[#2d6a2d]" />
                            <span className="font-semibold text-gray-800">{product.name}</span>
                        </div>
                        <span className={`ml-auto rounded-full px-3 py-1 text-xs font-bold ${statusStyle[product.auction_status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {product.auction_status.toUpperCase()}
                        </span>
                    </div>
                </header>

                <div className="mx-auto max-w-5xl px-4 py-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Left — Images */}
                        <div className="space-y-3">
                            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                                <div className="flex h-72 items-center justify-center overflow-hidden sm:h-96">
                                    {activeImg ? (
                                        <img
                                            src={`/storage/${activeImg.image_path}`}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <Package className="h-16 w-16 text-gray-200" />
                                    )}
                                </div>
                            </div>
                            {product.images.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {product.images.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImg(img)}
                                            className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${activeImg?.id === img.id ? 'border-[#2d6a2d]' : 'border-gray-100 hover:border-gray-300'}`}
                                        >
                                            <img src={`/storage/${img.image_path}`} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right — Info + Bid */}
                        <div className="space-y-4">
                            {/* Details card */}
                            <div className="rounded-2xl border border-gray-100 bg-white p-5">
                                <h1 className="mb-1 text-xl font-bold text-gray-900">{product.name}</h1>
                                <p className="mb-4 text-sm text-gray-500">
                                    {product.breed} • {product.age} • {product.weight} {product.weight_unit}
                                </p>

                                <div className="mb-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Reserve Price</p>
                                        <p className="text-lg font-bold text-[#2d6a2d]">₱{parseFloat(product.reserve_price).toFixed(2)}</p>
                                    </div>
                                    <div className="rounded-xl bg-gray-50 p-3">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Highest Bid</p>
                                        <p className="text-lg font-bold text-gray-800">
                                            {highestBid ? `₱${parseFloat(highestBid.amount).toFixed(2)}` : '—'}
                                        </p>
                                    </div>
                                </div>

                                {/* Countdown */}
                                {isLive && (
                                    <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3">
                                        <Clock className="h-4 w-4 text-red-500" />
                                        <span className="text-sm text-red-600">Ends in</span>
                                        <Countdown endTime={product.auction_end_at} />
                                    </div>
                                )}

                                {/* Seller */}
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="h-4 w-4" />
                                    <span>Sold by <span className="font-medium text-gray-700">{product.seller.name}</span></span>
                                </div>
                            </div>

                            {/* Place Bid */}
                            {isLive && auth?.user ? (
                                <div className="rounded-2xl border border-[#2d6a2d]/20 bg-white p-5">
                                    <h2 className="mb-3 text-sm font-bold text-gray-800">Place a Bid</h2>
                                    <p className="mb-3 text-xs text-gray-500">Minimum bid: <span className="font-semibold text-[#2d6a2d]">₱{minBid.toFixed(2)}</span></p>
                                    {flash?.success && (
                                    <div className="mb-3 rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                                        {flash.success}
                                    </div>
                                )}
                                    <form onSubmit={placeBid} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-gray-400">₱</span>
                                            <input
                                                type="number"
                                                min={minBid}
                                                step="0.01"
                                                value={data.amount}
                                                onChange={(e) => setData('amount', e.target.value)}
                                                placeholder={minBid.toFixed(2)}
                                                className="w-full rounded-xl border border-gray-200 py-2.5 pr-3 pl-7 text-sm focus:border-[#2d6a2d] focus:outline-none"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex items-center gap-2 rounded-xl bg-[#2d6a2d] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#245724] disabled:opacity-60"
                                        >
                                            <Gavel className="h-4 w-4" />
                                            Bid
                                        </button>
                                    </form>
                                    {(errors.amount || pageErrors?.amount) && (
                                        <p className="mt-2 text-xs text-red-500">{errors.amount || pageErrors.amount}</p>
                                    )}
                                </div>
                            ) : !auth?.user && isLive ? (
                                <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center">
                                    <p className="mb-3 text-sm text-gray-500">Sign in to place a bid</p>
                                    <Link href={route('login')} className="inline-block rounded-xl bg-[#2d6a2d] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#245724]">
                                        Login to Bid
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
                        <h2 className="mb-3 text-sm font-bold text-gray-800">Description</h2>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-600">{product.description}</p>
                    </div>

                    {/* Bid History */}
                    <div className="mt-6 rounded-2xl border border-gray-100 bg-white">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-sm font-bold text-gray-800">Bid History ({product.bids.length})</h2>
                        </div>
                        {product.bids.length === 0 ? (
                            <div className="py-10 text-center text-sm text-gray-400">No bids yet. Be the first!</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {product.bids.map((bid, idx) => (
                                    <div key={bid.id} className={`flex items-center justify-between px-5 py-3 ${idx === 0 ? 'bg-green-50' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                                {bid.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm text-gray-700">{bid.user.name}</span>
                                            {idx === 0 && <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">Highest</span>}
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${idx === 0 ? 'text-[#2d6a2d]' : 'text-gray-700'}`}>
                                                ₱{parseFloat(bid.amount).toFixed(2)}
                                            </p>
                                            <p className="text-[10px] text-gray-400">{new Date(bid.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
