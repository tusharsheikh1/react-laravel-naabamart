import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * StaticBanner — A purely static image component
 *
 * Props:
 * banners  {Array}   — Array of banner objects for this group.
 * Pass only the banners for the group you want,
 * e.g. banners.filter(b => b.group === 'banner_1')
 * className {string} — Optional extra wrapper classes.
 */
export default function StaticBanner({ banners, className = '' }) {
    // If no banners exist for this group, render nothing
    if (!banners || banners.length === 0) return null;

    // Banners are static — we only display the FIRST active item in the passed group
    const banner = banners[0];
    
    // Fallback images if the uploaded ones are broken
    const defaultDesktopImage = 'https://img.freepik.com/free-vector/black-friday-wide-orange-sale-grunge-banner_1017-34783.jpg?w=740&q=80';
    const defaultMobileImage = 'https://img.freepik.com/free-vector/horizontal-banner-template-black-friday-sales_23-2150867247.jpg?w=740&q=80';
    
    const desktopImgSrc = banner.image ? `/storage/${banner.image}` : defaultDesktopImage;
    const showMobileSpecificImage = Boolean(banner.mobile_image || !banner.image);
    const mobileImgSrc = banner.mobile_image ? `/storage/${banner.mobile_image}` : defaultMobileImage;

    const imgEl = (
        <>
            {/* Desktop image */}
            <img
                src={desktopImgSrc}
                alt={banner.title || 'Banner Promotion'}
                loading="lazy"
                className={`w-full h-full object-cover object-center rounded-lg shadow-sm ${showMobileSpecificImage ? 'hidden md:block' : 'block'}`}
                onError={(e) => {
                    if (e.target.src !== defaultDesktopImage) e.target.src = defaultDesktopImage;
                }}
            />
            
            {/* Mobile image */}
            {showMobileSpecificImage && (
                <img
                    src={mobileImgSrc}
                    alt={banner.title || 'Banner Promotion'}
                    loading="lazy"
                    className="w-full h-full object-cover object-center rounded-lg shadow-sm block md:hidden"
                    onError={(e) => {
                        if (e.target.src !== defaultMobileImage) e.target.src = defaultMobileImage;
                    }}
                />
            )}
        </>
    );

    return (
        <div className={`w-full relative overflow-hidden ${className}`}>
            {banner.link ? (
                <Link href={banner.link} className="block w-full h-full hover:opacity-95 transition-opacity">
                    {imgEl}
                </Link>
            ) : (
                <div className="w-full h-full">{imgEl}</div>
            )}
        </div>
    );
}