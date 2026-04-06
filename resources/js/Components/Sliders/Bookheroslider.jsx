import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

/**
 * BookHeroSlider
 * Aesthetic: Literary / antiquarian bookshop.
 * Aged parchment tones, deep burgundy/forest accents, elegant serif typography,
 * page-turn slide transition feel, chapter number indicator.
 *
 * Props:
 *   sliders   {Array}
 *   className {string}
 */
export default function BookHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [prev, setPrev]       = useState(null);
    const [dir, setDir]         = useState(1); // 1 = forward, -1 = back

    const count = sliders.length;

    const go = useCallback((idx, direction = 1) => {
        setPrev(current);
        setDir(direction);
        setCurrent(idx);
        setTimeout(() => setPrev(null), 600);
    }, [current]);

    const goNext = useCallback(() => go((current + 1) % count, 1), [current, count, go]);
    const goPrev = useCallback(() => go((current - 1 + count) % count, -1), [current, count, go]);

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(goNext, 6500);
        return () => clearInterval(t);
    }, [goNext, count]);

    if (!count) return null;

    const slide = sliders[current];

    return (
        <div
            className={`relative w-full overflow-hidden rounded-none sm:rounded-lg shadow-lg ${className}`}
            style={{
                background: '#1a0f0a',
                fontFamily: "'Georgia', 'Palatino Linotype', serif",
            }}
        >
            {/* Slide image with page-turn feel */}
            <div
                key={current}
                className="relative"
                style={{
                    animation: `bookSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
                    transformOrigin: dir === 1 ? 'left center' : 'right center',
                }}
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

                {/* Parchment vignette overlay */}
                <div className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to right, rgba(26,15,10,0.85) 0%, rgba(26,15,10,0.3) 45%, rgba(26,15,10,0.15) 100%)',
                    }}
                />
                <div className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(26,15,10,0.9) 0%, transparent 50%)',
                    }}
                />
            </div>

            {/* Text content */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end px-5 sm:px-10 pb-7 sm:pb-12"
                key={`content-${current}`}
                style={{ animation: 'bookFadeUp 0.7s 0.2s both' }}
            >
                {/* Chapter indicator */}
                <div className="hidden sm:flex items-center gap-2 mb-3">
                    <span className="text-amber-600/70 text-xs tracking-[0.25em] uppercase"
                        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                        {String(current + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
                    </span>
                    <div className="flex-1 max-w-[60px] h-px bg-amber-700/40" />
                </div>

                {slide.title && (
                    <h2 className="text-amber-50 font-bold leading-tight max-w-lg drop-shadow-2xl"
                        style={{ fontSize: 'clamp(1.1rem, 3.5vw, 2.8rem)', letterSpacing: '-0.01em' }}>
                        {slide.title}
                    </h2>
                )}
                {slide.subtitle && (
                    <p className="text-amber-200/70 mt-2 max-w-sm hidden sm:block italic"
                        style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)', fontWeight: 400 }}>
                        "{slide.subtitle}"
                    </p>
                )}
                {slide.link && (
                    <Link href={slide.link}
                        className="mt-4 hidden sm:inline-flex self-start items-center gap-2 px-5 py-2 border border-amber-700/60 text-amber-300 hover:bg-amber-900/40 transition-all text-xs tracking-widest uppercase rounded-sm"
                        style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                        Read More
                    </Link>
                )}
            </div>

            {/* Bookmark-style chapter tabs — right side */}
            {count > 1 && (
                <div className="absolute right-0 top-6 z-20 flex flex-col gap-1 hidden sm:flex">
                    {sliders.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i, i > current ? 1 : -1)}
                            className={`w-2.5 h-8 rounded-l-sm transition-all duration-300 ${i === current ? 'bg-amber-500 w-4' : 'bg-stone-700 hover:bg-stone-600'}`}
                        />
                    ))}
                </div>
            )}

            {/* Prev/Next */}
            {count > 1 && (
                <>
                    <button onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-amber-300/70 hover:text-amber-300 transition-colors"
                        style={{ background: 'rgba(26,15,10,0.6)', borderRadius: '2px' }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button onClick={goNext}
                        className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center text-amber-300/70 hover:text-amber-300 transition-colors"
                        style={{ background: 'rgba(26,15,10,0.6)', borderRadius: '2px' }}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}

            <style>{`
                @keyframes bookSlideIn {
                    from { opacity: 0.4; }
                    to   { opacity: 1; }
                }
                @keyframes bookFadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}