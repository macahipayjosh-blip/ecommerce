import '../css/app.css';

// On production, unregister stale service workers that cache old assets
if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
    });
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
}

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import SplashScreen from './components/SplashScreen';
import { initializeTheme } from './hooks/use-appearance';
import { Ziggy as ZiggyStatic } from './ziggy';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const PROTECTED = ['/dashboard', '/admin', '/seller', '/rider', '/customer', '/profile'];
const UNPROTECTED = ['/admin/register'];
const isProtected = (url: string) =>
    !UNPROTECTED.some((p) => url.startsWith(p)) && PROTECTED.some((p) => url.startsWith(p));

// Intercept every Inertia navigation (including back button)
router.on('navigate', (event) => {
    const page = (event as any).detail?.page;
    const user = page?.props?.auth?.user;
    const url  = page?.url ?? window.location.pathname;

    if (!user && isProtected(url)) {
        event.preventDefault();
        window.location.replace('/login');
    }
});

// Also intercept before the visit resolves
router.on('before', (event) => {
    const url = (event as any).detail?.visit?.url?.pathname ?? '';
    const user = (window as any).__inertia_auth_user__;

    if (user === false && isProtected(url)) {
        event.preventDefault();
        window.location.replace('/login');
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const ziggy = (props.initialPage?.props as any)?.ziggy ?? (window as any).Ziggy ?? ZiggyStatic;

        // Avoid total React crash when a route name is missing from Ziggy.
        // Ziggy throws; we catch and log and render using a safe fallback.
        (window as any).route = (name: string, params?: any, absolute?: boolean) => {
            try {
                return routeFn(name, params, absolute, ziggy);
            } catch (e) {
                console.error(`Ziggy error: route '${name}' is not in the route list.`, e);
                return '#';
            }
        };

        const siteLogo = (props.initialPage?.props as any)?.site_logo ?? null;

        function AppWithSplash() {
            const [ready, setReady] = useState(false);
            return (
                <>
                    {!ready
                        ? <SplashScreen onDone={() => setReady(true)} siteLogo={siteLogo} />
                        : <App {...props} />
                    }
                </>
            );
        }

        root.render(<AppWithSplash />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
