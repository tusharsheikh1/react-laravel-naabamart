import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function BookFooter() {
    const { global_settings } = usePage().props;
    
    return (
        <footer className="bg-[#2c241b] text-[#f4ebd8] py-12 md:py-16 mt-auto font-serif border-t-4 border-amber-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
                    
                    {/* Brand & Description */}
                    <div>
                        <h2 className="text-3xl font-bold text-amber-500 mb-4 tracking-tight">
                            {global_settings?.site_name || 'Bookery'}
                        </h2>
                        <p className="text-[#d8cbb8] leading-relaxed max-w-sm mx-auto md:mx-0">
                            {global_settings?.site_description || "Curating the finest collections of literature, authentic reads, and timeless classics for the avid reader."}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-semibold text-amber-600 mb-4 uppercase tracking-widest text-sm">Library</h3>
                        <ul className="space-y-3">
                            <li><Link href="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
                            <li><Link href={route('shop')} className="hover:text-white transition-colors duration-200">All Books</Link></li>
                            <li><Link href={route('categories.index')} className="hover:text-white transition-colors duration-200">Collections</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-semibold text-amber-600 mb-4 uppercase tracking-widest text-sm">Contact Us</h3>
                        <ul className="space-y-3 text-[#d8cbb8]">
                            {global_settings?.site_email && (
                                <li>Email: <a href={`mailto:${global_settings.site_email}`} className="hover:text-white transition">{global_settings.site_email}</a></li>
                            )}
                            {global_settings?.site_phone && (
                                <li>Phone: <a href={`tel:${global_settings.site_phone}`} className="hover:text-white transition">{global_settings.site_phone}</a></li>
                            )}
                            {global_settings?.site_address && (
                                <li className="max-w-xs">{global_settings.site_address}</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-8 border-t border-[#463a2b] text-center text-sm text-[#a89c8a]">
                    <p>&copy; {new Date().getFullYear()} {global_settings?.site_name || 'Bookery'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}