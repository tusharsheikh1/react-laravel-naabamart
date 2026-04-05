import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function GadgetNavbar() {
    const { global_settings } = usePage().props;
    const logo = global_settings?.site_logo;

    return (
        <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/">
                            {logo ? (
                                <img src={`/storage/${logo}`} alt="Logo" className="h-10 w-auto" />
                            ) : (
                                <span className="font-bold text-xl text-blue-400">TechStore</span>
                            )}
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="hover:text-blue-400 transition">Home</Link>
                        <Link href="/products" className="hover:text-blue-400 transition">All Gadgets</Link>
                        <Link href="/categories" className="hover:text-blue-400 transition">Categories</Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link href="/cart" className="relative text-gray-300 hover:text-white">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}