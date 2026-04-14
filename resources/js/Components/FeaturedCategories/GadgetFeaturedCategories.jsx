import React, { useRef } from 'react';
import { Link } from '@inertiajs/react';

// Premium fashion placeholder image
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80";

export default function GadgetFeaturedCategories({ featuredCategories = [] }) {
    const scrollContainerRef = useRef(null);
    const categoriesToDisplay = featuredCategories.slice(0, 12); // Increased limit for a better slider experience

    if (!categoriesToDisplay.length) return null;

    // Manual scroll controls for desktop convenience
    const scroll = (direction) => {
        const { current } = scrollContainerRef;
        const scrollAmount = 400;
        if (current) {
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="mb-16 md:px-2 relative group/section">
            
            {/* Elegant Section Header */}
            <div className="flex flex-col items-center justify-center mb-10 px-4">
                <h2 className="text-xl md:text-3xl font-serif tracking-[0.1em] text-gray-900 uppercase text-center">
                    The Collections
                </h2>
                <div className="mt-4 h-[1px] w-16 bg-black" />
            </div>

            {/* Desktop Navigation Arrows (Visible only on hover for clean look) */}
            <div className="hidden md:block">
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 backdrop-blur-sm border border-gray-100 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 -translate-x-4 group-hover/section:translate-x-2"
                    aria-label="Scroll Left"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/80 backdrop-blur-sm border border-gray-100 opacity-0 group-hover/section:opacity-100 transition-opacity duration-300 translate-x-4 group-hover/section:translate-x-2"
                    aria-label="Scroll Right"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>

            {/* SLIDER CONTAINER: Now horizontal for both mobile and desktop */}
            <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 md:gap-6 px-4 md:px-0 pb-6 snap-x snap-mandatory hide-scrollbar scroll-smooth"
            >
                {categoriesToDisplay.map(cat => (
                    <CollectionCard key={cat.id} category={cat} />
                ))}
            </div>

            {/* Hidden scrollbar utility */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </section>
    );
}

/**
 * Modern Collection Card with "Lookbook" Aesthetics
 */
function CollectionCard({ category }) {
    const getImageUrl = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    return (
        <Link
            href={route('shop', { category: category.id })}
            // Maintains the 3:4 portrait aspect ratio requested
            className="group relative flex-shrink-0 w-[160px] sm:w-[220px] md:w-[280px] aspect-[3/4] overflow-hidden snap-start bg-gray-50"
        >
            <img
                src={getImageUrl(category.image)}
                alt={category.name}
                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
                loading="lazy"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            <div className="absolute inset-0 p-5 flex flex-col justify-end items-center text-center">
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <h3 className="text-white font-serif text-lg md:text-xl font-medium tracking-wider mb-2 drop-shadow-md uppercase">
                        {category.name}
                    </h3>
                    <div className="overflow-hidden h-6">
                        <span className="block text-white/90 text-[10px] tracking-[0.3em] uppercase font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            Discover
                        </span>
                    </div>
                </div>
            </div>

            <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/0 group-hover:border-white/20 transition-all duration-700 pointer-events-none" />
        </Link>
    );
}