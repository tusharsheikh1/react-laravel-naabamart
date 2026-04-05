import React, { useState } from 'react';
import { useNode } from '@craftjs/core';

// ─── Shared UI primitives ─────────────────────────────────────────────────

const Section = ({ title, accent, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
                <div className="flex items-center gap-2">
                    {accent && <span>{accent}</span>}
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
                </div>
                <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="p-3 space-y-3">{children}</div>}
        </div>
    );
};

const Slider = ({ label, value, min, max, step = 1, onChange, unit = 'px' }) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-gray-600">{label}</label>
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full accent-indigo-500 h-1.5" />
    </div>
);

const ColorPicker = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600">{label}</label>
        <div className="flex items-center gap-1.5">
            <input type="color" value={value || '#6366f1'} onChange={onChange} className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0" />
            <span className="text-xs font-mono text-gray-400 w-16">{value}</span>
        </div>
    </div>
);

const Toggle = ({ label, checked, onChange, hint }) => (
    <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5 shrink-0">
            <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
            <div className={`w-9 h-5 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
        </div>
        <div>
            <span className="text-sm text-gray-700 font-medium leading-5">{label}</span>
            {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
        </div>
    </label>
);

const TabGroup = ({ value, onChange, options }) => (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-wrap">
        {options.map(opt => (
            <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={`flex-1 py-1.5 text-xs font-medium transition ${
                    value === opt.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

// ─── Template definitions ─────────────────────────────────────────────────
const CARD_TEMPLATES = [
    {
        key: 'cards',
        label: 'Cards',
        emoji: '🃏',
        desc: 'Classic white shadow card with icon on top',
        preview: (ac) => (
            <div style={{ background: '#fff', borderRadius: 8, padding: '10px 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.10)', textAlign: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ac}22`, color: ac, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px' }}>✨</div>
                <div style={{ height: 6, background: '#1e293b', borderRadius: 3, width: '70%', margin: '0 auto 4px' }} />
                <div style={{ height: 4, background: '#94a3b8', borderRadius: 2, width: '90%', margin: '0 auto' }} />
            </div>
        ),
        // Recommended settings applied when template is picked
        defaults: { columns: 3, bgColor: '#f8fafc', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 1, cardBorderColor: '#e2e8f0', cardRadius: 16, cardShadow: 'md', cardPadding: 28, iconShape: 'rounded' },
    },
    {
        key: 'horizontal',
        label: 'Horizontal',
        emoji: '➡️',
        desc: 'Icon left, text right — compact list style',
        preview: (ac) => (
            <div style={{ background: '#fff', borderRadius: 8, padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: `${ac}22`, color: ac, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✨</div>
                <div style={{ flex: 1 }}>
                    <div style={{ height: 5, background: '#1e293b', borderRadius: 3, width: '70%', marginBottom: 4 }} />
                    <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%' }} />
                </div>
            </div>
        ),
        defaults: { columns: 2, bgColor: '#ffffff', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 1, cardBorderColor: '#f1f5f9', cardRadius: 12, cardShadow: 'sm', cardPadding: 20, iconShape: 'rounded' },
    },
    {
        key: 'flatBorder',
        label: 'Flat Border',
        emoji: '▌',
        desc: 'No shadow, bold colored left-border accent',
        preview: (ac) => (
            <div style={{ background: '#fff', borderRadius: '0 8px 8px 0', borderLeft: `4px solid ${ac}`, border: '1px solid #e2e8f0', borderLeft: `4px solid ${ac}`, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 5, background: `${ac}18`, color: ac, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✨</div>
                <div style={{ flex: 1 }}>
                    <div style={{ height: 5, background: '#1e293b', borderRadius: 3, width: '65%', marginBottom: 4 }} />
                    <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%' }} />
                </div>
            </div>
        ),
        defaults: { columns: 2, bgColor: '#f8fafc', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 1, cardBorderColor: '#e2e8f0', cardRadius: 8, cardShadow: 'none', cardPadding: 20, iconShape: 'rounded' },
    },
    {
        key: 'glass',
        label: 'Glass',
        emoji: '🪟',
        desc: 'Frosted glass — best on dark/gradient backgrounds',
        preview: (ac) => (
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 8, padding: 8 }}>
                <div style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', padding: '8px 8px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: 'rgba(255,255,255,0.2)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>✨</div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.9)', borderRadius: 3, width: '70%', marginBottom: 4 }} />
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 2, width: '100%' }} />
                </div>
            </div>
        ),
        defaults: { columns: 3, bgType: 'gradient', bgGradientFrom: '#6366f1', bgGradientTo: '#8b5cf6', bgGradientDirection: 135, cardBg: 'rgba(255,255,255,0.1)', cardBorderWidth: 1, cardBorderColor: 'rgba(255,255,255,0.2)', cardRadius: 16, cardShadow: 'none', cardPadding: 28, iconShape: 'rounded', iconColor: '#a5b4fc', iconBg: 'rgba(255,255,255,0.15)', itemTitleColor: '#ffffff', itemDescColor: 'rgba(255,255,255,0.7)', titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.75)' },
    },
    {
        key: 'dark',
        label: 'Dark',
        emoji: '🌑',
        desc: 'Dark cards on a deep section background',
        preview: (ac) => (
            <div style={{ background: '#0f172a', borderRadius: 8, padding: 8 }}>
                <div style={{ background: '#1e293b', borderRadius: 6, border: '1px solid #334155', padding: '8px 8px' }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `${ac}20`, color: ac, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>✨</div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, width: '70%', marginBottom: 4 }} />
                    <div style={{ height: 3, background: '#64748b', borderRadius: 2, width: '100%' }} />
                </div>
            </div>
        ),
        defaults: { columns: 3, bgType: 'color', bgColor: '#0f172a', cardBg: '#1e293b', cardBorderWidth: 1, cardBorderColor: '#334155', cardRadius: 16, cardShadow: 'none', cardPadding: 28, iconShape: 'rounded', iconColor: '#818cf8', iconBg: '#312e81', itemTitleColor: '#f1f5f9', itemDescColor: '#94a3b8', titleColor: '#f1f5f9', subtitleColor: '#94a3b8' },
    },
    {
        key: 'pillSteps',
        label: 'Steps',
        emoji: '⓵',
        desc: 'Numbered pill steps with a connector line',
        preview: (ac) => (
            <div style={{ background: '#fff', borderRadius: 8, padding: '8px', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                {[1,2,3].map(n => (
                    <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: ac, color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
                        <div style={{ height: 4, background: '#1e293b', borderRadius: 2, width: '80%' }} />
                        <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%' }} />
                    </div>
                ))}
            </div>
        ),
        defaults: { columns: 4, bgColor: '#ffffff', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 0, cardRadius: 0, cardShadow: 'none', cardPadding: 20, iconShape: 'circle', showNumbers: false },
    },
    {
        key: 'bigEmoji',
        label: 'Big Emoji',
        emoji: '😍',
        desc: 'Huge emoji above minimal text, no card background',
        preview: (_ac) => (
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 4px', textAlign: 'center', display: 'flex', gap: 4 }}>
                {['🏆','🚚','🛡️'].map((e,i) => (
                    <div key={i} style={{ flex: 1 }}>
                        <div style={{ fontSize: 20, lineHeight: 1, marginBottom: 4 }}>{e}</div>
                        <div style={{ height: 4, background: '#1e293b', borderRadius: 2, width: '80%', margin: '0 auto 3px' }} />
                        <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%', margin: '0 auto' }} />
                    </div>
                ))}
            </div>
        ),
        defaults: { columns: 4, bgColor: '#f8fafc', bgType: 'color', cardBg: 'transparent', cardBorderWidth: 0, cardRadius: 0, cardShadow: 'none', cardPadding: 16, iconShape: 'none' },
    },
    {
        key: 'checklist',
        label: 'Checklist',
        emoji: '☑️',
        desc: 'Compact dense rows — great for long feature lists',
        preview: (ac) => (
            <div style={{ background: '#fff', borderRadius: 8, padding: '8px' }}>
                {[1,2,3].map(n => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 5, marginBottom: 5, borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${ac}18`, color: ac, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ height: 4, background: '#1e293b', borderRadius: 2, width: '60%', marginBottom: 2 }} />
                            <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%' }} />
                        </div>
                    </div>
                ))}
            </div>
        ),
        defaults: { columns: 1, bgColor: '#ffffff', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 0, cardBorderColor: '#f1f5f9', cardRadius: 0, cardShadow: 'none', cardPadding: 16, iconShape: 'none' },
    },
    {
        key: 'split',
        label: 'Split',
        emoji: '◧',
        desc: 'Colored icon band left, white text area right',
        preview: (ac) => (
            <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', gap: 0 }}>
                <div style={{ width: 30, background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>✨</div>
                <div style={{ flex: 1, background: '#fff', padding: '8px 10px' }}>
                    <div style={{ height: 5, background: '#1e293b', borderRadius: 3, width: '70%', marginBottom: 4 }} />
                    <div style={{ height: 3, background: '#94a3b8', borderRadius: 2, width: '100%' }} />
                </div>
            </div>
        ),
        defaults: { columns: 2, bgColor: '#f8fafc', bgType: 'color', cardBg: '#ffffff', cardBorderWidth: 1, cardBorderColor: '#e2e8f0', cardRadius: 12, cardShadow: 'sm', cardPadding: 24, iconShape: 'none' },
    },
];

// ─── Main settings panel ───────────────────────────────────────────────────

export default function FeaturesSettings() {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    const [copied, setCopied] = useState(false);
    const anchorLink = `#${p.sectionId || 'features'}`;

    const copyLink = () => {
        navigator.clipboard.writeText(anchorLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const updateItem = (i, field, val) => setProp(pr => { pr.items[i][field] = val; });
    const addItem    = () => setProp(pr => { pr.items.push({ title: 'New Feature', description: 'Describe this feature.', icon: '⭐', iconBg: '', iconColor: '' }); });
    const removeItem = (i) => setProp(pr => { pr.items.splice(i, 1); });
    const moveItem   = (i, dir) => setProp(pr => {
        const arr = pr.items;
        const to  = i + dir;
        if (to < 0 || to >= arr.length) return;
        [arr[i], arr[to]] = [arr[to], arr[i]];
    });

    // Apply a template's recommended defaults
    const applyTemplate = (tmpl) => {
        setProp(pr => {
            pr.cardTemplate = tmpl.key;
            if (tmpl.defaults) {
                Object.entries(tmpl.defaults).forEach(([k, v]) => { pr[k] = v; });
            }
        });
    };

    // Accent colour for preview miniatures
    const previewAccent = p.iconColor || '#6366f1';

    return (
        <div className="pb-6">

            {/* ══ SECTION LINK / ANCHOR ══════════════════════════════ */}
            <Section title="Section Link (Scroll to Features)" accent="🔗" defaultOpen={false}>
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 leading-relaxed">
                    Use this link in any button, hero CTA, or nav to scroll visitors directly to this features section.
                </div>

                {/* Anchor ID field */}
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Section ID (anchor)</label>
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 font-mono shrink-0">#</span>
                        <input
                            type="text"
                            value={p.sectionId || 'features'}
                            onChange={e => set('sectionId', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                            className="flex-1 text-sm border-gray-300 rounded-md font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="features"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Only letters, numbers, hyphens and underscores.</p>
                </div>

                {/* Copyable link display */}
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Link to copy</label>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                        <code className="flex-1 text-xs font-mono text-indigo-700 break-all">{anchorLink}</code>
                        <button
                            type="button"
                            onClick={copyLink}
                            className={`shrink-0 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                                copied
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-indigo-100 text-indigo-700 border border-indigo-200 hover:bg-indigo-200'
                            }`}
                        >
                            {copied ? '✓ Copied' : 'Copy'}
                        </button>
                    </div>
                </div>

                {/* Usage hint */}
                <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs text-gray-500 leading-relaxed space-y-1">
                    <p className="font-semibold text-gray-600">How to use in a Button widget:</p>
                    <p>Set the button's link / href to <code className="bg-gray-100 px-1 rounded font-mono">{anchorLink}</code></p>
                    <p className="text-gray-400">Clicking it will smoothly scroll down to this features section.</p>
                </div>
            </Section>

            {/* ══ STYLE GALLERY ═══════════════════════════════════════ */}
            <Section title="Card Style" accent="🎨" defaultOpen={true}>
                <p className="text-xs text-gray-400 -mt-1">Pick a style — settings are applied automatically. Fine-tune below.</p>
                <div className="grid grid-cols-3 gap-2">
                    {CARD_TEMPLATES.map(tmpl => {
                        const isActive = p.cardTemplate === tmpl.key;
                        return (
                            <button
                                key={tmpl.key}
                                type="button"
                                onClick={() => applyTemplate(tmpl)}
                                className="text-left rounded-xl overflow-hidden transition-all"
                                style={{
                                    border: `2px solid ${isActive ? '#6366f1' : '#e2e8f0'}`,
                                    background: isActive ? '#f0f0ff' : '#fff',
                                    outline: 'none',
                                    transform: isActive ? 'scale(1.03)' : 'scale(1)',
                                    boxShadow: isActive ? '0 0 0 2px #6366f155' : 'none',
                                }}
                            >
                                {/* Miniature preview */}
                                <div className="p-2 bg-gray-50">
                                    {tmpl.preview(previewAccent)}
                                </div>
                                <div className="px-2 pb-2 pt-1.5">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <span className="text-sm">{tmpl.emoji}</span>
                                        <span className="text-xs font-bold text-gray-800">{tmpl.label}</span>
                                        {isActive && <span className="ml-auto text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold">✓</span>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 leading-tight">{tmpl.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </Section>

            {/* ══ SECTION HEADER ══════════════════════════════════════ */}
            <Section title="Section Header" accent="✏️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Section Title</label>
                    <input
                        type="text"
                        value={p.sectionTitle}
                        onChange={e => set('sectionTitle', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg px-3 py-2"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Subtitle</label>
                    <textarea
                        rows={2}
                        value={p.sectionSubtitle}
                        onChange={e => set('sectionSubtitle', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg px-3 py-2 resize-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Alignment</label>
                    <TabGroup
                        value={p.headerAlign}
                        onChange={v => set('headerAlign', v)}
                        options={[
                            { value: 'left',   label: 'Left'   },
                            { value: 'center', label: 'Center' },
                            { value: 'right',  label: 'Right'  },
                        ]}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Title Size"    value={p.titleSize}    min={20} max={60} onChange={e => set('titleSize',    parseInt(e.target.value))} />
                    <Slider label="Subtitle Size" value={p.subtitleSize} min={12} max={24} onChange={e => set('subtitleSize', parseInt(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ColorPicker label="Title Color"    value={p.titleColor}    onChange={e => set('titleColor',    e.target.value)} />
                    <ColorPicker label="Subtitle Color" value={p.subtitleColor} onChange={e => set('subtitleColor', e.target.value)} />
                </div>
            </Section>

            {/* ══ LAYOUT ══════════════════════════════════════════════ */}
            <Section title="Layout" accent="🗂️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Columns</label>
                    <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => set('columns', n)}
                                className={`py-1.5 text-xs rounded-lg border font-bold transition ${
                                    p.columns === n ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                    </div>
                    {p.cardTemplate === 'checklist' && (
                        <p className="text-[10px] text-amber-600 mt-1">Checklist style always uses 1 column.</p>
                    )}
                </div>
                <Slider label="Gap between items" value={p.gap} min={0} max={60} onChange={e => set('gap', parseInt(e.target.value))} />
            </Section>

            {/* ══ BACKGROUND ══════════════════════════════════════════ */}
            <Section title="Background" accent="🖼️" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-1">
                    {[
                        { key: 'color',    label: '🎨 Solid'    },
                        { key: 'gradient', label: '🌈 Gradient' },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => set('bgType', key)}
                            className={`py-2 text-xs rounded-lg border font-medium transition ${
                                p.bgType === key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {p.bgType === 'color' && (
                    <ColorPicker label="Background Color" value={p.bgColor} onChange={e => set('bgColor', e.target.value)} />
                )}
                {p.bgType === 'gradient' && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">From</label>
                                <input type="color" value={p.bgGradientFrom} onChange={e => set('bgGradientFrom', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">To</label>
                                <input type="color" value={p.bgGradientTo} onChange={e => set('bgGradientTo', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        <Slider label="Direction" value={p.bgGradientDirection} min={0} max={360} onChange={e => set('bgGradientDirection', parseInt(e.target.value))} unit="°" />
                        <div className="h-8 rounded-lg" style={{ background: `linear-gradient(${p.bgGradientDirection}deg, ${p.bgGradientFrom}, ${p.bgGradientTo})` }} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Pad Top"    value={p.paddingTop}    min={0} max={160} onChange={e => set('paddingTop',    parseInt(e.target.value))} />
                    <Slider label="Pad Bottom" value={p.paddingBottom} min={0} max={160} onChange={e => set('paddingBottom', parseInt(e.target.value))} />
                    <Slider label="Pad Left"   value={p.paddingLeft}   min={0} max={80}  onChange={e => set('paddingLeft',   parseInt(e.target.value))} />
                    <Slider label="Pad Right"  value={p.paddingRight}  min={0} max={80}  onChange={e => set('paddingRight',  parseInt(e.target.value))} />
                </div>
            </Section>

            {/* ══ CARD FINE-TUNE ═══════════════════════════════════════ */}
            <Section title="Card Fine-Tune" accent="🃏" defaultOpen={false}>
                <ColorPicker label="Card Background" value={p.cardBg} onChange={e => set('cardBg', e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                    <ColorPicker label="Border Color" value={p.cardBorderColor} onChange={e => set('cardBorderColor', e.target.value)} />
                    <Slider label="Border Width" value={p.cardBorderWidth} min={0} max={4} onChange={e => set('cardBorderWidth', parseInt(e.target.value))} />
                </div>
                <Slider label="Border Radius" value={p.cardRadius} min={0} max={40} onChange={e => set('cardRadius', parseInt(e.target.value))} />
                <Slider label="Padding"       value={p.cardPadding} min={8} max={60} onChange={e => set('cardPadding', parseInt(e.target.value))} />
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Shadow</label>
                    <TabGroup
                        value={p.cardShadow}
                        onChange={v => set('cardShadow', v)}
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'sm',   label: 'SM'   },
                            { value: 'md',   label: 'MD'   },
                            { value: 'lg',   label: 'LG'   },
                        ]}
                    />
                </div>
            </Section>

            {/* ══ ICON STYLE ═══════════════════════════════════════════ */}
            <Section title="Icon Style" accent="🎭" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Icon Shape</label>
                    <TabGroup
                        value={p.iconShape}
                        onChange={v => set('iconShape', v)}
                        options={[
                            { value: 'circle',  label: 'Circle'  },
                            { value: 'rounded', label: 'Rounded' },
                            { value: 'square',  label: 'Square'  },
                            { value: 'none',    label: 'None'    },
                        ]}
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Icon Size</label>
                    <TabGroup
                        value={p.iconSize}
                        onChange={v => set('iconSize', v)}
                        options={[
                            { value: 'sm', label: 'Small'  },
                            { value: 'md', label: 'Medium' },
                            { value: 'lg', label: 'Large'  },
                        ]}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ColorPicker label="Icon BG"    value={p.iconBg}    onChange={e => set('iconBg',    e.target.value)} />
                    <ColorPicker label="Icon Color" value={p.iconColor} onChange={e => set('iconColor', e.target.value)} />
                </div>
                <Toggle
                    label="Use step numbers instead of icons"
                    checked={p.showNumbers}
                    onChange={e => set('showNumbers', e.target.checked)}
                    hint="Replaces emoji icons with 01, 02, 03…"
                />
                {/* Quick palette */}
                <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Quick Palette</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            ['#ede9fe','#7c3aed','Violet'],
                            ['#dbeafe','#2563eb','Blue'],
                            ['#dcfce7','#16a34a','Green'],
                            ['#fef3c7','#d97706','Amber'],
                            ['#fee2e2','#dc2626','Red'],
                            ['#f0f9ff','#0ea5e9','Sky'],
                            ['#fdf4ff','#a21caf','Purple'],
                            ['#1e293b','#f8fafc','Dark'],
                        ].map(([bg, color, name]) => (
                            <button
                                key={name}
                                type="button"
                                title={name}
                                onClick={() => { set('iconBg', bg); set('iconColor', color); }}
                                className="w-7 h-7 rounded-full border-2 border-white shadow hover:scale-110 transition-transform flex items-center justify-center text-xs"
                                style={{ backgroundColor: bg, color }}
                            >
                                ✦
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ══ ITEM TEXT ════════════════════════════════════════════ */}
            <Section title="Item Text" accent="🔤" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Title Size" value={p.itemTitleSize} min={12} max={28} onChange={e => set('itemTitleSize', parseInt(e.target.value))} />
                    <Slider label="Desc Size"  value={p.itemDescSize}  min={11} max={20} onChange={e => set('itemDescSize',  parseInt(e.target.value))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <ColorPicker label="Title Color" value={p.itemTitleColor} onChange={e => set('itemTitleColor', e.target.value)} />
                    <ColorPicker label="Desc Color"  value={p.itemDescColor}  onChange={e => set('itemDescColor',  e.target.value)} />
                </div>
            </Section>

            {/* ══ ANIMATION ════════════════════════════════════════════ */}
            <Section title="Animation" accent="🎬" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Entrance</label>
                    <select
                        value={p.animation}
                        onChange={e => set('animation', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="none">None</option>
                        <option value="fadeUp">Fade Up</option>
                        <option value="fadeIn">Fade In</option>
                        <option value="zoomIn">Zoom In</option>
                        <option value="slideLeft">Slide from Right</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Stagger Delay</label>
                    <select
                        value={p.staggerDelay}
                        onChange={e => set('staggerDelay', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="0">None</option>
                        <option value="0.05">0.05s</option>
                        <option value="0.08">0.08s</option>
                        <option value="0.12">0.12s</option>
                        <option value="0.15">0.15s</option>
                    </select>
                </div>
            </Section>

            {/* ══ FEATURE ITEMS ════════════════════════════════════════ */}
            <Section title={`Feature Items (${p.items.length})`} accent="📋" defaultOpen={true}>
                <div className="space-y-3">
                    {p.items.map((item, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                                <input
                                    type="text"
                                    value={item.icon}
                                    onChange={e => updateItem(i, 'icon', e.target.value)}
                                    className="w-10 text-center text-sm border-gray-200 rounded font-medium"
                                    placeholder="🏆"
                                />
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={e => updateItem(i, 'title', e.target.value)}
                                    className="flex-1 text-xs border-gray-200 rounded px-2 py-1 font-medium"
                                    placeholder="Feature title"
                                />
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => moveItem(i, -1)} disabled={i === 0}
                                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                                    <button onClick={() => moveItem(i, 1)} disabled={i === p.items.length - 1}
                                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                                    <button onClick={() => removeItem(i)}
                                        className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-600 font-bold text-sm">×</button>
                                </div>
                            </div>
                            <div className="p-3 space-y-2">
                                <textarea
                                    rows={2}
                                    value={item.description}
                                    onChange={e => updateItem(i, 'description', e.target.value)}
                                    className="w-full text-xs border-gray-200 rounded-lg px-2 py-1.5 resize-none"
                                    placeholder="Description"
                                />
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-400 shrink-0">Icon override</span>
                                    <input type="color" value={item.iconBg || p.iconBg}
                                        onChange={e => updateItem(i, 'iconBg', e.target.value)}
                                        title="Icon BG" className="h-5 w-6 rounded cursor-pointer border border-gray-200 p-0" />
                                    <input type="color" value={item.iconColor || p.iconColor}
                                        onChange={e => updateItem(i, 'iconColor', e.target.value)}
                                        title="Icon color" className="h-5 w-6 rounded cursor-pointer border border-gray-200 p-0" />
                                    <button
                                        onClick={() => { updateItem(i, 'iconBg', ''); updateItem(i, 'iconColor', ''); }}
                                        className="text-xs text-gray-400 hover:text-gray-600 transition">Reset</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addItem}
                    className="mt-2 w-full py-2.5 text-sm text-indigo-600 border border-dashed border-indigo-200 rounded-xl hover:bg-indigo-50 transition font-medium"
                >
                    + Add Feature
                </button>

                {/* Quick fill */}
                <div className="pt-1">
                    <label className="text-xs text-gray-400 block mb-1.5">Quick Fill</label>
                    <div className="grid grid-cols-1 gap-1">
                        {[
                            {
                                label: '🛒 E-commerce Trust',
                                items: [
                                    { title: 'Cash on Delivery', description: 'Pay only when you receive your order.',         icon: '💵', iconBg: '', iconColor: '' },
                                    { title: 'Fast Shipping',    description: 'Delivered in 2–3 days across Bangladesh.',      icon: '🚚', iconBg: '', iconColor: '' },
                                    { title: '7-Day Returns',    description: 'Not satisfied? Easy hassle-free returns.',      icon: '↩️', iconBg: '', iconColor: '' },
                                    { title: '100% Authentic',   description: 'All products sourced from verified suppliers.', icon: '✅', iconBg: '', iconColor: '' },
                                ],
                            },
                            {
                                label: '💼 Product Benefits',
                                items: [
                                    { title: 'Premium Quality', description: 'Built with the finest materials to last.',      icon: '🏆', iconBg: '', iconColor: '' },
                                    { title: 'Easy to Use',     description: 'No setup needed. Works right out of the box.',  icon: '⚡', iconBg: '', iconColor: '' },
                                    { title: 'Great Value',     description: 'Top-tier quality at an affordable price.',      icon: '💎', iconBg: '', iconColor: '' },
                                    { title: '24/7 Support',    description: 'Our team is always here to help you.',          icon: '💬', iconBg: '', iconColor: '' },
                                ],
                            },
                            {
                                label: '📚 Book Benefits',
                                items: [
                                    { title: '১০০% আসল বই',      description: 'সরাসরি প্রকাশকের কাছ থেকে সংগ্রহ করা।',     icon: '📚', iconBg: '', iconColor: '' },
                                    { title: 'ক্যাশ অন ডেলিভারি', description: 'বই হাতে পেয়ে টাকা দিন।',                  icon: '💵', iconBg: '', iconColor: '' },
                                    { title: 'দ্রুত ডেলিভারি',   description: '২-৩ দিনে সারা বাংলাদেশে পৌঁছে দেওয়া হয়।', icon: '🚚', iconBg: '', iconColor: '' },
                                    { title: '৭ দিনের রিটার্ন',  description: 'সমস্যা হলে বিনামূল্যে পরিবর্তন করা হবে।',   icon: '↩️', iconBg: '', iconColor: '' },
                                ],
                            },
                        ].map(({ label, items }) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setProp(pr => { pr.items = items; })}
                                className="w-full text-left px-3 py-2 text-xs rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition text-gray-700 font-medium"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}