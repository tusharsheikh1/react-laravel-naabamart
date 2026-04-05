import React from 'react';
import { usePage } from '@inertiajs/react';

export default function DigitalFooter() {
    const { global_settings } = usePage().props;
    
    return (
        <footer className="bg-gray-50 py-12 border-t border-gray-200 text-sm text-gray-500 text-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p>&copy; {new Date().getFullYear()} {global_settings?.site_name || 'Digital Goods'}. Instant Delivery.</p>
            </div>
        </footer>
    );
}