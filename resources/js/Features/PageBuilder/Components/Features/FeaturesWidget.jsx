import React from 'react';
import { useNode } from '@craftjs/core';
import { motion } from 'framer-motion';
import FeaturesSettings from './FeaturesSettings';

// ─── Animation helper ──────────────────────────────────────────────────────
function itemVariants(animation, delay) {
    const t = { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay };
    switch (animation) {
        case 'fadeUp':    return { hidden: { opacity: 0, y: 30 },      visible: { opacity: 1, y: 0,    transition: t } };
        case 'fadeIn':    return { hidden: { opacity: 0 },              visible: { opacity: 1,          transition: t } };
        case 'zoomIn':    return { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: t } };
        case 'slideLeft': return { hidden: { opacity: 0, x: 40 },      visible: { opacity: 1, x: 0,    transition: t } };
        default:          return { hidden: { opacity: 1 },              visible: { opacity: 1 } };
    }
}

// ─── Shadow map ────────────────────────────────────────────────────────────
const SHADOWS = {
    none:  'none',
    sm:    '0 1px 4px rgba(0,0,0,0.08)',
    md:    '0 4px 16px rgba(0,0,0,0.10)',
    lg:    '0 8px 32px rgba(0,0,0,0.14)',
};

// ─── Icon size helpers ─────────────────────────────────────────────────────
const iconDim  = s => s === 'sm' ? 40 : s === 'lg' ? 64 : 52;
const iconFont = s => s === 'sm' ? '18px' : s === 'lg' ? '28px' : '22px';

const radiusOf = shape =>
    shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : shape === 'square' ? '4px' : '0';

// ══════════════════════════════════════════════════════════════════════════
// TEMPLATE RENDERERS
// Each receives the full merged props for one item + global card settings.
// ══════════════════════════════════════════════════════════════════════════

// 1. CARDS — white shadow card, icon top-center (original default)
const CardTemplate = ({ item, g, i }) => (
    <div style={{
        backgroundColor: g.cardBg,
        border: g.cardBorderWidth > 0 ? `${g.cardBorderWidth}px solid ${g.cardBorderColor}` : 'none',
        borderRadius: g.cardRadius,
        boxShadow: SHADOWS[g.cardShadow] || 'none',
        padding: g.cardPadding,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', height: '100%', boxSizing: 'border-box',
        gap: 12,
    }}>
        <div style={{
            width: iconDim(g.iconSize), height: iconDim(g.iconSize), flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: iconFont(g.iconSize),
            backgroundColor: item.iconBg || g.iconBg,
            color: item.iconColor || g.iconColor,
            borderRadius: radiusOf(g.iconShape),
        }}>
            {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
        </div>
        <div>
            <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h3>
            <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
        </div>
    </div>
);

// 2. HORIZONTAL — icon left, text right
const HorizontalTemplate = ({ item, g, i }) => (
    <div style={{
        backgroundColor: g.cardBg,
        border: g.cardBorderWidth > 0 ? `${g.cardBorderWidth}px solid ${g.cardBorderColor}` : 'none',
        borderRadius: g.cardRadius,
        boxShadow: SHADOWS[g.cardShadow] || 'none',
        padding: g.cardPadding,
        display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
        gap: 16, height: '100%', boxSizing: 'border-box',
    }}>
        <div style={{
            width: iconDim(g.iconSize), height: iconDim(g.iconSize), flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: iconFont(g.iconSize),
            backgroundColor: item.iconBg || g.iconBg,
            color: item.iconColor || g.iconColor,
            borderRadius: radiusOf(g.iconShape),
        }}>
            {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h3>
            <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
        </div>
    </div>
);

// 3. FLAT BORDERED — no shadow, bold colored left-border accent
const FlatBorderedTemplate = ({ item, g, i }) => {
    const accent = item.iconColor || g.iconColor || '#6366f1';
    return (
        <div style={{
            backgroundColor: g.cardBg,
            borderLeft: `4px solid ${accent}`,
            borderTop: `1px solid ${g.cardBorderColor}`,
            borderBottom: `1px solid ${g.cardBorderColor}`,
            borderRight: `1px solid ${g.cardBorderColor}`,
            borderRadius: `0 ${g.cardRadius}px ${g.cardRadius}px 0`,
            padding: g.cardPadding,
            display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
            gap: 14, height: '100%', boxSizing: 'border-box',
        }}>
            <div style={{
                width: 36, height: 36, flexShrink: 0, marginTop: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px',
                backgroundColor: `${accent}18`,
                color: accent,
                borderRadius: 8,
            }}>
                {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 5, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// 4. GLASS — frosted-glass card (best on dark/gradient bg)
const GlassTemplate = ({ item, g, i }) => {
    const accent = item.iconColor || g.iconColor || '#a5b4fc';
    return (
        <div style={{
            background: 'rgba(255,255,255,0.10)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: g.cardRadius,
            padding: g.cardPadding,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            gap: 12, height: '100%', boxSizing: 'border-box',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
        }}>
            <div style={{
                width: iconDim(g.iconSize), height: iconDim(g.iconSize), flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: iconFont(g.iconSize),
                backgroundColor: `${accent}25`,
                color: accent,
                borderRadius: radiusOf(g.iconShape),
                border: `1px solid ${accent}40`,
            }}>
                {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
            </div>
            <div>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// 5. DARK — dark card on dark bg
const DarkTemplate = ({ item, g, i }) => {
    const accent = item.iconColor || g.iconColor || '#818cf8';
    return (
        <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: g.cardRadius,
            padding: g.cardPadding,
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            gap: 12, height: '100%', boxSizing: 'border-box',
        }}>
            <div style={{
                width: iconDim(g.iconSize), height: iconDim(g.iconSize), flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: iconFont(g.iconSize),
                backgroundColor: `${accent}20`,
                color: accent,
                borderRadius: radiusOf(g.iconShape),
            }}>
                {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
            </div>
            <div>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: '#f1f5f9', marginBottom: 6, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// 6. PILL STEPS — numbered step pill + connector line, horizontal-flow timeline
const PillStepsTemplate = ({ item, g, i, total }) => {
    const accent = item.iconColor || g.iconColor || '#6366f1';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', padding: '0 8px' }}>
            {/* Step pill */}
            <div style={{
                width: 52, height: 52, borderRadius: '50%',
                backgroundColor: accent, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, flexShrink: 0,
                boxShadow: `0 4px 16px ${accent}55`,
                zIndex: 1, position: 'relative',
            }}>
                {g.showNumbers ? String(i + 1).padStart(2, '0') : (item.icon || '✨')}
            </div>
            {/* Connector */}
            {i < total - 1 && (
                <div style={{
                    position: 'absolute', top: 26, left: 'calc(50% + 26px)',
                    width: 'calc(100% - 52px)', height: 2,
                    background: `linear-gradient(90deg, ${accent}, ${accent}44)`,
                    zIndex: 0,
                }} />
            )}
            <div style={{ marginTop: 14 }}>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 5, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// 7. BIG EMOJI — huge emoji, minimal text below, no card bg
const BigEmojiTemplate = ({ item, g, i }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', padding: `${g.cardPadding}px 12px`,
        height: '100%', boxSizing: 'border-box', gap: 8,
    }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 4 }}>
            {item.icon || '✨'}
        </div>
        <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 4, lineHeight: 1.3 }}>{item.title}</h3>
        <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
    </div>
);

// 8. CHECKLIST — compact dense row with large tick, no separate icon container
const ChecklistTemplate = ({ item, g, i }) => {
    const accent = item.iconColor || g.iconColor || '#16a34a';
    return (
        <div style={{
            display: 'flex', flexDirection: 'row', alignItems: 'flex-start',
            gap: 12, padding: `${Math.round(g.cardPadding * 0.6)}px 0`,
            borderBottom: `1px solid ${g.cardBorderColor}`,
            boxSizing: 'border-box',
        }}>
            <div style={{
                width: 28, height: 28, flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700,
                backgroundColor: `${accent}18`,
                color: accent,
                borderRadius: '50%',
            }}>
                {g.showNumbers ? String(i + 1) : (item.icon || '✓')}
            </div>
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 2, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.55, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// 9. SPLIT BANNER — full-width colored band left (icon), white right (text)
const SplitTemplate = ({ item, g, i }) => {
    const accent = item.iconBg || g.iconBg || '#6366f1';
    const iconClr = item.iconColor || g.iconColor || '#fff';
    return (
        <div style={{
            display: 'flex', flexDirection: 'row', alignItems: 'stretch',
            borderRadius: g.cardRadius,
            overflow: 'hidden',
            boxShadow: SHADOWS[g.cardShadow] || 'none',
            border: g.cardBorderWidth > 0 ? `${g.cardBorderWidth}px solid ${g.cardBorderColor}` : 'none',
            height: '100%', boxSizing: 'border-box',
        }}>
            {/* Left colored band */}
            <div style={{
                width: 80, flexShrink: 0,
                backgroundColor: accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '28px', color: iconClr,
            }}>
                {g.showNumbers ? <span style={{ fontWeight: 800, fontSize: 22 }}>{String(i + 1).padStart(2, '0')}</span> : (item.icon || '✨')}
            </div>
            {/* Right text area */}
            <div style={{
                flex: 1, backgroundColor: g.cardBg,
                padding: `${Math.round(g.cardPadding * 0.75)}px ${g.cardPadding}px`,
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
                <h3 style={{ fontSize: g.itemTitleSize, fontWeight: 700, color: g.itemTitleColor, marginBottom: 5, lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: g.itemDescSize, color: g.itemDescColor, lineHeight: 1.6, margin: 0 }}>{item.description}</p>
            </div>
        </div>
    );
};

// ─── Template registry ─────────────────────────────────────────────────────
const TEMPLATES = {
    cards:       CardTemplate,
    horizontal:  HorizontalTemplate,
    flatBorder:  FlatBorderedTemplate,
    glass:       GlassTemplate,
    dark:        DarkTemplate,
    pillSteps:   PillStepsTemplate,
    bigEmoji:    BigEmojiTemplate,
    checklist:   ChecklistTemplate,
    split:       SplitTemplate,
};

// ─── Main widget ───────────────────────────────────────────────────────────
export const FeaturesWidget = (props) => {
    const {
        // Section header
        sectionTitle, sectionSubtitle,
        titleColor, subtitleColor,
        titleSize, subtitleSize,
        headerAlign,

        // Layout
        columns, cardTemplate, gap,

        // Background
        bgType, bgColor,
        bgGradientFrom, bgGradientTo, bgGradientDirection,
        paddingTop, paddingBottom, paddingLeft, paddingRight,

        // Card defaults (passed as "g" to each template)
        cardBg, cardBorderColor, cardBorderWidth,
        cardRadius, cardShadow, cardPadding,

        // Icon defaults
        iconShape, iconBg, iconColor, iconSize,

        // Text
        itemTitleColor, itemDescColor, itemTitleSize, itemDescSize,

        // Features
        showNumbers,
        items,

        // Animation
        animation, staggerDelay,

        // Anchor
        sectionId,
    } = props;

    const { connectors: { connect, drag } } = useNode();

    // Shared "global" card settings object passed to every template renderer
    const g = {
        cardBg, cardBorderColor, cardBorderWidth,
        cardRadius: `${cardRadius}px`,
        cardShadow, cardPadding,
        iconShape, iconBg, iconColor, iconSize,
        itemTitleSize, itemDescSize, itemTitleColor, itemDescColor,
        showNumbers,
    };

    // Background
    let bg = bgColor;
    if (bgType === 'gradient') bg = `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;

    // Column Tailwind class
    const colMap = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    };

    const alignMap        = { left: 'text-left', center: 'text-center', right: 'text-right' };
    const headerAlignItems = { left: 'items-start', center: 'items-center', right: 'items-end' };

    // checklist & split are always single-column (they're full-width by nature)
    const forceSingleCol = cardTemplate === 'checklist';
    const effectiveCols  = forceSingleCol ? 1 : columns;

    const Renderer = TEMPLATES[cardTemplate] || CardTemplate;

    return (
        <div
            ref={ref => connect(drag(ref))}
            id={sectionId || 'features'}
            style={{
                background: bg,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
            }}
        >
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* Section header */}
                {(sectionTitle || sectionSubtitle) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className={`flex flex-col ${headerAlignItems[headerAlign]} mb-12`}
                    >
                        {sectionTitle && (
                            <h2 style={{
                                fontSize: `${titleSize}px`,
                                fontWeight: 800,
                                color: titleColor,
                                lineHeight: 1.2,
                                marginBottom: sectionSubtitle ? '12px' : '0',
                                letterSpacing: '-0.02em',
                            }} className={alignMap[headerAlign]}>
                                {sectionTitle}
                            </h2>
                        )}
                        {sectionSubtitle && (
                            <p style={{
                                fontSize: `${subtitleSize}px`,
                                color: subtitleColor,
                                maxWidth: '640px',
                                lineHeight: 1.65,
                            }} className={alignMap[headerAlign]}>
                                {sectionSubtitle}
                            </p>
                        )}
                    </motion.div>
                )}

                {/* Feature grid */}
                <div
                    className={`grid ${colMap[effectiveCols] || colMap[3]}`}
                    style={{ gap: `${gap}px` }}
                >
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants(animation, i * parseFloat(staggerDelay))}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <Renderer item={item} g={g} i={i} total={items.length} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

FeaturesWidget.craft = {
    displayName: 'Features Grid',
    props: {
        // Header
        sectionTitle: 'Why Choose This Product?',
        sectionSubtitle: "Everything you need, nothing you don't. Trusted by thousands of customers.",
        titleColor: '#0f172a',
        subtitleColor: '#64748b',
        titleSize: 36,
        subtitleSize: 17,
        headerAlign: 'center',

        // Layout
        columns: 3,
        cardTemplate: 'cards',   // key into TEMPLATES
        gap: 24,

        // Background
        bgType: 'color',
        bgColor: '#f8fafc',
        bgGradientFrom: '#f0f9ff',
        bgGradientTo: '#e0f2fe',
        bgGradientDirection: 180,
        paddingTop: 72,
        paddingBottom: 72,
        paddingLeft: 24,
        paddingRight: 24,

        // Card defaults
        cardBg: '#ffffff',
        cardBorderColor: '#e2e8f0',
        cardBorderWidth: 1,
        cardRadius: 16,
        cardShadow: 'md',
        cardPadding: 28,

        // Icon defaults
        iconShape: 'rounded',
        iconBg: '#ede9fe',
        iconColor: '#7c3aed',
        iconSize: 'md',

        // Item text
        itemTitleColor: '#0f172a',
        itemDescColor: '#64748b',
        itemTitleSize: 17,
        itemDescSize: 14,

        // Features
        showNumbers: false,
        items: [
            { title: 'Premium Quality',         description: 'Crafted from the finest materials, built to last for years of daily use.',     icon: '🏆', iconBg: '', iconColor: '' },
            { title: 'Lightning Fast Delivery',  description: 'Order today and receive your package within 2–3 business days, guaranteed.',   icon: '🚚', iconBg: '', iconColor: '' },
            { title: 'Money-Back Guarantee',     description: '100% satisfaction or your money back. No questions, no hassle, no risk.',       icon: '🛡️', iconBg: '', iconColor: '' },
            { title: 'Cash on Delivery',         description: 'Pay only when you receive and inspect your order at your doorstep.',           icon: '💵', iconBg: '', iconColor: '' },
            { title: '24/7 Support',             description: 'Our customer care team is always ready to help you before and after purchase.', icon: '💬', iconBg: '', iconColor: '' },
            { title: 'Authentic Products',       description: 'Every item is 100% genuine, sourced directly from authorized manufacturers.',   icon: '✅', iconBg: '', iconColor: '' },
        ],

        // Animation
        animation: 'fadeUp',
        staggerDelay: '0.08',

        // Anchor
        sectionId: 'features',
    },
    related: { settings: FeaturesSettings },
};