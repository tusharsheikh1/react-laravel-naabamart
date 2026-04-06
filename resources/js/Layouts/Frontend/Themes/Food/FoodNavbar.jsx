import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function FoodNavbar() {
    const { global_settings, featuredCategories = [], cart } = usePage().props;
    const s = global_settings || {};

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [logoError, setLogoError] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchQuery(params.get('search') || '');
    }, []);

    const cartItems = Object.values(cart || {});
    const liveCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('shop'), { search: searchQuery || undefined }, {
            preserveState: true,
            onFinish: () => setIsMobileMenuOpen(false)
        });
    };

    const logoUrl = "https://backoffice.ghorerbazar.com/company_logo/qJaKf1768887846.png";

    return (
        <>
            <header className="bg-white border-b border-gray-100">
                {/* Top Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4 gap-4">

                        {/* Mobile: Left Hamburger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-gray-700 hover:text-[#f97316]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* 1. Left Column - Logo */}
                        <div className="flex-1 lg:flex-1 flex justify-center lg:justify-start">
                            <Link href={route('home')} className="flex-shrink-0">
                                {!logoError ? (
                                    <img 
                                        src={logoUrl}
                                        alt="Ghorer Bazar"
                                        className="h-10 sm:h-11 w-auto object-contain"
                                        onError={() => setLogoError(true)}
                                    />
                                ) : s.site_logo ? (
                                    <img 
                                        src={`/storage/${s.site_logo}`} 
                                        alt={s.site_name || "Ghorer Bazar"} 
                                        className="h-10 sm:h-11 w-auto object-contain" 
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-[#f97316] rounded-2xl flex items-center justify-center">
                                            <span className="text-white text-3xl">🌱</span>
                                        </div>
                                        <div className="leading-none">
                                            <span className="text-[#f97316] font-bold text-[22px] tracking-tighter">GHORER</span>
                                            <span className="block text-[#01201d] font-bold text-[22px] tracking-tighter -mt-1">BAZAR</span>
                                        </div>
                                    </div>
                                )}
                            </Link>
                        </div>

                        {/* 2. Center Column - Search Bar */}
                        <div className="hidden md:flex flex-1 lg:flex-[2] justify-center px-2 lg:px-6">
                            <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search in..."
                                    className="w-full bg-[#f8f9fa] border border-gray-200 focus:border-[#f97316] rounded-full py-3 pl-6 pr-14 text-sm placeholder-gray-500 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#f97316]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 01-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* 3. Right Column - Actions */}
                        <div className="flex-none lg:flex-1 flex items-center justify-end gap-4 lg:gap-6">
                            {/* Desktop Actions */}
                            <div className="hidden lg:flex items-center gap-6 text-gray-700">
                                <Link href="#" className="flex flex-col items-center gap-0.5 hover:text-[#f97316] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                        <circle cx="12" cy="11" r="3" />
                                    </svg>
                                    <span className="text-xs font-medium">Track Order</span>
                                </Link>

                                <Link href={route('login')} className="flex flex-col items-center gap-0.5 hover:text-[#f97316] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs font-medium">Sign In</span>
                                </Link>

                                <Link href="#" className="flex flex-col items-center gap-0.5 hover:text-[#f97316] transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-xs font-medium">Wishlist</span>
                                </Link>

                                <button 
                                    onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))}
                                    className="relative flex flex-col items-center gap-0.5 hover:text-[#f97316]"
                                >
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {liveCartCount > 0 && (
                                            <span className="absolute -top-2 -right-2 bg-[#f97316] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                {liveCartCount > 99 ? '99' : liveCartCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-medium">Cart</span>
                                </button>
                            </div>

                            {/* Mobile Right: Cart Icon */}
                            <button 
                                onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))}
                                className="lg:hidden relative p-2 text-gray-700 hover:text-[#f97316]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {liveCartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {liveCartCount > 99 ? '99' : liveCartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sticky Categories Bar */}
            <div className="bg-[#01201d] text-white sticky top-0 z-50 hidden lg:block border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-8 py-3.5 text-sm font-medium overflow-x-auto no-scrollbar whitespace-nowrap">
                        {featuredCategories.length > 0 ? (
                            featuredCategories.slice(0, 10).map((cat, i) => (
                                <Link
                                    key={cat.id}
                                    href={route('shop', { category: cat.id })}
                                    className="hover:text-[#f97316] transition-colors flex items-center gap-1.5"
                                >
                                    {cat.name}
                                    {[1,2,3,4,5,7].includes(i) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    )}
                                </Link>
                            ))
                        ) : (
                            ['Oil & Ghee', 'Honey', 'Dates', 'Spices', 'Nuts & Seeds', 'Beverage', 'Rice', 'Flours & Lentils', 'Certified', 'Pickle'].map((item, i) => (
                                <Link
                                    key={i}
                                    href={route('shop')}
                                    className="hover:text-[#f97316] transition-colors flex items-center gap-1.5"
                                >
                                    {item}
                                    {['Honey','Dates','Spices','Nuts & Seeds','Beverage','Flours & Lentils'].includes(item) && (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    )}
                                </Link>
                            ))
                        )}
                    </nav>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/70 z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile Drawer */}
            <div className={`fixed inset-y-0 left-0 z-[110] w-[85%] max-w-sm bg-white shadow-2xl lg:hidden transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-5 border-b flex items-center justify-between">
                    <span className="font-bold text-xl text-[#f97316]">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="text-3xl text-gray-400">✕</button>
                </div>

                <div className="p-4">
                    <form onSubmit={handleSearch}>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in..."
                            className="w-full bg-[#f8f9fa] border border-gray-200 rounded-full py-3.5 px-6 text-base"
                        />
                    </form>
                </div>

                <nav className="px-4 space-y-1">
                    <Link href={route('home')} onClick={() => setIsMobileMenuOpen(false)} className="block py-4 px-4 text-lg font-medium hover:bg-gray-50 rounded-2xl">Home</Link>
                    <Link href={route('shop')} onClick={() => setIsMobileMenuOpen(false)} className="block py-4 px-4 text-lg font-medium hover:bg-gray-50 rounded-2xl">All Categories</Link>

                    <div className="pt-6 pb-3 px-4 text-xs font-semibold text-gray-500 uppercase">Categories</div>
                    {featuredCategories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={route('shop', { category: cat.id })}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-4 px-4 text-[17px] font-medium hover:bg-gray-50 rounded-2xl"
                        >
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}