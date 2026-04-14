import React, { useState, useEffect, useCallback } from 'react';
import { Link } from '@inertiajs/react';

// Branded fallback image
const FALLBACK_IMAGE = "https://oppsbd.com/uploads/slider/2025-10-27-68ffb0ce9823a.png";

export default function GadgetHeroSlider({ sliders = [] }) {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const items = sliders.length > 0 ? sliders : [
        { 
            image: FALLBACK_IMAGE, 
            title: "New Collection", 
            subtitle: "Season Essentials", 
            link: "/shop" 
        }
    ];

    const nextSlide = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 1000);
    }, [items.length, isAnimating]);

    const prevSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent((prev) => (prev === 0 ? items.length - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 1000);
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    const getImageUrl = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    return (
        /* BEST PRACTICE HEIGHTS: 
           Mobile: 60vh - Tall enough for fashion portraits, short enough to show next section.
           Desktop: 85vh - Immersive luxury editorial feel.
        */
        <section className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden bg-gray-100">
            
            {items.map((slide, index) => {
                const hasText = !!(slide.title || slide.subtitle);

                return (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                    >
                        <div className="relative w-full h-full overflow-hidden">
                            <img
                                src={getImageUrl(slide.image)}
                                alt={slide.title || 'Hero Slide'}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = FALLBACK_IMAGE;
                                }}
                                className={`w-full h-full object-cover object-center transition-transform duration-[6000ms] ease-out ${
                                    index === current && hasText ? 'scale-110' : 'scale-100'
                                }`}
                            />
                            
                            {/* Overlay is applied only if text is present */}
                            {hasText && (
                                <div className="absolute inset-0 bg-black/20" />
                            )}
                        </div>

                        {/* Text Overlay Section */}
                        {hasText && (
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                                <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
                                    <div className="max-w-3xl mx-auto text-white">
                                        
                                        {/* Subtitle */}
                                        {slide.subtitle && (
                                            <p className={`text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase mb-4 transition-all duration-700 delay-300 ${
                                                index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                            }`}>
                                                {slide.subtitle}
                                            </p>
                                        )}

                                        {/* Title */}
                                        {slide.title && (
                                            <h2 className={`text-3xl md:text-7xl font-serif leading-tight mb-8 transition-all duration-1000 delay-500 ${
                                                index === current ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                            }`}>
                                                {slide.title}
                                            </h2>
                                        )}

                                        {/* Explore Button: Only shown if both Title and Subtitle exist */}
                                        {slide.title && slide.subtitle && (
                                            <div className={`transition-all duration-700 delay-700 ${
                                                index === current ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                                            }`}>
                                                <Link
                                                    href={slide.link || route('shop')}
                                                    className="inline-block bg-white text-black px-10 md:px-16 py-3 md:py-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase hover:bg-black hover:text-white transition-all duration-300 shadow-xl"
                                                >
                                                    Explore Collection
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Desktop Navigation Arrows */}
            <div className="hidden md:flex absolute bottom-12 right-12 z-20 items-center gap-4">
                <button 
                    onClick={prevSlide}
                    className="p-4 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button 
                    onClick={nextSlide}
                    className="p-4 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Slide Progress Dots */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {items.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => !isAnimating && setCurrent(i)}
                        className={`transition-all duration-500 ${
                            i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'
                        } h-[2px]`}
                    />
                ))}
            </div>

        </section>
    );
}