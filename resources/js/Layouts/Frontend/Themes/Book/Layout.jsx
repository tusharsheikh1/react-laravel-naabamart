import React from 'react';

// Specific Book Components
import BookNavbar from './BookNavbar';
import BookFooter from './BookFooter';

export default function BookLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-[#fdfaf6] text-gray-800 font-serif overflow-x-clip relative">
            <BookNavbar />
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {children}
            </main>
            
            <BookFooter />
        </div>
    );
}