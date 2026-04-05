import { Link, usePage } from '@inertiajs/react';

export default function Footer() {
    // Access the global settings shared via HandleInertiaRequests middleware
    const { global_settings } = usePage().props;
    const settings = global_settings || {};

    return (
        <footer className="relative mt-20">

            {/* Newsletter Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-[-80px]">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-md text-center md:text-left">
                        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
                            {settings?.newsletter_title || 'Stay in the loop'}
                        </h2>
                        <p className="text-base text-gray-600">
                            {settings?.newsletter_subtitle || 'Get updates on new arrivals, special promotions, and exclusive offers.'}
                        </p>
                    </div>
                    
                    <form className="w-full md:w-auto flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                        <div className="relative flex-grow">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-w-[280px]"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="px-8 py-4 rounded-2xl font-bold text-white bg-indigo-600 transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95 whitespace-nowrap"
                        >
                            Subscribe Now
                        </button>
                    </form>
                </div>
            </div>

            {/* Main Footer */}
            <div className="pt-36 pb-8 md:pt-32 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col md:flex-row justify-between gap-10 mb-12 pb-12 border-b border-gray-200">

                        {/* Brand Column */}
                        <div className="flex-1 max-w-xs">
                            <div className="flex items-center gap-2 mb-4">
                                {settings?.site_logo ? (
                                    <img src={`/storage/${settings.site_logo}`} alt={settings?.site_name} className="h-8 md:h-10 w-auto" />
                                ) : (
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                )}
                                <h3 className="font-black text-2xl tracking-tight text-gray-900">
                                    {settings?.site_name || 'Your Brand'}
                                </h3>
                            </div>
                            
                            {/* Site Description */}
                            <p className="text-sm leading-relaxed mb-6 text-gray-600">
                                {settings?.site_description || 'Providing high-quality products and exceptional service directly to our customers worldwide.'}
                            </p>
                            
                            {/* Social Links matching the database structure */}
                            <div className="flex space-x-3">
                                {settings?.social_facebook && (
                                    <a href={settings.social_facebook} aria-label="Visit our Facebook page" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-500 transition duration-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                                    </a>
                                )}
                                {settings?.social_twitter && (
                                    <a href={settings.social_twitter} aria-label="Visit our Twitter page" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-500 transition duration-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                                    </a>
                                )}
                                {settings?.social_instagram && (
                                    <a href={settings.social_instagram} aria-label="Visit our Instagram page" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-500 transition duration-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                    </a>
                                )}
                                {settings?.social_linkedin && (
                                    <a href={settings.social_linkedin} aria-label="Visit our LinkedIn page" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center border border-gray-200 bg-white text-gray-500 transition duration-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Link Columns */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-[2]">
                            <div>
                                <h4 className="font-semibold uppercase tracking-widest mb-6 text-xs text-gray-900">Company</h4>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li><Link href="#" className="hover:text-indigo-600 transition">About Us</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Careers</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Blog</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Contact Us</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold uppercase tracking-widest mb-6 text-xs text-gray-900">Help</h4>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Customer Support</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Delivery Details</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Terms & Conditions</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Privacy Policy</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold uppercase tracking-widest mb-6 text-xs text-gray-900">Quick Links</h4>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li><Link href={route('dashboard')} className="hover:text-indigo-600 transition">My Account</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Track Order</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">FAQs</Link></li>
                                    <li><Link href="#" className="hover:text-indigo-600 transition">Return Policy</Link></li>
                                </ul>
                            </div>

                            {/* New Contact Column */}
                            <div>
                                <h4 className="font-semibold uppercase tracking-widest mb-6 text-xs text-gray-900">Contact Us</h4>
                                <ul className="space-y-4 text-sm text-gray-600">
                                    <li className="flex gap-2">
                                        <svg className="w-5 h-5 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <span>{settings?.site_address || '123 Main Street, City, Country'}</span>
                                    </li>
                                    {settings?.site_email && (
                                        <li className="flex gap-2">
                                            <svg className="w-5 h-5 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                            <a href={`mailto:${settings.site_email}`} className="hover:text-indigo-600 transition">{settings.site_email}</a>
                                        </li>
                                    )}
                                    {settings?.site_phone && (
                                        <li className="flex gap-2">
                                            <svg className="w-5 h-5 shrink-0 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                            <a href={`tel:${settings.site_phone}`} className="hover:text-indigo-600 transition">{settings.site_phone}</a>
                                        </li>
                                    )}
                                </ul>
                            </div>

                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500">
                            {settings?.site_name || 'Your Brand'} © {new Date().getFullYear()}, {settings?.copyright_text || 'All Rights Reserved'}
                        </p>
                        <div className="flex gap-3 flex-wrap justify-center">
                            {['bKash', 'Nagad', 'Visa', 'Mastercard'].map((pay, i) => (
                                <div key={i} className="px-3 py-1.5 rounded bg-white border border-gray-200 shadow-sm flex items-center justify-center min-w-[40px]">
                                    <span className="text-[10px] font-bold italic text-gray-500">{pay}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}