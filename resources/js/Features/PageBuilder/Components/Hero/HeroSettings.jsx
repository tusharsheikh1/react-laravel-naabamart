import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

// ─── UI primitives ────────────────────────────────────────────────────────

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
                    {accent && <span className="text-sm">{accent}</span>}
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
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {value}{unit}
            </span>
        </div>
        <input
            type="range" min={min} max={max} step={step} value={value}
            onChange={onChange}
            className="w-full accent-indigo-500 h-1.5"
        />
    </div>
);

const ColorPicker = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600">{label}</label>
        <div className="flex items-center gap-1.5">
            <input
                type="color" value={value} onChange={onChange}
                className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0"
            />
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
                    value === opt.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
                {opt.label}
            </button>
        ))}
    </div>
);

const ButtonBlock = ({ prefix, props, set, label }) => {
    // Capitalize the first letter of the prefix so it matches the camelCase property names
    const Prefix     = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const showKey    = `show${Prefix}Btn`;
    
    const textKey    = `${prefix}BtnText`;
    const urlKey     = `${prefix}BtnUrl`;
    const styleKey   = `${prefix}BtnStyle`;
    const bgKey      = `${prefix}BtnBgColor`;
    const colorKey   = `${prefix}BtnTextColor`;
    const borderKey  = `${prefix}BtnBorderColor`;
    const radiusKey  = `${prefix}BtnBorderRadius`;
    const sizeKey    = `${prefix}BtnSize`;

    return (
        <div className="space-y-2">
            <Toggle
                label={`Show ${label}`}
                checked={props[showKey]}
                onChange={e => set(showKey, e.target.checked)}
            />
            {props[showKey] && (
                <div className="pl-3 border-l-2 border-indigo-100 space-y-2">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Button Text</label>
                        <input
                            type="text"
                            value={props[textKey]}
                            onChange={e => set(textKey, e.target.value)}
                            className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Link URL</label>
                        <input
                            type="text"
                            value={props[urlKey]}
                            onChange={e => set(urlKey, e.target.value)}
                            placeholder="#checkout or https://..."
                            className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Style</label>
                        <TabGroup
                            value={props[styleKey]}
                            onChange={v => set(styleKey, v)}
                            options={[
                                { value: 'solid',   label: 'Solid'   },
                                { value: 'outline', label: 'Outline' },
                                { value: 'ghost',   label: 'Ghost'   },
                                { value: 'link',    label: 'Link'    },
                            ]}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Color</label>
                            <input type="color" value={props[bgKey]} onChange={e => set(bgKey, e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Text</label>
                            <input type="color" value={props[colorKey]} onChange={e => set(colorKey, e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Border</label>
                            <input type="color" value={props[borderKey]} onChange={e => set(borderKey, e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                        </div>
                    </div>
                    <Slider
                        label={`Radius`}
                        value={props[radiusKey]}
                        min={0} max={50}
                        onChange={e => set(radiusKey, parseInt(e.target.value))}
                    />
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Size</label>
                        <TabGroup
                            value={props[sizeKey]}
                            onChange={v => set(sizeKey, v)}
                            options={[
                                { value: 'sm', label: 'SM' },
                                { value: 'md', label: 'MD' },
                                { value: 'lg', label: 'LG' },
                                { value: 'xl', label: 'XL' },
                            ]}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Settings component ───────────────────────────────────────────────
export default function HeroSettings() {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    const [isUploading, setIsUploading] = useState(false);

    // Stat helpers
    const setStat   = (i, field, val) => setProp(pr => { pr.stats[i][field] = val; });
    const addStat   = () => setProp(pr => { pr.stats.push({ value: '100+', label: 'New Stat', show: true }); });
    const delStat   = (i) => setProp(pr => { pr.stats.splice(i, 1); });

    // Handle Hero Image Upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const response = await axios.post('/admin/landing-pages/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.url) {
                set('heroImageUrl', response.data.url);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please ensure it is a valid image file under 5MB.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset the input
        }
    };

    return (
        <div className="pb-6">

            {/* ── Content ── */}
            <Section title="Content" accent="✏️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Headline</label>
                    <textarea
                        rows={3}
                        value={p.title}
                        onChange={e => set('title', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg px-3 py-2 resize-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Subheadline</label>
                    <textarea
                        rows={3}
                        value={p.subtitle}
                        onChange={e => set('subtitle', e.target.value)}
                        className="w-full text-sm border-gray-300 rounded-lg px-3 py-2 resize-none"
                    />
                </div>
            </Section>

            {/* ── Hero Image ── */}
            <Section title="Hero Image" accent="🖼️" defaultOpen={false}>
                <Toggle
                    label="Show Hero Image"
                    checked={p.showHeroImage}
                    onChange={e => set('showHeroImage', e.target.checked)}
                />
                {p.showHeroImage && (
                    <div className="space-y-3 mt-3 pl-3 border-l-2 border-indigo-100">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Image Position</label>
                            <TabGroup
                                value={p.heroImagePos}
                                onChange={v => set('heroImagePos', v)}
                                options={[
                                    { value: 'right',  label: 'Right' },
                                    { value: 'left',   label: 'Left' },
                                    { value: 'bottom', label: 'Bottom' },
                                    { value: 'top',    label: 'Top' },
                                ]}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Image Source</label>
                            <input
                                type="text"
                                value={p.heroImageUrl}
                                onChange={e => set('heroImageUrl', e.target.value)}
                                placeholder="URL or Upload..."
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                            />
                            <div className="mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                />
                                {isUploading && <p className="text-[11px] text-indigo-600 mt-1 font-medium">Uploading image...</p>}
                            </div>
                        </div>
                        <Slider label="Image Width" value={p.heroImageWidth} min={20} max={100} unit="%" onChange={e => set('heroImageWidth', parseInt(e.target.value))} />
                        <Slider label="Border Radius" value={p.heroImageRadius} min={0} max={100} unit="px" onChange={e => set('heroImageRadius', parseInt(e.target.value))} />
                        <Toggle label="Add Drop Shadow" checked={p.heroImageShadow} onChange={e => set('heroImageShadow', e.target.checked)} />
                    </div>
                )}
            </Section>

            {/* ── Badge ── */}
            <Section title="Announcement Badge" accent="🏷️" defaultOpen={false}>
                <Toggle
                    label="Show Badge"
                    checked={p.showBadge}
                    onChange={e => set('showBadge', e.target.checked)}
                    hint="Small pill shown above the headline"
                />
                {p.showBadge && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Badge Text</label>
                            <input
                                type="text"
                                value={p.badgeText}
                                onChange={e => set('badgeText', e.target.value)}
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Text/Dot Color</label>
                                <input type="color" value={p.badgeColor} onChange={e => set('badgeColor', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Background</label>
                                <input type="color" value={p.badgeBgColor} onChange={e => set('badgeBgColor', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        {/* Live preview */}
                        <div className="flex justify-center pt-1">
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                backgroundColor: p.badgeBgColor, color: p.badgeColor,
                                fontSize: '11px', fontWeight: 700, padding: '4px 12px',
                                borderRadius: '999px', border: `1px solid ${p.badgeColor}30`,
                                letterSpacing: '0.05em', textTransform: 'uppercase',
                            }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: p.badgeColor, display: 'inline-block' }} />
                                {p.badgeText}
                            </div>
                        </div>
                    </>
                )}
            </Section>

            {/* ── Typography ── */}
            <Section title="Typography" accent="🔤" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Title Font Weight</label>
                    <TabGroup
                        value={p.titleWeight}
                        onChange={v => set('titleWeight', v)}
                        options={[
                            { value: '400', label: 'Normal' },
                            { value: '600', label: 'Semi'   },
                            { value: '700', label: 'Bold'   },
                            { value: '800', label: 'Extra'  },
                            { value: '900', label: 'Black'  },
                        ]}
                    />
                </div>
                <Slider label="Title Size" value={p.titleSize} min={20} max={96} onChange={e => set('titleSize', parseInt(e.target.value))} />
                <Slider label="Title Line Height" value={p.titleLineHeight} min={0.8} max={2} step={0.05} onChange={e => set('titleLineHeight', parseFloat(e.target.value))} unit="" />
                <Slider label="Title Letter Spacing" value={p.titleLetterSpacing} min={-0.05} max={0.2} step={0.005} onChange={e => set('titleLetterSpacing', parseFloat(e.target.value))} unit="em" />
                <ColorPicker label="Title Color" value={p.titleColor} onChange={e => set('titleColor', e.target.value)} />
                <hr className="border-gray-100" />
                <Slider label="Subtitle Size" value={p.subtitleSize} min={12} max={36} onChange={e => set('subtitleSize', parseInt(e.target.value))} />
                <Slider label="Subtitle Line Height" value={p.subtitleLineHeight} min={1} max={2.5} step={0.05} onChange={e => set('subtitleLineHeight', parseFloat(e.target.value))} unit="" />
                <Slider label="Subtitle Max Width" value={p.subtitleMaxWidth || 0} min={0} max={900} step={10} onChange={e => set('subtitleMaxWidth', parseInt(e.target.value) || null)} />
                <ColorPicker label="Subtitle Color" value={p.subtitleColor} onChange={e => set('subtitleColor', e.target.value)} />
            </Section>

            {/* ── Background ── */}
            <Section title="Background" accent="🎨" defaultOpen={false}>
                <div className="grid grid-cols-3 gap-1">
                    {[
                        { key: 'color',    label: 'Color',    icon: '🎨' },
                        { key: 'gradient', label: 'Gradient', icon: '🌈' },
                        { key: 'image',    label: 'Image',    icon: '🖼️' },
                    ].map(({ key, label, icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => set('bgType', key)}
                            className={`py-2 text-xs rounded-lg border transition font-medium flex flex-col items-center gap-0.5 ${
                                p.bgType === key
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                            }`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
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
                        <Slider
                            label="Direction"
                            value={p.bgGradientDirection}
                            min={0} max={360}
                            onChange={e => set('bgGradientDirection', parseInt(e.target.value))}
                            unit="°"
                        />
                        {/* Preview swatch */}
                        <div
                            className="h-10 rounded-xl border border-gray-100"
                            style={{ background: `linear-gradient(${p.bgGradientDirection}deg, ${p.bgGradientFrom}, ${p.bgGradientTo})` }}
                        />
                        {/* Quick presets */}
                        <div>
                            <label className="text-xs text-gray-400 block mb-1.5">Quick Presets</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {[
                                    ['#1e293b','#334155', 180, 'Dark Slate'],
                                    ['#6366f1','#8b5cf6', 135, 'Violet'],
                                    ['#ec4899','#f43f5e', 135, 'Rose'],
                                    ['#f59e0b','#ef4444', 135, 'Amber Red'],
                                    ['#10b981','#06b6d4', 135, 'Teal'],
                                    ['#0f172a','#1e3a5f', 160, 'Midnight'],
                                    ['#7c3aed','#db2777', 135, 'Purple Pink'],
                                    ['#ffffff','#f1f5f9',  180, 'Light'],
                                ].map(([from, to, dir, name]) => (
                                    <button
                                        key={name}
                                        type="button"
                                        title={name}
                                        onClick={() => { set('bgGradientFrom', from); set('bgGradientTo', to); set('bgGradientDirection', dir); }}
                                        className="w-9 h-7 rounded-lg border-2 border-white shadow hover:scale-110 transition-transform"
                                        style={{ background: `linear-gradient(${dir}deg, ${from}, ${to})` }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {p.bgType === 'image' && (
                    <div className="space-y-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Image URL</label>
                            <input
                                type="text"
                                value={p.bgImage}
                                onChange={e => set('bgImage', e.target.value)}
                                placeholder="https://... or /storage/..."
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        {p.bgImage && (
                            <div className="h-20 rounded-xl border border-gray-200 overflow-hidden">
                                <img src={p.bgImage} className="w-full h-full object-cover" alt="bg preview" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Size</label>
                                <select value={p.bgImageSize} onChange={e => set('bgImageSize', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Position</label>
                                <select value={p.bgImagePosition} onChange={e => set('bgImagePosition', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                    <option value="center">Center</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left center">Left</option>
                                    <option value="right center">Right</option>
                                </select>
                            </div>
                        </div>
                        <ColorPicker label="Overlay Color" value={p.overlayColor} onChange={e => set('overlayColor', e.target.value)} />
                        <Slider
                            label="Overlay Opacity"
                            value={p.overlayOpacity}
                            min={0} max={95} step={5}
                            onChange={e => set('overlayOpacity', parseInt(e.target.value))}
                            unit="%"
                        />
                    </div>
                )}
            </Section>

            {/* ── Layout & Sizing ── */}
            <Section title="Layout & Sizing" accent="📐" defaultOpen={false}>
                <Slider label="Min Height" value={p.minHeight} min={100} max={1000} step={20} onChange={e => set('minHeight', parseInt(e.target.value))} />
                <Slider label="Content Max Width" value={p.contentMaxWidth} min={400} max={1400} step={20} onChange={e => set('contentMaxWidth', parseInt(e.target.value))} />

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

                <div>
                    <label className="text-xs text-gray-500 block mb-1">Vertical Alignment</label>
                    <TabGroup
                        value={p.contentVerticalAlign}
                        onChange={v => set('contentVerticalAlign', v)}
                        options={[
                            { value: 'top',    label: 'Top'    },
                            { value: 'center', label: 'Middle' },
                            { value: 'bottom', label: 'Bottom' },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Padding Top"    value={p.paddingTop}    min={0} max={300} step={8} onChange={e => set('paddingTop',    parseInt(e.target.value))} />
                    <Slider label="Padding Bottom" value={p.paddingBottom} min={0} max={300} step={8} onChange={e => set('paddingBottom', parseInt(e.target.value))} />
                    <Slider label="Padding Left"   value={p.paddingLeft}   min={0} max={120} step={4} onChange={e => set('paddingLeft',   parseInt(e.target.value))} />
                    <Slider label="Padding Right"  value={p.paddingRight}  min={0} max={120} step={4} onChange={e => set('paddingRight',  parseInt(e.target.value))} />
                </div>
            </Section>

            {/* ── Primary Button ── */}
            <Section title="Primary Button" accent="🔘" defaultOpen={false}>
                <ButtonBlock prefix="primary" props={p} set={set} label="Primary Button" />
            </Section>

            {/* ── Secondary Button ── */}
            <Section title="Secondary Button" accent="🔲" defaultOpen={false}>
                <ButtonBlock prefix="secondary" props={p} set={set} label="Secondary Button" />
            </Section>

            {/* ── Stats Strip ── */}
            <Section title="Stats / Social Proof Strip" accent="📊" defaultOpen={false}>
                <Toggle
                    label="Show Stats Row"
                    checked={p.showStats}
                    onChange={e => set('showStats', e.target.checked)}
                    hint="Numbers shown below the buttons (e.g. 10,000+ customers)"
                />
                {p.showStats && (
                    <div className="space-y-2">
                        {p.stats?.map((stat, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <input
                                    type="checkbox"
                                    checked={stat.show}
                                    onChange={e => setStat(i, 'show', e.target.checked)}
                                    className="rounded accent-indigo-500 shrink-0"
                                />
                                <input
                                    type="text"
                                    value={stat.value}
                                    onChange={e => setStat(i, 'value', e.target.value)}
                                    className="w-20 text-xs border-gray-300 rounded font-bold"
                                    placeholder="10,000+"
                                />
                                <input
                                    type="text"
                                    value={stat.label}
                                    onChange={e => setStat(i, 'label', e.target.value)}
                                    className="flex-1 text-xs border-gray-300 rounded"
                                    placeholder="Label"
                                />
                                <button onClick={() => delStat(i)} className="text-red-400 hover:text-red-600 font-bold text-base leading-none shrink-0">×</button>
                            </div>
                        ))}
                        <button onClick={addStat} className="w-full py-2 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Add Stat
                        </button>
                    </div>
                )}
            </Section>

            {/* ── Decorative Shape ── */}
            <Section title="Decorative Shape" accent="✨" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Shape</label>
                    <select
                        value={p.decorShape}
                        onChange={e => set('decorShape', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="none">None</option>
                        <option value="blob-tr">Blob — Top Right</option>
                        <option value="blob-bl">Blob — Bottom Left</option>
                        <option value="circle-tr">Circle — Top Right</option>
                        <option value="grid">Grid Pattern</option>
                        <option value="dots">Dot Pattern</option>
                        <option value="waves">Wave Bottom</option>
                    </select>
                </div>
                {p.decorShape !== 'none' && (
                    <>
                        <ColorPicker label="Shape Color" value={p.decorColor} onChange={e => set('decorColor', e.target.value)} />
                        <Slider label="Opacity" value={p.decorOpacity} min={1} max={100} onChange={e => set('decorOpacity', parseInt(e.target.value))} unit="%" />
                    </>
                )}
            </Section>

            {/* ── Animation ── */}
            <Section title="Animation" accent="🎬" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Entrance Animation</label>
                    <select
                        value={p.animation}
                        onChange={e => set('animation', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="none">None (instant)</option>
                        <option value="fade">Fade In</option>
                        <option value="slideUp">Slide Up</option>
                        <option value="slideDown">Slide Down</option>
                        <option value="slideLeft">Slide from Right</option>
                        <option value="slideRight">Slide from Left</option>
                        <option value="zoomIn">Zoom In</option>
                        <option value="zoomOut">Zoom Out</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Delay</label>
                    <select
                        value={p.animationDelay}
                        onChange={e => set('animationDelay', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="0">No delay</option>
                        <option value="0.1">0.1s</option>
                        <option value="0.2">0.2s</option>
                        <option value="0.3">0.3s</option>
                        <option value="0.5">0.5s</option>
                        <option value="0.8">0.8s</option>
                    </select>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">
                    Elements animate in staggered order: badge → title → subtitle → buttons → stats.
                </div>
            </Section>
        </div>
    );
}