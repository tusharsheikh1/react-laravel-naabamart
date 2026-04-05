import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FoodNavbar() {
    const { global_settings, cartCount } = usePage().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white border-b-4 border-orange-500 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    
                    {/* Left: Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-orange-600 bg-orange-100 hover:bg-orange-200 focus:outline-none p-2 rounded-full transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
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
                                <span className="text-3xl font-black text-orange-600 tracking-tight">
                                    {global_settings?.site_name || 'FreshBites'}
                                </span>
                            )}
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-6 items-center">
                        <Link href="/" className="px-3 py-2 text-gray-800 hover:text-orange-600 font-bold transition-colors">Home</Link>
                        <Link href={route('shop')} className="px-3 py-2 text-gray-800 hover:text-orange-600 font-bold transition-colors">Menu</Link>
                        <Link href={route('categories.all')} className="px-3 py-2 text-gray-800 hover:text-orange-600 font-bold transition-colors">Categories</Link>
                    </nav>

                    {/* Right: Cart Actions */}
                    <div className="flex-1 flex justify-end items-center space-x-4">
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('open-cart-sidebar'))}
                            className="relative flex items-center justify-center bg-orange-600 text-white hover:bg-orange-700 p-3 rounded-full shadow-md transition-all transform hover:scale-105"
                            aria-label="Cart"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-orange-600 bg-white border-2 border-orange-600 rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t-2 border-orange-100 pb-4 shadow-inner">
                    <div className="px-4 pt-3 space-y-2">
                        <Link href="/" className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition">Home</Link>
                        <Link href={route('shop')} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition">Menu</Link>
                        <Link href={route('categories.all')} className="block px-4 py-3 rounded-xl text-base font-bold text-gray-800 bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition">Categories</Link>
                    </div>
                </div>
            )}
        </header>
    );
}