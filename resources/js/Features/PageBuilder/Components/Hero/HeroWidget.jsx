import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { motion } from 'framer-motion';
import HeroSettings from './HeroSettings';

// ─── Animation variant builder ─────────────────────────────────────────────
function makeVariants(animation, delay = 0) {
    const transitions = { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay };
    const base = { visible: { opacity: 1, y: 0, x: 0, scale: 1, transition: transitions } };

    switch (animation) {
        case 'fade':      return { hidden: { opacity: 0 }, ...base };
        case 'slideUp':   return { hidden: { opacity: 0, y: 60 }, ...base };
        case 'slideDown': return { hidden: { opacity: 0, y: -60 }, ...base };
        case 'slideLeft': return { hidden: { opacity: 0, x: 60 }, ...base };
        case 'slideRight':return { hidden: { opacity: 0, x: -60 }, ...base };
        case 'zoomIn':    return { hidden: { opacity: 0, scale: 0.85 }, ...base };
        case 'zoomOut':   return { hidden: { opacity: 0, scale: 1.1 }, ...base };
        default:          return { hidden: { opacity: 1 }, ...base };
    }
}

// ─── Decorative background shape ─────────────────────────────────────────
const DecorShape = ({ shape, color, opacity }) => {
    if (shape === 'none') return null;

    const baseStyle = {
        position: 'absolute',
        pointerEvents: 'none',
        opacity: opacity / 100,
    };

    if (shape === 'blob-tr') return (
        <svg style={{ ...baseStyle, top: '-10%', right: '-5%', width: '45%', maxWidth: 400 }} viewBox="0 0 400 400" fill="none">
            <path d="M200 0C310 0 400 90 400 200C400 290 340 380 240 395C140 410 20 350 2 250C-16 150 40 40 120 10C147-1 174 0 200 0Z" fill={color} />
        </svg>
    );
    if (shape === 'blob-bl') return (
        <svg style={{ ...baseStyle, bottom: '-10%', left: '-5%', width: '40%', maxWidth: 360 }} viewBox="0 0 400 400" fill="none">
            <path d="M200 400C90 400 0 310 0 200C0 110 60 20 160 5C260-10 380 50 398 150C416 250 360 360 280 390C254 400 227 400 200 400Z" fill={color} />
        </svg>
    );
    if (shape === 'circle-tr') return (
        <div style={{ ...baseStyle, top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', backgroundColor: color }} />
    );
    if (shape === 'grid') return (
        <svg style={{ ...baseStyle, inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="hero-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={color} strokeWidth="0.5" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
    );
    if (shape === 'dots') return (
        <svg style={{ ...baseStyle, inset: 0, width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
                <pattern id="hero-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill={color} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-dots)" />
        </svg>
    );
    if (shape === 'waves') return (
        <svg style={{ ...baseStyle, bottom: 0, left: 0, right: 0, width: '100%' }} viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill={color} />
        </svg>
    );
    return null;
};

// ─── Button component ──────────────────────────────────────────────────────
const HeroButton = ({ text, url, style, bgColor, textColor, borderColor, borderRadius, size, isEditor = false }) => {
    const padMap  = { sm: '8px 20px', md: '12px 28px', lg: '16px 40px', xl: '20px 52px' };
    const fontMap = { sm: '13px', md: '15px', lg: '17px', xl: '19px' };

    const base = {
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: padMap[size] || padMap.lg,
        fontSize: fontMap[size] || fontMap.lg,
        fontWeight: 700,
        borderRadius: `${borderRadius}px`,
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
    };

    const handleClick = (e) => {
        if (isEditor) {
            e.preventDefault();
            return;
        }
        if (url && url.startsWith('#')) {
            e.preventDefault();
            const target = document.getElementById(url.slice(1));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (style === 'solid') return (
        <a href={url || '#'} onClick={handleClick} style={{ ...base, backgroundColor: bgColor, color: textColor, border: 'none', boxShadow: `0 4px 20px ${bgColor}55` }}>
            {text}
        </a>
    );
    if (style === 'outline') return (
        <a href={url || '#'} onClick={handleClick} style={{ ...base, backgroundColor: 'transparent', color: borderColor, border: `2px solid ${borderColor}` }}>
            {text}
        </a>
    );
    if (style === 'ghost') return (
        <a href={url || '#'} onClick={handleClick} style={{ ...base, backgroundColor: `${bgColor}20`, color: bgColor, border: 'none' }}>
            {text}
        </a>
    );
    if (style === 'link') return (
        <a href={url || '#'} onClick={handleClick} style={{ ...base, backgroundColor: 'transparent', color: bgColor, border: 'none', padding: '0', textDecoration: 'underline', fontWeight: 600 }}>
            {text} →
        </a>
    );
    return null;
};

// ─── Main Hero widget ──────────────────────────────────────────────────────
export const HeroWidget = (props) => {
    const {
        // Background
        bgType, bgColor,
        bgGradientFrom, bgGradientTo, bgGradientDirection,
        bgImage, bgImageSize, bgImagePosition,
        overlayColor, overlayOpacity,

        // Hero Image
        showHeroImage, heroImagePos, heroImageUrl,
        heroImageWidth, heroImageRadius, heroImageShadow,

        // Layout
        minHeight, paddingTop, paddingBottom, paddingLeft, paddingRight,
        contentAlign, contentMaxWidth, contentVerticalAlign,

        // Badge
        showBadge, badgeText, badgeColor, badgeBgColor,

        // Title
        title, titleSize, titleWeight, titleColor,
        titleLineHeight, titleLetterSpacing,

        // Subtitle
        subtitle, subtitleSize, subtitleColor, subtitleMaxWidth,
        subtitleLineHeight,

        // Primary button
        showPrimaryBtn, primaryBtnText, primaryBtnUrl,
        primaryBtnStyle, primaryBtnBgColor, primaryBtnTextColor,
        primaryBtnBorderColor, primaryBtnBorderRadius, primaryBtnSize,

        // Secondary button
        showSecondaryBtn, secondaryBtnText, secondaryBtnUrl,
        secondaryBtnStyle, secondaryBtnBgColor, secondaryBtnTextColor,
        secondaryBtnBorderColor, secondaryBtnBorderRadius, secondaryBtnSize,

        // Stats / social proof strip
        showStats, stats,

        // Decorative shape
        decorShape, decorColor, decorOpacity,

        // Animation
        animation, animationDelay,
    } = props;

    const { connectors: { connect, drag } } = useNode();
    const { enabled: isEditor } = useEditor((state) => ({ enabled: state.options.enabled }));

    // Build background CSS
    let bg = bgColor;
    if (bgType === 'gradient') {
        bg = `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;
    }
    const bgImgStyle = bgType === 'image' && bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: bgImageSize, backgroundPosition: bgImagePosition, backgroundRepeat: 'no-repeat' }
        : {};

    // Alignment classes for text
    const alignMap = {
        left:   { text: 'text-left',   items: 'items-start',  mx: '' },
        center: { text: 'text-center', items: 'items-center', mx: 'mx-auto' },
        right:  { text: 'text-right',  items: 'items-end',    mx: 'ml-auto' },
    };
    const align = alignMap[contentAlign] || alignMap.center;

    const verticalMap = {
        top:    'justify-start',
        center: 'justify-center',
        bottom: 'justify-end',
    };

    const titleVariants    = makeVariants(animation, parseFloat(animationDelay));
    const subtitleVariants = makeVariants(animation, parseFloat(animationDelay) + 0.1);
    const btnVariants      = makeVariants(animation, parseFloat(animationDelay) + 0.2);
    const statsVariants    = makeVariants(animation, parseFloat(animationDelay) + 0.3);
    const imageVariants    = makeVariants(animation, parseFloat(animationDelay) + 0.4);

    const isAnimated = animation !== 'none';

    // Figure out flex container alignment for image vs text
    let flexLayoutClass = 'flex-col';
    if (showHeroImage) {
        if (heroImagePos === 'right') flexLayoutClass = 'flex-col lg:flex-row';
        else if (heroImagePos === 'left') flexLayoutClass = 'flex-col lg:flex-row-reverse';
        else if (heroImagePos === 'top') flexLayoutClass = 'flex-col-reverse';
        else if (heroImagePos === 'bottom') flexLayoutClass = 'flex-col';
    }

    const isSideBySide = showHeroImage && (heroImagePos === 'left' || heroImagePos === 'right');

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                background: bg,
                ...bgImgStyle,
                minHeight: `${minHeight}px`,
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
            className={`w-full ${verticalMap[contentVerticalAlign] || 'justify-center'}`}
        >
            {/* Overlay */}
            {overlayOpacity > 0 && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity / 100,
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            )}

            {/* Decorative shape */}
            <DecorShape shape={decorShape} color={decorColor} opacity={decorOpacity} />

            {/* Main content wrapper */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: contentMaxWidth ? `${contentMaxWidth}px` : '900px',
                    width: '100%',
                    margin: '0 auto',
                    paddingTop: `${paddingTop}px`,
                    paddingBottom: `${paddingBottom}px`,
                    paddingLeft: `${paddingLeft}px`,
                    paddingRight: `${paddingRight}px`,
                }}
            >
                <div className={`flex w-full items-center gap-8 lg:gap-12 ${flexLayoutClass}`}>
                    
                    {/* Text Section */}
                    <div className={`flex flex-col ${align.items} ${align.text} ${isSideBySide ? 'lg:w-1/2' : 'w-full'}`}>
                        {/* Badge */}
                        {showBadge && badgeText && (
                            <motion.div
                                initial={isAnimated ? { opacity: 0, y: -10 } : false}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: parseFloat(animationDelay) }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    backgroundColor: badgeBgColor,
                                    color: badgeColor,
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    padding: '5px 14px',
                                    borderRadius: '999px',
                                    marginBottom: '20px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    border: `1px solid ${badgeColor}30`,
                                }}
                            >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: badgeColor, display: 'inline-block' }} />
                                {badgeText}
                            </motion.div>
                        )}

                        {/* Title */}
                        <motion.h1
                            variants={titleVariants}
                            initial={isAnimated ? 'hidden' : 'visible'}
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{
                                fontSize: `${titleSize}px`,
                                fontWeight: titleWeight,
                                color: titleColor,
                                lineHeight: titleLineHeight,
                                letterSpacing: `${titleLetterSpacing}em`,
                                marginBottom: '16px',
                                width: '100%',
                            }}
                        >
                            {title}
                        </motion.h1>

                        {/* Subtitle */}
                        {subtitle && (
                            <motion.p
                                variants={subtitleVariants}
                                initial={isAnimated ? 'hidden' : 'visible'}
                                whileInView="visible"
                                viewport={{ once: true }}
                                style={{
                                    fontSize: `${subtitleSize}px`,
                                    color: subtitleColor,
                                    lineHeight: subtitleLineHeight,
                                    maxWidth: subtitleMaxWidth ? `${subtitleMaxWidth}px` : '100%',
                                    marginBottom: (showPrimaryBtn || showSecondaryBtn) ? '36px' : '0',
                                }}
                                className={align.mx}
                            >
                                {subtitle}
                            </motion.p>
                        )}

                        {/* Buttons */}
                        {(showPrimaryBtn || showSecondaryBtn) && (
                            <motion.div
                                variants={btnVariants}
                                initial={isAnimated ? 'hidden' : 'visible'}
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="flex flex-wrap gap-3"
                                style={{
                                    justifyContent: contentAlign === 'center' ? 'center' : contentAlign === 'right' ? 'flex-end' : 'flex-start',
                                    marginBottom: showStats ? '40px' : '0',
                                }}
                            >
                                {showPrimaryBtn && (
                                    <HeroButton
                                        text={primaryBtnText}
                                        url={primaryBtnUrl}
                                        style={primaryBtnStyle}
                                        bgColor={primaryBtnBgColor}
                                        textColor={primaryBtnTextColor}
                                        borderColor={primaryBtnBorderColor}
                                        borderRadius={primaryBtnBorderRadius}
                                        size={primaryBtnSize}
                                        isEditor={isEditor}
                                    />
                                )}
                                {showSecondaryBtn && (
                                    <HeroButton
                                        text={secondaryBtnText}
                                        url={secondaryBtnUrl}
                                        style={secondaryBtnStyle}
                                        bgColor={secondaryBtnBgColor}
                                        textColor={secondaryBtnTextColor}
                                        borderColor={secondaryBtnBorderColor}
                                        borderRadius={secondaryBtnBorderRadius}
                                        size={secondaryBtnSize}
                                        isEditor={isEditor}
                                    />
                                )}
                            </motion.div>
                        )}

                        {/* Stats strip */}
                        {showStats && stats?.length > 0 && (
                            <motion.div
                                variants={statsVariants}
                                initial={isAnimated ? 'hidden' : 'visible'}
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="flex flex-wrap gap-6"
                                style={{
                                    justifyContent: contentAlign === 'center' ? 'center' : contentAlign === 'right' ? 'flex-end' : 'flex-start',
                                    paddingTop: '32px',
                                    borderTop: `1px solid ${titleColor}20`,
                                    marginTop: '4px',
                                }}
                            >
                                {stats.filter(s => s.show).map((stat, i) => (
                                    <div key={i} className={align.text} style={{ color: titleColor }}>
                                        <div style={{ fontSize: '28px', fontWeight: 800, lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
                                        <div style={{ fontSize: '13px', opacity: 0.7, fontWeight: 500 }}>{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* Image Section */}
                    {showHeroImage && heroImageUrl && (
                        <div className={`flex justify-center w-full ${isSideBySide ? 'lg:w-1/2' : ''}`}>
                            <motion.img
                                variants={imageVariants}
                                initial={isAnimated ? 'hidden' : 'visible'}
                                whileInView="visible"
                                viewport={{ once: true }}
                                src={heroImageUrl}
                                alt="Hero Feature"
                                className={heroImageShadow ? 'shadow-2xl' : ''}
                                style={{
                                    width: `${heroImageWidth}%`,
                                    borderRadius: `${heroImageRadius}px`,
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

HeroWidget.craft = {
    displayName: 'Hero Section',
    props: {
        // Background
        bgType: 'gradient',
        bgColor: '#1e293b',
        bgGradientFrom: '#1e293b',
        bgGradientTo: '#334155',
        bgGradientDirection: 135,
        bgImage: '',
        bgImageSize: 'cover',
        bgImagePosition: 'center',
        overlayColor: '#000000',
        overlayOpacity: 0,

        // Hero Image
        showHeroImage: false,
        heroImagePos: 'right',
        heroImageUrl: '',
        heroImageWidth: 100,
        heroImageRadius: 16,
        heroImageShadow: true,

        // Layout
        minHeight: 480,
        paddingTop: 80,
        paddingBottom: 80,
        paddingLeft: 24,
        paddingRight: 24,
        contentAlign: 'center',
        contentMaxWidth: 1100,
        contentVerticalAlign: 'center',

        // Badge
        showBadge: true,
        badgeText: '🎉 Limited Time Offer',
        badgeColor: '#f59e0b',
        badgeBgColor: '#f59e0b1a',

        // Title
        title: 'The Headline That Sells Your Product',
        titleSize: 56,
        titleSizeMobile: 32,
        titleWeight: '800',
        titleColor: '#ffffff',
        titleLineHeight: 1.15,
        titleLetterSpacing: -0.02,

        // Subtitle
        subtitle: 'Describe your offer clearly. Focus on the transformation, not the product. Make them feel it.',
        subtitleSize: 19,
        subtitleColor: '#cbd5e1',
        subtitleMaxWidth: 640,
        subtitleLineHeight: 1.65,

        // Primary button
        showPrimaryBtn: true,
        primaryBtnText: '🛒 Order Now — Cash on Delivery',
        primaryBtnUrl: '#checkout',
        primaryBtnStyle: 'solid',
        primaryBtnBgColor: '#f59e0b',
        primaryBtnTextColor: '#1a1a1a',
        primaryBtnBorderColor: '#f59e0b',
        primaryBtnBorderRadius: 10,
        primaryBtnSize: 'lg',

        // Secondary button
        showSecondaryBtn: false,
        secondaryBtnText: 'Learn More',
        secondaryBtnUrl: '#features',
        secondaryBtnStyle: 'outline',
        secondaryBtnBgColor: '#ffffff',
        secondaryBtnTextColor: '#ffffff',
        secondaryBtnBorderColor: '#ffffff',
        secondaryBtnBorderRadius: 10,
        secondaryBtnSize: 'lg',

        // Stats
        showStats: false,
        stats: [
            { value: '10,000+', label: 'Happy Customers', show: true },
            { value: '4.9★',    label: 'Average Rating',  show: true },
            { value: '2-3 Days', label: 'Fast Delivery',  show: true },
        ],

        // Decorative shape
        decorShape: 'blob-tr',
        decorColor: '#ffffff',
        decorOpacity: 5,

        // Animation
        animation: 'slideUp',
        animationDelay: '0',
    },
    related: { settings: HeroSettings },
};