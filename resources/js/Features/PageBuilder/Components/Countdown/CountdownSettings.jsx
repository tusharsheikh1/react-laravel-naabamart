import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { COUNTDOWN_TEMPLATES } from './CountdownWidget';

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
        <label className="text-xs text-gray-600 flex-1 min-w-0 truncate pr-2">{label}</label>
        <div className="flex items-center gap-1.5 shrink-0">
            <input type="color" value={value || '#000000'} onChange={onChange} className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0" />
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
    <div className="flex rounded-lg border border-gray-200 overflow-hidden">
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

const TextInput = ({ label, value, onChange, placeholder, type = 'text' }) => (
    <div>
        {label && <label className="text-xs text-gray-500 block mb-1">{label}</label>}
        <input
            type={type}
            value={value || ''}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
    </div>
);

// ─── Main Settings Panel ───────────────────────────────────────────────────

export default function CountdownSettings() {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });
    const setMany = (obj) => setProp(pr => { Object.assign(pr, obj); });

    const set24h = () => {
        const d = new Date(Date.now() + 24 * 3600 * 1000);
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        set('targetDate', local);
        set('mode', 'fixed');
    };

    const applyTemplate = (key) => {
        const tpl = COUNTDOWN_TEMPLATES[key];
        if (tpl) setMany(tpl.props);
    };

    return (
        <div className="pb-6">

            {/* ── Templates ── */}
            <Section title="Templates" accent="✨" defaultOpen={true}>
                <p className="text-xs text-gray-400">Start from a ready-made design, then customize.</p>
                <div className="grid grid-cols-1 gap-2">
                    {Object.entries(COUNTDOWN_TEMPLATES).map(([key, tpl]) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => applyTemplate(key)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-indigo-300 hover:bg-indigo-50 transition text-left group"
                        >
                            <div
                                className="w-10 h-10 rounded-lg shrink-0"
                                style={{
                                    background: tpl.props.bgType === 'gradient'
                                        ? `linear-gradient(135deg, ${tpl.props.bgGradientFrom}, ${tpl.props.bgGradientTo})`
                                        : tpl.props.bgColor,
                                }}
                            />
                            <div>
                                <div className="text-xs font-bold text-gray-700 group-hover:text-indigo-700">{tpl.label}</div>
                                <div className="text-xs text-gray-400 capitalize">{tpl.props.displayStyle} style · {tpl.props.mode} timer</div>
                            </div>
                            <div className="ml-auto text-indigo-400 opacity-0 group-hover:opacity-100 transition text-sm">Apply →</div>
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── Timer Mode ── */}
            <Section title="Timer Mode" accent="⏱️" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Countdown Type</label>
                    <TabGroup
                        value={p.mode}
                        onChange={v => set('mode', v)}
                        options={[
                            { value: 'fixed',     label: 'Fixed' },
                            { value: 'evergreen', label: 'Evergreen' },
                            { value: 'daily',     label: 'Daily' },
                        ]}
                    />
                    <div className="mt-2 p-2.5 bg-gray-50 rounded-lg text-xs text-gray-500 border border-gray-100">
                        {p.mode === 'fixed'     && '⚡ Counts down to a specific date/time you choose.'}
                        {p.mode === 'evergreen' && '♻️ Each visitor gets their own fresh countdown per browser session.'}
                        {p.mode === 'daily'     && '🔄 Resets at midnight daily — great for daily deals.'}
                    </div>
                </div>

                {p.mode === 'fixed' && (
                    <div className="space-y-2">
                        <TextInput
                            label="End Date & Time"
                            type="datetime-local"
                            value={p.targetDate}
                            onChange={e => set('targetDate', e.target.value)}
                        />
                        <button type="button" onClick={set24h} className="w-full py-1.5 text-xs text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Set to 24 hours from now
                        </button>
                    </div>
                )}

                {p.mode === 'evergreen' && (
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Duration per visitor (hours)</label>
                        <input
                            type="number"
                            min="0.5" max="720" step="0.5"
                            value={p.durationHours}
                            onChange={e => set('durationHours', parseFloat(e.target.value))}
                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2"
                        />
                    </div>
                )}

                <Toggle label="Show Days" checked={p.showDays} onChange={e => set('showDays', e.target.checked)} />
            </Section>

            {/* ── Content ── */}
            <Section title="Content" accent="✍️" defaultOpen={false}>
                <Toggle label="Show Headline" checked={p.showHeadline} onChange={e => set('showHeadline', e.target.checked)} />
                {p.showHeadline && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <TextInput value={p.headline} onChange={e => set('headline', e.target.value)} placeholder="Headline text" />
                        <div className="grid grid-cols-2 gap-2">
                            <Slider label="Size" value={p.headlineSize} min={14} max={56} onChange={e => set('headlineSize', parseInt(e.target.value))} />
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Weight</label>
                                <select value={p.headlineWeight} onChange={e => set('headlineWeight', e.target.value)} className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5">
                                    {['400','600','700','800','900'].map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                        </div>
                        <ColorPicker label="Color" value={p.headlineColor} onChange={e => set('headlineColor', e.target.value)} />
                    </div>
                )}

                <Toggle label="Show Subtitle" checked={p.showSubtitle} onChange={e => set('showSubtitle', e.target.checked)} />
                {p.showSubtitle && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <div>
                            <textarea
                                rows={3}
                                value={p.subtitle || ''}
                                onChange={e => set('subtitle', e.target.value)}
                                placeholder="Subtitle text"
                                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Slider label="Size" value={p.subtitleSize} min={11} max={24} onChange={e => set('subtitleSize', parseInt(e.target.value))} />
                            <ColorPicker label="Color" value={p.subtitleColor} onChange={e => set('subtitleColor', e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Badge */}
                <Toggle label="Show Badge Pill" checked={p.showBadge} onChange={e => set('showBadge', e.target.checked)} hint="Small pill above the headline" />
                {p.showBadge && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <TextInput value={p.badgeText} onChange={e => set('badgeText', e.target.value)} placeholder="e.g. Limited Time" />
                        <div className="grid grid-cols-2 gap-1">
                            <ColorPicker label="Background" value={p.badgeBg} onChange={e => set('badgeBg', e.target.value)} />
                            <ColorPicker label="Text" value={p.badgeTextColor} onChange={e => set('badgeTextColor', e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Urgency bar */}
                <Toggle label="Urgency Bar" checked={p.showUrgencyBar} onChange={e => set('showUrgencyBar', e.target.checked)} hint="Banner strip above timer" />
                {p.showUrgencyBar && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <TextInput value={p.urgencyText} onChange={e => set('urgencyText', e.target.value)} placeholder="e.g. 🔥 Flash Sale!" />
                        <div className="grid grid-cols-2 gap-1">
                            <ColorPicker label="Bar BG" value={p.urgencyBarBg} onChange={e => set('urgencyBarBg', e.target.value)} />
                            <ColorPicker label="Bar Text" value={p.urgencyBarText} onChange={e => set('urgencyBarText', e.target.value)} />
                        </div>
                    </div>
                )}

                <div className="pt-1 border-t border-gray-100">
                    <TextInput label="Expired Message" value={p.expiredMessage} onChange={e => set('expiredMessage', e.target.value)} placeholder="Message after expiry" />
                    <div className="mt-2">
                        <TextInput label="Redirect URL (on expiry)" value={p.expiredRedirectUrl} onChange={e => set('expiredRedirectUrl', e.target.value)} placeholder="https://..." />
                    </div>
                </div>
            </Section>

            {/* ── Timer Style ── */}
            <Section title="Timer Style" accent="🎨" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Display Style</label>
                    <div className="grid grid-cols-3 gap-1">
                        {[
                            { value: 'card',    label: '🃏 Card'    },
                            { value: 'filled',  label: '■ Filled'  },
                            { value: 'outline', label: '□ Outline' },
                            { value: 'minimal', label: '— Minimal' },
                            { value: 'glass',   label: '◈ Glass'   },
                            { value: 'neon',    label: '⚡ Neon'    },
                        ].map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => set('displayStyle', value)}
                                className={`py-1.5 text-xs rounded-lg border font-medium transition ${
                                    p.displayStyle === value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-xs text-gray-500 block mb-1">Box Size</label>
                    <TabGroup
                        value={p.boxSize}
                        onChange={v => set('boxSize', v)}
                        options={[
                            { value: 'xs', label: 'XS' },
                            { value: 'sm', label: 'SM' },
                            { value: 'md', label: 'MD' },
                            { value: 'lg', label: 'LG' },
                            { value: 'xl', label: 'XL' },
                        ]}
                    />
                </div>

                <Slider label="Box Radius" value={p.boxRadius} min={0} max={28} onChange={e => set('boxRadius', parseInt(e.target.value))} />
                <Toggle label="Show Labels" checked={p.showLabels} onChange={e => set('showLabels', e.target.checked)} />
                <Toggle
                    label="Flip Animation"
                    checked={p.flipAnimation}
                    onChange={e => set('flipAnimation', e.target.checked)}
                    hint="Split-digit flip effect when numbers change"
                />
                <Toggle
                    label="Glow Effect"
                    checked={p.showGlow}
                    onChange={e => set('showGlow', e.target.checked)}
                    hint="Adds a colour glow around boxes"
                />
                {p.showGlow && (
                    <ColorPicker label="Glow Color" value={p.glowColor} onChange={e => set('glowColor', e.target.value)} />
                )}

                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    <ColorPicker label="Box Color"     value={p.boxBg}          onChange={e => set('boxBg',          e.target.value)} />
                    <ColorPicker label="Number Color"  value={p.boxTextColor}   onChange={e => set('boxTextColor',   e.target.value)} />
                    <ColorPicker label="Label Color"   value={p.labelColor}     onChange={e => set('labelColor',     e.target.value)} />
                    <ColorPicker label="Separator (:)" value={p.separatorColor} onChange={e => set('separatorColor', e.target.value)} />
                </div>

                {/* Quick presets */}
                <div>
                    <label className="text-xs text-gray-400 block mb-1.5">Quick Presets</label>
                    <div className="flex gap-1.5 flex-wrap">
                        {[
                            { name: 'Fire',    boxBg: '#ffffff', boxText: '#dc2626', label: '#ffffff', sep: '#ffffff', bg: '#dc2626', bgTo: '#991b1b'  },
                            { name: 'Night',   boxBg: '#1e293b', boxText: '#ffffff', label: '#94a3b8', sep: '#475569', bg: '#0f172a', bgTo: '#1e293b'  },
                            { name: 'Amber',   boxBg: '#fef3c7', boxText: '#92400e', label: '#d97706', sep: '#f59e0b', bg: '#f59e0b', bgTo: '#d97706'  },
                            { name: 'Forest',  boxBg: '#dcfce7', boxText: '#15803d', label: '#16a34a', sep: '#4ade80', bg: '#16a34a', bgTo: '#15803d'  },
                            { name: 'Violet',  boxBg: '#ede9fe', boxText: '#6d28d9', label: '#8b5cf6', sep: '#a78bfa', bg: '#6366f1', bgTo: '#8b5cf6'  },
                            { name: 'Cyan',    boxBg: '#22d3ee', boxText: '#0c4a6e', label: '#0ea5e9', sep: '#22d3ee', bg: '#0c4a6e', bgTo: '#0e7490'  },
                            { name: 'Rose',    boxBg: '#ffe4e6', boxText: '#be123c', label: '#fb7185', sep: '#fb7185', bg: '#be123c', bgTo: '#9f1239'  },
                        ].map(({ name, boxBg, boxText, label, sep, bg, bgTo }) => (
                            <button
                                key={name}
                                type="button"
                                title={name}
                                onClick={() => {
                                    set('boxBg', boxBg);
                                    set('boxTextColor', boxText);
                                    set('labelColor', label);
                                    set('separatorColor', sep);
                                    set('bgType', 'gradient');
                                    set('bgGradientFrom', bg);
                                    set('bgGradientTo', bgTo);
                                    set('bgGradientDirection', 135);
                                }}
                                className="w-9 h-7 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
                                style={{ background: `linear-gradient(135deg, ${bg}, ${bgTo})` }}
                            />
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── Progress Bar ── */}
            <Section title="Progress Bar" accent="📊" defaultOpen={false}>
                <Toggle
                    label="Show Progress Bar"
                    checked={p.showProgressBar}
                    onChange={e => set('showProgressBar', e.target.checked)}
                    hint="Shows how much time is remaining visually"
                />
                {p.showProgressBar && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <ColorPicker label="Bar Color"       value={p.progressBarColor} onChange={e => set('progressBarColor', e.target.value)} />
                        <ColorPicker label="Track Color"     value={p.progressBarBg}    onChange={e => set('progressBarBg',    e.target.value)} />
                        <Slider label="Height" value={p.progressBarHeight} min={2} max={20} onChange={e => set('progressBarHeight', parseInt(e.target.value))} />
                        <Slider label="Radius" value={p.progressBarRadius} min={0} max={20} onChange={e => set('progressBarRadius', parseInt(e.target.value))} />
                    </div>
                )}
            </Section>

            {/* ── CTA Button ── */}
            <Section title="CTA Button" accent="🔘" defaultOpen={false}>
                <Toggle label="Show CTA Button" checked={p.showCTA} onChange={e => set('showCTA', e.target.checked)} />
                {p.showCTA && (
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-100">
                        <TextInput label="Button Text" value={p.ctaText} onChange={e => set('ctaText', e.target.value)} placeholder="e.g. Shop Now" />
                        <TextInput label="Button URL" value={p.ctaUrl} onChange={e => set('ctaUrl', e.target.value)} placeholder="https://..." />
                        <div className="grid grid-cols-2 gap-1">
                            <ColorPicker label="BG Color"   value={p.ctaBg}        onChange={e => set('ctaBg',        e.target.value)} />
                            <ColorPicker label="Text Color" value={p.ctaTextColor} onChange={e => set('ctaTextColor', e.target.value)} />
                        </div>
                        <Slider label="Radius" value={p.ctaRadius} min={0} max={99} onChange={e => set('ctaRadius', parseInt(e.target.value))} />
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Size</label>
                            <TabGroup
                                value={p.ctaSize}
                                onChange={v => set('ctaSize', v)}
                                options={[
                                    { value: 'sm', label: 'SM' },
                                    { value: 'md', label: 'MD' },
                                    { value: 'lg', label: 'LG' },
                                ]}
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Background ── */}
            <Section title="Background" accent="🖼️" defaultOpen={false}>
                <div className="grid grid-cols-3 gap-1">
                    {[
                        { key: 'color',    label: '🎨 Solid'    },
                        { key: 'gradient', label: '🌈 Gradient' },
                        { key: 'image',    label: '🖼️ Image'    },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => set('bgType', key)}
                            className={`py-1.5 text-xs rounded-lg border font-medium transition ${
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

                {p.bgType === 'image' && (
                    <div className="space-y-2">
                        <TextInput label="Image URL" value={p.bgImage} onChange={e => set('bgImage', e.target.value)} placeholder="https://..." />
                        {p.bgImage && (
                            <div className="h-16 rounded-lg border border-gray-200 overflow-hidden">
                                <img src={p.bgImage} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                        <ColorPicker label="Overlay Color" value={p.overlayColor} onChange={e => set('overlayColor', e.target.value)} />
                        <Slider label="Overlay Opacity" value={p.overlayOpacity} min={0} max={95} step={5} onChange={e => set('overlayOpacity', parseInt(e.target.value))} unit="%" />
                    </div>
                )}
            </Section>

            {/* ── Border & Widget Frame ── */}
            <Section title="Widget Frame" accent="🔲" defaultOpen={false}>
                <Slider label="Border Width" value={p.borderWidth || 0} min={0} max={6} onChange={e => set('borderWidth', parseInt(e.target.value))} />
                {(p.borderWidth > 0) && (
                    <ColorPicker label="Border Color" value={p.borderColor} onChange={e => set('borderColor', e.target.value)} />
                )}
                <Slider label="Widget Corner Radius" value={p.borderRadius || 0} min={0} max={32} onChange={e => set('borderRadius', parseInt(e.target.value))} />
            </Section>

            {/* ── Typography ── */}
            <Section title="Typography" accent="🔤" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Google Font</label>
                    <select
                        value={p.fontFamily || 'inherit'}
                        onChange={e => set('fontFamily', e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5"
                    >
                        <option value="inherit">Default (inherit)</option>
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Oswald">Oswald</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Bebas Neue">Bebas Neue</option>
                        <option value="Barlow Condensed">Barlow Condensed</option>
                        <option value="Space Mono">Space Mono</option>
                        <option value="DM Sans">DM Sans</option>
                        <option value="Sora">Sora</option>
                    </select>
                </div>
            </Section>

            {/* ── Layout & Spacing ── */}
            <Section title="Layout & Spacing" accent="📐" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Content Alignment</label>
                    <TabGroup
                        value={p.contentAlign}
                        onChange={v => set('contentAlign', v)}
                        options={[
                            { value: 'left',   label: 'Left'   },
                            { value: 'center', label: 'Center' },
                            { value: 'right',  label: 'Right'  },
                        ]}
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Padding Top"    value={p.paddingTop}    min={0} max={160} onChange={e => set('paddingTop',    parseInt(e.target.value))} />
                    <Slider label="Padding Bottom" value={p.paddingBottom} min={0} max={160} onChange={e => set('paddingBottom', parseInt(e.target.value))} />
                    <Slider label="Padding Left"   value={p.paddingLeft}   min={0} max={80}  onChange={e => set('paddingLeft',   parseInt(e.target.value))} />
                    <Slider label="Padding Right"  value={p.paddingRight}  min={0} max={80}  onChange={e => set('paddingRight',  parseInt(e.target.value))} />
                </div>
            </Section>

            {/* ── Custom CSS ── */}
            <Section title="Custom CSS" accent="💻" defaultOpen={false}>
                <p className="text-xs text-gray-400">Advanced: inject custom CSS into the widget. Use <code className="bg-gray-100 px-1 rounded">.cd-widget-inner</code> as the root selector.</p>
                <textarea
                    rows={5}
                    value={p.customCss || ''}
                    onChange={e => set('customCss', e.target.value)}
                    placeholder=".cd-widget-inner { letter-spacing: 0.05em; }"
                    className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 resize-none font-mono"
                />
            </Section>
        </div>
    );
}