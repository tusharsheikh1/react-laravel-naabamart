import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function BookNavbar() {
    const { global_settings, cart } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Live cart count
    const cartItems = Object.values(cart || {});
    const liveCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header
                className="sticky top-0 z-50 transition-all duration-300"
                style={{
                    background: scrolled
                        ? 'rgba(253,248,240,0.97)'
                        : 'rgba(253,248,240,1)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: scrolled
                        ? '0 1px 0 rgba(139,90,43,0.15), 0 4px 24px rgba(139,90,43,0.08)'
                        : '0 1px 0 rgba(139,90,43,0.12)',
                    fontFamily: "'Lora', 'Georgia', serif",
                }}
            >
                {/* Top accent line */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #8b5a2b 0%, #c8973f 50%, #8b5a2b 100%)' }} />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-1 rounded-lg transition-colors"
                            style={{ color: '#5a3a1a' }}
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h10M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href={route('home')} className="flex items-center gap-3 group shrink-0">
                            {global_settings?.site_logo ? (
                                <img
                                    src={`/storage/${global_settings.site_logo}`}
                                    alt={global_settings?.site_name}
                                    className="h-9 sm:h-11 w-auto object-contain"
                                />
                            ) : (
                                <div className="flex items-center gap-2">
                                    {/* Book icon */}
                                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                                        <rect x="2" y="4" width="16" height="20" rx="2" fill="#c8973f" opacity="0.25" />
                                        <rect x="4" y="4" width="16" height="20" rx="2" stroke="#8b5a2b" strokeWidth="1.5" fill="none" />
                                        <path d="M4 8h16M4 12h10" stroke="#8b5a2b" strokeWidth="1.2" strokeLinecap="round" />
                                        <rect x="18" y="5" width="8" height="18" rx="1" fill="#8b5a2b" opacity="0.15" />
                                    </svg>
                                    <span
                                        className="text-xl sm:text-2xl font-bold tracking-tight group-hover:opacity-80 transition-opacity"
                                        style={{ color: '#3d1f0a', fontFamily: "'Lora', serif" }}
                                    >
                                        {global_settings?.site_name || 'Bookery'}
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
                            {[
                                { label: 'Home', href: route('home') },
                                { label: 'Library', href: route('shop') },
                                { label: 'Categories', href: route('categories.index') },
                            ].map(({ label, href }) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className="relative text-sm font-medium tracking-wide group transition-colors"
                                    style={{ color: '#5a3a1a', fontFamily: "'DM Sans', sans-serif" }}
                                >
                                    {label}
                                    <span
                                        className="absolute -bottom-1 left-0 w-0 group-hover:w-full transition-all duration-300 rounded-full"
                                        style={{ height: 2, background: '#c8973f' }}
                                    />
                                </Link>
                            ))}
                        </nav>

                        {/* Right actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Cart */}
                            <button
                                onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))}
                                className="relative p-2.5 rounded-xl transition-all group"
                                style={{ color: '#5a3a1a' }}
                                aria-label="Shopping cart"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {liveCartCount > 0 && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2 border-white"
                                        style={{ width: 18, height: 18, background: '#8b5a2b' }}
                                    >
                                        {liveCartCount > 99 ? '99+' : liveCartCount}
                                    </span>
                                )}
                            </button>

                            {/* Account */}
                            <Link
                                href={route('login')}
                                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                                style={{
                                    background: '#8b5a2b',
                                    color: '#fdf8f0',
                                    fontFamily: "'DM Sans', sans-serif",
                                }}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Account
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-[70] w-[82%] max-w-xs flex flex-col lg:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ background: '#fdf4e8', fontFamily: "'Lora', serif" }}
            >
                {/* Drawer top accent */}
                <div style={{ height: 3, background: 'linear-gradient(90deg, #8b5a2b, #c8973f)' }} />
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(139,90,43,0.15)' }}>
                    <span className="text-lg font-bold" style={{ color: '#3d1f0a' }}>Menu</span>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg"
                        style={{ color: '#8b5a2b' }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {[
                        { label: 'Home', href: route('home') },
                        { label: 'Library', href: route('shop') },
                        { label: 'Categories', href: route('categories.index') },
                    ].map(({ label, href }) => (
                        <Link
                            key={label}
                            href={href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors"
                            style={{ color: '#5a3a1a' }}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t" style={{ borderColor: 'rgba(139,90,43,0.15)' }}>
                    <Link
                        href={route('login')}
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm"
                        style={{ background: '#8b5a2b', color: '#fdf8f0', fontFamily: "'DM Sans', sans-serif" }}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Account
                    </Link>
                </div>
            </div>
        </>
    );
}