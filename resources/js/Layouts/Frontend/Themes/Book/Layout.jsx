import React from 'react';
import BookNavbar from './BookNavbar';
import BookFooter from './BookFooter';

export default function BookLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col overflow-x-clip relative" style={{
            background: 'linear-gradient(160deg, #fdf8f0 0%, #f5ede0 100%)',
            fontFamily: "'Lora', 'Georgia', serif",
        }}>
            {/* Subtle paper texture overlay */}
            <div className="pointer-events-none fixed inset-0 z-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
                opacity: 0.6,
            }} />
            <BookNavbar />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 relative z-10">
                {children}
            </main>
            <BookFooter />
        </div>
    );
}