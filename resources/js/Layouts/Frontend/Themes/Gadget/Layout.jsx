import React from 'react';
import GadgetNavbar from './GadgetNavbar';
import GadgetFooter from './GadgetFooter';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans antialiased selection:bg-black selection:text-white">
            <style>{`
                /* Optional animations for the mobile drawer slide-in */
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-left {
                    animation: slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
            
            <GadgetNavbar />
            
            <main className="flex-grow w-full overflow-hidden">
                {children}
            </main>
            
            {/* You can also update GadgetFooter similarly later to complete the look */}
            <GadgetFooter />
        </div>
    );
}