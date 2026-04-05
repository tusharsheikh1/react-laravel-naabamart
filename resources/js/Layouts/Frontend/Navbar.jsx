import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ProductSearch from '@/Components/ProductSearch';

export default function Navbar() {
    // CRITICAL FIX: Destructure `cart` directly from props instead of `cartCount`
    const { auth, cart, featuredCategories = [], global_settings } = usePage().props;
    const settings = global_settings || {};
    
    // Dynamically calculate the live cart count so it's immune to production page caching
    const cartItems = Object.values(cart || {});
    const liveCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [showingMobileSearch, setShowingMobileSearch] = useState(false);
    const [showTopBanner, setShowTopBanner] = useState(true);

    // Close mobile search when navigation dropdown is opened
    useEffect(() => {
        if (showingNavigationDropdown) {
            setShowingMobileSearch(false);
        }
    }, [showingNavigationDropdown]);

    // Prevent background scrolling when mobile menu is open
    useEffect(() => {
        if (showingNavigationDropdown) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showingNavigationDropdown]);

    return (
        <>
            <nav 
                className="w-full sticky top-0 z-50 shadow-sm bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300"
                style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
            >
                {/* 1. Top Banner */}
                {showTopBanner && settings?.top_banner_text && (
                    <div className="text-white text-xs sm:text-sm py-2 px-4 relative bg-gradient-to-r from-[#1a3a1a] via-[#2d5a27] to-[#3a7a30]">
                        <div className="max-w-7xl mx-auto flex justify-center items-center text-center gap-2 pr-6">
                            <span className="w-2 h-2 rounded-full bg-[#a8e063] animate-pulse shadow-[0_0_8px_#a8e063]"></span>
                            <p className="font-medium tracking-wide">
                                {settings.top_banner_text}{' '}
                                {settings?.top_banner_link_text && (
                                    <Link href={route('shop')} className="font-bold underline underline-offset-4 decoration-[#a8e063]/50 hover:decoration-[#a8e063] hover:text-[#a8e063] transition-all ml-1">
                                        {settings.top_banner_link_text}
                                    </Link>
                                )}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowTopBanner(false)} 
                            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/20 p-1 rounded-full transition-colors"
                            aria-label="Close banner"
                        >
                            <svg className="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {/* 2. Main Desktop Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
                        
                        {/* Logo & Mobile Toggle */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                            <button 
                                onClick={() => setShowingNavigationDropdown(true)} 
                                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#2d5a27] hover:bg-[#2d5a27]/10 rounded-full transition-colors flex items-center justify-center"
                                aria-label="Open mobile menu"
                            >
                                <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                            </button>
                            <Link href={route('home')} className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 duration-200">
                                {settings?.site_logo ? (
                                    <img src={`/storage/${settings.site_logo}`} alt={settings?.site_name} className="h-8 sm:h-10 w-auto object-contain" />
                                ) : (
                                    <span className="font-black text-xl md:text-2xl text-[#1a3a1a] tracking-tight" style={{fontFamily: 'Georgia, serif'}}>
                                        {settings?.site_name || 'Bismillah Bazar'}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* DESKTOP CATEGORIES */}
                        <div className="hidden lg:flex items-center space-x-6 text-[15px] font-semibold text-gray-600 ml-8 shrink-0">
                            <Link href={route('shop')} className="relative group hover:text-[#2d5a27] transition-colors py-2">
                                All Products
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2d5a27] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                            </Link>
                            
                            {featuredCategories.slice(0, 5).map((cat) => (
                                <Link 
                                    key={cat.id} 
                                    href={route('shop', { category: cat.id })} 
                                    className="relative group hover:text-[#2d5a27] transition-colors whitespace-nowrap py-2"
                                >
                                    {cat.name}
                                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#2d5a27] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                                </Link>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="hidden md:flex flex-1 max-w-2xl ml-auto mr-4 lg:mr-8">
                            <div className="w-full relative shadow-sm rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-[#2d5a27]/20 transition-all">
                                <ProductSearch placeholder={settings?.search_placeholder || "Search dates, ghee, honey..."} />
                            </div>
                        </div>

                        {/* Icons */}
                        <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-gray-700 relative z-[60]">
                            {/* Mobile Search Toggle */}
                            <button 
                                onClick={() => setShowingMobileSearch(!showingMobileSearch)} 
                                className={`md:hidden p-2 rounded-full transition-colors flex items-center justify-center ${showingMobileSearch ? 'bg-[#2d5a27]/10 text-[#2d5a27]' : 'hover:bg-gray-100'}`}
                                aria-label="Toggle mobile search"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {showingMobileSearch ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    )}
                                </svg>
                            </button>

                            {/* Cart Icon */}
                            <Link href={route('cart.index')} aria-label="View shopping cart" className="p-2 relative rounded-full hover:bg-gray-100 transition-colors group flex items-center justify-center">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-[#2d5a27] transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                {liveCartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-[#e11d48] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm pointer-events-none">
                                        {liveCartCount > 99 ? '99+' : liveCartCount}
                                    </span>
                                )}
                            </Link>

                            {/* User Profile Icon */}
                            <Link 
                                href={
                                    auth?.user 
                                        ? (auth.user.role === 'admin' ? route('admin.dashboard') : route('dashboard')) 
                                        : route('login')
                                } 
                                aria-label="User account dashboard"
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors group hidden sm:flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:text-[#2d5a27] transition-colors pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar Dropdown */}
                <div 
                    className={`md:hidden bg-gray-50 border-b border-gray-100 transition-all duration-300 ease-in-out overflow-hidden shadow-inner ${
                        showingMobileSearch ? 'max-h-24 py-3 opacity-100 visible' : 'max-h-0 py-0 opacity-0 invisible pointer-events-none'
                    }`}
                >
                    <div className="px-4">
                        <ProductSearch 
                            autoFocus={showingMobileSearch}
                            placeholder={settings?.search_placeholder || "Search everything..."} 
                            onSearchSuccess={() => setShowingMobileSearch(false)}
                        />
                    </div>
                </div>
            </nav>

            {/* 3. Mobile Menu Backdrop Overlay */}
            {showingNavigationDropdown && (
                <div 
                    className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
                    onClick={() => setShowingNavigationDropdown(false)}
                    aria-hidden="true"
                />
            )}

            {/* 4. Mobile Menu Drawer */}
            <div 
                className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm bg-white shadow-2xl lg:hidden transform transition-transform duration-300 ease-in-out flex flex-col ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
            >
                {/* Drawer Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50">
                    <span className="font-bold text-lg text-[#1a3a1a]">Menu</span>
                    <button 
                        onClick={() => setShowingNavigationDropdown(false)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
                        aria-label="Close mobile menu"
                    >
                        <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Drawer Links */}
                <div className="flex-1 overflow-y-auto py-4">
                    <div className="px-2">
                        <ResponsiveNavLink href={route('home')} active={route().current('home')}>Home</ResponsiveNavLink>
                        <ResponsiveNavLink href={route('shop')} active={route().current('shop')}>All Products</ResponsiveNavLink>
                    </div>
                    
                    <div className="mt-6 mb-2 px-6 uppercase text-[11px] font-black text-gray-400 tracking-wider">
                        Categories
                    </div>
                    <div className="px-2">
                        {featuredCategories.map((cat) => (
                            <ResponsiveNavLink key={cat.id} href={route('shop', { category: cat.id })}>
                                {cat.name}
                            </ResponsiveNavLink>
                        ))}
                    </div>
                </div>

                {/* Drawer Footer / Auth */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    {auth?.user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 px-2 mb-4">
                                <div className="w-10 h-10 rounded-full bg-[#2d5a27]/10 flex items-center justify-center text-[#2d5a27] font-bold">
                                    {auth.user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{auth.user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{auth.user.role}</p>
                                </div>
                            </div>
                            <Link 
                                href={auth.user.role === 'admin' ? route('admin.dashboard') : route('dashboard')} 
                                className="block w-full text-center py-3 bg-[#2d5a27] hover:bg-[#1a3a1a] text-white rounded-xl font-bold transition-colors shadow-sm"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Link href={route('login')} className="flex items-center justify-center py-3 bg-[#2d5a27] hover:bg-[#1a3a1a] text-white rounded-xl font-bold transition-colors shadow-sm">
                                Log In
                            </Link>
                            <Link href={route('register')} className="flex items-center justify-center py-3 border-2 border-[#2d5a27] text-[#2d5a27] hover:bg-[#2d5a27]/5 rounded-xl font-bold transition-colors">
                                Join
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}