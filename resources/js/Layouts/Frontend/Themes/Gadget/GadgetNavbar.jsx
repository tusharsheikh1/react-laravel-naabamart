import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function GadgetNavbar() {
    // Extract auth and cartCount props provided by HandleInertiaRequests.php
    const { global_settings, auth, cartCount } = usePage().props; 
    const logo = global_settings?.site_logo;
    
    // Dynamic Top Banner & Search Settings directly mapped from NavbarTab.jsx keys
    const topBannerText = global_settings?.top_banner_text; 
    const topBannerLinkText = global_settings?.top_banner_link_text;
    const searchPlaceholder = global_settings?.search_placeholder || "Search products...";
    
    // Optional banner styling fallbacks
    const bannerBg = global_settings?.top_banner_bg_color || '#000000';
    const bannerTextColor = global_settings?.top_banner_text_color || '#ffffff';

    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // Search functionality state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Handle scroll shadow/blur effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    }, [mobileMenuOpen]);

    // Handle Search Submission using correct route
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.get(route('shop'), { search: searchQuery });
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    // Reusable Logo Component
    const BrandLogo = () => (
        <>
            {logo ? (
                <img 
                    src={`/storage/${logo}`} 
                    alt={global_settings?.site_name || "Store Logo"} 
                    className="h-7 md:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
            ) : (
                <span className="font-serif font-black text-xl md:text-2xl tracking-widest uppercase text-black">
                    {global_settings?.site_name || "AURA"}
                </span>
            )}
        </>
    );

    return (
        <>
            {/* 1. Settings-Driven Announcement Top Banner */}
            {topBannerText && (
                <div 
                    className="text-[10px] sm:text-xs text-center py-2 px-4 uppercase tracking-widest font-medium z-50 relative flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-2"
                    style={{ backgroundColor: bannerBg, color: bannerTextColor }}
                >
                    <span>{topBannerText}</span>
                    {topBannerLinkText && (
                        <Link 
                            href={route('shop')} 
                            className="underline hover:opacity-80 transition-opacity font-bold ml-1"
                        >
                            {topBannerLinkText}
                        </Link>
                    )}
                </div>
            )}

            {/* 2. Main Navigation */}
            <nav className={`sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${isScrolled ? 'bg-white/95 backdrop-blur-md py-3 shadow-sm' : 'bg-white py-4'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-8 md:h-10">
                        
                        {/* Left Side: Mobile Menu (Mobile) / Logo (Desktop) */}
                        <div className="flex-1 flex items-center justify-start">
                            {/* Mobile Hamburger Icon */}
                            <button 
                                className="md:hidden p-1 -ml-1 text-gray-800 hover:text-black transition focus:outline-none"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open Menu"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            {/* Desktop Logo */}
                            <Link href={route('home')} className="hidden md:flex items-center group">
                                <BrandLogo />
                            </Link>
                        </div>

                        {/* Center: Mobile Logo (Mobile) / Navigation Links (Desktop) */}
                        <div className="flex-1 flex items-center justify-center">
                            {/* Mobile Logo */}
                            <Link href={route('home')} className="md:hidden flex items-center group">
                                <BrandLogo />
                            </Link>

                            {/* Desktop Links */}
                            <div className="hidden md:flex space-x-8">
                                <Link href={route('home')} className="text-sm font-medium text-gray-500 hover:text-black uppercase tracking-widest transition-colors duration-200">
                                    Home
                                </Link>
                                <Link href={route('shop')} className="text-sm font-medium text-gray-500 hover:text-black uppercase tracking-widest transition-colors duration-200">
                                    Shop
                                </Link>
                                <Link href={route('categories.index')} className="text-sm font-medium text-gray-500 hover:text-black uppercase tracking-widest transition-colors duration-200">
                                    Collections
                                </Link>
                            </div>
                        </div>

                        {/* Right Side: Icons (Search, Profile, Cart) */}
                        <div className="flex-1 flex items-center justify-end space-x-4 md:space-x-6">
                            
                            {/* Expandable Functional Search Bar */}
                            <div className="relative flex items-center">
                                {isSearchOpen && (
                                    <form 
                                        onSubmit={handleSearchSubmit} 
                                        className="absolute right-8 top-1/2 -translate-y-1/2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 flex items-center w-48 sm:w-64 animate-fade-in transition-all"
                                        style={{ animation: 'fadeIn 0.2s ease-in-out' }}
                                    >
                                        <input
                                            type="text"
                                            placeholder={searchPlaceholder}
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none text-gray-800 placeholder-gray-400 p-0"
                                        />
                                        <button type="button" onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gray-600 ml-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </form>
                                )}
                                
                                <button 
                                    onClick={() => setIsSearchOpen(!isSearchOpen)} 
                                    className="text-gray-800 hover:text-black transition"
                                    aria-label="Search"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* User Account Icon (Routes to Dashboard if logged in, Login if guest) */}
                            <Link href={auth?.user ? route('dashboard') : route('login')} className="text-gray-800 hover:text-black transition hidden sm:block">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </Link>

                            {/* Shopping Bag Icon with Dynamic Count */}
                            <Link href={route('cart.index')} className="relative text-gray-800 hover:text-black transition flex items-center group">
                                <svg className="w-6 h-6 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartCount || 0}
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 3. Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] flex md:hidden">
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>
                    
                    <div className="relative flex-1 flex flex-col max-w-[80%] w-full bg-white shadow-2xl h-full" style={{ animation: 'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                            <span className="font-serif font-black text-lg tracking-widest uppercase text-gray-900">Menu</span>
                            <button 
                                onClick={() => setMobileMenuOpen(false)} 
                                className="p-2 -mr-2 text-gray-500 hover:text-black bg-white rounded-full shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 flex flex-col">
                            <Link href={route('home')} className="text-lg font-medium text-gray-800 hover:text-black uppercase tracking-widest border-b border-gray-50 pb-2">Home</Link>
                            <Link href={route('shop')} className="text-lg font-medium text-gray-800 hover:text-black uppercase tracking-widest border-b border-gray-50 pb-2">Shop All</Link>
                            <Link href={route('categories.index')} className="text-lg font-medium text-gray-800 hover:text-black uppercase tracking-widest border-b border-gray-50 pb-2">Collections</Link>
                            <Link href={auth?.user ? route('dashboard') : route('login')} className="text-lg font-medium text-gray-800 hover:text-black uppercase tracking-widest border-b border-gray-50 pb-2 mt-auto">Account / Login</Link>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-50%) translateX(10px); }
                    to { opacity: 1; transform: translateY(-50%) translateX(0); }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
            `}</style>
        </>
    );
}