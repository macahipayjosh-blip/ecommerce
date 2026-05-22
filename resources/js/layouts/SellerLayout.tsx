import { Gavel, LayoutDashboard, Megaphone, Package, RotateCcw, ShoppingCart, Star, Store, TrendingUp, Wallet, Warehouse } from 'lucide-react';
import { ReactNode } from 'react';
import AppShell from './AppShell';

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
        ],
    },
    {
        label: 'Marketing',
        items: [{ name: 'Promotions', routeName: 'seller.promotions.index', icon: <Megaphone size={15} /> }],
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

interface Props {
    children: ReactNode;
    breadcrumb?: string;
}

export default function SellerLayout({ children, breadcrumb }: Props) {
    return (
        <AppShell nav={NAV} breadcrumb={breadcrumb} roleLabel="Seller" accentClass="seller">
            {children}
        </AppShell>
    );
}
