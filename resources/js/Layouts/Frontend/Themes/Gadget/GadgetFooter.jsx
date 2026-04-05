import React from 'react';
import { usePage } from '@inertiajs/react';

export default function GadgetFooter() {
    const { global_settings } = usePage().props;
    
    return (
        <footer className="bg-black text-gray-400 py-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="mb-2">Premium Tech & Gadgets</p>
                <p>&copy; {new Date().getFullYear()} {global_settings?.site_name || 'TechStore'}. All rights reserved.</p>
            </div>
        </footer>
    );
}