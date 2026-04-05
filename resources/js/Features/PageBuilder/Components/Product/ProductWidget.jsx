import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ProductSettings from './ProductSettings';

// ─── Responsive hook ──────────────────────────────────────────────────────
function useWindowWidth() {
    const [w, setW] = React.useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    React.useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return w;
}

// ─── Star rating ──────────────────────────────────────────────────────────
const Stars = ({ value = 5, color = '#f59e0b', size = 16 }) => (
    <span style={{ color, fontSize: size, letterSpacing: '-1px', lineHeight: 1 }}>
        {'★'.repeat(Math.min(5, Math.round(value)))}
        {'☆'.repeat(Math.max(0, 5 - Math.round(value)))}
    </span>
);

// ─── Trust badge pill ─────────────────────────────────────────────────────
const TrustPill = ({ icon, text, bg, color }) => (
    <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        backgroundColor: bg, color,
        fontSize: 12, fontWeight: 600,
        padding: '5px 12px', borderRadius: 999,
        border: `1px solid ${color}22`,
        whiteSpace: 'nowrap',
    }}>
        <span>{icon}</span>
        <span>{text}</span>
    </div>
);

// ─── Empty placeholder ────────────────────────────────────────────────────
const EmptyState = () => (
    <div style={{
        padding: '48px 24px',
        border: '2px dashed #cbd5e1',
        borderRadius: 16,
        textAlign: 'center',
        background: '#f8fafc',
        color: '#94a3b8',
    }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#64748b' }}>
            Dynamic Product Will Appear Here
        </div>
        <div style={{ fontSize: 13 }}>
            Link a product when creating this landing page.<br />
            All product data is pulled automatically from your store.
        </div>
    </div>
);

// ─── Main ProductWidget ───────────────────────────────────────────────────
export const ProductWidget = (props) => {
    const {
        // Data source
        selectedProductId,

        // Layout
        layout, maxWidth,
        bgType, bgColor, bgGradientFrom, bgGradientTo, bgGradientDirection,
        paddingTop, paddingBottom, paddingLeft, paddingRight,

        // Image
        imageRatio,         // '1:1' | '4:3' | '3:4' | '16:9' | 'auto'
        imageBorderRadius,
        imageShadow,
        showGallery,        // show thumbnail strip (uses product.gallery)

        // Badge
        showBadge, badgeText, badgeBg, badgeColor,

        // Title
        showTitle, titleSize, titleWeight, titleColor, titleLineHeight,

        // Price
        showPrice, priceColor, priceSize, priceWeight,
        showOriginalPrice, showDiscountBadge,
        currencySymbol,

        // Rating
        showRating, ratingValue, reviewCount, starColor,

        // Description
        showDescription, descriptionSize, descriptionColor, descriptionLines,

        // Specs / key points
        showSpecs, specs,

        // Trust badges
        showTrust, trustItems,

        // Stock indicator
        showStock, stockText, stockBg, stockColor,

        // CTA button
        showCta, ctaText, ctaUrl, ctaBg, ctaTextColor, ctaRadius, ctaSize,
        ctaSubText, ctaBorderColor,

        // Book info (auto-shown when product.type === 'book')
        showBookInfo,

        // Animation
        animation,
    } = props;

    const { connectors: { connect, drag } } = useNode();
    const { enabled: isEditor } = useEditor((state) => ({ enabled: state.options.enabled }));
    const { product: pageProduct, page } = usePage().props;
    const vw = useWindowWidth();
    const isMobile = vw < 640;

    // Gallery state
    const [activeImg, setActiveImg] = useState(0);

    // Fetch a specific product when selectedProductId is set
    const [dbProduct, setDbProduct] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    useEffect(() => {
        let mounted = true;
        const fetchId = selectedProductId || null;
        if (fetchId) {
            setIsFetching(true);
            axios.get(`/api/widget-products/${fetchId}`)
                .then(res => {
                    if (mounted) {
                        setDbProduct(res.data);
                        setActiveImg(0);
                        setIsFetching(false);
                    }
                })
                .catch(() => { if (mounted) setIsFetching(false); });
        } else {
            setDbProduct(null);
        }
        return () => { mounted = false; };
    }, [selectedProductId]);

    // Active product: fetched > page prop
    const product = dbProduct || pageProduct || null;

    // Resolve gallery images — handle local storage paths
    const resolveUrl = (raw) => {
        if (!raw) return null;
        if (raw.startsWith('http') || raw.startsWith('/')) return raw;
        return '/storage/' + raw;
    };

    let galleryImages = [];
    if (product?.images?.length > 0) {
        galleryImages = product.images
            .map(img => resolveUrl(img.image_url || img.url || img.image_path))
            .filter(Boolean);
    }
    if (galleryImages.length === 0 && product?.gallery?.length > 0) {
        galleryImages = product.gallery.map(resolveUrl).filter(Boolean);
    }
    if (galleryImages.length === 0 && product?.image_url) {
        galleryImages = [resolveUrl(product.image_url)];
    }
    if (galleryImages.length === 0 && product?.thumbnail) {
        galleryImages = [resolveUrl(product.thumbnail)];
    }

    const currentImage = galleryImages[activeImg] || '/placeholder.png';

    // Background
    let bg = bgColor;
    if (bgType === 'gradient') {
        bg = `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;
    }

    // Image aspect ratio padding
    const ratioMap = { '1:1': '100%', '4:3': '75%', '3:4': '133.33%', '16:9': '56.25%', 'auto': null };
    const ratioPad = ratioMap[imageRatio];

    // Responsive layout: on mobile, always stack
    const isHoriz = (layout === 'side-by-side' || layout === 'image-right') && !isMobile;
    const imgRight = layout === 'image-right' && !isMobile;

    // Shadow
    const shadowMap = {
        none: 'none',
        sm:   '0 2px 8px rgba(0,0,0,0.10)',
        md:   '0 8px 32px rgba(0,0,0,0.14)',
        lg:   '0 16px 56px rgba(0,0,0,0.18)',
    };

    // CTA button size
    const ctaPad = ctaSize === 'sm' ? '10px 22px' : ctaSize === 'lg' ? '16px 40px' : '13px 30px';
    const ctaFont = ctaSize === 'sm' ? 14 : ctaSize === 'lg' ? 18 : 16;

    // Calculate final price based on backend fields
    const regularPrice = Number(product?.price || 0);
    let finalPrice = regularPrice;

    if (product?.discount_value > 0) {
        if (product.discount_type === 'percent') {
            finalPrice = regularPrice - (regularPrice * (Number(product.discount_value) / 100));
        } else if (product.discount_type === 'fixed') {
            finalPrice = regularPrice - Number(product.discount_value);
        }
    }

    const hasDiscount = finalPrice < regularPrice;

    // Discount percent
    const discountPct = hasDiscount && regularPrice > 0
        ? Math.round(((regularPrice - finalPrice) / regularPrice) * 100)
        : null;

    // ── Book meta (only relevant when product.type === 'book') ──────────────
    const isBook = product?.type === 'book';
    const bookMeta = isBook ? [
        {
            icon: '✍️', label: 'লেখক',
            value: product.authors?.length
                ? product.authors.map(a => a.name).join(', ')
                : (product.author?.name || null),
        },
        {
            icon: '🏢', label: 'প্রকাশনী',
            value: product.publications?.length
                ? product.publications.map(p => p.name).join(', ')
                : (product.publication?.name || null),
        },
        {
            icon: '📄', label: 'পৃষ্ঠা',
            value: product.pages || product.total_pages || null,
        },
        {
            icon: '🌐', label: 'ভাষা',
            value: product.language || null,
        },
    ].filter(m => m.value) : [];

    // Animation variants
    const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22,1,0.36,1] } } };
    const anim = animation !== 'none';

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                background: bg,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
                width: '100%',
                boxSizing: 'border-box',
                opacity: isFetching ? 0.6 : 1,
                transition: 'opacity 0.2s',
            }}
        >
            <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto', width: '100%' }}>
                {!product ? (
                    <EmptyState />
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: isHoriz ? (imgRight ? 'row-reverse' : 'row') : 'column',
                        gap: isMobile ? 24 : 40,
                        alignItems: isHoriz ? 'flex-start' : 'stretch',
                    }}>

                        {/* ── IMAGE COLUMN ── */}
                        <motion.div
                            variants={anim ? fade : {}}
                            initial={anim ? 'hidden' : false}
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{ flex: isHoriz ? '0 0 48%' : '1', width: '100%' }}
                        >
                            {/* Main image */}
                            <div style={{
                                position: 'relative',
                                borderRadius: `${imageBorderRadius}px`,
                                overflow: 'hidden',
                                boxShadow: shadowMap[imageShadow] || 'none',
                                ...(ratioPad ? { paddingBottom: ratioPad } : {}),
                                background: '#f1f5f9',
                            }}>
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    style={{
                                        ...(ratioPad
                                            ? { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }
                                            : { width: '100%', display: 'block' }),
                                        objectFit: 'cover',
                                        transition: 'opacity 0.25s',
                                    }}
                                />

                                {/* Discount badge on image */}
                                {showDiscountBadge && discountPct && (
                                    <div style={{
                                        position: 'absolute', top: 12, left: 12,
                                        backgroundColor: '#ef4444', color: '#fff',
                                        fontSize: 13, fontWeight: 800,
                                        padding: '4px 10px', borderRadius: 8,
                                        boxShadow: '0 2px 8px rgba(239,68,68,0.4)',
                                    }}>
                                        -{discountPct}%
                                    </div>
                                )}

                                {/* Custom badge */}
                                {showBadge && badgeText && (
                                    <div style={{
                                        position: 'absolute', top: 12, right: 12,
                                        backgroundColor: badgeBg, color: badgeColor,
                                        fontSize: 12, fontWeight: 700,
                                        padding: '4px 12px', borderRadius: 999,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        textTransform: 'uppercase', letterSpacing: '0.05em',
                                    }}>
                                        {badgeText}
                                    </div>
                                )}
                            </div>

                            {/* Gallery thumbnails */}
                            {showGallery && galleryImages.length > 1 && (
                                <div style={{
                                    display: 'flex', gap: 8, marginTop: 10,
                                    flexWrap: 'wrap',
                                }}>
                                    {galleryImages.map((img, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => setActiveImg(i)}
                                            style={{
                                                width: 60, height: 60,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                border: `2px solid ${i === activeImg ? '#6366f1' : '#e2e8f0'}`,
                                                cursor: 'pointer',
                                                padding: 0,
                                                background: 'none',
                                                transition: 'border-color 0.15s',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* ── DETAILS COLUMN ── */}
                        <motion.div
                            variants={anim ? { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.12, ease: [0.22,1,0.36,1] } } } : {}}
                            initial={anim ? 'hidden' : false}
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 0,
                            }}
                        >
                            {/* Title */}
                            {showTitle && (
                                <h2 style={{
                                    fontSize: isMobile ? Math.max(18, titleSize * 0.78) : titleSize,
                                    fontWeight: titleWeight,
                                    color: titleColor,
                                    lineHeight: titleLineHeight,
                                    marginBottom: 10,
                                    letterSpacing: '-0.01em',
                                }}>
                                    {product.name}
                                </h2>
                            )}

                            {/* Rating */}
                            {showRating && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <Stars value={ratingValue} color={starColor} size={isMobile ? 14 : 16} />
                                    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                                        {ratingValue.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            {showPrice && (
                                <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                                    <span style={{
                                        fontSize: isMobile ? Math.max(20, priceSize * 0.85) : priceSize,
                                        fontWeight: priceWeight,
                                        color: priceColor,
                                        lineHeight: 1,
                                    }}>
                                        {currencySymbol}{Number(finalPrice).toLocaleString()}
                                    </span>
                                    {showOriginalPrice && hasDiscount && (
                                        <span style={{ fontSize: isMobile ? 15 : 18, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                                            {currencySymbol}{Number(regularPrice).toLocaleString()}
                                        </span>
                                    )}
                                    {showDiscountBadge && discountPct && (
                                        <span style={{
                                            fontSize: 13, fontWeight: 700, color: '#dc2626',
                                            backgroundColor: '#fef2f2', padding: '3px 8px',
                                            borderRadius: 6, border: '1px solid #fecaca',
                                        }}>
                                            Save {discountPct}%
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Stock indicator */}
                            {showStock && stockText && (
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    backgroundColor: stockBg, color: stockColor,
                                    fontSize: 12, fontWeight: 700,
                                    padding: '5px 12px', borderRadius: 8,
                                    marginBottom: 14,
                                    alignSelf: 'flex-start',
                                }}>
                                    <span style={{
                                        width: 7, height: 7, borderRadius: '50%',
                                        backgroundColor: stockColor, display: 'inline-block',
                                        animation: 'pulse 1.5s infinite',
                                    }} />
                                    {stockText}
                                </div>
                            )}

                            {/* ── Book Info (auto when type=book) ── */}
                            {(showBookInfo === true || (showBookInfo !== false && isBook)) && bookMeta.length > 0 && (
                                <div style={{ marginBottom: 16 }}>
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <tbody>
                                            {bookMeta.map((row, i) => (
                                                <tr key={i} style={{ borderBottom: i < bookMeta.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                    <td style={{
                                                        padding: '7px 12px 7px 0',
                                                        fontSize: 13, fontWeight: 600,
                                                        color: descriptionColor,
                                                        whiteSpace: 'nowrap',
                                                        verticalAlign: 'middle',
                                                        width: '1%',
                                                    }}>
                                                        <span style={{ marginRight: 6 }}>{row.icon}</span>{row.label}
                                                    </td>
                                                    <td style={{
                                                        padding: '7px 0',
                                                        fontSize: 13,
                                                        color: titleColor,
                                                        fontWeight: 500,
                                                        verticalAlign: 'middle',
                                                    }}>
                                                        {row.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Description */}
                            {showDescription && product.short_description && (
                                <p style={{
                                    fontSize: descriptionSize,
                                    color: descriptionColor,
                                    lineHeight: 1.65,
                                    marginBottom: 16,
                                    display: '-webkit-box',
                                    WebkitLineClamp: descriptionLines || 'none',
                                    WebkitBoxOrient: 'vertical',
                                    overflow: descriptionLines ? 'hidden' : 'visible',
                                }}>
                                    {product.short_description}
                                </p>
                            )}

                            {/* Specs / key points */}
                            {showSpecs && specs?.length > 0 && (
                                <div style={{ marginBottom: 18 }}>
                                    {specs.filter(s => s.show !== false).map((spec, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'flex-start', gap: 8,
                                            padding: '7px 0',
                                            borderBottom: i < specs.length - 1 ? '1px solid #f1f5f9' : 'none',
                                        }}>
                                            <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{spec.icon || '✓'}</span>
                                            <div style={{ flex: 1 }}>
                                                {spec.label && (
                                                    <span style={{ fontWeight: 700, fontSize: 13, color: titleColor, marginRight: 4 }}>
                                                        {spec.label}:
                                                    </span>
                                                )}
                                                <span style={{ fontSize: 13, color: descriptionColor }}>{spec.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Trust badges */}
                            {showTrust && trustItems?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                                    {trustItems.filter(t => t.show !== false).map((t, i) => (
                                        <TrustPill key={i} icon={t.icon} text={t.text} bg={t.bg || '#f0fdf4'} color={t.color || '#15803d'} />
                                    ))}
                                </div>
                            )}

                            {/* CTA Button */}
                            {showCta && ctaText && (
                                <div>
                                    <a
                                        href={ctaUrl || '#checkout'}
                                        onClick={e => {
                                            if (isEditor) { e.preventDefault(); return; }
                                            if (ctaUrl && ctaUrl.startsWith('#')) {
                                                e.preventDefault();
                                                const target = document.getElementById(ctaUrl.slice(1));
                                                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }}
                                        style={{
                                            display: 'inline-block',
                                            backgroundColor: ctaBg,
                                            color: ctaTextColor,
                                            border: ctaBorderColor ? `2px solid ${ctaBorderColor}` : 'none',
                                            borderRadius: `${ctaRadius}px`,
                                            padding: ctaPad,
                                            fontSize: ctaFont,
                                            fontWeight: 800,
                                            textDecoration: 'none',
                                            cursor: 'pointer',
                                            width: '100%',
                                            textAlign: 'center',
                                            boxShadow: `0 4px 20px ${ctaBg}55`,
                                            letterSpacing: '0.01em',
                                            boxSizing: 'border-box',
                                            transition: 'transform 0.15s, box-shadow 0.15s',
                                        }}
                                    >
                                        {ctaText}
                                    </a>
                                    {ctaSubText && (
                                        <p style={{ textAlign: 'center', fontSize: 12, color: descriptionColor, marginTop: 8, fontWeight: 500 }}>
                                            {ctaSubText}
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Pulse animation for stock dot */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
};

ProductWidget.craft = {
    displayName: 'Product Display',
    props: {
        // Data source
        selectedProductId: '',

        // Layout
        layout: 'side-by-side',   // 'stack' | 'side-by-side' | 'image-right' | 'centered'
        maxWidth: 1000,

        // Background
        bgType: 'color',
        bgColor: '#ffffff',
        bgGradientFrom: '#f8fafc',
        bgGradientTo: '#f1f5f9',
        bgGradientDirection: 180,

        // Spacing
        paddingTop: 56,
        paddingBottom: 56,
        paddingLeft: 24,
        paddingRight: 24,

        // Image
        imageRatio: '1:1',
        imageBorderRadius: 16,
        imageShadow: 'md',
        showGallery: true,

        // Badge
        showBadge: true,
        badgeText: 'Best Seller',
        badgeBg: '#fef3c7',
        badgeColor: '#d97706',

        // Title
        showTitle: true,
        titleSize: 30,
        titleWeight: '800',
        titleColor: '#0f172a',
        titleLineHeight: 1.2,

        // Price
        showPrice: true,
        priceColor: '#16a34a',
        priceSize: 34,
        priceWeight: '800',
        showOriginalPrice: true,
        showDiscountBadge: true,
        currencySymbol: '৳',

        // Rating
        showRating: true,
        ratingValue: 4.8,
        reviewCount: 238,
        starColor: '#f59e0b',

        // Description
        showDescription: true,
        descriptionSize: 15,
        descriptionColor: '#475569',
        descriptionLines: 4,

        // Book info (auto-shown for type=book, can be forced on/off)
        showBookInfo: true,

        // Specs
        showSpecs: true,
        specs: [
            { icon: '✅', label: 'Material',  value: '100% Premium Quality',          show: true },
            { icon: '🚚', label: 'Delivery',  value: '2–3 days across Bangladesh',    show: true },
            { icon: '💵', label: 'Payment',   value: 'Cash on Delivery available',    show: true },
            { icon: '↩️', label: 'Returns',   value: '7-day hassle-free return',      show: true },
            { icon: '🏷️', label: 'Warranty',  value: '6 months manufacturer warranty', show: true },
        ],

        // Trust badges
        showTrust: true,
        trustItems: [
            { icon: '🔒', text: '100% Secure',    bg: '#f0fdf4', color: '#15803d', show: true },
            { icon: '💵', text: 'Cash on Delivery', bg: '#fffbeb', color: '#d97706', show: true },
            { icon: '↩️', text: '7-Day Return',   bg: '#eff6ff', color: '#1d4ed8', show: true },
            { icon: '✅', text: 'Authentic',       bg: '#fdf4ff', color: '#7e22ce', show: true },
        ],

        // Stock
        showStock: true,
        stockText: '🔥 Only 12 left in stock!',
        stockBg: '#fef2f2',
        stockColor: '#dc2626',

        // CTA
        showCta: true,
        ctaText: '🛒 Order Now — Cash on Delivery',
        ctaUrl: '#checkout',
        ctaBg: '#16a34a',
        ctaTextColor: '#ffffff',
        ctaRadius: 12,
        ctaSize: 'lg',
        ctaSubText: 'No advance payment • Free delivery on orders above ৳999',
        ctaBorderColor: '',

        // Animation
        animation: 'fadeUp',
    },
    related: { settings: ProductSettings },
};