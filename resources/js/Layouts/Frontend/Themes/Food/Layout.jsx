import React from 'react';
import FoodNavbar from './FoodNavbar';
import FoodFooter from './FoodFooter';

export default function FoodLayout({ children }) {
    return (
        <div
            className="flex min-h-screen flex-col relative"
            style={{
                backgroundColor: '#ffffff', // Ensures the clean white base
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif",
            }}
        >
            <FoodNavbar />
            
            {/* Main Content Area */}
            {/* Added pt-6 and overflow handling suitable for the non-sticky top header */}
            <main className="flex-grow w-full mx-auto overflow-x-hidden">
                {children}
            </main>

            <FoodFooter />
        </div>
    );
}