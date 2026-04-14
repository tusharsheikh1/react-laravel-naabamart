import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import useTranslation from '@/Hooks/useTranslation';

export default function GadgetFooter() {
    const { global_settings } = usePage().props;
    const { __ } = useTranslation();

    // Dynamic Data from Backend Settings
    const logo = global_settings?.site_logo;
    const siteName = global_settings?.site_name || "AURA";
    const email = global_settings?.contact_email;
    const phone = global_settings?.contact_phone;
    const address = global_settings?.contact_address;

    // Social Links
    const facebook = global_settings?.social_facebook;
    const instagram = global_settings?.social_instagram;
    const twitter = global_settings?.social_twitter;
    const youtube = global_settings?.social_youtube;

    return (
        <footer className="bg-white text-black pt-16 pb-8 border-t border-gray-200 font-sans selection:bg-black selection:text-white mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Top Section: Newsletter Sign-up (Crucial for Fashion E-commerce) */}
                <div className="flex flex-col items-center justify-center text-center mb-16 pb-16 border-b border-gray-100">
                    <h3 className="font-serif text-2xl md:text-3xl tracking-wide text-black mb-3">
                        {__('Join The List')}
                    </h3>
                    <p className="text-gray-500 text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-8 max-w-md">
                        {__('Sign up for exclusive updates, new arrivals, and insider-only discounts.')}
                    </p>
                    <form className="flex w-full max-w-md border-b border-black pb-2 relative group" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder={__('ENTER YOUR EMAIL')}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-xs tracking-widest placeholder-gray-400 px-0 text-black outline-none"
                            required
                        />
                        <button type="submit" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-black transition-colors">
                            {__('Subscribe')}
                        </button>
                    </form>
                </div>

                {/* Middle Section: Links & Info Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand / Contact */}
                    <div>
                        <Link href="/" className="inline-block mb-6 group">
                            {logo ? (
                                <img src={`/storage/${logo}`} alt={siteName} className="h-8 object-contain transition-transform group-hover:opacity-70" />
                            ) : (
                                <h4 className="font-serif font-black text-2xl tracking-widest uppercase text-black">{siteName}</h4>
                            )}
                        </Link>
                        <div className="space-y-4 text-xs text-gray-500 leading-relaxed">
                            {address && <p>{address}</p>}
                            {email && <p><a href={`mailto:${email}`} className="hover:text-black transition-colors">{email}</a></p>}
                            {phone && <p><a href={`tel:${phone}`} className="hover:text-black transition-colors">{phone}</a></p>}
                        </div>
                    </div>

                    {/* Column 2: Customer Care */}
                    <div>
                        <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-black mb-6">
                            {__('Customer Care')}
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="#" className="hover:text-black transition-colors">{__('Contact Us')}</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">{__('FAQs')}</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">{__('Shipping & Returns')}</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">{__('Track Order')}</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Explore */}
                    <div>
                        <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-black mb-6">
                            {__('Explore')}
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            <li><Link href="/about" className="hover:text-black transition-colors">{__('Our Story')}</Link></li>
                            <li><Link href={route('shop')} className="hover:text-black transition-colors">{__('Shop All')}</Link></li>
                            <li><Link href={route('categories.index')} className="hover:text-black transition-colors">{__('Collections')}</Link></li>
                            <li><Link href="#" className="hover:text-black transition-colors">{__('Careers')}</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Social Links */}
                    <div>
                        <h4 className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-black mb-6">
                            {__('Follow Us')}
                        </h4>
                        <ul className="space-y-4 text-sm text-gray-500">
                            {instagram && <li><a href={instagram} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Instagram</a></li>}
                            {facebook && <li><a href={facebook} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">Facebook</a></li>}
                            {twitter && <li><a href={twitter} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Twitter</a></li>}
                            {youtube && <li><a href={youtube} target="_blank" rel="noreferrer" className="hover:text-black transition-colors">YouTube</a></li>}
                            {/* Fallback if no socials are set in DB */}
                            {(!instagram && !facebook && !twitter && !youtube) && (
                                <>
                                    <li><a href="#" className="hover:text-black transition-colors">Instagram</a></li>
                                    <li><a href="#" className="hover:text-black transition-colors">Facebook</a></li>
                                    <li><a href="#" className="hover:text-black transition-colors">Pinterest</a></li>
                                </>
                            )}
                        </ul>
                    </div>

                </div>

                {/* Bottom Section: Copyright & Legal */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-[10px] text-gray-400 tracking-[0.15em] uppercase">
                    <p>&copy; {new Date().getFullYear()} {siteName}. {__('All Rights Reserved.')}</p>
                    <div className="flex gap-4 md:gap-6 mt-4 md:mt-0">
                        <Link href="/privacy-policy" className="hover:text-black transition-colors">{__('Privacy Policy')}</Link>
                        <Link href="/terms" className="hover:text-black transition-colors">{__('Terms & Conditions')}</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}