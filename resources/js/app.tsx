import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';
import { Ziggy as ZiggyStatic } from './ziggy';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const ziggy = (window as any).Ziggy ?? ZiggyStatic;

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

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
