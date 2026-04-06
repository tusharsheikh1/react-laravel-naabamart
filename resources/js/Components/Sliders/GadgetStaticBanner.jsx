import React from 'react';
import { Link } from '@inertiajs/react';

/**
 * GadgetStaticBanner
 * Aesthetic: Dark tech spec panel — neon border glow on hover, corner brackets,
 * "NEW" badge, cyan label strip.
 */
export default function GadgetStaticBanner({ banners = [], className = '' }) {
    const banner = banners?.[0];
    if (!banner) return null;

    const inner = (
        <div className="relative w-full h-full overflow-hidden"
            style={{ background: '#050810', fontFamily: "'Courier New', monospace" }}>

            <img
                src={`/storage/${banner.image}`}
                alt={banner.title || 'Banner'}
                loading="lazy"
                className={`w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-110 ${banner.mobile_image ? 'hidden md:block' : ''}`}
            />
            {banner.mobile_image && (
                <img
                    src={`/storage/${banner.mobile_image}`}
                    alt={banner.title || 'Banner'}
                    loading="lazy"
                    className="w-full h-full object-cover object-center md:hidden"
                />
            )}

            {/* Overlay */}
            <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(5,8,16,0.9) 0%, transparent 50%)' }} />

            {/* Scan lines */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,200,0.02) 3px, rgba(0,255,200,0.02) 4px)' }} />

            {/* Corner brackets */}
            {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls, i) => (
                <div key={i} className={`absolute w-4 h-4 border-cyan-500/60 group-hover:border-cyan-400 transition-colors ${cls}`} />
            ))}

            {/* NEW badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase"
                style={{ background: 'linear-gradient(135deg, #00ffcc, #0080ff)', color: '#050810', clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}>
                NEW
            </div>

            {/* Label */}
            {banner.title && (
                <div className="absolute bottom-0 inset-x-0 px-3 py-3 border-t border-cyan-900/60">
                    <p className="text-cyan-300 text-xs font-bold tracking-wider uppercase">&gt; {banner.title}</p>
                    {banner.subtitle && <p className="text-cyan-700 text-xs mt-0.5">{banner.subtitle}</p>}
                </div>
            )}
        </div>
    );

    const wrapperClass = `group block w-full h-full overflow-hidden border border-cyan-900/50 group-hover:border-cyan-400/60 shadow-[0_0_20px_rgba(0,255,200,0.05)] hover:shadow-[0_0_30px_rgba(0,255,200,0.15)] transition-all duration-400 ${className}`;

    return banner.link
        ? <Link href={banner.link} className={wrapperClass}>{inner}</Link>
        : <div className={wrapperClass}>{inner}</div>;
}