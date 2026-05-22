import { Link } from '@inertiajs/react';
import {
    BarChart2,
    Bike,
    Camera,
    Clock,
    LayoutDashboard,
    LogOut,
    MessageCircle,
    Navigation,
    Package,
    RotateCcw,
    ShieldCheck,
    Smartphone,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

export const RIDER_NAV = [
    { label: 'Dashboard', href: 'rider.dashboard', icon: LayoutDashboard },
    { label: 'Order Pickup', href: 'rider.pickup', icon: Package },
    { label: 'Order Handling', href: 'rider.handling', icon: Bike },
    { label: 'Navigation & Delivery', href: 'rider.navigation', icon: Navigation },
    { label: 'App Interaction', href: 'rider.app-interaction', icon: Smartphone },
    { label: 'Customer Communication', href: 'rider.communication', icon: MessageCircle },
    { label: 'Payment Handling', href: 'rider.payment', icon: Wallet },
    { label: 'Proof of Delivery', href: 'rider.proof', icon: Camera },
    { label: 'Time Management', href: 'rider.time', icon: Clock },
    { label: 'Compliance & Safety', href: 'rider.compliance', icon: ShieldCheck },
    { label: 'Return Handling', href: 'rider.returns', icon: RotateCcw },
    { label: 'Performance', href: 'rider.performance', icon: BarChart2 },
];

export default function RiderLayout({ children, title }: { children: React.ReactNode; title: string }) {
    const [open, setOpen] = useState(false);

    const isActive = (routeName: string) => {
        try {
            const targetPath = new URL(route(routeName)).pathname;
            return window.location.pathname.startsWith(targetPath);
        } catch {
            return false;
        }
    };

    return (
        <div className="ap-shell">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                :root {
                    --green-950: #0e2610;
                    --green-900: #173d14;
                    --green-800: #1e5219;
                    --green-700: #2d6a27;
                    --green-600: #3d8535;
                    --green-500: #4fa344;
                    --green-400: #72bf68;
                    --green-200: #b8e0b3;
                    --green-100: #d6efd3;
                    --green-50:  #edf7eb;

                    --teal-700: #0d7060;
                    --teal-100: #d0f0ea;
                    --teal-50:  #e5f8f4;

                    --blue-700: #1a5fa8;
                    --blue-100: #d3e8fb;
                    --blue-50:  #eaf3fd;

                    --amber-700: #b56b10;
                    --amber-100: #fde8c0;
                    --amber-50:  #fef5e3;

                    --red-700: #b52c2c;
                    --red-100: #fbc9c9;
                    --red-50:  #fdeaea;

                    --purple-700: #5c35a0;
                    --purple-100: #e0d5f8;
                    --purple-50:  #f0eafd;

                    --lime-700: #4d7a0e;
                    --lime-100: #daedb8;
                    --lime-50:  #edf7d8;

                    --gray-50:  #f6f8f3;
                    --gray-100: #edf0e8;
                    --gray-200: #dde3d5;
                    --gray-300: #c4ccb8;
                    --gray-400: #9aaa8c;
                    --gray-500: #6e806a;
                    --gray-700: #3a4d36;
                    --gray-900: #1c2b19;

                    --bg-page: #f3f6ef;
                    --bg-card: #ffffff;
                    --text-primary: #1a3017;
                    --text-secondary: #5a7056;
                    --text-muted: #8fa88b;
                    --border: #dde3d5;
                    --border-hover: #b0caa8;
                    --sidebar-bg: #ffffff;

                    --radius-sm: 8px;
                    --radius-md: 12px;
                    --radius-lg: 16px;

                    --shadow-sm: 0 1px 3px rgba(30,82,25,0.07), 0 1px 2px rgba(30,82,25,0.05);
                    --shadow-md: 0 4px 12px rgba(30,82,25,0.1), 0 2px 4px rgba(30,82,25,0.06);
                    --shadow-lg: 0 10px 25px -5px rgba(30,82,25,0.12), 0 4px 6px -2px rgba(30,82,25,0.05);

                    --sidebar-w: 260px;
                    --header-h: 70px;
                    --font: 'DM Sans', system-ui, sans-serif;
                }

                html, body { height: 100%; background: var(--bg-page); }

                .ap-shell {
                    display: flex;
                    height: 100vh;
                    width: 100%;
                    font-family: var(--font);
                    background: var(--bg-page);
                    color: var(--text-primary);
                    -webkit-font-smoothing: antialiased;
                    overflow: hidden;
                }

                /* ── Overlay for mobile ── */
                .ap-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.4);
                    backdrop-filter: blur(2px);
                    z-index: 199;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                }
                .ap-overlay.show {
                    opacity: 1;
                    visibility: visible;
                }

                /* ════════════════════════════════
                   SIDEBAR — STICKY FOOTER WORKING
                ════════════════════════════════ */
                .ap-sidebar {
                    width: var(--sidebar-w);
                    min-width: var(--sidebar-w);
                    background: var(--sidebar-bg);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    z-index: 200;
                    transition: transform 0.28s cubic-bezier(0.2, 0.9, 0.4, 1.1);
                    box-shadow: 0 0 20px rgba(0,0,0,0.05);
                }

                /* Mobile sidebar - fixed positioning */
                @media (max-width: 1023px) {
                    .ap-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        bottom: 0;
                        transform: translateX(-100%);
                    }
                    .ap-sidebar.open {
                        transform: translateX(0);
                    }
                }

                /* Desktop - normal relative positioning */
                @media (min-width: 1024px) {
                    .ap-sidebar {
                        position: relative;
                        transform: translateX(0);
                    }
                }

                .ap-sidebar::-webkit-scrollbar { width: 5px; }
                .ap-sidebar::-webkit-scrollbar-track { background: transparent; }
                .ap-sidebar::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 10px; }

                /* ── Brand / Logo ── */
                .ap-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 22px 20px 20px;
                    border-bottom: 1px solid var(--gray-100);
                    flex-shrink: 0;
                    text-decoration: none;
                    background: var(--sidebar-bg);
                }
                .ap-logo-icon {
                    width: 38px;
                    height: 38px;
                    background: var(--green-700);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    box-shadow: var(--shadow-sm);
                }
                .ap-logo-icon svg {
                    color: #fff;
                    width: 20px;
                    height: 20px;
                }
                .ap-logo-name {
                    font-family: 'Instrument Serif', serif;
                    font-size: 20px;
                    color: var(--green-900);
                    letter-spacing: -0.3px;
                }
                .ap-logo-badge {
                    margin-left: auto;
                    font-size: 9px;
                    font-weight: 600;
                    letter-spacing: 0.6px;
                    text-transform: uppercase;
                    background: var(--green-50);
                    color: var(--green-700);
                    border: 1px solid var(--green-200);
                    padding: 2px 8px;
                    border-radius: 30px;
                }

                /* ── Navigation (GROWS and SCROLLS) ── */
                .ap-nav {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 12px;
                    scrollbar-width: thin;
                    min-height: 0;
                }
                .ap-nav::-webkit-scrollbar { width: 5px; }
                .ap-nav::-webkit-scrollbar-track { background: transparent; }
                .ap-nav::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 10px; }

                .ap-nav-group {
                    margin-bottom: 8px;
                }
                .ap-nav-group-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    padding: 0 8px;
                    margin-bottom: 6px;
                }
                .ap-nav-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    font-size: 13.5px;
                    cursor: pointer;
                    transition: all 0.15s;
                    margin-bottom: 2px;
                    text-decoration: none;
                    position: relative;
                }
                .ap-nav-link svg {
                    width: 18px;
                    height: 18px;
                    flex-shrink: 0;
                    stroke-width: 1.7;
                }
                .ap-nav-link:hover {
                    background: var(--green-50);
                    color: var(--green-800);
                }
                .ap-nav-link.active {
                    background: var(--green-100);
                    color: var(--green-900);
                    font-weight: 500;
                }
                .ap-nav-link.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 20%;
                    bottom: 20%;
                    width: 3px;
                    border-radius: 0 3px 3px 0;
                    background: var(--green-700);
                }
                .ap-nav-link.active svg {
                    color: var(--green-700);
                }

  
                /* ── Sidebar Footer / User Card ── */
                .ap-sidebar-footer {
                    margin-top: auto;
                    padding: 16px;
                    border-top: 1px solid var(--gray-100);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-shrink: 0;
                        margin-top: auto;      /* Pushes footer to bottom of flex container */
    flex-shrink: 0;        /* Prevents footer from shrinking */
                }
                .ap-user-card {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    width: 100%;
                    text-decoration: none;
                }
.ap-user-card:hover {
    background: var(--green-50);
}

                .ap-avatar {
                    width: 38px;
                    height: 38px;
                    background: var(--green-700);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                    flex-shrink: 0;
                    letter-spacing: 0.5px;
                    text-decoration: none;
                }

                .ap-user-info {
                    flex: 1;
                    min-width: 0;
                }
                .ap-user-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .ap-logout-btn {
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: color 0.12s;
                    background: none;
                    border: none;
                    padding: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                }
.ap-logout-btn:hover {
    color: var(--red-700);
    background: var(--red-50);
}

                /* ════════════════
                   MAIN AREA
                ════════════════ */
                .ap-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-width: 0;
                    background: var(--bg-page);
                }

                /* Header/Topbar */
                .ap-header {
                    height: var(--header-h);
                    background: #ffffff;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    gap: 16px;
                    flex-shrink: 0;
                    box-shadow: var(--shadow-sm);
                }

                .ap-hamburger {
                    display: none;
                    width: 40px;
                    height: 40px;
                    border-radius: var(--radius-sm);
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    gap: 5px;
                    cursor: pointer;
                    background: none;
                    border: 1px solid var(--border);
                    transition: all 0.12s;
                    flex-shrink: 0;
                }
                .ap-hamburger:hover {
                    background: var(--green-50);
                    border-color: var(--border-hover);
                }
                .ap-hamburger span {
                    display: block;
                    width: 16px;
                    height: 1.5px;
                    background: var(--text-secondary);
                    border-radius: 2px;
                    transition: 0.2s;
                }

                .ap-breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    color: var(--text-muted);
                    min-width: 0;
                }
                .ap-breadcrumb-sep {
                    font-size: 12px;
                    color: var(--border);
                }
                .ap-breadcrumb-current {
                    color: var(--text-primary);
                    font-weight: 500;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ap-header-right {
                    margin-left: auto;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ap-header-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: none;
                    border: 1px solid var(--border);
                    cursor: pointer;
                    color: var(--text-secondary);
                    transition: all 0.12s;
                }
                .ap-header-btn:hover {
                    background: var(--green-50);
                    color: var(--green-800);
                    border-color: var(--border-hover);
                }

                /* Content area */
                .ap-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 28px 30px;
                    background: var(--bg-page);
                    scrollbar-width: thin;
                }
                .ap-content::-webkit-scrollbar {
                    width: 6px;
                }
                .ap-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ap-content::-webkit-scrollbar-thumb {
                    background: var(--gray-200);
                    border-radius: 10px;
                }

                /* ── Responsive breakpoints ── */
                @media (max-width: 1023px) {
                    .ap-hamburger {
                        display: flex;
                    }
                    .ap-content {
                        padding: 20px 18px;
                    }
                }

                @media (max-width: 640px) {
                    .ap-header {
                        padding: 0 16px;
                    }
                    .ap-content {
                        padding: 16px;
                    }
                    .ap-logo-badge {
                        display: none;
                    }
                }
            `}</style>

            {/* Mobile overlay */}
            <div className={`ap-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

            {/* Sidebar — Fresh organic design with STICKY FOOTER */}
            <aside className={`ap-sidebar ${open ? 'open' : ''}`}>
                {/* Brand Area */}
                <div className="ap-logo">
                    <div className="ap-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22V12M12 12C12 7 7 4 2 4c0 5 3 9 10 8M12 12c0-5 5-8 10-8-1 5-4 9-10 8" />
                        </svg>
                    </div>
                    <span className="ap-logo-name">BSABShop</span>
                    <span className="ap-logo-badge">Rider</span>
                </div>

                {/* Navigation - grows and scrolls */}
                <nav className="ap-nav">
                    <div className="ap-nav-group">
                        <span className="ap-nav-group-label">Rider</span>
                        {RIDER_NAV.map(({ label, href, icon: Icon }) => (
                            <Link
                                key={href}
                                href={route(href)}
                                className={`ap-nav-link ${isActive(href) ? 'active' : ''}`}
                                onClick={() => setOpen(false)}
                            >
                                <Icon size={18} strokeWidth={1.7} />
                                {label}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* Footer - STICKS TO BOTTOM via margin-top: auto */}
                <div className="ap-sidebar-footer">
                    <Link href={route('profile.show')} className="ap-user-card" onClick={() => setOpen(false)}>
                        <div className="ap-avatar">RD</div>
                        <div className="ap-user-info">
                            <div className="ap-user-name">Rider</div>
                            <div className="ap-user-role">Delivery Partner</div>
                        </div>
                    </Link>
                    <Link href={route('logout')} method="post" as="button" className="ap-logout-btn" title="Sign out">
                        <LogOut size={16} strokeWidth={1.8} />
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="ap-main">
                <header className="ap-header">
                    <button className="ap-hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
                        <span />
                        <span />
                        <span />
                    </button>

                    <div className="ap-breadcrumb">
                        <span>BSABShop</span>
                        <span className="ap-breadcrumb-sep">›</span>
                        <span className="ap-breadcrumb-current">{title}</span>
                    </div>

                    <div className="ap-header-right">
                        <Link href={route('profile.show')} className="ap-header-btn" aria-label="Profile">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                    </div>
                </header>

                <main className="ap-content">{children}</main>
            </div>
        </div>
    );
}
