import React, { useEffect, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Editor, Frame } from '@craftjs/core';

// All widgets — MUST match Builder.jsx exactly
import { Container }            from '@/Features/PageBuilder/Components/Container';
import { HeadlineWidget }       from '@/Features/PageBuilder/Components/HeadlineWidget';
import { TextWidget }           from '@/Features/PageBuilder/Components/TextWidget';
import { ImageWidget }          from '@/Features/PageBuilder/Components/ImageWidget';
import { ImageSliderWidget }    from '@/Features/PageBuilder/Components/ImageSliderWidget';
import { BookWidget }           from '@/Features/PageBuilder/Components/Book/BookWidget';
import { HeroWidget }           from '@/Features/PageBuilder/Components/Hero/HeroWidget';
import { CheckoutWidget }       from '@/Features/PageBuilder/Components/Checkout/CheckoutWidget';
import { ProductWidget }        from '@/Features/PageBuilder/Components/Product/ProductWidget';
import { ProductVariantWidget } from '@/Features/PageBuilder/Components/ProductVariantWidget';
import { FeaturesWidget }       from '@/Features/PageBuilder/Components/Features/FeaturesWidget';
import { CountdownWidget }      from '@/Features/PageBuilder/Components/Countdown/CountdownWidget';
import { FaqWidget }            from '@/Features/PageBuilder/Components/FaqWidget';
import { TestimonialWidget }    from '@/Features/PageBuilder/Components/TestimonialWidget';
import { ButtonWidget }         from '@/Features/PageBuilder/Components/ButtonWidget';
import { VideoWidget }          from '@/Features/PageBuilder/Components/VideoWidget';
import { DividerWidget }        from '@/Features/PageBuilder/Components/DividerWidget';
import { CustomCodeWidget }     from '@/Features/PageBuilder/Components/CustomCodeWidget';

// Import FloatingContact component
import FloatingContact          from '@/Components/FloatingContact';

const RESOLVER = {
    Container,
    HeadlineWidget,
    TextWidget,
    ImageWidget,
    ImageSliderWidget,
    BookWidget,
    HeroWidget,
    CheckoutWidget,
    ProductWidget,
    ProductVariantWidget,
    FeaturesWidget,
    CountdownWidget,
    FaqWidget,
    TestimonialWidget,
    ButtonWidget,
    VideoWidget,
    DividerWidget,
    CustomCodeWidget,
};

export default function LandingPageShow({ page, product }) {
    const trackingScripts = page.tracking_scripts || {};
    const trackingInitialised = useRef(false);

    useEffect(() => {
        // Only run once per page mount — tracking pixels must not be double-fired.
        if (trackingInitialised.current) return;
        trackingInitialised.current = true;

        // ── Theme CSS variable ─────────────────────────────────────────────
        if (trackingScripts.theme_color) {
            document.documentElement.style.setProperty('--theme-color', trackingScripts.theme_color);
        }

        // ── Facebook Pixel(s) ──────────────────────────────────────────────
        const fbPixels = trackingScripts.fb_pixels
            ? trackingScripts.fb_pixels.split(',').map(p => p.trim()).filter(Boolean)
            : [];

        fbPixels.forEach(pixel => {
            if (!pixel) return;

            if (typeof window.fbq === 'function') {
                window.fbq('init', pixel);
                window.fbq('track', 'PageView');
            } else {
                !function(f,b,e,v,n,t,s){
                    if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)
                }(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

                window.fbq('init', pixel);
                window.fbq('track', 'PageView');
            }
        });
    }, []);

    const savedJson = (() => {
        if (!page?.content_json) return null;
        if (typeof page.content_json === 'string') return page.content_json;
        return JSON.stringify(page.content_json);
    })();

    // ── SEO Logic ──────────────────────────────────────────────────────
    const metaTitle = page.meta_title || page.title;
    const metaDescription = page.meta_description || product?.short_description || '';
    
    // Determine the Meta Image: 
    // 1. Manual Meta Image from Landing Page settings
    // 2. Primary Product Image
    // 3. First Image in the product gallery
    const metaImageUrl = page.meta_image || product?.image_url || product?.images?.[0]?.image_url;

    // Construct Canonical URL
    const canonicalUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/lp/${page.slug}` 
        : '';

    return (
        <>
            <Head>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="product.item" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={metaTitle} />
                <meta property="og:description" content={metaDescription} />
                {metaImageUrl && <meta property="og:image" content={metaImageUrl} />}

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content={canonicalUrl} />
                <meta name="twitter:title" content={metaTitle} />
                <meta name="twitter:description" content={metaDescription} />
                {metaImageUrl && <meta name="twitter:image" content={metaImageUrl} />}

                {/* Hind Siliguri Font Import */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            {/* Global Styles for Bangla Support */}
            <style dangerouslySetInnerHTML={{ __html: `
                .lp-bangla-font {
                    font-family: 'Hind Siliguri', sans-serif !important;
                }
                .builder-wrapper {
                    font-family: 'Hind Siliguri', sans-serif;
                }
            `}} />

            {/* Inject custom CSS from tracking scripts */}
            {trackingScripts.custom_css && (
                <style dangerouslySetInnerHTML={{ __html: trackingScripts.custom_css }} />
            )}

            <div className="w-full overflow-x-hidden min-h-screen bg-white builder-wrapper">
                <Editor enabled={false} resolver={RESOLVER}>
                    {savedJson && <Frame data={savedJson} />}
                </Editor>
            </div>

            {/* Inject custom JS */}
            {trackingScripts.custom_js && (
                <script dangerouslySetInnerHTML={{ __html: trackingScripts.custom_js }} />
            )}

            {/* Render the Floating Contact Component */}
            <FloatingContact />
        </>
    );
}