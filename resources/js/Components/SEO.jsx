import React from 'react';
import { Head, usePage } from '@inertiajs/react';

/**
 * SEO Component
 * * Handles dynamic meta tags for standard SEO, Open Graph (Facebook/LinkedIn), 
 * and Twitter cards.
 * * @param {string} title - Page-specific title
 * @param {string} description - Page-specific description
 * @param {string} keywords - Page-specific keywords
 * @param {string} image - Path to a specific social share image
 * @param {string} url - Canonical URL for the page
 */
export default function SEO({ title, description, keywords, image, url }) {
    // Retrieve global SEO settings passed from HandleInertiaRequests middleware
    const { seo } = usePage().props;

    // 1. Construct the Meta Title
    // Combines the page title with the separator and default site title
    const metaTitle = title 
        ? `${title}${seo.title_separator}${seo.default_title}` 
        : seo.default_title;
        
    // 2. Clean and Truncate Description
    // Strips HTML tags and limits length to recommended 160 characters
    const rawDescription = description || seo.default_description || '';
    const metaDescription = rawDescription
        .replace(/<[^>]*>?/gm, '') // Remove HTML tags
        .trim()
        .substring(0, 160);

    const metaKeywords = keywords || seo.default_keywords;
    
    // 3. Ensure Absolute Image URL
    // Social media crawlers require full URLs (e.g., https://site.com/image.jpg)
    let metaImage = image || seo.default_image;
    if (metaImage && !metaImage.startsWith('http')) {
        // Construct absolute path if a relative path was provided
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        metaImage = origin + (metaImage.startsWith('/') ? '' : '/') + metaImage;
    }

    // 4. Resolve Canonical URL
    const metaUrl = url || seo.current_url;

    return (
        <Head>
            {/* Standard SEO Tags */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            <meta name="keywords" content={metaKeywords} />
            <meta name="author" content={seo.author} />

            {/* Open Graph / Facebook / LinkedIn */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={metaUrl} />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={metaImage} />
        </Head>
    );
}