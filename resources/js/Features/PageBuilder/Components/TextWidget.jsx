import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

// ─── Google Fonts list ─────────────────────────────────────────────────────
const GOOGLE_FONTS = [
    'Inter', 'Playfair Display', 'DM Sans', 'Sora', 'Outfit', 'Plus Jakarta Sans',
    'Raleway', 'Nunito', 'Poppins', 'Lato', 'Merriweather', 'Roboto Slab',
    'Space Grotesk', 'Josefin Sans', 'Cormorant Garamond', 'Montserrat',
    'Source Serif 4', 'Libre Baskerville', 'Manrope', 'Fraunces',
];

let loadedFonts = new Set();
function loadGoogleFont(family) {
    if (!family || loadedFonts.has(family) || typeof document === 'undefined') return;
    loadedFonts.add(family);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,700&display=swap`;
    document.head.appendChild(link);
}

// ─── CSS for text effects ──────────────────────────────────────────────────
const EFFECTS_CSS = `
.lp-highlight-animated {
    background: linear-gradient(120deg, #f59e0b55 0%, #f59e0b 50%, #f59e0b55 100%);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    animation: highlightSlide 1.5s ease-in-out forwards;
    -webkit-text-fill-color: transparent;
}
@keyframes highlightSlide {
    from { background-position: 200% center; }
    to   { background-position: 0% center; }
}
.lp-highlight-static {
    background: linear-gradient(transparent 60%, #fde68a 60%);
    padding: 0 2px;
}
.lp-highlight-pink {
    background: linear-gradient(transparent 60%, #fbcfe8 60%);
    padding: 0 2px;
}
.lp-highlight-green {
    background: linear-gradient(transparent 60%, #bbf7d0 60%);
    padding: 0 2px;
}
.lp-highlight-blue {
    background: linear-gradient(transparent 60%, #bfdbfe 60%);
    padding: 0 2px;
}
.lp-highlight-purple {
    background: linear-gradient(transparent 60%, #e9d5ff 60%);
    padding: 0 2px;
}
.lp-underline-wave {
    text-decoration: underline wavy #f59e0b;
    text-underline-offset: 4px;
}
.lp-underline-double {
    text-decoration: underline double #6366f1;
    text-underline-offset: 4px;
}
.lp-underline-thick {
    border-bottom: 3px solid currentColor;
    padding-bottom: 2px;
}
.lp-zigzag {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='4'%3E%3Cpath d='M0 2 L5 0 L10 2 L15 0 L20 2' stroke='%23ef4444' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
    background-repeat: repeat-x;
    background-position: bottom;
    padding-bottom: 5px;
}
.lp-circle {
    border: 2px solid currentColor;
    border-radius: 50%;
    padding: 2px 8px;
    display: inline-block;
}
.lp-box {
    border: 2px solid currentColor;
    padding: 2px 8px;
    display: inline-block;
    border-radius: 4px;
}
.lp-cross {
    text-decoration: line-through;
    text-decoration-color: #ef4444;
    text-decoration-thickness: 2px;
}
.lp-strikethrough {
    text-decoration: line-through;
}
.lp-superscript {
    vertical-align: super;
    font-size: 0.6em;
}
.lp-subscript {
    vertical-align: sub;
    font-size: 0.6em;
}
.lp-code-inline {
    font-family: 'Fira Code', 'JetBrains Mono', monospace;
    background: #f1f5f9;
    color: #7c3aed;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 0.9em;
}
.lp-kbd {
    font-family: monospace;
    background: #e2e8f0;
    border: 1px solid #94a3b8;
    border-bottom-width: 3px;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 0.85em;
}
.lp-badge {
    background: #6366f1;
    color: white;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.75em;
    font-weight: 700;
    letter-spacing: 0.04em;
    vertical-align: middle;
}
.lp-spoiler {
    background: #1e293b;
    color: #1e293b;
    border-radius: 3px;
    padding: 0 3px;
    cursor: pointer;
    user-select: none;
    transition: color 0.3s;
}
.lp-spoiler:hover { color: #f8fafc; }
.lp-shimmer {
    background: linear-gradient(90deg, #94a3b8 25%, #e2e8f0 50%, #94a3b8 75%);
    background-size: 200% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 2s infinite;
}
@keyframes shimmer {
    0% { background-position: 200% center; }
    100% { background-position: -200% center; }
}
.lp-rainbow {
    background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #a855f7);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.lp-neon {
    color: #a3e635;
    text-shadow: 0 0 8px #a3e635, 0 0 20px #a3e635aa;
}
.lp-ghost {
    opacity: 0.3;
    font-style: italic;
}
`;

// ─── Effect definitions ────────────────────────────────────────────────────
const EFFECTS = [
    { key: 'lp-highlight-animated', icon: '✨', label: 'Animated Highlight', tooltip: 'Animated golden highlight sweep', group: 'Highlights' },
    { key: 'lp-highlight-static',   icon: '🖊️', label: 'Yellow Highlight',   tooltip: 'Marker-style yellow highlight', group: 'Highlights' },
    { key: 'lp-highlight-pink',     icon: '🩷', label: 'Pink Highlight',     tooltip: 'Marker-style pink highlight', group: 'Highlights' },
    { key: 'lp-highlight-green',    icon: '💚', label: 'Green Highlight',    tooltip: 'Marker-style green highlight', group: 'Highlights' },
    { key: 'lp-highlight-blue',     icon: '💙', label: 'Blue Highlight',     tooltip: 'Marker-style blue highlight', group: 'Highlights' },
    { key: 'lp-highlight-purple',   icon: '💜', label: 'Purple Highlight',   tooltip: 'Marker-style purple highlight', group: 'Highlights' },
    { key: 'lp-underline-wave',     icon: '〜', label: 'Wave Underline',    tooltip: 'Wavy amber underline', group: 'Underlines' },
    { key: 'lp-underline-double',   icon: '═',  label: 'Double Underline',  tooltip: 'Double underline in indigo', group: 'Underlines' },
    { key: 'lp-underline-thick',    icon: '▬',  label: 'Thick Underline',   tooltip: 'Bold bottom border', group: 'Underlines' },
    { key: 'lp-zigzag',             icon: '⌇',  label: 'Zigzag',            tooltip: 'Red zigzag underline', group: 'Underlines' },
    { key: 'lp-circle',             icon: '○',  label: 'Circle',            tooltip: 'Draw a circle around the text', group: 'Decorations' },
    { key: 'lp-box',                icon: '□',  label: 'Box',               tooltip: 'Draw a box around the text', group: 'Decorations' },
    { key: 'lp-badge',              icon: '🏷️', label: 'Badge',             tooltip: 'Pill-shaped badge', group: 'Decorations' },
    { key: 'lp-cross',              icon: '✕',  label: 'Cross Out',         tooltip: 'Red strikethrough (X-out)', group: 'Decorations' },
    { key: 'lp-strikethrough',      icon: '—',  label: 'Strikethrough',     tooltip: 'Plain strikethrough', group: 'Decorations' },
    { key: 'lp-code-inline',        icon: '</>',label: 'Inline Code',       tooltip: 'Monospace code style', group: 'Semantic' },
    { key: 'lp-kbd',                icon: '⌨',  label: 'Keyboard Key',      tooltip: 'Keyboard key style', group: 'Semantic' },
    { key: 'lp-superscript',        icon: 'x²', label: 'Superscript',       tooltip: 'Superscript text', group: 'Semantic' },
    { key: 'lp-subscript',          icon: 'x₂', label: 'Subscript',         tooltip: 'Subscript text', group: 'Semantic' },
    { key: 'lp-spoiler',            icon: '👁', label: 'Spoiler',           tooltip: 'Hidden reveal on hover', group: 'Fun' },
    { key: 'lp-shimmer',            icon: '🌟', label: 'Shimmer',           tooltip: 'Silver shimmer animation', group: 'Fun' },
    { key: 'lp-rainbow',            icon: '🌈', label: 'Rainbow',           tooltip: 'Rainbow gradient text', group: 'Fun' },
    { key: 'lp-neon',               icon: '⚡', label: 'Neon Glow',         tooltip: 'Neon green glow effect', group: 'Fun' },
    { key: 'lp-ghost',              icon: '👻', label: 'Ghost',             tooltip: 'Faded ghost text', group: 'Fun' },
];

// ─── Inject global CSS once ────────────────────────────────────────────────
let cssInjected = false;
function ensureEffectsCSS() {
    if (cssInjected || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.id = 'lp-text-effects';
    style.textContent = EFFECTS_CSS;
    document.head.appendChild(style);
    cssInjected = true;
}

// ─── Apply effect to selected text ────────────────────────────────────────
function applyEffectToSelection(effectClass) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const parentSpan = container.nodeType === 3 ? container.parentElement : container;
    if (parentSpan && parentSpan.tagName === 'SPAN' && parentSpan.classList.contains(effectClass)) {
        const text = document.createTextNode(parentSpan.textContent);
        parentSpan.replaceWith(text);
        return true;
    }
    const span = document.createElement('span');
    span.className = effectClass;
    try {
        range.surroundContents(span);
    } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
    }
    sel.removeAllRanges();
    return true;
}

// ─── Apply inline text background color to selection ──────────────────────
function applyTextBgColor(color) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
    const range = sel.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = color;
    span.style.padding = '0 2px';
    span.style.borderRadius = '3px';
    try {
        range.surroundContents(span);
    } catch {
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
    }
    sel.removeAllRanges();
    return true;
}

function execCmd(command, value = null) {
    document.execCommand(command, false, value);
}

// ─── Shadow presets ────────────────────────────────────────────────────────
const SHADOW_PRESETS = {
    none: 'none',
    sm:   '0 1px 2px rgba(0,0,0,0.1)',
    md:   '0 4px 6px rgba(0,0,0,0.15)',
    lg:   '0 10px 15px rgba(0,0,0,0.2)',
    xl:   '0 20px 25px rgba(0,0,0,0.25)',
    glow: (color) => `0 0 15px ${color}80, 0 0 30px ${color}40`,
    retro: '3px 3px 0px rgba(0,0,0,0.8)',
    long:  '4px 4px 0 #e879f9, 8px 8px 0 #818cf8',
    inset: 'inset 0 2px 4px rgba(0,0,0,0.2)',
};

function getShadowValue(shadowType, color) {
    if (shadowType === 'glow') return SHADOW_PRESETS.glow(color);
    return SHADOW_PRESETS[shadowType] || 'none';
}

// ─── Typography presets (type-only) ───────────────────────────────────────
const TYPE_PRESETS = {
    h1:      { tagName: 'h1', fontSize: 56, fontWeight: '800', lineHeight: 1.1,  letterSpacing: -0.02, textTransform: 'none' },
    h2:      { tagName: 'h2', fontSize: 36, fontWeight: '700', lineHeight: 1.25, letterSpacing: -0.01, textTransform: 'none' },
    h3:      { tagName: 'h3', fontSize: 24, fontWeight: '600', lineHeight: 1.3,  letterSpacing: 0,     textTransform: 'none' },
    p:       { tagName: 'p',  fontSize: 16, fontWeight: '400', lineHeight: 1.65, letterSpacing: 0,     textTransform: 'none' },
    caps:    { tagName: 'h6', fontSize: 13, fontWeight: '700', lineHeight: 1.5,  letterSpacing: 0.1,   textTransform: 'uppercase' },
    display: { tagName: 'h1', fontSize: 80, fontWeight: '900', lineHeight: 0.95, letterSpacing: -0.04, textTransform: 'none' },
    quote:   { tagName: 'blockquote', fontSize: 22, fontWeight: '400', lineHeight: 1.55, letterSpacing: 0.01, textTransform: 'none' },
    caption: { tagName: 'p',  fontSize: 12, fontWeight: '400', lineHeight: 1.4,  letterSpacing: 0.02,  textTransform: 'none' },
};

// ─── Full style templates (type + color + bg + border + spacing) ───────────
const STYLE_TEMPLATES = [
    {
        key: 'hero-dark',
        label: '🌑 Hero Dark',
        desc: 'Bold dark hero headline',
        preview: { bg: '#0f172a', color: '#f8fafc' },
        props: {
            tagName: 'h1', fontSize: 64, fontWeight: '900', lineHeight: 1.05,
            letterSpacing: -0.03, textTransform: 'none',
            color: '#f8fafc', isGradient: false,
            backgroundColor: '#0f172a', backgroundOpacity: 100,
            paddingTop: 48, paddingBottom: 48, paddingLeft: 48, paddingRight: 48,
            borderRadius: 0, borderLeft: false,
            textShadow: 'none', fontFamily: 'Inter',
            text: '<strong>Build Something</strong><br/><span style="color:#818cf8">Extraordinary</span>',
        },
    },
    {
        key: 'gradient-hero',
        label: '🌈 Gradient Hero',
        desc: 'Vibrant gradient headline',
        preview: { bg: '#ffffff', color: '#6366f1' },
        props: {
            tagName: 'h1', fontSize: 60, fontWeight: '800', lineHeight: 1.1,
            letterSpacing: -0.03, textTransform: 'none',
            isGradient: true, gradientFrom: '#6366f1', gradientTo: '#ec4899',
            gradientType: 'linear', gradientDirection: 135, useGradientMid: false,
            backgroundColor: '#ffffff', backgroundOpacity: 100,
            paddingTop: 32, paddingBottom: 32, paddingLeft: 0, paddingRight: 0,
            borderLeft: false, textShadow: 'none', fontFamily: 'Outfit',
            text: 'The Future Is<br/><strong>Now</strong>',
        },
    },
    {
        key: 'glass-card',
        label: '🪟 Glass Card',
        desc: 'Frosted glass style block',
        preview: { bg: 'rgba(99,102,241,0.12)', color: '#1e293b' },
        props: {
            tagName: 'h2', fontSize: 28, fontWeight: '700', lineHeight: 1.3,
            letterSpacing: -0.01, textTransform: 'none',
            color: '#1e293b', isGradient: false,
            backgroundColor: 'rgba(99,102,241,0.12)', backgroundOpacity: 100,
            backgroundBlur: true, paddingTop: 32, paddingBottom: 32,
            paddingLeft: 32, paddingRight: 32, borderRadius: 16,
            borderLeft: false, textShadow: 'none', fontFamily: 'DM Sans',
            text: '✦ Premium Feature<br/><span style="font-weight:400;font-size:16px;color:#64748b">Everything you need to grow faster.</span>',
        },
    },
    {
        key: 'editorial-quote',
        label: '📰 Editorial Quote',
        desc: 'Classic blockquote with accent',
        preview: { bg: '#fefce8', color: '#1e293b' },
        props: {
            tagName: 'blockquote', fontSize: 22, fontWeight: '400', lineHeight: 1.6,
            letterSpacing: 0.01, textTransform: 'none',
            color: '#1e293b', isGradient: false,
            backgroundColor: '#fefce8', backgroundOpacity: 100,
            paddingTop: 28, paddingBottom: 28, paddingLeft: 36, paddingRight: 28,
            borderRadius: 8, borderLeft: true, borderLeftColor: '#f59e0b', borderLeftWidth: 5,
            textShadow: 'none', fontFamily: 'Cormorant Garamond',
            text: '"The details are not the details. They make the design."<br/><span style="font-size:13px;color:#92400e;font-weight:600">— Charles Eames</span>',
        },
    },
    {
        key: 'pricing-tag',
        label: '💰 Pricing Tag',
        desc: 'Clean price display block',
        preview: { bg: '#f0fdf4', color: '#16a34a' },
        props: {
            tagName: 'div', fontSize: 48, fontWeight: '800', lineHeight: 1.1,
            letterSpacing: -0.02, textTransform: 'none',
            color: '#16a34a', isGradient: false,
            backgroundColor: '#f0fdf4', backgroundOpacity: 100,
            paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
            borderRadius: 12, borderLeft: false, textShadow: 'none', fontFamily: 'Inter',
            text: '<span style="font-size:20px;font-weight:500;color:#64748b">Starting from</span><br/><strong>$29</strong><span style="font-size:18px;font-weight:400;color:#64748b">/mo</span>',
        },
    },
    {
        key: 'cta-banner',
        label: '📣 CTA Banner',
        desc: 'Bold call-to-action strip',
        preview: { bg: '#6366f1', color: '#ffffff' },
        props: {
            tagName: 'h2', fontSize: 32, fontWeight: '700', lineHeight: 1.2,
            letterSpacing: -0.01, textTransform: 'none',
            color: '#ffffff', isGradient: false,
            backgroundColor: '#6366f1', backgroundOpacity: 100,
            paddingTop: 32, paddingBottom: 32, paddingLeft: 40, paddingRight: 40,
            borderRadius: 12, borderLeft: false, textShadow: 'none', fontFamily: 'Plus Jakarta Sans',
            text: '🚀 <strong>Join 10,000+ makers</strong> building with us.<br/><span style="font-size:16px;font-weight:400;opacity:0.85">No credit card required. Cancel anytime.</span>',
        },
    },
    {
        key: 'eyebrow-section',
        label: '🏷 Eyebrow Section',
        desc: 'Section label + headline combo',
        preview: { bg: '#ffffff', color: '#1e293b' },
        props: {
            tagName: 'div', fontSize: 40, fontWeight: '800', lineHeight: 1.2,
            letterSpacing: -0.02, textTransform: 'none',
            color: '#1e293b', isGradient: false,
            backgroundColor: '#ffffff', backgroundOpacity: 100,
            paddingTop: 16, paddingBottom: 16, paddingLeft: 0, paddingRight: 0,
            borderRadius: 0, borderLeft: false, textShadow: 'none', fontFamily: 'Manrope',
            text: '<span style="font-size:12px;font-weight:700;letter-spacing:0.12em;color:#6366f1;text-transform:uppercase">Why Choose Us</span><br/><strong>Designed for modern teams</strong><br/><span style="font-size:16px;font-weight:400;color:#64748b;line-height:1.6">Everything you need to ship faster and look great doing it.</span>',
        },
    },
    {
        key: 'dark-terminal',
        label: '💻 Dark Terminal',
        desc: 'Code/terminal aesthetic',
        preview: { bg: '#020617', color: '#a3e635' },
        props: {
            tagName: 'p', fontSize: 16, fontWeight: '400', lineHeight: 1.7,
            letterSpacing: 0.02, textTransform: 'none',
            color: '#a3e635', isGradient: false,
            backgroundColor: '#020617', backgroundOpacity: 100,
            paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24,
            borderRadius: 10, borderLeft: true, borderLeftColor: '#a3e635', borderLeftWidth: 3,
            textShadow: 'glow', fontFamily: 'Space Grotesk',
            text: '<span style="color:#64748b">$</span> <strong>npm install greatness</strong><br/><span style="color:#64748b">✓ All 142 dependencies installed</span><br/><span style="color:#a3e635">→ Ready to ship 🚀</span>',
        },
    },
    {
        key: 'soft-pastel',
        label: '🌸 Soft Pastel',
        desc: 'Gentle pastel lifestyle block',
        preview: { bg: '#fdf2f8', color: '#9d174d' },
        props: {
            tagName: 'h2', fontSize: 32, fontWeight: '600', lineHeight: 1.4,
            letterSpacing: 0, textTransform: 'none',
            color: '#9d174d', isGradient: false,
            backgroundColor: '#fdf2f8', backgroundOpacity: 100,
            paddingTop: 28, paddingBottom: 28, paddingLeft: 28, paddingRight: 28,
            borderRadius: 16, borderLeft: false, textShadow: 'none', fontFamily: 'Fraunces',
            text: 'Made with care,<br/><em>crafted with love</em> 🌸',
        },
    },
    {
        key: 'warning-alert',
        label: '⚠️ Alert / Warning',
        desc: 'Attention-grabbing alert block',
        preview: { bg: '#fff7ed', color: '#c2410c' },
        props: {
            tagName: 'p', fontSize: 15, fontWeight: '500', lineHeight: 1.6,
            letterSpacing: 0, textTransform: 'none',
            color: '#c2410c', isGradient: false,
            backgroundColor: '#fff7ed', backgroundOpacity: 100,
            paddingTop: 16, paddingBottom: 16, paddingLeft: 20, paddingRight: 20,
            borderRadius: 8, borderLeft: true, borderLeftColor: '#f97316', borderLeftWidth: 4,
            textShadow: 'none', fontFamily: 'Inter',
            text: '⚠️ <strong>Important Notice:</strong> This feature will be deprecated on March 1st. Please migrate to the new API before then.',
        },
    },
    {
        key: 'magazine',
        label: '📖 Magazine Pull',
        desc: 'Large editorial pull quote',
        preview: { bg: '#f8fafc', color: '#1e293b' },
        props: {
            tagName: 'blockquote', fontSize: 36, fontWeight: '300', lineHeight: 1.3,
            letterSpacing: -0.01, textTransform: 'none',
            color: '#1e293b', isGradient: false,
            backgroundColor: '#f8fafc', backgroundOpacity: 100,
            paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40,
            borderRadius: 0, borderLeft: false, textShadow: 'none', fontFamily: 'Playfair Display',
            textAlign: 'center',
            text: '"<em>Design is not just what it looks like.<br/>Design is how it works.</em>"',
        },
    },
    {
        key: 'neon-future',
        label: '🔆 Neon Future',
        desc: 'Futuristic dark + neon glow',
        preview: { bg: '#030712', color: '#818cf8' },
        props: {
            tagName: 'h1', fontSize: 52, fontWeight: '900', lineHeight: 1.1,
            letterSpacing: -0.02, textTransform: 'uppercase',
            isGradient: true, gradientFrom: '#818cf8', gradientTo: '#e879f9',
            gradientType: 'linear', gradientDirection: 135, useGradientMid: false,
            backgroundColor: '#030712', backgroundOpacity: 100,
            paddingTop: 40, paddingBottom: 40, paddingLeft: 40, paddingRight: 40,
            borderRadius: 0, borderLeft: false, textShadow: 'glow', fontFamily: 'Space Grotesk',
            text: '<strong>The Next<br/>Generation</strong>',
        },
    },
];

// ─── Main widget ───────────────────────────────────────────────────────────
export const TextWidget = (props) => {
    const {
        text, tagName, fontSize, textAlign, color, fontWeight,
        lineHeight, letterSpacing, fontFamily, textTransform,
        textShadow, isGradient, gradientFrom, gradientTo, gradientDirection,
        gradientType, gradientMidColor, useGradientMid,
        paddingTop, paddingBottom, paddingLeft, paddingRight,
        marginTop, marginBottom,
        opacity, mixBlendMode,
        textDecoration, textDecorationColor, textDecorationStyle,
        wordSpacing, writingMode, direction,
        // Container background
        backgroundColor, backgroundOpacity, backgroundBlur,
        backgroundGradient, bgGradientFrom, bgGradientTo, bgGradientDirection,
        borderRadius,
        // Left border accent
        borderLeft, borderLeftColor, borderLeftWidth,
        // Text bg highlight
        textBgColor,
        maxWidth, webkitLineClamp, enableLineClamp,
        textIndent,
    } = props;

    const {
        connectors: { connect, drag },
        hasSelectedNode,
        actions: { setProp },
    } = useNode((state) => ({ hasSelectedNode: state.events.selected }));

    const [editable, setEditable] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [charCount, setCharCount] = useState(0);
    const [showTextBgPicker, setShowTextBgPicker] = useState(false);
    const containerRef = useRef(null);
    const toolbarRef = useRef(null);
    const textBgRef = useRef(textBgColor || '#fde68a');

    useEffect(() => { ensureEffectsCSS(); }, []);

    useEffect(() => {
        if (fontFamily) loadGoogleFont(fontFamily);
    }, [fontFamily]);

    useEffect(() => {
        if (!hasSelectedNode) setEditable(false);
    }, [hasSelectedNode]);

    useEffect(() => {
        const plain = text?.replace(/<[^>]*>/g, '') || '';
        setCharCount(plain.length);
        setWordCount(plain.trim() ? plain.trim().split(/\s+/).length : 0);
    }, [text]);

    const updateText = useCallback(() => {
        if (!containerRef.current) return;
        const div = containerRef.current.querySelector('[contenteditable]');
        if (div) setProp(p => { p.text = div.innerHTML; });
    }, [setProp]);

    const handleEffect = (effectClass) => {
        if (!editable) return;
        applyEffectToSelection(effectClass);
        updateText();
    };

    const handleFormat = (command, value = null) => {
        if (!editable) return;
        execCmd(command, value);
        updateText();
    };

    const handleLink = () => {
        if (!editable) return;
        const url = prompt('Enter URL:');
        if (url) execCmd('createLink', url);
        updateText();
    };

    const handleColorize = () => {
        if (!editable) return;
        const color = prompt('Enter text color (hex or name):', '#6366f1');
        if (color) execCmd('foreColor', color);
        updateText();
    };

    const handleTextBgColor = (color) => {
        if (!editable) return;
        textBgRef.current = color;
        setProp(p => { p.textBgColor = color; });
        applyTextBgColor(color);
        updateText();
    };

    const handleFontSize = (size) => {
        if (!editable) return;
        execCmd('fontSize', size);
        updateText();
    };

    // ── Compute text style ─────────────────────────────────────────────────
    const activeColor = isGradient ? gradientFrom : color;
    const textStyle = {
        fontSize: `${fontSize}px`,
        textAlign,
        fontWeight,
        lineHeight,
        letterSpacing: `${letterSpacing}em`,
        wordSpacing: wordSpacing ? `${wordSpacing}em` : undefined,
        fontFamily: fontFamily || 'inherit',
        textTransform: textTransform !== 'none' ? textTransform : undefined,
        textShadow: getShadowValue(textShadow, activeColor),
        opacity: opacity !== undefined ? opacity / 100 : 1,
        mixBlendMode: mixBlendMode !== 'normal' ? mixBlendMode : undefined,
        textIndent: textIndent ? `${textIndent}px` : undefined,
        writingMode: writingMode !== 'horizontal-tb' ? writingMode : undefined,
        direction: direction !== 'ltr' ? direction : undefined,
        textDecoration: textDecoration !== 'none'
            ? `${textDecoration} ${textDecorationStyle || 'solid'} ${textDecorationColor || 'currentColor'}`
            : undefined,
    };

    if (enableLineClamp && webkitLineClamp) {
        textStyle.display = '-webkit-box';
        textStyle.WebkitLineClamp = webkitLineClamp;
        textStyle.WebkitBoxOrient = 'vertical';
        textStyle.overflow = 'hidden';
    }

    if (isGradient) {
        const gradStr = useGradientMid
            ? `${gradientType || 'linear'}-gradient(${gradientDirection}deg, ${gradientFrom}, ${gradientMidColor || '#a855f7'}, ${gradientTo})`
            : `${gradientType || 'linear'}-gradient(${gradientDirection}deg, ${gradientFrom}, ${gradientTo})`;
        textStyle.backgroundImage = gradStr;
        textStyle.WebkitBackgroundClip = 'text';
        textStyle.WebkitTextFillColor = 'transparent';
        textStyle.backgroundClip = 'text';
        textStyle.color = 'transparent';
    } else {
        textStyle.color = color;
    }

    // ── Compute container style ────────────────────────────────────────────
    let containerBg;
    if (backgroundGradient) {
        containerBg = `linear-gradient(${bgGradientDirection || 135}deg, ${bgGradientFrom || '#6366f1'}, ${bgGradientTo || '#a855f7'})`;
    } else if (backgroundColor && backgroundColor !== 'transparent') {
        // Apply backgroundOpacity
        const op = (backgroundOpacity !== undefined ? backgroundOpacity : 100) / 100;
        // Parse hex to rgba if needed
        if (backgroundColor.startsWith('#') && op < 1) {
            const r = parseInt(backgroundColor.slice(1, 3), 16);
            const g = parseInt(backgroundColor.slice(3, 5), 16);
            const b = parseInt(backgroundColor.slice(5, 7), 16);
            containerBg = `rgba(${r},${g},${b},${op})`;
        } else {
            containerBg = backgroundColor;
        }
    }

    const containerStyle = {
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        paddingRight: `${paddingRight}px`,
        marginTop: marginTop ? `${marginTop}px` : undefined,
        marginBottom: marginBottom ? `${marginBottom}px` : undefined,
        maxWidth: maxWidth || undefined,
        background: containerBg || undefined,
        borderRadius: borderRadius ? `${borderRadius}px` : undefined,
        borderLeft: borderLeft ? `${borderLeftWidth || 4}px solid ${borderLeftColor || '#6366f1'}` : undefined,
        paddingInlineStart: borderLeft ? `${(paddingLeft || 0) + 12}px` : undefined,
        backdropFilter: backgroundBlur ? 'blur(12px)' : undefined,
        WebkitBackdropFilter: backgroundBlur ? 'blur(12px)' : undefined,
    };

    return (
        <div
            ref={ref => { connect(drag(ref)); containerRef.current = ref; }}
            onClick={() => setEditable(true)}
            className="w-full relative"
            style={containerStyle}
        >
            {/* Floating Toolbar */}
            {editable && (
                <div
                    ref={toolbarRef}
                    style={{
                        position: 'absolute',
                        top: -56,
                        left: 0,
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        background: '#0f172a',
                        borderRadius: 10,
                        padding: '7px 10px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)',
                        flexWrap: 'nowrap',
                        overflowX: 'auto',
                        maxWidth: '95vw',
                    }}
                    onMouseDown={e => e.preventDefault()}
                >
                    {/* Standard Formatting */}
                    {[
                        { label: 'B', cmd: 'bold',      style: { fontWeight: 800 } },
                        { label: 'I', cmd: 'italic',     style: { fontStyle: 'italic', fontFamily: 'Georgia' } },
                        { label: 'U', cmd: 'underline',  style: { textDecoration: 'underline' } },
                    ].map(({ label, cmd, style }) => (
                        <button key={cmd} onClick={() => handleFormat(cmd)}
                            style={{ ...style, color: '#cbd5e1', background: 'none', border: 'none', padding: '3px 7px', borderRadius: 5, cursor: 'pointer', fontSize: 13, lineHeight: 1, transition: 'background 0.1s' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >{label}</button>
                    ))}

                    <Divider />

                    {/* Link, Text Color, Text BG Color, Clear */}
                    <ToolbarBtn onClick={handleLink} title="Insert Link">🔗</ToolbarBtn>
                    <ToolbarBtn onClick={handleColorize} title="Text Color (click for color prompt)">🎨</ToolbarBtn>

                    {/* Text Background Color Picker */}
                    <div style={{ position: 'relative' }}>
                        <button
                            title="Text Background Color"
                            onClick={() => setShowTextBgPicker(v => !v)}
                            style={{
                                background: 'none', border: 'none', color: '#e2e8f0', fontSize: 14,
                                cursor: 'pointer', padding: '3px 5px', borderRadius: 5, lineHeight: 1,
                                display: 'flex', alignItems: 'center', gap: 3,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            <span style={{ fontSize: 13 }}>🖌</span>
                            <span style={{
                                width: 10, height: 10, borderRadius: 2,
                                background: textBgRef.current || '#fde68a',
                                display: 'inline-block', border: '1px solid rgba(255,255,255,0.2)'
                            }} />
                        </button>
                        {showTextBgPicker && (
                            <div style={{
                                position: 'absolute', top: 30, left: 0, zIndex: 2000,
                                background: '#1e293b', borderRadius: 8, padding: 8,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                display: 'flex', flexWrap: 'wrap', gap: 4, width: 140,
                            }}>
                                {['#fde68a','#fbcfe8','#bbf7d0','#bfdbfe','#e9d5ff','#fed7aa','#fecaca','#d1fae5','#ffffff','#1e293b','transparent'].map(c => (
                                    <button key={c} onClick={() => { handleTextBgColor(c); setShowTextBgPicker(false); }}
                                        title={c}
                                        style={{
                                            width: 20, height: 20, borderRadius: 4,
                                            background: c === 'transparent' ? 'repeating-conic-gradient(#aaa 0% 25%, white 0% 50%) 0 0 / 8px 8px' : c,
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            cursor: 'pointer', padding: 0,
                                        }}
                                    />
                                ))}
                                <input type="color" defaultValue="#fde68a"
                                    onChange={e => { textBgRef.current = e.target.value; setProp(p => { p.textBgColor = e.target.value; }); }}
                                    onBlur={e => { handleTextBgColor(e.target.value); setShowTextBgPicker(false); }}
                                    style={{ width: 20, height: 20, padding: 0, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                                    title="Custom color"
                                />
                            </div>
                        )}
                    </div>

                    <ToolbarBtn onClick={() => handleFormat('removeFormat')} title="Clear Formatting">✖</ToolbarBtn>

                    <Divider />

                    {/* Inline Font Size */}
                    {[1, 2, 3, 4].map(s => (
                        <ToolbarBtn key={s} onClick={() => handleFontSize(s)} title={`Font size ${s}`} style={{ fontSize: 10 + s }}>
                            {['S', 'M', 'L', 'XL'][s - 1]}
                        </ToolbarBtn>
                    ))}

                    <Divider />

                    {/* FX label */}
                    <span style={{ color: '#64748b', fontSize: 10, marginRight: 2, whiteSpace: 'nowrap', fontWeight: 700, letterSpacing: '0.05em' }}>FX:</span>

                    {/* Effects */}
                    {EFFECTS.map(effect => (
                        <button
                            key={effect.key}
                            title={effect.tooltip}
                            onClick={() => handleEffect(effect.key)}
                            style={{
                                background: 'none', border: 'none', color: '#e2e8f0', fontSize: 13,
                                cursor: 'pointer', padding: '3px 5px', borderRadius: 5, lineHeight: 1,
                                transition: 'background 0.1s', whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1e3a5f'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >
                            {effect.icon}
                        </button>
                    ))}

                    {/* Word count badge */}
                    <Divider />
                    <span style={{ color: '#475569', fontSize: 10, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                        {wordCount}w · {charCount}c
                    </span>
                </div>
            )}

            <ContentEditable
                html={text}
                disabled={!editable}
                onChange={e => setProp(p => (p.text = e.target.value))}
                tagName={tagName}
                style={textStyle}
                className={`outline-none transition-all duration-200 ${
                    editable ? 'ring-2 ring-indigo-400 ring-offset-4 ring-offset-transparent bg-indigo-50/5 rounded-md' : ''
                }`}
            />
        </div>
    );
};

// ─── Tiny toolbar helpers ──────────────────────────────────────────────────
const Divider = () => (
    <div style={{ width: 1, height: 18, background: '#1e293b', margin: '0 4px', flexShrink: 0 }} />
);
const ToolbarBtn = ({ onClick, title, children, style = {} }) => (
    <button onClick={onClick} title={title}
        style={{ background: 'none', border: 'none', color: '#e2e8f0', fontSize: 14, cursor: 'pointer', padding: '3px 5px', borderRadius: 5, lineHeight: 1, transition: 'background 0.1s', ...style }}
        onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >{children}</button>
);

// ─── Settings panel primitives ─────────────────────────────────────────────
const Section = ({ title, accent, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
                <div className="flex items-center gap-2">
                    {accent && <span className="text-sm">{accent}</span>}
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
                </div>
                <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="p-4 space-y-4">{children}</div>}
        </div>
    );
};

const RangeRow = ({ label, propKey, min, max, step = 1, unit = '', value, set }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-500 font-medium">{label}</label>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value}
            onChange={e => set(propKey, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
            className="w-full accent-indigo-500" />
    </div>
);

// ─── Settings panel ────────────────────────────────────────────────────────
export const TextSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    const applyTypePreset = (type) => {
        setProp(pr => { Object.assign(pr, TYPE_PRESETS[type] || {}); });
    };

    const applyStyleTemplate = (tpl) => {
        setProp(pr => { Object.assign(pr, tpl.props); });
    };

    const copyHTML = () => {
        navigator.clipboard?.writeText(p.text || '').then(() => alert('HTML copied!')).catch(() => {});
    };

    return (
        <div className="pb-6">
            {/* Info banner */}
            <div className="p-3 mb-4 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100 flex items-start gap-2">
                <span className="text-lg leading-none">💡</span>
                <span>Click the text to edit. Select words to reveal the FX toolbar — text color, background highlight, 25+ effects, and live word count.</span>
            </div>

            {/* ── Style Templates ── */}
            <Section title="Style Templates" accent="🎭" defaultOpen>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">One-click full styles</p>
                <div className="grid grid-cols-2 gap-2">
                    {STYLE_TEMPLATES.map(tpl => (
                        <button
                            key={tpl.key}
                            type="button"
                            onClick={() => applyStyleTemplate(tpl)}
                            className="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition text-left group"
                        >
                            <span
                                className="w-8 h-8 rounded-md flex-shrink-0 border border-gray-200"
                                style={{ background: tpl.preview.bg, color: tpl.preview.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}
                            >T</span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold text-gray-700 group-hover:text-indigo-700 truncate">{tpl.label}</p>
                                <p className="text-[10px] text-gray-400 truncate">{tpl.desc}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── Semantic & Quick Presets ── */}
            <Section title="Semantic & Type Presets" accent="📑" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">HTML Tag (SEO/Structure)</label>
                    <select value={p.tagName} onChange={e => set('tagName', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        {['h1','h2','h3','h4','h5','h6'].map(t => <option key={t} value={t}>{t.toUpperCase()} — Heading {t[1]}</option>)}
                        <option value="p">P — Paragraph</option>
                        <option value="blockquote">blockquote — Quote Block</option>
                        <option value="div">div — Standard Block</option>
                        <option value="span">span — Inline Text</option>
                        <option value="label">label — Form Label</option>
                        <option value="figcaption">figcaption — Caption</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-2">Typography Presets</label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {Object.entries(TYPE_PRESETS).map(([key]) => (
                            <button key={key} type="button" onClick={() => applyTypePreset(key)}
                                className="py-1.5 text-xs bg-gray-100 hover:bg-indigo-100 text-gray-700 hover:text-indigo-700 font-medium rounded transition capitalize">
                                {key === 'h1' ? 'H1' : key === 'h2' ? 'H2' : key === 'h3' ? 'H3' : key === 'p' ? 'Body' : key === 'caps' ? 'Eyebrow' : key.charAt(0).toUpperCase() + key.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={copyHTML}
                        className="flex-1 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition flex items-center justify-center gap-1">
                        📋 Copy HTML
                    </button>
                    <button type="button" onClick={() => set('text', '<strong>The Headline That Connects</strong><br/>Write something beautiful here.')}
                        className="flex-1 py-2 text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex items-center justify-center gap-1">
                        🔄 Reset Text
                    </button>
                </div>
            </Section>

            {/* ── Typography ── */}
            <Section title="Typography" accent="🔤" defaultOpen>
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Font Family</label>
                    <select value={p.fontFamily || ''} onChange={e => set('fontFamily', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        <option value="">Inherit from page</option>
                        {GOOGLE_FONTS.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                    </select>
                </div>

                <RangeRow label="Font Size" propKey="fontSize" min={8} max={200} value={p.fontSize} unit="px" set={set} />

                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Font Weight</label>
                    <select value={p.fontWeight} onChange={e => set('fontWeight', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        {[100,200,300,400,500,600,700,800,900].map(w => (
                            <option key={w} value={String(w)}>{['Thin','Extra Light','Light','Regular','Medium','Semibold','Bold','Extra Bold','Black'][w/100 - 1]} ({w})</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Text Alignment</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {[
                            { val: 'left',    icon: '⬅' },
                            { val: 'center',  icon: '↔' },
                            { val: 'right',   icon: '➡' },
                            { val: 'justify', icon: '⇔' },
                        ].map(a => (
                            <button key={a.val} type="button" onClick={() => set('textAlign', a.val)}
                                className={`flex-1 py-1.5 text-xs font-medium transition ${p.textAlign === a.val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                title={a.val}>
                                {a.icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Text Casing</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                        {[
                            { val: 'none', label: 'Aa' },
                            { val: 'uppercase', label: 'AA' },
                            { val: 'lowercase', label: 'aa' },
                            { val: 'capitalize', label: 'Aa Bb' },
                        ].map(t => (
                            <button key={t.val} type="button" onClick={() => set('textTransform', t.val)}
                                className={`flex-1 py-1.5 text-xs font-medium transition ${p.textTransform === t.val ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <RangeRow label="Line Height" propKey="lineHeight" min={0.8} max={3} step={0.05} value={p.lineHeight} set={set} />
                <RangeRow label="Letter Spacing" propKey="letterSpacing" min={-0.1} max={0.5} step={0.005} unit="em" value={p.letterSpacing} set={set} />
                <RangeRow label="Word Spacing" propKey="wordSpacing" min={-0.1} max={1} step={0.01} unit="em" value={p.wordSpacing || 0} set={set} />
                <RangeRow label="Text Indent" propKey="textIndent" min={0} max={80} value={p.textIndent || 0} unit="px" set={set} />

                {/* Writing direction */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1">Writing Mode</label>
                        <select value={p.writingMode || 'horizontal-tb'} onChange={e => set('writingMode', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                            <option value="horizontal-tb">Horizontal</option>
                            <option value="vertical-rl">Vertical RL</option>
                            <option value="vertical-lr">Vertical LR</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1">Direction</label>
                        <select value={p.direction || 'ltr'} onChange={e => set('direction', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                            <option value="ltr">LTR (Left-Right)</option>
                            <option value="rtl">RTL (Right-Left)</option>
                        </select>
                    </div>
                </div>
            </Section>

            {/* ── Text Decoration ── */}
            <Section title="Text Decoration" accent="✍️" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Decoration Type</label>
                    <select value={p.textDecoration || 'none'} onChange={e => set('textDecoration', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        <option value="none">None</option>
                        <option value="underline">Underline</option>
                        <option value="overline">Overline</option>
                        <option value="line-through">Line-Through</option>
                        <option value="underline overline">Underline + Overline</option>
                    </select>
                </div>
                {p.textDecoration && p.textDecoration !== 'none' && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1">Decoration Style</label>
                            <select value={p.textDecorationStyle || 'solid'} onChange={e => set('textDecorationStyle', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                                {['solid','double','dotted','dashed','wavy'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-600 font-medium">Decoration Color</label>
                            <input type="color" value={p.textDecorationColor || '#6366f1'} onChange={e => set('textDecorationColor', e.target.value)} className="block w-10 h-8 rounded border border-gray-200 cursor-pointer p-0" />
                        </div>
                    </>
                )}
            </Section>

            {/* ── Text Colors & Gradient ── */}
            <Section title="Text Color & Gradient" accent="🎨" defaultOpen={false}>
                <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <input type="checkbox" checked={p.isGradient} onChange={e => set('isGradient', e.target.checked)} className="rounded accent-indigo-600 w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Use Gradient Text</span>
                </label>

                {!p.isGradient ? (
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600 font-medium">Text Color</label>
                        <input type="color" value={p.color} onChange={e => set('color', e.target.value)} className="block w-10 h-8 rounded border border-gray-200 cursor-pointer p-0" />
                    </div>
                ) : (
                    <div className="space-y-3 p-3 bg-gray-50 border border-gray-100 rounded-lg">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Gradient Type</label>
                            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                                {['linear','radial','conic'].map(t => (
                                    <button key={t} type="button" onClick={() => set('gradientType', t)}
                                        className={`flex-1 py-1 text-xs font-medium transition capitalize ${(p.gradientType || 'linear') === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Color 1</label>
                                <input type="color" value={p.gradientFrom} onChange={e => set('gradientFrom', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            {p.useGradientMid && (
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">Mid Color</label>
                                    <input type="color" value={p.gradientMidColor || '#a855f7'} onChange={e => set('gradientMidColor', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                                </div>
                            )}
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">Color 2</label>
                                <input type="color" value={p.gradientTo} onChange={e => set('gradientTo', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                            <input type="checkbox" checked={p.useGradientMid || false} onChange={e => set('useGradientMid', e.target.checked)} className="accent-indigo-600" />
                            Add mid-stop color
                        </label>
                        <RangeRow label="Angle" propKey="gradientDirection" min={0} max={360} unit="°" value={p.gradientDirection} set={set} />
                    </div>
                )}

                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Text Shadow</label>
                    <select value={p.textShadow} onChange={e => set('textShadow', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        <option value="none">None</option>
                        <option value="sm">Soft Shadow (sm)</option>
                        <option value="md">Drop Shadow (md)</option>
                        <option value="lg">Deep Shadow (lg)</option>
                        <option value="xl">Heavy Shadow (xl)</option>
                        <option value="glow">Neon Glow</option>
                        <option value="retro">Retro Hard Shadow</option>
                        <option value="long">Long Duotone Shadow</option>
                        <option value="inset">Inset Shadow</option>
                    </select>
                </div>
            </Section>

            {/* ── Container Background ── */}
            <Section title="Container Background" accent="🖼️" defaultOpen={false}>
                {/* Solid Background Color */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600 font-medium">Background Color</label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => set('backgroundColor', 'transparent')}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-500 transition"
                                title="Remove background"
                            >✕ None</button>
                            <input
                                type="color"
                                value={p.backgroundColor && p.backgroundColor !== 'transparent' ? p.backgroundColor : '#ffffff'}
                                onChange={e => { set('backgroundColor', e.target.value); set('backgroundGradient', false); }}
                                className="block w-10 h-8 rounded border border-gray-200 cursor-pointer p-0"
                            />
                        </div>
                    </div>
                    {p.backgroundColor && p.backgroundColor !== 'transparent' && (
                        <RangeRow label="Background Opacity" propKey="backgroundOpacity" min={0} max={100} value={p.backgroundOpacity !== undefined ? p.backgroundOpacity : 100} unit="%" set={set} />
                    )}
                </div>

                {/* Background Gradient */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="checkbox" checked={p.backgroundGradient || false} onChange={e => set('backgroundGradient', e.target.checked)} className="rounded accent-indigo-600 w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">Background Gradient</span>
                    </label>
                    {p.backgroundGradient && (
                        <div className="space-y-3 pl-2">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">From</label>
                                    <input type="color" value={p.bgGradientFrom || '#6366f1'} onChange={e => set('bgGradientFrom', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 block mb-1">To</label>
                                    <input type="color" value={p.bgGradientTo || '#a855f7'} onChange={e => set('bgGradientTo', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                                </div>
                            </div>
                            <RangeRow label="Angle" propKey="bgGradientDirection" min={0} max={360} unit="°" value={p.bgGradientDirection || 135} set={set} />
                        </div>
                    )}
                </div>

                {/* Backdrop Blur */}
                <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <input type="checkbox" checked={p.backgroundBlur || false} onChange={e => set('backgroundBlur', e.target.checked)} className="rounded accent-indigo-600 w-4 h-4" />
                    <div>
                        <span className="text-sm font-medium text-gray-700">Backdrop Blur (Glass)</span>
                        <p className="text-[10px] text-gray-400">Works on top of images/backgrounds</p>
                    </div>
                </label>

                {/* Border Radius */}
                <RangeRow label="Border Radius" propKey="borderRadius" min={0} max={64} value={p.borderRadius || 0} unit="px" set={set} />

                {/* Left Border Accent */}
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100">
                        <input type="checkbox" checked={p.borderLeft || false} onChange={e => set('borderLeft', e.target.checked)} className="rounded accent-indigo-600 w-4 h-4" />
                        <span className="text-sm font-medium text-gray-700">Left Border Accent</span>
                    </label>
                    {p.borderLeft && (
                        <div className="flex gap-3 pl-2">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">Color</label>
                                <input type="color" value={p.borderLeftColor || '#6366f1'} onChange={e => set('borderLeftColor', e.target.value)} className="block w-8 h-7 rounded border border-gray-200 cursor-pointer p-0" />
                            </div>
                            <div className="flex-1">
                                <input type="range" min={1} max={12} value={p.borderLeftWidth || 4} onChange={e => set('borderLeftWidth', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                                <span className="text-[10px] text-gray-400">{p.borderLeftWidth || 4}px width</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Opacity & Blend */}
                <RangeRow label="Overall Opacity" propKey="opacity" min={10} max={100} value={p.opacity !== undefined ? p.opacity : 100} unit="%" set={set} />
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Mix Blend Mode</label>
                    <select value={p.mixBlendMode || 'normal'} onChange={e => set('mixBlendMode', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                        {['normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion'].map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </Section>

            {/* ── Spacing ── */}
            <Section title="Spacing" accent="📐" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-4">
                    {[
                        ['paddingTop','Padding Top'], ['paddingBottom','Padding Bottom'],
                        ['paddingLeft','Padding Left'], ['paddingRight','Padding Right'],
                        ['marginTop','Margin Top'], ['marginBottom','Margin Bottom'],
                    ].map(([k, l]) => (
                        <div key={k}>
                            <label className="text-xs text-gray-500 block mb-1">{l}</label>
                            <div className="flex items-center gap-2">
                                <input type="range" min={0} max={120} value={p[k] || 0} onChange={e => set(k, parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
                                <span className="text-xs font-mono text-gray-400 w-6 text-right">{p[k] || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Overflow / Line Clamp ── */}
            <Section title="Overflow & Clamp" accent="✂️" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Max Width</label>
                    <input type="text" placeholder="e.g. 600px or 80%" value={p.maxWidth || ''}
                        onChange={e => set('maxWidth', e.target.value)}
                        className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <input type="checkbox" checked={p.enableLineClamp || false} onChange={e => set('enableLineClamp', e.target.checked)} className="rounded accent-indigo-600 w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Clamp Lines (Truncate)</span>
                </label>
                {p.enableLineClamp && (
                    <RangeRow label="Max Lines" propKey="webkitLineClamp" min={1} max={10} value={p.webkitLineClamp || 3} set={set} />
                )}
            </Section>

            {/* ── FX Reference ── */}
            <Section title="FX Reference" accent="✨" defaultOpen={false}>
                {[...new Set(EFFECTS.map(e => e.group))].map(group => (
                    <div key={group}>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">{group}</p>
                        <div className="grid grid-cols-1 gap-1.5 mb-3">
                            {EFFECTS.filter(e => e.group === group).map(effect => (
                                <div key={effect.key} className="flex items-center gap-3 p-2 bg-gray-50 rounded border border-gray-100">
                                    <span className="text-base w-6 text-center flex-shrink-0">{effect.icon}</span>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-700">{effect.label}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{effect.tooltip}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </Section>
        </div>
    );
};

// ─── Craft.js config ───────────────────────────────────────────────────────
TextWidget.craft = {
    displayName: 'Modern Text',
    props: {
        text: '<strong>The Headline That Connects</strong><br/>Write something beautiful here. Highlight important words for emphasis.',
        tagName: 'h2',
        fontSize: 32,
        textAlign: 'left',
        color: '#1e293b',
        fontWeight: '700',
        lineHeight: 1.25,
        letterSpacing: -0.01,
        wordSpacing: 0,
        fontFamily: '',
        textTransform: 'none',
        textShadow: 'none',
        textDecoration: 'none',
        textDecorationColor: '#6366f1',
        textDecorationStyle: 'solid',
        isGradient: false,
        gradientFrom: '#6366f1',
        gradientTo: '#a855f7',
        gradientMidColor: '#ec4899',
        gradientDirection: 135,
        gradientType: 'linear',
        useGradientMid: false,
        // Container background
        backgroundColor: 'transparent',
        backgroundOpacity: 100,
        backgroundBlur: false,
        backgroundGradient: false,
        bgGradientFrom: '#6366f1',
        bgGradientTo: '#a855f7',
        bgGradientDirection: 135,
        borderRadius: 0,
        // Spacing
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 0,
        paddingRight: 0,
        marginTop: 0,
        marginBottom: 0,
        // Effects
        opacity: 100,
        mixBlendMode: 'normal',
        borderLeft: false,
        borderLeftColor: '#6366f1',
        borderLeftWidth: 4,
        // Clamp
        maxWidth: '',
        enableLineClamp: false,
        webkitLineClamp: 3,
        // Misc
        textIndent: 0,
        writingMode: 'horizontal-tb',
        direction: 'ltr',
        // Text bg color (for inline highlight via toolbar)
        textBgColor: '#fde68a',
    },
    related: { settings: TextSettings },
};