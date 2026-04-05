import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => title || appName,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});

// Automatically track Single Page Application (SPA) page views for GTM / Meta Pixel
router.on('navigate', (event) => {
    const url = event.detail.page.url;

    // Skip tracking for admin routes
    if (url.startsWith('/admin')) {
        return;
    }

    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
            event: 'virtual_page_view',
            page_url: url,
            page_title: document.title || appName
        });
    }
});