import { usePage } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

/**
 * AdminLayout
 *
 * Structure:
 *  ┌──────────────────────────────────────────────────┐
 *  │  <Sidebar>   │  <Navbar>                         │
 *  │  (fixed/     │  ─────────────────────────────    │
 *  │   slide-in)  │  <main> {children} </main>        │
 *  └──────────────────────────────────────────────────┘
 *
 * Best-practice notes:
 *  - Uses <header>, <main>, <aside> for correct landmark semantics
 *  - Skip-to-content link for keyboard accessibility
 *  - Overlay traps pointer events on mobile but allows keyboard Escape to close
 *  - Body scroll-lock isolated to this component (cleaned up on unmount)
 *  - No inline styles — all layout via Tailwind utilities
 */
export default function AdminLayout({ children }) {
    const user = usePage().props.auth?.user ?? {};
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = useCallback(() => setSidebarOpen(false), []);
    const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

    // Lock body scroll when mobile sidebar is open
    useEffect(() => {
        document.body.style.overflow = sidebarOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [sidebarOpen]);

    // Close sidebar on Escape key
    useEffect(() => {
        if (!sidebarOpen) return;
        const onKeyDown = (e) => { if (e.key === 'Escape') closeSidebar(); };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [sidebarOpen, closeSidebar]);

    return (
        <>
            {/* Skip to main content — visible only on focus for keyboard users */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
            >
                Skip to content
            </a>

            <div className="flex h-screen w-full overflow-hidden bg-gray-50">

                {/* ── Mobile overlay ── */}
                <div
                    className={`fixed inset-0 z-40 bg-gray-900/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={closeSidebar}
                    aria-hidden="true"
                />

                {/* ── Sidebar ── */}
                <div
                    className={`
                        fixed inset-y-0 left-0 z-50 flex-shrink-0
                        transform transition-transform duration-300 ease-in-out
                        lg:static lg:translate-x-0
                        ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    `}
                    aria-label="Sidebar"
                >
                    <Sidebar />
                </div>

                {/* ── Main area ── */}
                <div className="flex min-w-0 flex-1 flex-col h-screen overflow-hidden">
                    <Navbar user={user} toggleSidebar={toggleSidebar} />

                    <main
                        id="main-content"
                        tabIndex={-1}
                        className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 focus:outline-none"
                    >
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}