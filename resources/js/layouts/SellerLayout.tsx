import { Gavel, LayoutDashboard, Megaphone, MessageCircle, Package, RotateCcw, ShoppingCart, Star, Store, TrendingUp, Wallet, Warehouse, Zap } from 'lucide-react';
import { ReactNode } from 'react';
import { usePage } from '@inertiajs/react';
import AppShell from './AppShell';

interface Props {
    children: ReactNode;
    breadcrumb?: string;
}

export default function SellerLayout({ children, breadcrumb }: Props) {
    const { unreadMessages } = usePage<{ unreadMessages?: number }>().props;

    const NAV = [
        {
            label: 'Main',
            items: [{ name: 'Dashboard', routeName: 'seller.dashboard', icon: <LayoutDashboard size={15} /> }],
        },
        {
            label: 'Commerce',
            items: [
                { name: 'Products', routeName: 'seller.products.index', icon: <Package size={15} /> },
                { name: 'Auctions', routeName: 'seller.auctions.index', icon: <Gavel size={15} /> },
                { name: 'Inventory', routeName: 'seller.inventory.index', icon: <Warehouse size={15} /> },
                { name: 'Orders', routeName: 'seller.orders.index', icon: <ShoppingCart size={15} /> },
                { name: 'Returns', routeName: 'seller.returns.index', icon: <RotateCcw size={15} /> },
                { name: 'Messages', routeName: 'seller.messages.index', icon: <MessageCircle size={15} />, badge: unreadMessages },
            ],
        },
        {
            label: 'Marketing',
            items: [
                { name: 'Promotions', routeName: 'seller.promotions.index', icon: <Megaphone size={15} /> },
                { name: 'Flash Sales', routeName: 'seller.flash-sales.index', icon: <Zap size={15} /> },
            ],
        },
        {
            label: 'Insights',
            items: [
                { name: 'Performance', routeName: 'seller.performance.index', icon: <TrendingUp size={15} /> },
                { name: 'Reviews', routeName: 'seller.reviews.index', icon: <Star size={15} /> },
                { name: 'Payouts', routeName: 'seller.payouts', icon: <Wallet size={15} /> },
            ],
        },
        {
            label: 'Account',
            items: [{ name: 'Store Profile', routeName: 'seller.profile.index', icon: <Store size={15} /> }],
        },
    ];

    return (
        <AppShell nav={NAV} breadcrumb={breadcrumb} roleLabel="Seller" accentClass="seller">
            {children}
        </AppShell>
    );
}
