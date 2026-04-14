import React from 'react';
import Navbar from '@/Layouts/Frontend/Navbar';
import Footer from '@/Layouts/Frontend/Footer';

export default function GeneralLayout({ children, layoutBgColor }) {
    return (
        <>
            <style>{`
                /* Global smooth scroll & box-sizing */
                *, *::before, *::after { box-sizing: border-box; }
                html { scroll-behavior: smooth; }

                /* Subtle grain texture overlay for warmth */
                .gl-root::before {
                    content: '';
                    position: fixed; inset: 0; z-index: 0;
                    pointer-events: none;
                    opacity: 0.018;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
                    background-repeat: repeat;
                    background-size: 128px 128px;
                }

                .gl-main {
                    flex: 1; width: 100%;
                    max-width: 1280px; margin: 0 auto;
                    padding: 0 16px 48px;
                    position: relative; z-index: 1;
                }
                @media (min-width: 640px) { .gl-main { padding-left: 24px; padding-right: 24px; } }
                @media (min-width: 1024px) { .gl-main { padding-left: 32px; padding-right: 32px; } }

                /* Page-level fade-in */
                @keyframes gl-fadein {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .gl-main { animation: gl-fadein 0.4s ease both; }
            `}</style>

            <div
                className="gl-root"
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    flexDirection: 'column',
                    backgroundColor: layoutBgColor || '#f8f7f4',
                    color: '#1a2a1a',
                    fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif",
                    overflowX: 'clip',
                    position: 'relative',
                }}
            >
                <Navbar />
                <main className="gl-main">
                    {children}
                </main>
                <Footer />
            </div>
        </>
    );
}