import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * BookStaticBanner
 * Aesthetic: Antique frame treatment — decorative corner ornaments, ribbon label,
 * warm sepia hover treatment.
 */
export default function BookStaticBanner({ banners = [], className = '' }) {
    const banner = banners?.[0];
    if (!banner) return null;

    const inner = (
        <div className="relative w-full h-full overflow-hidden"
            style={{ background: '#1a0f0a' }}>
            <img
                src={`/storage/${banner.image}`}
                alt={banner.title || 'Banner'}
                loading="lazy"
                className={`w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105 group-hover:sepia-[0.3] ${banner.mobile_image ? 'hidden md:block' : ''}`}
            />
            {banner.mobile_image && (
                <img
                    src={`/storage/${banner.mobile_image}`}
                    alt={banner.title || 'Banner'}
                    loading="lazy"
                    className="w-full h-full object-cover object-center md:hidden transition-all duration-700 group-hover:scale-105"
                />
            )}

            {/* Vignette */}
            <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(26,15,10,0.65) 100%)' }} />

            {/* Decorative corner ornaments */}
            {[
                'top-2 left-2 border-t-2 border-l-2 rounded-tl',
                'top-2 right-2 border-t-2 border-r-2 rounded-tr',
                'bottom-2 left-2 border-b-2 border-l-2 rounded-bl',
                'bottom-2 right-2 border-b-2 border-r-2 rounded-br',
            ].map((cls, i) => (
                <div key={i} className={`absolute w-5 h-5 border-amber-600/70 ${cls}`} />
            ))}

            {/* Ribbon label */}
            {banner.title && (
                <div className="absolute bottom-0 inset-x-0 flex justify-center pb-3">
                    <div className="px-4 py-1.5 text-center"
                        style={{
                            background: 'linear-gradient(135deg, #78350f, #92400e)',
                            clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0% 50%)',
                        }}>
                        <p className="text-amber-100 text-xs font-semibold tracking-wider"
                            style={{ fontFamily: "'Georgia', serif" }}>
                            {banner.title}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );

    const wrapperClass = `group block w-full h-full rounded-lg overflow-hidden shadow-xl border-2 border-amber-900/40 hover:border-amber-700/60 transition-all duration-300 ${className}`;

    return banner.link
        ? <Link href={banner.link} className={wrapperClass}>{inner}</Link>
        : <div className={wrapperClass}>{inner}</div>;
}