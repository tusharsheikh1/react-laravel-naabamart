import React from 'react';
import Navbar from '@/Layouts/Frontend/Navbar';
import Footer from '@/Layouts/Frontend/Footer';

export default function GeneralLayout({ children }) {
    return (
        <div
            className="flex min-h-screen flex-col bg-[#f8f7f4] text-gray-900 overflow-x-clip relative"
            style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
        >
            <Navbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
                {children}
            </main>
            <Footer />
        </div>
    );
}