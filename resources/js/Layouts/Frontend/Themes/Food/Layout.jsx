import React from 'react';
import FoodNavbar from './FoodNavbar';
import FoodFooter from './FoodFooter';

export default function FoodLayout({ children, layoutBgColor = '#c66a00' }) {
    return (
        <div
            className="flex min-h-screen flex-col relative"
            style={{
                backgroundColor: layoutBgColor,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            <FoodNavbar />
            
            {/* Main Content Area */}
            <main className="flex-grow w-full mx-auto overflow-x-hidden">
                {children}
            </main>

            <FoodFooter />
        </div>
    );
}