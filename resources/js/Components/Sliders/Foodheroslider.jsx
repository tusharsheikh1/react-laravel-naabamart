import React, { useState, useEffect, useCallback } from 'react';

export default function FoodHeroSlider({ sliders = [], className = '' }) {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    
    const defaultImage = "https://backoffice.ghorerbazar.com/banner/26q3s1771837303.jpeg";
    const displaySliders = sliders?.length > 0 ? sliders : [{ image: defaultImage }];
    const count = displaySliders.length;

    const go = useCallback((idx) => {
        setTransitioning(true);
        setTimeout(() => {
            setCurrent(idx);
            setTransitioning(false);
        }, 400);
    }, []);

    const goNext = useCallback(() => { if (count > 0) go((current + 1) % count); }, [current, count, go]);
    const goPrev = useCallback(() => { if (count > 0) go((current - 1 + count) % count); }, [current, count, go]);

    useEffect(() => {
        if (count <= 1) return;
        const t = setInterval(goNext, 5500);
        return () => clearInterval(t);
    }, [goNext, count]);

    const slide = displaySliders[current];

    const getImageUrl = (img) => {
        if (!img) return defaultImage;
        if (img.startsWith('http') || img.startsWith('https') || img.startsWith('data:')) return img;
        return `/storage/${img}`;
    };

    const handleImageError = (e) => { e.target.src = defaultImage; };

    return (
        <div
            className={`relative w-full h-full overflow-hidden ${className}`}
            style={{ background: '#1c0a00' }}
        >
            {/* Image */}
            <div
                className="relative h-full w-full transition-all duration-500"
                style={{
                    opacity: transitioning ? 0 : 1,
                    transform: transitioning ? 'scale(1.02)' : 'scale(1)',
                }}
            >
                <img
                    src={getImageUrl(slide?.image)}
                    alt={slide?.title || 'Food Banner'}
                    onError={handleImageError}
                    className={`w-full h-full object-cover object-center block ${slide?.mobile_image ? 'hidden md:block' : ''}`}
                />
                {slide?.mobile_image && (
                    <img
                        src={getImageUrl(slide.mobile_image)}
                        alt={slide?.title || 'Food Banner'}
                        onError={handleImageError}
                        className="w-full h-full object-cover object-center md:hidden"
                    />
                )}
            </div>

            {/* Text Overlay */}
            <div
                className="absolute inset-0 z-20 flex flex-col justify-end px-6 sm:px-10 pb-14 transition-all duration-500 pointer-events-none"
                style={{ opacity: transitioning ? 0 : 1 }}
            >
                {slide?.title && (
                    <h2
                        className="font-bold leading-tight text-white"
                        style={{
                            fontSize: 'clamp(1.2rem, 4vw, 3.2rem)',
                            fontFamily: "'Georgia', serif",
                            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                        }}>
                        {slide.title}
                    </h2>
                )}
                {slide?.subtitle && (
                    <p className="mt-2 max-w-md hidden sm:block text-white"
                        style={{
                            fontSize: '0.9rem',
                            fontStyle: 'italic',
                            textShadow: '0 2px 10px rgba(0,0,0,0.6)',
                        }}>
                        {slide.subtitle}
                    </p>
                )}
            </div>

            {/* Dots — bottom-left (matching screenshot) */}
            {count > 1 && (
                <div className="hidden md:flex absolute bottom-4 left-6 z-30 items-center gap-2">
                    {displaySliders.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i)}
                            className={`rounded-full transition-all duration-300 ${
                                i === current
                                    ? 'w-7 h-2.5 bg-orange-500'
                                    : 'w-2.5 h-2.5 bg-white/50 hover:bg-white'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Prev/Next Arrows */}
            {count > 1 && (
                <>
                    <button onClick={goPrev}
                        className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full items-center justify-center text-white hover:bg-orange-500/80 transition-all"
                        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <button onClick={goNext}
                        className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full items-center justify-center text-white hover:bg-orange-500/80 transition-all"
                        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </>
            )}
        </div>
    );
}