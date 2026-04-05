import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function DigitalNavbar() {
    const { global_settings } = usePage().props;
    const logo = global_settings?.site_logo;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            {logo ? (
                                <img src={`/storage/${logo}`} alt="Logo" className="h-8 w-auto" />
                            ) : (
                                <span className="font-extrabold text-2xl tracking-tighter text-indigo-600">Digital.</span>
                            )}
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <Link href="/" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Home</Link>
                        <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Software</Link>
                        <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-indigo-600">Templates</Link>
                    </div>
                    <div>
                        <Link href="/cart" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition">
                            View Cart
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}