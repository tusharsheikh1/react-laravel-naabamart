import React from 'react';
import DigitalNavbar from './DigitalNavbar';
import DigitalFooter from './DigitalFooter';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
            <DigitalNavbar />
            <main className="flex-grow">
                {children}
            </main>
            <DigitalFooter />
        </div>
    );
}