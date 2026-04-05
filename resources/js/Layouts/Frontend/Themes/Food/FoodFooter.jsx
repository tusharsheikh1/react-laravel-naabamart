import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FoodFooter() {
    const { global_settings } = usePage().props;
    
    return (
        <footer className="bg-orange-600 text-white mt-auto rounded-t-[2.5rem] pt-16 pb-8 shadow-2xl relative overflow-hidden">
            
            {/* Decorative background element */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="food-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                            <circle cx="30" cy="30" r="2" fill="currentColor"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#food-pattern)" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
                    
                    {/* Brand & Description */}
                    <div>
                        <h2 className="text-3xl font-black text-white mb-4 tracking-tight drop-shadow-md">
                            {global_settings?.site_name || 'FreshBites'}
                        </h2>
                        <p className="text-orange-100 leading-relaxed font-medium max-w-sm mx-auto md:mx-0">
                            {global_settings?.site_description || "Delivering fresh, organic, and delicious groceries directly to your door. Taste the difference!"}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-bold text-white mb-4">Explore</h3>
                        <ul className="space-y-3 font-medium text-orange-100">
                            <li><Link href="/" className="hover:text-white transition-colors duration-200 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Home</Link></li>
                            <li><Link href={route('shop')} className="hover:text-white transition-colors duration-200 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Menu</Link></li>
                            <li><Link href={route('categories.index')} className="hover:text-white transition-colors duration-200 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-white"></span> Categories</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-xl font-bold text-white mb-4">Get in Touch</h3>
                        <ul className="space-y-3 text-orange-100 font-medium bg-orange-700/50 p-6 rounded-2xl w-full">
                            {global_settings?.site_phone && (
                                <li className="flex items-center justify-center md:justify-start gap-3">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                    <a href={`tel:${global_settings.site_phone}`} className="hover:text-white">{global_settings.site_phone}</a>
                                </li>
                            )}
                            {global_settings?.site_email && (
                                <li className="flex items-center justify-center md:justify-start gap-3 mt-2">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                    <a href={`mailto:${global_settings.site_email}`} className="hover:text-white">{global_settings.site_email}</a>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-12 pt-6 border-t border-orange-500 text-center font-medium text-orange-200">
                    <p>&copy; {new Date().getFullYear()} {global_settings?.site_name || 'FreshBites'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}