import React from 'react';

// Specific Food Components
import FoodNavbar from './FoodNavbar';
import FoodFooter from './FoodFooter';

export default function FoodLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-orange-50 text-gray-900 font-sans overflow-x-clip relative">
            <FoodNavbar />
            
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 md:pb-12">
                {children}
            </main>
            
            <FoodFooter />
        </div>
    );
}