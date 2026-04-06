import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@inertiajs/react';

/**
 * GadgetHeroSlider
 * Aesthetic: Dark tech / cyberpunk showroom.
 * Jet black + electric cyan/lime accents, monospace type, animated scan-line,
 * spec-sheet data overlays, sharp geometric transitions.
 *
 * Props:
 *   sliders   {Array}
 *   className {string}
 */
export default function GadgetHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [glitch, setGlitch]   = useState(false);
    const timerRef              = useRef(null);
    const count                 = sliders.length;

    const go = useCallback((idx) => {
        setGlitch(true);
        setTimeout(() => {
            setCurrent(idx);
            setGlitch(false);
        }, 180);
    }, []);

    const goNext = useCallback(() => go((current + 1) % count), [current, count, go]);
    const goPrev = useCallback(() => go((current - 1 + count) % count), [current, count, go]);

    const resetTimer = useCallback(() => {
        clearInterval(timerRef.current);
        if (count > 1) timerRef.current = setInterval(goNext, 5500);
    }, [goNext, count]);

    useEffect(() => {
        resetTimer();
        return () => clearInterval(timerRef.current);
    }, [resetTimer]);

    if (!count) return null;
    const slide = sliders[current];

    return (
        <div
            className={`relative w-full overflow-hidden rounded-none sm:rounded-lg ${className}`}
            style={{ background: '#050810', fontFamily: "'Courier New', 'Lucida Console', monospace" }}
        >
            {/* Scan-line overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,200,0.015) 2px, rgba(0,255,200,0.015) 4px)',
                }} />

            {/* Corner brackets */}
            {[
                'top-3 left-3 border-t-2 border-l-2',
                'top-3 right-3 border-t-2 border-r-2',
                'bottom-3 left-3 border-b-2 border-l-2',
                'bottom-3 right-3 border-b-2 border-r-2',
            ].map((cls, i) => (
                <div key={i} className={`absolute z-30 w-5 h-5 border-cyan-400/80 pointer-events-none ${cls}`} />
            ))}

            {/* Image */}
            <div
                className="relative transition-all duration-200"
                style={{ filter: glitch ? 'brightness(2) saturate(0) blur(1px)' : 'none' }}
            >
                <img
                    src={`/storage/${slide.image}`}
                    alt={slide.title || ''}
                    className={`w-full object-cover object-center block ${slide.mobile_image ? 'hidden md:block' : ''}`}
                    style={{ height: 'clamp(180px, 40vw, 460px)' }}
                />
                {slide.mobile_image && (
                    <img
                        src={`/storage/${slide.mobile_image}`}
                        alt={slide.title || ''}
                        className="w-full object-cover object-center md:hidden"
                        style={{ height: 'clamp(180px, 55vw, 360px)' }}
                    />
                )}

                {/* Dark overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(105deg, rgba(5,8,16,0.90) 0%, rgba(5,8,16,0.5) 50%, rgba(5,8,16,0.15) 100%)' }} />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(5,8,16,0.95) 0%, transparent 45%)' }} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 sm:px-10 pb-8 sm:pb-12">

                {/* Slide index */}
                <div className="hidden sm:flex items-center gap-3 mb-3">
                    <span className="text-cyan-400 text-xs tracking-[0.3em]">
                        SYS:{String(current + 1).padStart(2, '0')}/{String(count).padStart(2, '0')}
                    </span>
                    <div className="flex-1 max-w-16 h-px" style={{ background: 'linear-gradient(to right, #00ffcc60, transparent)' }} />
                    <span className="text-cyan-900 text-xs">■■■■□□</span>
                </div>

                {slide.title && (
                    <h2
                        className="font-bold leading-none tracking-tight"
                        style={{
                            fontSize: 'clamp(1.2rem, 4vw, 3rem)',
                            color: glitch ? '#00ffcc' : '#f0f9ff',
                            textShadow: '0 0 30px rgba(0,255,200,0.3)',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        {slide.title}
                    </h2>
                )}

                {slide.subtitle && (
                    <p className="text-cyan-600 mt-2 text-xs sm:text-sm max-w-md hidden sm:block tracking-wider">
                        &gt; {slide.subtitle}
                    </p>
                )}

                <div className="flex items-center gap-4 mt-4 hidden sm:flex">
                    {slide.link && (
                        <Link href={slide.link}
                            className="inline-flex items-center gap-2 px-5 py-2 text-xs tracking-widest uppercase font-bold transition-all duration-200 hover:shadow-[0_0_20px_rgba(0,255,200,0.5)]"
                            style={{
                                background: 'linear-gradient(135deg, #00ffcc, #0080ff)',
                                color: '#050810',
                                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                            }}>
                            View Specs
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>

            {/* Progress bar */}
            {count > 1 && (
                <div className="absolute bottom-0 left-0 right-0 z-30 flex">
                    {sliders.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { go(i); resetTimer(); }}
                            className={`h-0.5 flex-1 transition-all duration-300 mx-0.5 ${i === current ? 'bg-cyan-400' : 'bg-cyan-950 hover:bg-cyan-800'}`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows */}
            {count > 1 && (
                <>
                    <button onClick={() => { goPrev(); resetTimer(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center border border-cyan-800 hover:border-cyan-400 text-cyan-600 hover:text-cyan-400 transition-all"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))', background: 'rgba(5,8,16,0.8)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button onClick={() => { goNext(); resetTimer(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 flex items-center justify-center border border-cyan-800 hover:border-cyan-400 text-cyan-600 hover:text-cyan-400 transition-all"
                        style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)', background: 'rgba(5,8,16,0.8)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}