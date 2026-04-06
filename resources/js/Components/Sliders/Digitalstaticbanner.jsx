import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * DigitalStaticBanner
 * Aesthetic: Glassmorphism card — frosted glass label, gradient border glow,
 * floating pill badge, smooth hover lift.
 */
export default function DigitalStaticBanner({ banners = [], className = '' }) {
    const banner = banners?.[0];
    if (!banner) return null;

    const inner = (
        <div className="relative w-full h-full overflow-hidden"
            style={{ background: '#0f0720' }}>

            <img
                src={`/storage/${banner.image}`}
                alt={banner.title || 'Banner'}
                loading="lazy"
                className={`w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.06] ${banner.mobile_image ? 'hidden md:block' : ''}`}
            />
            {banner.mobile_image && (
                <img
                    src={`/storage/${banner.mobile_image}`}
                    alt={banner.title || 'Banner'}
                    loading="lazy"
                    className="w-full h-full object-cover object-center md:hidden"
                />
            )}

            {/* Mesh overlay */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(15,7,32,0.9) 0%, rgba(15,7,32,0.2) 60%, transparent 100%)' }} />
            <div className="absolute inset-0"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.15) 0%, transparent 60%)' }} />

            {/* Floating badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold text-violet-200 tracking-wider"
                style={{ background: 'rgba(139,92,246,0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(139,92,246,0.4)' }}>
                PROMO
            </div>

            {/* Glass label */}
            {(banner.title || banner.subtitle) && (
                <div className="absolute bottom-3 inset-x-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    {banner.title && (
                        <p className="text-white text-sm font-bold tracking-tight">{banner.title}</p>
                    )}
                    {banner.subtitle && (
                        <p className="text-violet-300/70 text-xs mt-0.5">{banner.subtitle}</p>
                    )}
                </div>
            )}
        </div>
    );

    const wrapperClass = `group block w-full h-full rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)] ${className}`;

    return banner.link
        ? <Link href={banner.link} className={wrapperClass}>{inner}</Link>
        : <div className={wrapperClass}>{inner}</div>;
}