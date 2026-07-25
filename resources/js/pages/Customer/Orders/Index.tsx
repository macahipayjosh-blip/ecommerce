import { Head, Link } from '@inertiajs/react';
import { Package, Eye, Download, RotateCcw, Truck, CheckCircle, Clock, X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        images?: { url: string; image_path: string; is_primary: boolean }[];
    };
    quantity: number;
    unit_price: number;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    auction_fee?: number;
    total: number;
    proof_photo?: string | null;
    items: OrderItem[];
    shipment?: {
        tracking_number: string;
        carrier: string;
        status: string;
    };
    created_at: string;
}

interface NotificationItem {
    id: string;
    order_id: number | null;
    product_name: string | null;
    message: string;
    created_at?: string;
}

interface OrdersIndexProps {
    orders: {
        data: Order[];
        links: any[];
        meta?: { total?: number };
    };
    auctionNotifications?: NotificationItem[];
}

export default function OrdersIndex({ orders, auctionNotifications = [] }: OrdersIndexProps) {
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'processing': return <Package className="h-5 w-5 text-blue-500" />;
            case 'shipped': return <Truck className="h-5 w-5 text-purple-500" />;
            case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'cancelled': return <X className="h-5 w-5 text-red-500" />;
            default: return <Package className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canCancel = (order: Order) => {
        return ['pending', 'processing'].includes(order.status);
    };

    const canReturn = (order: Order) => {
        return order.status === 'delivered' && !order.proof_photo;
    };

    const filteredOrders = (orders.data ?? []).filter((order) => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'auction') {
            return order.order_number.startsWith('AUCTION-') || (order.auction_fee ?? 0) > 0;
        }
        return order.status === statusFilter;
    });

    const auctionCount = (orders.data ?? []).filter((order) => order.order_number.startsWith('AUCTION-') || (order.auction_fee ?? 0) > 0).length;

    return (
        <>
            <Head title="My Orders" />
            <div className="mx-auto max-w-6xl p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link href={route('dashboard')} className="inline-flex items-center gap-1.5 text-sm text-[#2d6a2d] hover:underline mb-3">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600">Track and manage your orders</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Package className="h-8 w-8 text-blue-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.meta?.total ?? orders.data?.length ?? 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-yellow-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(orders.data ?? []).filter(o => o.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Truck className="h-8 w-8 text-purple-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Shipped</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(orders.data ?? []).filter(o => o.status === 'shipped').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <CheckCircle className="h-8 w-8 text-green-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(orders.data ?? []).filter(o => o.status === 'delivered').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <Clock className="h-8 w-8 text-amber-500" />
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Auction Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{auctionCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">Filter by status:</label>
                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="auction">Auction Orders</option>
                        </select>
                    </div>
                </div>

                {/* Auction Notifications */}
                {auctionNotifications && auctionNotifications.length > 0 && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-yellow-900">Auction updates</h2>
                                <p className="text-sm text-yellow-700">You have new auction order notifications.</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {auctionNotifications.map((notification) => (
                                <div key={notification.id} className="rounded-xl bg-white p-4 shadow-sm border border-yellow-100">
                                    <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                                    <p className="text-sm text-gray-500">{notification.product_name}</p>
                                    {notification.order_id && (
                                        <Link href={route('customer.orders.show', notification.order_id)} className="mt-3 inline-flex items-center text-sm text-yellow-700 hover:underline">
                                            View auction order
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Orders List */}
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Order #{order.order_number}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Placed on {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                            {(order.order_number.startsWith('AUCTION-') || (order.auction_fee ?? 0) > 0) && (
                                                <span className="mt-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                                                    Auction Order
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getStatusIcon(order.status)}
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">₱{Number(order.total).toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">{order.items.length} items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                    {order.items.slice(0, 3).map((item) => {
                                        const img = item.product.images?.find(i => i.is_primary) ?? item.product.images?.[0];
                                        return (
                                        <div key={item.id} className="flex items-center space-x-3">
                                            <div className="flex-shrink-0">
                                                {img ? (
                                                    <img
                                                        src={img.url}
                                                        alt={item.product.name}
                                                        className="h-12 w-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                        );
                                    })}
                                    {order.items.length > 3 && (
                                        <div className="flex items-center justify-center text-sm text-gray-500">
                                            +{order.items.length - 3} more items
                                        </div>
                                    )}
                                </div>

                                {/* Tracking Info */}
                                {order.shipment && (
                                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Truck className="h-5 w-5 text-blue-500" />
                                            <span className="font-medium text-blue-900">Tracking Information</span>
                                        </div>
                                        <p className="text-sm text-blue-800">
                                            Carrier: {order.shipment.carrier} | 
                                            Tracking: {order.shipment.tracking_number} | 
                                            Status: {order.shipment.status}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Order Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={route('customer.orders.show', order.id)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Link>
                                        <Link
                                            href={route('customer.orders.invoice', order.id)}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Invoice
                                        </Link>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {canReturn(order) && (
                                            <button className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-md text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100">
                                                <RotateCcw className="h-4 w-4 mr-2" />
                                                Return
                                            </button>
                                        )}
                                        {canCancel(order) && (
                                            <button className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100">
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredOrders.length === 0 && (
                    <div className="text-center py-12">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter === 'all'
                                ? "You haven't placed any orders yet."
                                : 'No orders match the selected filter.'}
                        </p>
                        {statusFilter === 'all' && (
                            <div className="mt-6">
                                <Link
                                    href={route('customer.products.index')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {orders.links && orders.data.length > 0 && (
                    <div className="mt-8 flex items-center justify-center">
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            {orders.links.map((link, index) => (
                                link.url ? (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`relative inline-flex items-center px-2 py-2 border text-sm font-medium ${
                                            link.active
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ) : (
                                    <span
                                        key={index}
                                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-300"
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                )
                            ))}
                        </nav>
                    </div>
                )}
            </div>
        </>
    );
}