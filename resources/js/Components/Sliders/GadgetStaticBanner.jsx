import React from 'react';
import { Link } from '@inertiajs/react';

// Open-source fallback image strictly for broken links or missing storage files
const DEFAULT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80";

export default function GadgetStaticBanner({ banner }) {
    if (!banner) return null;

    // Helper to format image URLs safely from DB
    const getImageUrl = (path) => {
        if (!path) return DEFAULT_FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    const innerContent = (
        <>
            {/* Background Image with Hover Zoom */}
            <img 
                src={getImageUrl(banner.image)} 
                alt={banner.title || 'Promotional Banner'}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_FALLBACK_IMAGE;
                }}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
            />

            {/* Mobile specific image if provided by backend */}
            {banner.mobile_image && (
                <img
                    src={getImageUrl(banner.mobile_image)}
                    alt={banner.title || 'Promotional Banner'}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="absolute inset-0 w-full h-full object-cover object-center md:hidden group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                />
            )}

            {/* Elegant Dark Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-500" />

            {/* Text Content Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                
                {banner.subtitle && (
                    <span className="text-white text-xs md:text-sm uppercase tracking-[0.2em] font-medium mb-3 drop-shadow-md">
                        {banner.subtitle}
                    </span>
                )}
                
                {banner.title && (
                    <h3 className="text-white text-3xl md:text-4xl font-serif font-bold tracking-wider drop-shadow-lg">
                        {banner.title}
                    </h3>
                )}
                
                {/* Action button appears if there is a link attached to the banner in the DB */}
                {banner.link && (
                    <span className="mt-6 text-white text-xs uppercase tracking-[0.2em] font-bold border-b border-transparent group-hover:border-white transition-colors duration-300 pb-1">
                        Discover
                    </span>
                )}
            </div>
        </>
    );

    const wrapperClasses = "group relative block w-full h-64 md:h-80 overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm hover:shadow-xl transition-shadow duration-500 rounded-lg";

    return banner.link ? (
        <Link href={banner.link} className={wrapperClasses}>
            {innerContent}
        </Link>
    ) : (
        <div className={wrapperClasses}>
            {innerContent}
        </div>
    );
}