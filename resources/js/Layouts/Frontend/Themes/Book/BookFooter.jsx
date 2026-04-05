import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function BookFooter() {
    const { global_settings } = usePage().props;
    const s = global_settings || {};

    const navLinks = [
        { label: 'Home', href: route('home') },
        { label: 'Library', href: route('shop') },
        { label: 'Categories', href: route('categories.index') },
    ];

    return (
        <footer
            className="relative mt-24 overflow-hidden"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            {/* Decorative wave divider */}
            <div className="relative -mb-1">
                <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 60 }}>
                    <path d="M0 60 C360 0 1080 0 1440 60 L1440 60 L0 60Z" fill="#2c1f0e" />
                </svg>
            </div>

            <div style={{ background: '#2c1f0e' }}>
                {/* Main footer body */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

                        {/* Brand column */}
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3 mb-5">
                                {s.site_logo ? (
                                    <img src={`/storage/${s.site_logo}`} alt={s.site_name} className="h-10 w-auto object-contain" />
                                ) : (
                                    <span className="text-2xl font-bold" style={{ color: '#f0c070', fontFamily: "'Lora', serif" }}>
                                        {s.site_name || 'Bookery'}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm leading-relaxed mb-8" style={{ color: '#b8a080', maxWidth: 360 }}>
                                {s.site_description || 'Curating the finest collections of literature, authentic reads, and timeless classics for the avid reader.'}
                            </p>
                            {/* Social icons */}
                            <div className="flex gap-3">
                                {s.social_facebook && (
                                    <a href={s.social_facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                        style={{ background: 'rgba(240,192,112,0.12)', color: '#f0c070', border: '1px solid rgba(240,192,112,0.2)' }}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                    </a>
                                )}
                                {s.social_instagram && (
                                    <a href={s.social_instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                        style={{ background: 'rgba(240,192,112,0.12)', color: '#f0c070', border: '1px solid rgba(240,192,112,0.2)' }}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>
                                    </a>
                                )}
                                {s.social_twitter && (
                                    <a href={s.social_twitter} target="_blank" rel="noreferrer" aria-label="Twitter"
                                        className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                                        style={{ background: 'rgba(240,192,112,0.12)', color: '#f0c070', border: '1px solid rgba(240,192,112,0.2)' }}>
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Nav columns */}
                        <div className="md:col-span-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#f0c070' }}>Explore</h4>
                            <ul className="space-y-3">
                                {navLinks.map(({ label, href }) => (
                                    <li key={label}>
                                        <Link href={href} className="text-sm transition-colors" style={{ color: '#b8a080' }}
                                            onMouseEnter={e => e.target.style.color = '#f0c070'}
                                            onMouseLeave={e => e.target.style.color = '#b8a080'}>
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="md:col-span-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest mb-5" style={{ color: '#f0c070' }}>Contact</h4>
                            <ul className="space-y-4 text-sm" style={{ color: '#b8a080' }}>
                                {s.site_address && (
                                    <li className="flex gap-3">
                                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f0c070' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" />
                                            <circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                        </svg>
                                        <span>{s.site_address}</span>
                                    </li>
                                )}
                                {s.site_email && (
                                    <li className="flex gap-3">
                                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f0c070' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        <a href={`mailto:${s.site_email}`} className="hover:underline" style={{ color: '#b8a080' }}>{s.site_email}</a>
                                    </li>
                                )}
                                {s.site_phone && (
                                    <li className="flex gap-3">
                                        <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f0c070' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <a href={`tel:${s.site_phone}`} className="hover:underline" style={{ color: '#b8a080' }}>{s.site_phone}</a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(240,192,112,0.12)' }}>
                        <p className="text-xs" style={{ color: '#7a6a50' }}>
                            &copy; {new Date().getFullYear()} {s.site_name || 'Bookery'}. {s.copyright_text || 'All rights reserved.'}
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-xs" style={{ color: '#7a6a50' }}>Made with</span>
                            <svg className="w-3.5 h-3.5" style={{ color: '#f0c070' }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <span className="text-xs" style={{ color: '#7a6a50' }}>for book lovers</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}