import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from '@inertiajs/react';

/**
 * GeneralHeroSlider — Editorial organic aesthetic
 * Crossfade transitions, warm overlays, refined typography.
 */
export default function GeneralHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [progressKey, setProgressKey] = useState(0);
    const timerRef = useRef(null);
    const count = sliders.length;

    const go = useCallback((idx) => {
        if (transitioning) return;
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(idx);
            setTransitioning(false);
            setProgressKey(k => k + 1);
        }, 420);
    }, [transitioning]);

    const next = useCallback(() => go((current + 1) % count), [current, count, go]);
    const prev = useCallback(() => go((current - 1 + count) % count), [current, count, go]);

    useEffect(() => {
        if (count <= 1) return;
        timerRef.current = setInterval(next, 6500);
        return () => clearInterval(timerRef.current);
    }, [next, count]);

    if (!count) return null;
    const slide = sliders[current];

    return (
        <>
            <style>{`
                .hs-root {
                    position: relative; width: 100%; overflow: hidden;
                    border-radius: 0;
                    background: #1a2a1a;
                    font-family: 'Georgia', 'Times New Roman', serif;
                }
                @media (min-width: 640px) { .hs-root { border-radius: 16px; } }

                /* Aspect ratio */
                .hs-aspect {
                    position: relative;
                    height: 200px;
                }
                @media (min-width: 480px) { .hs-aspect { height: 260px; } }
                @media (min-width: 768px) { .hs-aspect { height: 380px; } }
                @media (min-width: 1024px) { .hs-aspect { height: 460px; } }
                @media (min-width: 1280px) { .hs-aspect { height: 520px; } }

                /* Images */
                .hs-img {
                    position: absolute; inset: 0; width: 100%; height: 100%;
                    object-fit: cover; object-position: center;
                    transition: opacity 0.42s ease, transform 0.42s ease;
                    will-change: opacity, transform;
                }
                .hs-img.fading { opacity: 0; transform: scale(1.03); }
                .hs-img.visible { opacity: 1; transform: scale(1); }

                /* Overlays */
                .hs-overlay-lr {
                    position: absolute; inset: 0;
                    background: linear-gradient(90deg, rgba(15,28,15,0.82) 0%, rgba(15,28,15,0.35) 55%, transparent 100%);
                    pointer-events: none;
                }
                .hs-overlay-tb {
                    position: absolute; inset: 0;
                    background: linear-gradient(180deg, transparent 40%, rgba(10,20,10,0.55) 100%);
                    pointer-events: none;
                }

                /* Content */
                .hs-content {
                    position: absolute; inset: 0; z-index: 10;
                    display: flex; flex-direction: column; justify-content: flex-end;
                    padding: 20px 24px;
                    transition: opacity 0.42s ease, transform 0.42s ease;
                    will-change: opacity, transform;
                }
                @media (min-width: 640px) { .hs-content { padding: 32px 40px; } }
                @media (min-width: 1024px) { .hs-content { padding: 48px 56px; max-width: 640px; } }
                .hs-content.fading { opacity: 0; transform: translateY(8px); }
                .hs-content.visible { opacity: 1; transform: translateY(0); }

                .hs-accent { width: 32px; height: 3px; background: #a8e063; border-radius: 2px; margin-bottom: 14px; display: none; }
                @media (min-width: 640px) { .hs-accent { display: block; } }

                .hs-title {
                    font-family: 'Georgia', serif;
                    font-size: clamp(18px, 4vw, 48px);
                    font-weight: 700; color: #fff; line-height: 1.15;
                    letter-spacing: -0.025em;
                    text-shadow: 0 2px 16px rgba(0,0,0,0.3);
                    margin: 0 0 8px;
                }
                .hs-sub {
                    font-family: 'DM Sans', sans-serif;
                    font-size: clamp(12px, 1.5vw, 16px);
                    color: rgba(255,255,255,.78); font-weight: 300;
                    line-height: 1.55; letter-spacing: 0.02em;
                    margin: 0 0 20px; display: none;
                }
                @media (min-width: 640px) { .hs-sub { display: block; } }

                .hs-cta {
                    display: inline-flex; align-items: center; gap: 8px;
                    color: #a8e063; text-decoration: none;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase;
                    transition: gap 0.2s, color 0.2s;
                    align-self: flex-start;
                    display: none;
                }
                @media (min-width: 640px) { .hs-cta { display: inline-flex; } }
                .hs-cta:hover { color: #c4f080; gap: 12px; }

                /* Progress bar */
                .hs-progress {
                    position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
                    background: rgba(255,255,255,.15); z-index: 20;
                }
                .hs-progress-fill {
                    height: 100%; background: #a8e063; border-radius: 0 2px 2px 0;
                    animation: hs-prog 6.5s linear forwards;
                }
                @keyframes hs-prog { from { width: 0; } to { width: 100%; } }

                /* Dots */
                .hs-dots {
                    position: absolute; bottom: 16px; right: 20px; z-index: 20;
                    display: flex; align-items: center; gap: 6px;
                }
                .hs-dot {
                    border: none; cursor: pointer; padding: 0;
                    border-radius: 50px; background: rgba(255,255,255,.45);
                    transition: width 0.3s ease, background 0.3s ease;
                    height: 6px;
                }
                .hs-dot.active { width: 22px; background: #a8e063; border-radius: 3px; }
                .hs-dot:not(.active) { width: 6px; }
                .hs-dot:hover:not(.active) { background: rgba(255,255,255,.75); }

                /* Arrows */
                .hs-arrow {
                    position: absolute; top: 50%; z-index: 20;
                    transform: translateY(-50%);
                    width: 40px; height: 40px; border-radius: 50%;
                    background: rgba(255,255,255,.12);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,.22);
                    color: #fff; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background 0.2s, transform 0.2s;
                    display: none;
                }
                @media (min-width: 640px) { .hs-arrow { display: flex; } }
                .hs-arrow:hover { background: rgba(255,255,255,.26); transform: translateY(-50%) scale(1.08); }
                .hs-arrow-prev { left: 16px; }
                .hs-arrow-next { right: 16px; }

                /* Slide counter badge */
                .hs-counter {
                    position: absolute; top: 16px; right: 20px; z-index: 20;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 11px; font-weight: 700; letter-spacing: .06em;
                    color: rgba(255,255,255,.6);
                    display: none;
                }
                @media (min-width: 640px) { .hs-counter { display: block; } }
            `}</style>

            <div className={`hs-root ${className}`}>
                <div className="hs-aspect">
                    {/* Background image */}
                    <img
                        src={`/storage/${slide.image}`}
                        alt={slide.title || ''}
                        className={`hs-img ${transitioning ? 'fading' : 'visible'} ${slide.mobile_image ? 'hidden sm:block' : ''}`}
                        loading="eager"
                        fetchPriority="high"
                    />
                    {slide.mobile_image && (
                        <img
                            src={`/storage/${slide.mobile_image}`}
                            alt={slide.title || ''}
                            className={`hs-img sm:hidden ${transitioning ? 'fading' : 'visible'}`}
                            loading="eager"
                        />
                    )}

                    {/* Overlays */}
                    <div className="hs-overlay-lr" />
                    <div className="hs-overlay-tb" />

                    {/* Content */}
                    <div className={`hs-content ${transitioning ? 'fading' : 'visible'}`}>
                        <div className="hs-accent" />
                        {slide.title && <h2 className="hs-title">{slide.title}</h2>}
                        {slide.subtitle && <p className="hs-sub">{slide.subtitle}</p>}
                        {slide.link && (
                            <Link href={slide.link} className="hs-cta">
                                Explore Now
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                                </svg>
                            </Link>
                        )}
                    </div>

                    {/* Slide counter */}
                    {count > 1 && (
                        <span className="hs-counter">{current + 1} / {count}</span>
                    )}

                    {/* Progress bar */}
                    {count > 1 && (
                        <div className="hs-progress">
                            <div key={progressKey} className="hs-progress-fill" />
                        </div>
                    )}

                    {/* Dots */}
                    {count > 1 && (
                        <div className="hs-dots">
                            {sliders.map((_, i) => (
                                <button
                                    key={i}
                                    className={`hs-dot ${i === current ? 'active' : ''}`}
                                    onClick={() => go(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Arrows */}
                    {count > 1 && (
                        <>
                            <button className="hs-arrow hs-arrow-prev" onClick={prev} aria-label="Previous slide">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                                </svg>
                            </button>
                            <button className="hs-arrow hs-arrow-next" onClick={next} aria-label="Next slide">
                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}