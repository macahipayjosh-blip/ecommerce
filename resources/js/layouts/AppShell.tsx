import { Link, usePage } from '@inertiajs/react';
import { LogOut, User } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react';

interface NavItem {
    name: string;
    routeName: string;
    icon: React.ReactNode;
    badge?: number;
}
interface NavSection {
    label: string;
    items: NavItem[];
}

interface Props {
    children: ReactNode;
    breadcrumb?: string;
    role?: 'admin' | 'seller';
    nav: NavSection[];
    roleLabel: string;
    accentClass: string;
}

const SHARED_CSS = `
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
   CRITICAL FIX: Sidebar uses height: 100% NOT fixed positioning
═══════════════════════════════════ */
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
    /* REMOVED position: fixed - this was breaking the sticky footer */
}

/* Mobile sidebar - only use fixed on mobile */
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

/* ── Brand / Logo (sticky at top) ── */
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

/* ── Navigation (THIS GROWS and SCROLLS) ── */
.ap-nav {
    flex: 1;              /* Takes all remaining space between logo and footer */
    overflow-y: auto;     /* Scrolls when many items */
    padding: 16px 12px;
    scrollbar-width: thin;
    min-height: 0;        /* CRITICAL: allows flex child to scroll */
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
    padding: 8px 8px 4px;
    display: block;
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
.ap-nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}
.ap-nav-icon svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.7;
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

.ap-header-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--green-700);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    text-decoration: none;
    cursor: pointer;
    transition: opacity 0.15s;
    flex-shrink: 0;
    border: none;
    letter-spacing: 0.5px;
}
.ap-header-avatar:hover {
    opacity: 0.85;
}

/* Header dropdown */
.ap-hdr-drop-wrap {
    position: relative;
}
.ap-hdr-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    min-width: 220px;
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 300;
    overflow: hidden;
    animation: dropIn 0.12s ease;
}
@keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
}
.ap-hdr-drop-banner {
    padding: 12px 16px;
    background: var(--green-50);
    border-bottom: 1px solid var(--green-100);
    font-size: 12px;
    font-weight: 500;
    color: var(--green-700);
}
.ap-hdr-drop-banner span {
    display: block;
    font-size: 11px;
    color: var(--text-muted);
    font-weight: 400;
    margin-top: 2px;
}
.ap-hdr-drop-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    cursor: pointer;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    transition: all 0.12s;
}
.ap-hdr-drop-item:hover {
    background: var(--green-50);
    color: var(--green-800);
}
.ap-hdr-drop-item svg {
    width: 15px;
    height: 15px;
}
.ap-hdr-drop-item.danger {
    color: var(--red-700);
}
.ap-hdr-drop-item.danger:hover {
    background: var(--red-50);
    color: var(--red-700);
}
.ap-hdr-drop-sep {
    height: 1px;
    background: var(--gray-100);
    margin: 4px 0;
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
`;

export default function AppShell({ children, breadcrumb, nav, roleLabel, accentClass }: Props) {
    const [open, setOpen] = useState(false);
    const [dropOpen, setDropOpen] = useState(false);
    const { url } = usePage();

    const { auth, unreadMessages } = usePage<{
        auth: { user?: { name?: string } };
        riderProfile?: { full_name?: string; delivery_partner_role?: string };
        adminProfile?: { full_name?: string; role?: string };
        unreadMessages?: number;
    }>().props;

    // ── Flash toast ──────────────────────────────────────────────────────────
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (flash?.success) setToast({ msg: flash.success, type: 'success' });
        else if (flash?.error) setToast({ msg: flash.error, type: 'error' });
    }, [flash]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(t);
    }, [toast]);

    const displayName = auth?.user?.name || (auth as any)?.riderProfile?.full_name || (auth as any)?.adminProfile?.full_name || roleLabel;

    const initials =
        displayName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() ?? roleLabel[0];

    useEffect(() => {
        const close = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setOpen(false);
                setDropOpen(false);
            }
        };
        document.addEventListener('keydown', close);
        return () => document.removeEventListener('keydown', close);
    }, []);

    const isActive = (routeName: string) => {
        try {
            const generated = route(routeName);
            const path = generated.startsWith('http') ? new URL(generated).pathname : generated;
            return url.startsWith(path);
        } catch {
            return false;
        }
    };

    return (
        <div className="ap-shell">
            <style>{SHARED_CSS}</style>

            {/* Mobile overlay */}
            <div className={`ap-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

            {/* Sidebar with STICKY FOOTER - NOW WORKING */}
            <aside className={`ap-sidebar ${open ? 'open' : ''}`}>
                {/* Brand Area */}
                <div className="ap-logo">
                    <div className="ap-logo-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22V12M12 12C12 7 7 4 2 4c0 5 3 9 10 8M12 12c0-5 5-8 10-8-1 5-4 9-10 8" />
                        </svg>
                    </div>
                    <span className="ap-logo-name">BSABShop</span>
                    <span className="ap-logo-badge">{roleLabel}</span>
                </div>

                {/* Navigation - grows and scrolls */}
                <nav className="ap-nav">
                    {nav.map((section) => (
                        <div className="ap-nav-group" key={section.label}>
                            <span className="ap-nav-group-label">{section.label}</span>
                            {section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    href={route(item.routeName)}
                                    className={`ap-nav-link ${isActive(item.routeName) ? 'active' : ''}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <span className="ap-nav-icon">{item.icon}</span>
                                    {item.name}
                                    {item.badge && item.badge > 0 ? (
                                        <span style={{ marginLeft: 'auto', background: '#e53e3e', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700, lineHeight: '16px' }}>
                                            {item.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                {/* Footer - STICKS TO BOTTOM via margin-top: auto */}
                <div className="ap-sidebar-footer">
                    <Link href={route('profile.show')} className="ap-user-card" onClick={() => setOpen(false)}>
                        <div className="ap-avatar">{initials}</div>
                        <div className="ap-user-info">
                            <div className="ap-user-name">{displayName}</div>
                            <div className="ap-user-role">
                                {(auth as any)?.riderProfile?.delivery_partner_role || (auth as any)?.adminProfile?.role || roleLabel}
                            </div>
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
                        <span className="ap-breadcrumb-current">{breadcrumb ?? roleLabel}</span>
                    </div>

                    <div className="ap-header-right">
                        <div className="ap-hdr-drop-wrap">
                            <button className="ap-header-avatar" title="Account" onClick={() => setDropOpen((v) => !v)}>
                                {initials}
                            </button>

                            {dropOpen && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setDropOpen(false)} />
                                    <div className="ap-hdr-dropdown">
                                        <div className="ap-hdr-drop-banner">
                                            {displayName}
                                            <span>{roleLabel}</span>
                                        </div>
                                        <Link href={route('profile.show')} className="ap-hdr-drop-item" onClick={() => setDropOpen(false)}>
                                            <User size={15} /> My Account
                                        </Link>
                                        <div className="ap-hdr-drop-sep" />

                                        {roleLabel === 'Seller' && (
                                            <>
                                                <Link
                                                    href={route('role.switch')}
                                                    method="post"
                                                    as="button"
                                                    data={{ role: 'customer' }}
                                                    className="ap-hdr-drop-item"
                                                    onClick={() => setDropOpen(false)}
                                                >
                                                    <svg
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                                        <polyline points="9 22 9 12 15 12 15 22" />
                                                    </svg>
                                                    Switch to Customer
                                                </Link>
                                                <div className="ap-hdr-drop-sep" />
                                            </>
                                        )}

                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="ap-hdr-drop-item danger"
                                            onClick={() => setDropOpen(false)}
                                        >
                                            <LogOut size={15} /> Logout
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="ap-content">{children}</main>
            </div>

            {/* ── Toast notification ── */}
            {toast && (
                <div
                    onClick={() => setToast(null)}
                    style={{
                        position: 'fixed',
                        bottom: 28,
                        right: 28,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 18px',
                        borderRadius: 10,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        maxWidth: 360,
                        animation: 'toastIn 0.2s ease',
                        background: toast.type === 'success' ? 'var(--green-700)' : 'var(--red-700)',
                        color: '#fff',
                    }}
                >
                    <span style={{ fontSize: 16 }}>{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.msg}
                </div>
            )}
            <style>{`@keyframes toastIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
}
