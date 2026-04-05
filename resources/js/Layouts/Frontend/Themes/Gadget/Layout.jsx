import React from 'react';
import GadgetNavbar from './GadgetNavbar';
import GadgetFooter from './GadgetFooter';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <GadgetNavbar />
            <main className="flex-grow">
                {children}
            </main>
            <GadgetFooter />
        </div>
    );
}