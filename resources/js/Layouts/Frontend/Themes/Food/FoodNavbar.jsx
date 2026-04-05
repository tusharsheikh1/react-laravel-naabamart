import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ProductSearch from '@/Components/ProductSearch';

export default function FoodNavbar() {
    const { global_settings, featuredCategories = [], cart } = usePage().props;
    const s = global_settings || {};

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const cartItems = Object.values(cart || {});
    const liveCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    return (
        <>
            <header className="bg-white border-b border-gray-200" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
                {/* Top Tier: Logo, Search, Actions */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4 gap-4 lg:gap-8">
                        
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-[#ea580c]"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Logo */}
                        <Link href={route('home')} className="flex items-center shrink-0">
                            {s.site_logo ? (
                                <img src={`/storage/${s.site_logo}`} alt={s.site_name} className="h-10 sm:h-12 w-auto object-contain" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: '#f8f9fa', border: '2px solid #ea580c' }}>
                                        <span style={{ color: '#01201d' }}>🌿</span>
                                    </div>
                                    <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#ea580c] leading-none">
                                        GHORER<br/><span className="text-[#01201d]">BAZAR</span>
                                    </span>
                                </div>
                            )}
                        </Link>

                        {/* Search Bar (Center) */}
                        <div className="hidden lg:block flex-1 max-w-2xl">
                            <div className="relative flex items-center w-full h-11 rounded-md bg-gray-50 border border-transparent focus-within:border-gray-200 focus-within:bg-white overflow-hidden">
                                <div className="flex-1 h-full">
                                    {/* Assuming ProductSearch works well in this container. If it has its own input, adjust accordingly. */}
                                    <ProductSearch 
                                        placeholder="Search in..." 
                                        className="w-full h-full bg-transparent border-none focus:ring-0 px-4 text-sm"
                                    />
                                </div>
                                <button className="h-full px-4 text-gray-500 hover:text-[#ea580c]">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-6 shrink-0 text-gray-700">
                            <Link href="#" className="hidden sm:flex flex-col items-center gap-1 hover:text-[#ea580c] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                                    <circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                                </svg>
                                <span className="text-[12px] font-medium">Track Order</span>
                            </Link>

                            <Link href={route('login')} className="hidden sm:flex flex-col items-center gap-1 hover:text-[#ea580c] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-[12px] font-medium">Sign In</span>
                            </Link>

                            <Link href="#" className="hidden sm:flex flex-col items-center gap-1 hover:text-[#ea580c] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span className="text-[12px] font-medium">Wishlist</span>
                            </Link>

                            <button onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))} className="relative flex flex-col items-center gap-1 hover:text-[#ea580c] transition-colors group">
                                <div className="relative">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center text-[10px] font-bold text-white rounded-full bg-[#ea580c]" style={{ width: 18, height: 18 }}>
                                        {liveCartCount > 99 ? '99+' : liveCartCount}
                                    </span>
                                </div>
                                <span className="text-[12px] font-medium">Cart</span>
                            </button>

                            <button onClick={() => setIsMobileMenuOpen(true)} className="flex flex-col items-center gap-1 hover:text-[#ea580c] transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                <span className="text-[12px] font-medium">More</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Tier: Categories Navbar */}
                <div className="bg-[#022421] text-white hidden lg:block">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <nav className="flex items-center gap-8 py-3 overflow-x-auto no-scrollbar">
                            <Link href={route('shop')} className="text-[14px] font-medium hover:text-[#ea580c] transition-colors whitespace-nowrap">
                                All Categories
                            </Link>
                            
                            {/* Mixing featured categories with the exact image styling */}
                            {featuredCategories.slice(0, 8).map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={route('shop', { category: cat.id })}
                                    className="text-[14px] font-medium hover:text-[#ea580c] transition-colors whitespace-nowrap flex items-center gap-1"
                                >
                                    {cat.name}
                                    <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </Link>
                            ))}
                            {/* Fallbacks if featured categories are empty to match the design */}
                            {featuredCategories.length === 0 && ['Oil & Ghee', 'Honey', 'Dates', 'Spices', 'Nuts & Seeds', 'Beverage', 'Rice', 'Flours & Lentils'].map((item) => (
                                <Link key={item} href={route('shop')} className="text-[14px] font-medium hover:text-[#ea580c] transition-colors whitespace-nowrap flex items-center gap-1">
                                    {item}
                                    {['Honey', 'Dates', 'Spices', 'Nuts & Seeds', 'Beverage', 'Flours & Lentils'].includes(item) && (
                                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}

            {/* Mobile drawer */}
            <div className={`fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm flex flex-col bg-white lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <span className="font-bold text-lg text-[#ea580c]">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-4 border-b border-gray-100">
                    <ProductSearch placeholder="Search..." className="w-full bg-gray-50" onSearchSuccess={() => setIsMobileMenuOpen(false)} />
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    <Link href={route('home')} onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-2 rounded-md text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#ea580c]">Home</Link>
                    <Link href={route('shop')} onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-2 rounded-md text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#ea580c]">All Menu</Link>
                    <div className="pt-4 pb-2 px-2 text-xs font-bold text-gray-400 uppercase">Categories</div>
                    {featuredCategories.map((cat) => (
                        <Link key={cat.id} href={route('shop', { category: cat.id })} onClick={() => setIsMobileMenuOpen(false)} className="block py-3 px-2 rounded-md text-[15px] font-medium text-gray-700 hover:bg-gray-50 hover:text-[#ea580c]">
                            {cat.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}