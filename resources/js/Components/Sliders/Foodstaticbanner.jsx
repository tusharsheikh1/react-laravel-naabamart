import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * FoodStaticBanner
 * Aesthetic: Clean — rounded corners, appetising hover zoom, no text or overlays.
 */
export default function FoodStaticBanner({ banner, className = '' }) {
    // Default fallback image provided
    const defaultImage = "https://backoffice.ghorerbazar.com/banner/9weyd1775362946.jpeg";

    // Helper to format image URL and handle external links vs local storage
    const getImageUrl = (img) => {
        if (!img) return defaultImage;
        if (img.startsWith('http') || img.startsWith('https') || img.startsWith('data:')) return img;
        return `/storage/${img}`;
    };

    // Fallback if image fails to load (broken link, deleted file, etc.)
    const handleImageError = (e) => {
        e.target.src = defaultImage;
    };

    // Ensure we have an object to work with even if banner is undefined
    const displayBanner = banner || {};

    const inner = (
        <div className="relative w-full h-full overflow-hidden"
            style={{ background: '#1c0a00' }}>

            {/* Desktop / Main Image */}
            <img
                src={getImageUrl(displayBanner.image)}
                alt={displayBanner.title || 'Special Banner'}
                onError={handleImageError}
                loading="lazy"
                className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.07] ${displayBanner.mobile_image ? 'hidden md:block' : ''}`}
            />
            
            {/* Mobile Image (if available) */}
            {displayBanner.mobile_image && (
                <img
                    src={getImageUrl(displayBanner.mobile_image)}
                    alt={displayBanner.title || 'Special Banner'}
                    onError={handleImageError}
                    loading="lazy"
                    className="w-full h-full object-cover object-center md:hidden"
                />
            )}
        </div>
    );

    const wrapperClass = `group block w-full h-full overflow-hidden transition-all duration-300 ${className}`;

    // If there is a valid link, wrap in Inertia Link, otherwise just use a div
    return displayBanner.link
        ? <Link href={displayBanner.link} className={wrapperClass}>{inner}</Link>
        : <div className={wrapperClass}>{inner}</div>;
}