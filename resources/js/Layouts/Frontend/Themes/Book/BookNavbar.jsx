import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function BookNavbar() {
    const { global_settings, cartCount } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-[#f4ebd8] border-b border-[#e2d5bd] shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Left: Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-amber-900 hover:text-amber-700 focus:outline-none p-2"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>

                    {/* Center/Left: Logo */}
                    <div className="flex-1 flex justify-center md:justify-start">
                        <Link href="/" className="flex items-center gap-3">
                            {global_settings?.site_logo ? (
                                <img src={`/storage/${global_settings.site_logo}`} alt="Logo" className="h-10 w-auto object-contain" />
                            ) : (
                                <span className="text-3xl font-bold font-serif text-amber-900 tracking-tight">
                                    {global_settings?.site_name || 'Bookery'}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link href="/" className="text-amber-900 hover:text-amber-700 font-medium tracking-wide transition-colors">Home</Link>
                        <Link href={route('shop')} className="text-amber-900 hover:text-amber-700 font-medium tracking-wide transition-colors">Library</Link>
                        <Link href={route('categories.index')} className="text-amber-900 hover:text-amber-700 font-medium tracking-wide transition-colors">Categories</Link>
                    </nav>

                    {/* Right: Cart & Actions */}
                    <div className="flex-1 flex justify-end items-center space-x-4">
                        {/* Cart Button triggering the global sidebar cart */}
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))}
                            className="relative text-amber-900 hover:text-amber-700 p-2 transition-colors"
                            aria-label="Cart"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-amber-700 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#f4ebd8] border-t border-[#e2d5bd]">
                    <div className="px-4 pt-2 pb-4 space-y-1">
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:bg-[#eadecc] transition">Home</Link>
                        <Link href={route('shop')} className="block px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:bg-[#eadecc] transition">Library</Link>
                        <Link href={route('categories.index')} className="block px-3 py-2 rounded-md text-base font-medium text-amber-900 hover:bg-[#eadecc] transition">Categories</Link>
                    </div>
                </div>
            )}
        </header>
    );
}