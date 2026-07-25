import {
    BarChart2,
    ClipboardList,
    CreditCard,
    Folder,
    Gavel,
    LayoutDashboard,
    Package,
    RotateCcw,
    Settings,
    ShoppingCart,
    Tag,
    Ticket,
    Users,
    Zap,
} from 'lucide-react';
import { ReactNode } from 'react';
import AppShell from './AppShell';

const NAV = [
    {
        label: 'Main',
        items: [{ name: 'Dashboard', routeName: 'dashboard', icon: <LayoutDashboard size={15} /> }],
    },
    {
        label: 'Users',
        items: [
            { name: 'Users', routeName: 'admin.users.index', icon: <Users size={15} /> },
        ],
    },
    {
        label: 'Commerce',
        items: [
            { name: 'Products', routeName: 'admin.products.index', icon: <Package size={15} /> },
            { name: 'Auctions', routeName: 'admin.auctions.index', icon: <Gavel size={15} /> },
            { name: 'Categories', routeName: 'admin.categories.index', icon: <Folder size={15} /> },
            { name: 'Brands', routeName: 'admin.brands.index', icon: <Tag size={15} /> },
            { name: 'Orders', routeName: 'admin.orders.index', icon: <ShoppingCart size={15} /> },
            { name: 'Returns', routeName: 'admin.returns.index', icon: <RotateCcw size={15} /> },
        ],
    },
    {
        label: 'Finance',
        items: [
            { name: 'Payments', routeName: 'admin.payments.index', icon: <CreditCard size={15} /> },
            { name: 'Voucher', routeName: 'admin.coupons.index', icon: <Ticket size={15} /> },
            { name: 'Flash Sales', routeName: 'admin.flash-sales.index', icon: <Zap size={15} /> },
        ],
    },
    {
        label: 'Insights',
        items: [
            { name: 'Reports', routeName: 'admin.reports.index', icon: <BarChart2 size={15} /> },
            { name: 'Activity', routeName: 'admin.activity.index', icon: <ClipboardList size={15} /> },
        ],
    },
    {
        label: 'System',
        items: [{ name: 'Settings', routeName: 'admin.settings.index', icon: <Settings size={15} /> }],
    },
];

interface Props {
    children: ReactNode;
    breadcrumb?: string;
}

export default function AdminLayout({ children, breadcrumb }: Props) {
    return (
        <AppShell nav={NAV} breadcrumb={breadcrumb} roleLabel="Admin" accentClass="admin">
            {children}
        </AppShell>
    );
}
