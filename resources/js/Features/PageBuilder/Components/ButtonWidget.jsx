// resources/js/Features/PageBuilder/Components/ButtonWidget.jsx
import React, { useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { DuplicateButton } from '@/Features/PageBuilder/Components/DuplicateButton';

// ─── Icon Library (inline SVGs — no extra deps) ───────────────────────────────
const ICONS = {
    none: null,
    cart: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
    ),
    arrow: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
    ),
    arrowDown: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
        </svg>
    ),
    star: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
    ),
    phone: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    ),
    whatsapp: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
    ),
    download: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
    ),
    heart: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
    ),
    lightning: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
    ),
    gift: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
            <line x1="12" y1="22" x2="12" y2="7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
        </svg>
    ),
};

// ─── Preset Templates ─────────────────────────────────────────────────────────
const TEMPLATES = {
    'cod-amber': {
        label: '🛒 COD Amber',
        props: {
            text: '🛒 Order Now — COD Available',
            bgColor: '#f59e0b', textColor: '#1a1a1a', borderColor: '#f59e0b',
            borderWidth: 0, borderRadius: 8, paddingX: 32, paddingY: 14,
            fontSize: 16, fontWeight: '700', shadow: true, fullWidth: false,
            alignment: 'center', hoverEffect: 'lift', animationStyle: 'none',
            gradientEnabled: false, gradientEnd: '#f59e0b',
            icon: 'cart', iconPosition: 'left', pulse: false, outline: false,
            letterSpacing: 0, textTransform: 'none', opacity: 100,
        },
    },
    'whatsapp-green': {
        label: '💬 WhatsApp Order',
        props: {
            text: 'Order via WhatsApp',
            bgColor: '#25D366', textColor: '#ffffff', borderColor: '#25D366',
            borderWidth: 0, borderRadius: 50, paddingX: 28, paddingY: 13,
            fontSize: 15, fontWeight: '600', shadow: true, fullWidth: false,
            alignment: 'center', hoverEffect: 'glow', animationStyle: 'none',
            gradientEnabled: false, gradientEnd: '#128C7E',
            icon: 'whatsapp', iconPosition: 'left', pulse: true, outline: false,
            letterSpacing: 0.5, textTransform: 'none', opacity: 100,
        },
    },
    'cta-red': {
        label: '🔥 Urgent CTA Red',
        props: {
            text: '⚡ Buy Now — Limited Stock!',
            bgColor: '#ef4444', textColor: '#ffffff', borderColor: '#ef4444',
            borderWidth: 0, borderRadius: 6, paddingX: 36, paddingY: 15,
            fontSize: 17, fontWeight: '800', shadow: true, fullWidth: true,
            alignment: 'center', hoverEffect: 'scale', animationStyle: 'shake',
            gradientEnabled: true, gradientEnd: '#b91c1c',
            icon: 'lightning', iconPosition: 'left', pulse: false, outline: false,
            letterSpacing: 0.5, textTransform: 'uppercase', opacity: 100,
        },
    },
    'elegant-dark': {
        label: '🖤 Elegant Dark',
        props: {
            text: 'Explore Collection',
            bgColor: '#0f0f0f', textColor: '#ffffff', borderColor: '#ffffff',
            borderWidth: 1, borderRadius: 0, paddingX: 40, paddingY: 16,
            fontSize: 14, fontWeight: '600', shadow: false, fullWidth: false,
            alignment: 'center', hoverEffect: 'fill', animationStyle: 'none',
            gradientEnabled: false, gradientEnd: '#0f0f0f',
            icon: 'arrow', iconPosition: 'right', pulse: false, outline: true,
            letterSpacing: 3, textTransform: 'uppercase', opacity: 100,
        },
    },
    'gradient-purple': {
        label: '💜 Gradient Purple',
        props: {
            text: 'Get Started Free',
            bgColor: '#7c3aed', textColor: '#ffffff', borderColor: '#7c3aed',
            borderWidth: 0, borderRadius: 50, paddingX: 32, paddingY: 14,
            fontSize: 16, fontWeight: '700', shadow: true, fullWidth: false,
            alignment: 'center', hoverEffect: 'lift', animationStyle: 'none',
            gradientEnabled: true, gradientEnd: '#ec4899',
            icon: 'star', iconPosition: 'left', pulse: false, outline: false,
            letterSpacing: 0, textTransform: 'none', opacity: 100,
        },
    },
    'outline-blue': {
        label: '🔵 Outline Blue',
        props: {
            text: 'Learn More',
            bgColor: 'transparent', textColor: '#2563eb', borderColor: '#2563eb',
            borderWidth: 2, borderRadius: 8, paddingX: 28, paddingY: 12,
            fontSize: 15, fontWeight: '600', shadow: false, fullWidth: false,
            alignment: 'center', hoverEffect: 'fill', animationStyle: 'none',
            gradientEnabled: false, gradientEnd: '#2563eb',
            icon: 'arrow', iconPosition: 'right', pulse: false, outline: true,
            letterSpacing: 0, textTransform: 'none', opacity: 100,
        },
    },
    'download-green': {
        label: '⬇️ Download CTA',
        props: {
            text: 'Download Free Guide',
            bgColor: '#16a34a', textColor: '#ffffff', borderColor: '#16a34a',
            borderWidth: 0, borderRadius: 10, paddingX: 30, paddingY: 14,
            fontSize: 16, fontWeight: '700', shadow: true, fullWidth: false,
            alignment: 'center', hoverEffect: 'lift', animationStyle: 'bounce',
            gradientEnabled: false, gradientEnd: '#16a34a',
            icon: 'download', iconPosition: 'left', pulse: false, outline: false,
            letterSpacing: 0, textTransform: 'none', opacity: 100,
        },
    },
    'flash-sale': {
        label: '🏷️ Flash Sale',
        props: {
            text: '🎁 Claim Your Discount',
            bgColor: '#f97316', textColor: '#ffffff', borderColor: '#f97316',
            borderWidth: 0, borderRadius: 12, paddingX: 34, paddingY: 15,
            fontSize: 16, fontWeight: '800', shadow: true, fullWidth: true,
            alignment: 'center', hoverEffect: 'glow', animationStyle: 'none',
            gradientEnabled: true, gradientEnd: '#eab308',
            icon: 'gift', iconPosition: 'left', pulse: true, outline: false,
            letterSpacing: 0, textTransform: 'none', opacity: 100,
        },
    },
};

// ─── Keyframe injection (once) ─────────────────────────────────────────────────
const KEYFRAMES = `
@keyframes bw-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(var(--bw-pulse-rgb),0.6)} 70%{box-shadow:0 0 0 12px rgba(var(--bw-pulse-rgb),0)} }
@keyframes bw-shake { 0%,100%{transform:translateX(0)} 15%{transform:translateX(-4px)} 30%{transform:translateX(4px)} 45%{transform:translateX(-3px)} 60%{transform:translateX(3px)} 75%{transform:translateX(-1px)} }
@keyframes bw-bounce { 0%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} 60%{transform:translateY(-2px)} }
`;

if (typeof document !== 'undefined' && !document.getElementById('bw-keyframes')) {
    const s = document.createElement('style');
    s.id = 'bw-keyframes';
    s.textContent = KEYFRAMES;
    document.head.appendChild(s);
}

// ─── Hex → RGB helper for pulse animation ─────────────────────────────────────
const hexToRgb = (hex) => {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : '0,0,0';
};

// ─── Main Component ────────────────────────────────────────────────────────────
export const ButtonWidget = ({
    text, url, bgColor, textColor, borderColor, borderWidth,
    borderRadius, paddingX, paddingY, fontSize, fontWeight,
    shadow, fullWidth, alignment,
    // New props
    hoverEffect, animationStyle, gradientEnabled, gradientEnd,
    icon, iconPosition, pulse, outline,
    letterSpacing, textTransform, opacity,
    tooltipText, tooltipEnabled,
    openInNewTab, noFollow,
    badgeText, badgeColor, badgeTextColor,
}) => {
    const { connectors: { connect, drag } } = useNode();
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));
    const [hovered, setHovered] = useState(false);

    const alignMap = { left: 'flex-start', center: 'center', right: 'flex-end' };

    const bg = gradientEnabled
        ? `linear-gradient(135deg, ${bgColor} 0%, ${gradientEnd} 100%)`
        : bgColor;

    // Hover overrides
    let hoverStyle = {};
    if (hovered) {
        if (hoverEffect === 'lift')   hoverStyle = { transform: 'translateY(-3px)', boxShadow: '0 8px 24px rgba(0,0,0,0.22)' };
        if (hoverEffect === 'scale')  hoverStyle = { transform: 'scale(1.05)' };
        if (hoverEffect === 'glow')   hoverStyle = { boxShadow: `0 0 0 4px ${bgColor}55, 0 4px 20px ${bgColor}88` };
        if (hoverEffect === 'dim')    hoverStyle = { opacity: 0.8 };
        if (hoverEffect === 'fill')   hoverStyle = { backgroundColor: borderColor, color: bgColor === 'transparent' ? borderColor : textColor, background: borderColor };
        if (hoverEffect === 'invert') hoverStyle = { filter: 'invert(1)' };
    }

    // Animation style
    let animStyle = {};
    if (animationStyle === 'shake')  animStyle = { animation: 'bw-shake 0.6s ease infinite' };
    if (animationStyle === 'bounce') animStyle = { animation: 'bw-bounce 1.2s ease infinite' };

    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: bg,
        color: textColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: `${borderRadius}px`,
        padding: `${paddingY}px ${paddingX}px`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textDecoration: 'none',
        cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto',
        textAlign: 'center',
        boxShadow: shadow ? '0 4px 14px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        letterSpacing: `${letterSpacing}px`,
        textTransform,
        opacity: opacity / 100,
        position: 'relative',
        '--bw-pulse-rgb': hexToRgb(bgColor),
        ...(pulse ? { animation: 'bw-pulse 2s infinite' } : {}),
        ...animStyle,
        ...hoverStyle,
    };

    const iconEl = icon && ICONS[icon] ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
            {ICONS[icon]}
        </span>
    ) : null;

    const badge = badgeText ? (
        <span style={{
            position: 'absolute', top: '-10px', right: '-10px',
            background: badgeColor || '#ef4444', color: badgeTextColor || '#fff',
            fontSize: '10px', fontWeight: '700', borderRadius: '50px',
            padding: '2px 7px', whiteSpace: 'nowrap', lineHeight: 1.6,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        }}>
            {badgeText}
        </span>
    ) : null;

    const relArr = [];
    if (noFollow) relArr.push('nofollow');
    if (openInNewTab) relArr.push('noopener', 'noreferrer');

    const inner = (
        <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {iconPosition === 'left' && iconEl}
            {text}
            {iconPosition === 'right' && iconEl}
            {badge}
        </span>
    );

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{ display: 'flex', justifyContent: alignMap[alignment] || 'center', padding: '8px 0' }}
            title={tooltipEnabled ? tooltipText : undefined}
        >
            <a
                href={url || '#'}
                target={openInNewTab ? '_blank' : '_self'}
                rel={relArr.length ? relArr.join(' ') : undefined}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={e => {
                    if (enabled) { e.preventDefault(); return; }
                    if (url && url.startsWith('#')) {
                        e.preventDefault();
                        const target = document.getElementById(url.slice(1));
                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }}
                style={baseStyle}
            >
                {inner}
            </a>
        </div>
    );
};

// ─── Settings Panel ────────────────────────────────────────────────────────────
const ButtonSettings = () => {
    const { actions: { setProp }, props } = useNode(node => ({ props: node.data.props }));
    const p = props;
    const [activeTab, setActiveTab] = useState('content');
    const [templateOpen, setTemplateOpen] = useState(false);

    const applyTemplate = (tpl) => {
        const t = TEMPLATES[tpl];
        if (!t) return;
        Object.entries(t.props).forEach(([k, v]) => setProp(pr => { pr[k] = v; }));
        setTemplateOpen(false);
    };

    const tabs = ['content', 'style', 'layout', 'effects', 'advanced'];

    const inputCls = 'w-full mt-1 text-sm border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400';
    const labelCls = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
    const sectionCls = 'space-y-3 pt-2';

    return (
        <div className="text-sm">
            
            {/* ── Duplicate Widget Button ── */}
            <DuplicateButton />

            {/* ── Template Picker ── */}
            <div className="mb-3">
                <button
                    onClick={() => setTemplateOpen(o => !o)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-semibold shadow"
                >
                    <span>⚡ Apply Template</span>
                    <span>{templateOpen ? '▲' : '▼'}</span>
                </button>
                {templateOpen && (
                    <div className="mt-2 space-y-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                        {Object.entries(TEMPLATES).map(([key, tpl]) => (
                            <button
                                key={key}
                                onClick={() => applyTemplate(key)}
                                className="w-full text-left px-3 py-2 text-xs rounded hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium"
                            >
                                {tpl.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-0.5 bg-gray-100 rounded-lg p-0.5 mb-3">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── CONTENT TAB ── */}
            {activeTab === 'content' && (
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Button Text</label>
                        <input type="text" value={p.text} onChange={e => setProp(pr => pr.text = e.target.value)} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Link URL</label>
                        <input type="text" value={p.url} onChange={e => setProp(pr => pr.url = e.target.value)} placeholder="#checkout or https://..." className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Icon</label>
                        <select value={p.icon} onChange={e => setProp(pr => pr.icon = e.target.value)} className={inputCls}>
                            {Object.keys(ICONS).map(k => <option key={k} value={k}>{k === 'none' ? '— None —' : k}</option>)}
                        </select>
                    </div>
                    {p.icon !== 'none' && (
                        <div>
                            <label className={labelCls}>Icon Position</label>
                            <select value={p.iconPosition} onChange={e => setProp(pr => pr.iconPosition = e.target.value)} className={inputCls}>
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Badge Text (optional)</label>
                        <input type="text" value={p.badgeText || ''} onChange={e => setProp(pr => pr.badgeText = e.target.value)} placeholder="NEW, HOT, -20%…" className={inputCls} />
                    </div>
                    {p.badgeText && (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className={labelCls}>Badge BG</label>
                                <input type="color" value={p.badgeColor || '#ef4444'} onChange={e => setProp(pr => pr.badgeColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className={labelCls}>Badge Text</label>
                                <input type="color" value={p.badgeTextColor || '#ffffff'} onChange={e => setProp(pr => pr.badgeTextColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                            </div>
                        </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input type="checkbox" checked={!!p.tooltipEnabled} onChange={e => setProp(pr => pr.tooltipEnabled = e.target.checked)} className="rounded" />
                        <span>Show Tooltip</span>
                    </label>
                    {p.tooltipEnabled && (
                        <input type="text" value={p.tooltipText || ''} onChange={e => setProp(pr => pr.tooltipText = e.target.value)} placeholder="Tooltip text…" className={inputCls} />
                    )}
                </div>
            )}

            {/* ── STYLE TAB ── */}
            {activeTab === 'style' && (
                <div className={sectionCls}>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className={labelCls}>Background</label>
                            <input type="color" value={p.bgColor} onChange={e => setProp(pr => pr.bgColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                        </div>
                        <div className="flex-1">
                            <label className={labelCls}>Text</label>
                            <input type="color" value={p.textColor} onChange={e => setProp(pr => pr.textColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                        </div>
                        <div className="flex-1">
                            <label className={labelCls}>Border</label>
                            <input type="color" value={p.borderColor} onChange={e => setProp(pr => pr.borderColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!p.gradientEnabled} onChange={e => setProp(pr => pr.gradientEnabled = e.target.checked)} className="rounded" />
                        <span>Enable Gradient</span>
                    </label>
                    {p.gradientEnabled && (
                        <div>
                            <label className={labelCls}>Gradient End Color</label>
                            <input type="color" value={p.gradientEnd || p.bgColor} onChange={e => setProp(pr => pr.gradientEnd = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" />
                        </div>
                    )}
                    <div>
                        <label className={labelCls}>Border Width ({p.borderWidth}px)</label>
                        <input type="range" min="0" max="6" value={p.borderWidth} onChange={e => setProp(pr => pr.borderWidth = parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className={labelCls}>Border Radius ({p.borderRadius}px)</label>
                        <input type="range" min="0" max="50" value={p.borderRadius} onChange={e => setProp(pr => pr.borderRadius = parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className={labelCls}>Font Size ({p.fontSize}px)</label>
                        <input type="range" min="10" max="32" value={p.fontSize} onChange={e => setProp(pr => pr.fontSize = parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className={labelCls}>Font Weight</label>
                        <select value={p.fontWeight} onChange={e => setProp(pr => pr.fontWeight = e.target.value)} className={inputCls}>
                            <option value="400">Normal (400)</option>
                            <option value="500">Medium (500)</option>
                            <option value="600">Semibold (600)</option>
                            <option value="700">Bold (700)</option>
                            <option value="800">Extra Bold (800)</option>
                            <option value="900">Black (900)</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Letter Spacing ({p.letterSpacing}px)</label>
                        <input type="range" min="0" max="8" step="0.5" value={p.letterSpacing || 0} onChange={e => setProp(pr => pr.letterSpacing = parseFloat(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className={labelCls}>Text Transform</label>
                        <select value={p.textTransform || 'none'} onChange={e => setProp(pr => pr.textTransform = e.target.value)} className={inputCls}>
                            <option value="none">None</option>
                            <option value="uppercase">UPPERCASE</option>
                            <option value="lowercase">lowercase</option>
                            <option value="capitalize">Capitalize</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Opacity ({p.opacity ?? 100}%)</label>
                        <input type="range" min="20" max="100" value={p.opacity ?? 100} onChange={e => setProp(pr => pr.opacity = parseInt(e.target.value))} className="w-full" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!p.shadow} onChange={e => setProp(pr => pr.shadow = e.target.checked)} className="rounded" />
                        <span>Drop Shadow</span>
                    </label>
                </div>
            )}

            {/* ── LAYOUT TAB ── */}
            {activeTab === 'layout' && (
                <div className={sectionCls}>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className={labelCls}>Padding X ({p.paddingX}px)</label>
                            <input type="range" min="8" max="80" value={p.paddingX} onChange={e => setProp(pr => pr.paddingX = parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className={labelCls}>Padding Y ({p.paddingY}px)</label>
                            <input type="range" min="4" max="40" value={p.paddingY} onChange={e => setProp(pr => pr.paddingY = parseInt(e.target.value))} className="w-full" />
                        </div>
                    </div>
                    <div>
                        <label className={labelCls}>Alignment</label>
                        <div className="flex gap-2 mt-1">
                            {['left', 'center', 'right'].map(a => (
                                <button
                                    key={a}
                                    onClick={() => setProp(pr => pr.alignment = a)}
                                    className={`flex-1 py-1.5 text-xs rounded border capitalize font-medium transition-all ${p.alignment === a ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-300'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input type="checkbox" checked={!!p.fullWidth} onChange={e => setProp(pr => pr.fullWidth = e.target.checked)} className="rounded" />
                        <span>Full Width</span>
                    </label>
                </div>
            )}

            {/* ── EFFECTS TAB ── */}
            {activeTab === 'effects' && (
                <div className={sectionCls}>
                    <div>
                        <label className={labelCls}>Hover Effect</label>
                        <select value={p.hoverEffect || 'none'} onChange={e => setProp(pr => pr.hoverEffect = e.target.value)} className={inputCls}>
                            <option value="none">None</option>
                            <option value="lift">Lift (move up)</option>
                            <option value="scale">Scale Up</option>
                            <option value="glow">Glow Ring</option>
                            <option value="dim">Dim</option>
                            <option value="fill">Fill (outline style)</option>
                            <option value="invert">Invert Colors</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelCls}>Attention Animation</label>
                        <select value={p.animationStyle || 'none'} onChange={e => setProp(pr => pr.animationStyle = e.target.value)} className={inputCls}>
                            <option value="none">None</option>
                            <option value="shake">Shake (urgency)</option>
                            <option value="bounce">Bounce (playful)</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input type="checkbox" checked={!!p.pulse} onChange={e => setProp(pr => pr.pulse = e.target.checked)} className="rounded" />
                        <span>Pulse Ring (draws attention)</span>
                    </label>
                </div>
            )}

            {/* ── ADVANCED TAB ── */}
            {activeTab === 'advanced' && (
                <div className={sectionCls}>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!p.openInNewTab} onChange={e => setProp(pr => pr.openInNewTab = e.target.checked)} className="rounded" />
                        <span>Open in New Tab</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={!!p.noFollow} onChange={e => setProp(pr => pr.noFollow = e.target.checked)} className="rounded" />
                        <span>Add rel="nofollow"</span>
                    </label>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-xs text-gray-500 leading-relaxed">
                        <strong className="text-gray-700 block mb-1">📋 Current Config</strong>
                        <pre className="whitespace-pre-wrap break-all text-gray-400 text-[10px]">
                            {JSON.stringify({
                                text: p.text, url: p.url, icon: p.icon,
                                gradient: p.gradientEnabled, hover: p.hoverEffect,
                                animation: p.animationStyle, pulse: p.pulse,
                            }, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Craft Config ──────────────────────────────────────────────────────────────
ButtonWidget.craft = {
    displayName: 'Button',
    props: {
        // Base
        text: '🛒 Order Now — COD Available',
        url: '#checkout',
        bgColor: '#f59e0b',
        textColor: '#1a1a1a',
        borderColor: '#f59e0b',
        borderWidth: 0,
        borderRadius: 8,
        paddingX: 32,
        paddingY: 14,
        fontSize: 16,
        fontWeight: '700',
        shadow: true,
        fullWidth: false,
        alignment: 'center',
        // New
        hoverEffect: 'lift',
        animationStyle: 'none',
        gradientEnabled: false,
        gradientEnd: '#f59e0b',
        icon: 'cart',
        iconPosition: 'left',
        pulse: false,
        outline: false,
        letterSpacing: 0,
        textTransform: 'none',
        opacity: 100,
        tooltipText: '',
        tooltipEnabled: false,
        openInNewTab: false,
        noFollow: false,
        badgeText: '',
        badgeColor: '#ef4444',
        badgeTextColor: '#ffffff',
    },
    related: { settings: ButtonSettings },
};

export default ButtonWidget;