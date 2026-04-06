import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

/**
 * GeneralHeroSlider
 * Aesthetic: Editorial split-screen — image right, text overlay left on wide screens.
 * Warm neutrals, serif display + clean sans, smooth crossfade transitions.
 *
 * Props:
 *   sliders   {Array}   — Active slider records for this group (from Slider::forGroup)
 *   className {string}  — Optional extra wrapper classes
 */
export default function GeneralHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);

    const count = sliders.length;

    const go = useCallback((idx) => {
        setFading(true);
        setTimeout(() => {
            setCurrent(idx);
            setFading(false);
        }, 350);
    }, []);

    const next = useCallback(() => go((current + 1) % count), [current, count, go]);
    const prev = useCallback(() => go((current - 1 + count) % count), [current, count, go]);

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(next, 6000);
        return () => clearInterval(t);
    }, [next, count]);

    if (!count) return null;

    const slide = sliders[current];

    return (
        <div className={`relative w-full overflow-hidden rounded-none sm:rounded-xl shadow-md bg-stone-900 ${className}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>

            {/* Background image */}
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity: fading ? 0 : 1 }}
            >
                {/* Desktop image */}
                <img
                    src={`/storage/${slide.mobile_image ? slide.image : slide.image}`}
                    alt={slide.title || ''}
                    className={`absolute inset-0 w-full h-full object-cover object-center ${slide.mobile_image ? 'hidden md:block' : ''}`}
                />
                {slide.mobile_image && (
                    <img
                        src={`/storage/${slide.mobile_image}`}
                        alt={slide.title || ''}
                        className="absolute inset-0 w-full h-full object-cover object-center md:hidden"
                    />
                )}
                {/* Dark gradient overlay — stronger on left for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div
                className="relative z-10 flex flex-col justify-end h-[200px] sm:h-[300px] md:h-[400px] lg:h-[460px] px-5 sm:px-10 pb-8 sm:pb-12 transition-opacity duration-500"
                style={{ opacity: fading ? 0 : 1 }}
            >
                {/* Thin accent line */}
                <div className="w-10 h-0.5 bg-amber-400 mb-3 hidden sm:block" />

                {slide.title && (
                    <h2 className="text-white text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-xl drop-shadow-lg"
                        style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}>
                        {slide.title}
                    </h2>
                )}
                {slide.subtitle && (
                    <p className="text-stone-300 text-sm sm:text-base mt-2 max-w-md hidden sm:block"
                        style={{ fontFamily: "'Helvetica Neue', sans-serif", fontWeight: 300, letterSpacing: '0.02em' }}>
                        {slide.subtitle}
                    </p>
                )}
                {slide.link && (
                    <Link
                        href={slide.link}
                        className="mt-4 self-start inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-widest uppercase text-amber-400 hover:text-amber-300 transition-colors hidden sm:inline-flex"
                        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
                    >
                        Explore
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Dots */}
            {count > 1 && (
                <div className="absolute bottom-3 right-5 z-20 flex items-center gap-1.5">
                    {sliders.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'w-5 h-1.5 bg-amber-400' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}

            {/* Arrow nav */}
            {count > 1 && (
                <>
                    <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}