import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function FoodFooter() {
    const { global_settings } = usePage().props;
    const s = global_settings || {};

    const infoLinks = [
        { label: 'About us', href: '#' },
        { label: 'Contact us', href: '#' },
        { label: 'Company Information', href: '#' },
        { label: 'Ghorer Bazar Stories', href: '#' },
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Privacy Policy', href: '#' },
        { label: 'Careers', href: '#' },
    ];

    const shopByLinks = [
        { label: 'Oil & Ghee', href: '#' },
        { label: 'Honey', href: '#' },
        { label: 'Dates', href: '#' },
        { label: 'Spices', href: '#' },
        { label: 'Nuts & Seeds', href: '#' },
        { label: 'Beverage', href: '#' },
        { label: 'Functional Foods', href: '#' },
    ];

    const supportLinks = [
        { label: 'Support Center', href: '#' },
        { label: 'How to Order', href: '#' },
        { label: 'Order Tracking', href: '#' },
        { label: 'Payment', href: '#' },
        { label: 'Shipping', href: '#' },
        { label: 'FAQ', href: '#' },
    ];

    const policyLinks = [
        { label: 'Happy Return', href: '#' },
        { label: 'Refund Policy', href: '#' },
        { label: 'Exchange', href: '#' },
        { label: 'Cancellation', href: '#' },
        { label: 'Pre-Order', href: '#' },
        { label: 'Extra Discount', href: '#' },
    ];

    return (
        <footer className="bg-white border-t border-gray-200 mt-12" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Brand & Contact Column */}
                    <div className="lg:col-span-4 pr-0 lg:pr-8">
                        <Link href={route('home')} className="inline-block mb-6">
                            {s.site_logo ? (
                                <img src={`/storage/${s.site_logo}`} alt={s.site_name} className="h-12 w-auto object-contain" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: '#f8f9fa', border: '2px solid #ea580c' }}>
                                        <span style={{ color: '#01201d' }}>🌿</span>
                                    </div>
                                    <span className="text-xl font-bold tracking-tight text-[#ea580c] leading-none">
                                        GHORER<br/><span className="text-[#01201d]">BAZAR</span>
                                    </span>
                                </div>
                            )}
                        </Link>
                        
                        <p className="text-[14px] text-gray-500 leading-relaxed mb-6">
                            {s.site_description || 'Ghorer Bazar is an e-commerce platform dedicated to providing safe and reliable food to every home.'}
                        </p>

                        <div className="space-y-3 text-[14px] text-gray-600 mb-8">
                            {s.site_address && (
                                <div className="flex items-start gap-3">
                                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
                                    <span>{s.site_address}</span>
                                </div>
                            )}
                            {s.site_phone && (
                                <a href={`tel:${s.site_phone}`} className="flex items-center gap-3 hover:text-[#ea580c] transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span>{s.site_phone}</span>
                                </a>
                            )}
                            {s.site_email && (
                                <a href={`mailto:${s.site_email}`} className="flex items-center gap-3 hover:text-[#ea580c] transition-colors">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <span>{s.site_email}</span>
                                </a>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-3 mb-8">
                            {['facebook', 'twitter', 'instagram'].map((social) => {
                                const url = s[`social_${social}`] || '#';
                                const icons = {
                                    facebook: <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />,
                                    twitter: <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />,
                                    instagram: <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                };
                                return (
                                    <a key={social} href={url} target="_blank" rel="noreferrer" aria-label={social}
                                        className="w-8 h-8 rounded-full flex items-center justify-center bg-orange-50 text-[#ea580c] hover:bg-[#ea580c] hover:text-white transition-colors">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{icons[social]}</svg>
                                    </a>
                                );
                            })}
                        </div>

                        {/* App Download Placeholder */}
                        <div className="mb-4">
                            <p className="text-[14px] text-gray-700 mb-3">Download App on Mobile :</p>
                            <div className="flex gap-3">
                                {/* Placeholder App Store buttons - Use real images if available */}
                                <div className="bg-gray-800 text-white rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-700 transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5zm11.5-1.5h4v-1h-4v1zm-2-12h2v-2h-2v2zm0 4h2v-2h-2v2zm0 4h2v-2h-2v2z"/></svg>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase leading-none">Get it on</span>
                                        <span className="text-[13px] font-bold leading-none">Google Play</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-gray-100 transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.84 1.5.06 2.89.69 3.73 1.9-3.2 1.92-2.6 6.47.66 7.78-.71 1.76-1.78 3.65-2.97 3.33zM13.03 7.27c-.1-2.85 2.34-5.26 5.1-5.27.18 3.12-2.73 5.37-5.1 5.27z"/></svg>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] uppercase leading-none">Download on the</span>
                                        <span className="text-[13px] font-bold leading-none">App Store</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Columns 2-5: Link Lists */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-[15px] font-medium text-gray-900 mb-5">Information</h4>
                            <ul className="space-y-3">
                                {infoLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[14px] text-gray-500 hover:text-[#ea580c] transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-[15px] font-medium text-gray-900 mb-5">Shop By</h4>
                            <ul className="space-y-3">
                                {shopByLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[14px] text-gray-500 hover:text-[#ea580c] transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[15px] font-medium text-gray-900 mb-5">Support</h4>
                            <ul className="space-y-3">
                                {supportLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[14px] text-gray-500 hover:text-[#ea580c] transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-[15px] font-medium text-gray-900 mb-5">Consumer Policy</h4>
                            <ul className="space-y-3">
                                {policyLinks.map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-[14px] text-gray-500 hover:text-[#ea580c] transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </div>
            
            {/* Scroll to Top Arrow (Matching Image) */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex justify-end">
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 rounded-full border border-[#ea580c] text-[#ea580c] flex items-center justify-center hover:bg-[#ea580c] hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                </button>
            </div>
        </footer>
    );
}