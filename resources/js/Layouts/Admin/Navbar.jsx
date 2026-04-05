import React, { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import { Link } from '@inertiajs/react';

const HamburgerIcon = () => (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const HomeIcon = () => (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m-4 0h4m5-6v6a1 1 0 01-1 1H6a1 1 0 01-1-1v-6" />
    </svg>
);

const ChevronDown = () => (
    <svg className="-me-0.5 ms-1.5 h-3.5 w-3.5 text-gray-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

const ClockIcon = () => (
    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default function Navbar({ user, toggleSidebar }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update the time every second
    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup interval on unmount
        return () => clearInterval(timerId);
    }, []);

    // Format the time (e.g., 03:45:20 PM)
    const formattedTime = currentTime.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 bg-white px-4 sm:px-6 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">

            {/* ── Left: Hamburger + Page title ── */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="lg:hidden flex-shrink-0 -ml-1 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                    aria-label="Toggle navigation"
                >
                    <HamburgerIcon />
                </button>
                <h1 className="text-sm font-semibold text-gray-800 tracking-tight truncate select-none">
                    Admin Console
                </h1>
            </div>

            {/* ── Right: Actions + Profile ── */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

                {/* Current Time Widget */}
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100 shadow-sm" title="Current Time">
                    <ClockIcon />
                    <span className="text-xs font-medium text-gray-600 tracking-wide font-mono w-[75px] text-center">
                        {formattedTime}
                    </span>
                </div>

                {/* Divider for Time Widget */}
                <div className="w-px h-5 bg-gray-200 mx-1 hidden md:block" aria-hidden="true" />

                {/* Storefront link */}
                <Link
                    href={route('home')}
                    title="Go to Storefront"
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                >
                    <HomeIcon />
                    <span className="hidden sm:inline">Storefront</span>
                </Link>

                {/* Divider */}
                <div className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" aria-hidden="true" />

                {/* User dropdown */}
                <Dropdown>
                    <Dropdown.Trigger>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 rounded-lg pl-1 pr-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors"
                            aria-label="User menu"
                        >
                            {/* Avatar */}
                            <span
                                className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                aria-hidden="true"
                            >
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                            <span className="truncate max-w-[80px] sm:max-w-[140px] hidden xs:inline sm:inline">
                                {user?.name || 'Admin'}
                            </span>
                            <ChevronDown />
                        </button>
                    </Dropdown.Trigger>

                    <Dropdown.Content align="right" width="48">
                        <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                        <Dropdown.Link href={route('logout')} method="post" as="button">Log Out</Dropdown.Link>
                    </Dropdown.Content>
                </Dropdown>
            </div>
        </header>
    );
}