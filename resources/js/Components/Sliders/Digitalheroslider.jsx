import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

/**
 * DigitalHeroSlider
 * Aesthetic: Glassmorphism SaaS / digital products.
 * Vivid mesh gradient backgrounds, frosted glass panels, floating badge pills,
 * smooth vertical slide transition, bold geometric sans typography.
 *
 * Props:
 *   sliders   {Array}
 *   className {string}
 */
export default function DigitalHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [sliding, setSliding] = useState(false);
    const [slideDir, setSlideDir] = useState('up');
    const count = sliders.length;

    const go = useCallback((idx) => {
        const dir = idx > current ? 'up' : 'down';
        setSlideDir(dir);
        setSliding(true);
        setTimeout(() => {
            setCurrent(idx);
            setSliding(false);
        }, 380);
    }, [current]);

    const goNext = useCallback(() => go((current + 1) % count), [current, count, go]);
    const goPrev = useCallback(() => go((current - 1 + count) % count), [current, count, go]);

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(goNext, 5800);
        return () => clearInterval(t);
    }, [goNext, count]);

    if (!count) return null;
    const slide = sliders[current];

    // Vivid gradient per index
    const gradients = [
        'linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)',
        'linear-gradient(135deg, #0ea5e9 0%, #6366f1 50%, #8b5cf6 100%)',
        'linear-gradient(135deg, #10b981 0%, #0ea5e9 50%, #6366f1 100%)',
        'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #ec4899 100%)',
        'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f59e0b 100%)',
    ];
    const bg = gradients[current % gradients.length];

    return (
        <div
            className={`relative w-full overflow-hidden rounded-none sm:rounded-2xl ${className}`}
            style={{ background: '#0f0720', fontFamily: "'system-ui', sans-serif" }}
        >
            {/* Animated mesh gradient backdrop */}
            <div className="absolute inset-0 transition-all duration-700" style={{ background: bg, opacity: 0.25 }} />
            <div className="absolute inset-0"
                style={{ backgroundImage: 'radial-gradient(ellipse 60% 70% at 70% 30%, rgba(255,255,255,0.07) 0%, transparent 60%)' }} />

            {/* Image */}
            <div
                className="relative transition-all duration-400"
                style={{
                    opacity: sliding ? 0 : 1,
                    transform: sliding ? (slideDir === 'up' ? 'translateY(-12px)' : 'translateY(12px)') : 'translateY(0)',
                }}
            >
                <img
                    src={`/storage/${slide.image}`}
                    alt={slide.title || ''}
                    className={`w-full object-cover object-center ${slide.mobile_image ? 'hidden md:block' : ''}`}
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
                {/* Gradient overlay */}
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to right, rgba(15,7,32,0.92) 0%, rgba(15,7,32,0.5) 50%, rgba(15,7,32,0.1) 100%)' }} />
                <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(15,7,32,0.95) 0%, transparent 50%)' }} />
            </div>

            {/* Frosted glass content panel */}
            <div
                className="absolute inset-0 z-10 flex flex-col justify-end px-5 sm:px-10 pb-8 sm:pb-12 transition-all duration-400"
                style={{
                    opacity: sliding ? 0 : 1,
                    transform: sliding ? 'translateY(8px)' : 'translateY(0)',
                }}
            >
                {/* Pill badge */}
                <div className="hidden sm:flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            color: '#e0d7ff',
                        }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                        Featured
                    </span>
                </div>

                {slide.title && (
                    <h2 className="font-black leading-none tracking-tight text-white"
                        style={{ fontSize: 'clamp(1.2rem, 4vw, 3rem)', letterSpacing: '-0.04em' }}>
                        {slide.title}
                    </h2>
                )}
                {slide.subtitle && (
                    <p className="mt-2 text-violet-200/70 text-sm hidden sm:block max-w-md font-medium">
                        {slide.subtitle}
                    </p>
                )}

                {slide.link && (
                    <Link href={slide.link}
                        className="mt-4 hidden sm:inline-flex self-start items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.03]"
                        style={{
                            background: bg,
                            boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
                        }}>
                        Get Started
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                        </svg>
                    </Link>
                )}
            </div>

            {/* Vertical dots */}
            {count > 1 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
                    {sliders.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            className={`rounded-full transition-all duration-300 ${i === current ? 'h-6 w-1.5 bg-violet-400' : 'h-1.5 w-1.5 bg-white/30 hover:bg-white/60'}`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows */}
            {count > 1 && (
                <>
                    <button onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button onClick={goNext}
                        className="absolute right-10 sm:right-12 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}