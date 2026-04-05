// resources/js/Features/PageBuilder/Components/Container.jsx
import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { DuplicateButton } from '@/Features/PageBuilder/Components/DuplicateButton';

// ─── Helper: build the background style ───────────────────────────────────
function buildBackground(bgType, bgColor, bgGradientFrom, bgGradientTo, bgGradientDirection, bgImage) {
    if (bgType === 'gradient') {
        return `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;
    }
    if (bgType === 'image' && bgImage) {
        return undefined; // handled via backgroundImage separately
    }
    return bgColor;
}

// ─── The Container widget ──────────────────────────────────────────────────
export const Container = ({
    // Background
    bgType, bgColor,
    bgGradientFrom, bgGradientTo, bgGradientDirection,
    bgImage, bgImageSize, bgImagePosition, bgImageRepeat,
    overlayColor, overlayOpacity,

    // Spacing — per side
    paddingTop, paddingRight, paddingBottom, paddingLeft,
    marginTop, marginRight, marginBottom, marginLeft,

    // Layout
    flexDirection, flexWrap, alignItems, justifyContent, gap,
    display,

    // Sizing
    width, maxWidth, minHeight,

    // Border
    borderStyle, borderWidth, borderColor, borderRadius,
    borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius,
    useIndividualRadius,

    // Shadow
    shadow, shadowColor,

    // Effects
    opacity, overflow, cursor,

    // Position & z
    position,

    children,
}) => {
    const {
        connectors: { connect, drag },
        isSelected,
    } = useNode((state) => ({ isSelected: state.events.selected }));

    const bg = buildBackground(bgType, bgColor, bgGradientFrom, bgGradientTo, bgGradientDirection, bgImage);

    const shadowMap = {
        none  : 'none',
        xs    : `0 1px 3px ${shadowColor}30, 0 1px 2px ${shadowColor}20`,
        sm    : `0 2px 8px ${shadowColor}25`,
        md    : `0 4px 20px ${shadowColor}25`,
        lg    : `0 10px 40px ${shadowColor}25`,
        xl    : `0 20px 60px ${shadowColor}25`,
        '2xl' : `0 32px 80px ${shadowColor}30`,
        inner : `inset 0 2px 8px ${shadowColor}25`,
    };

    const radius = useIndividualRadius
        ? `${borderTopLeftRadius}px ${borderTopRightRadius}px ${borderBottomRightRadius}px ${borderBottomLeftRadius}px`
        : `${borderRadius}px`;

    // FIX #5a: Removed duplicate `position` key — previously the object had
    // `position` defined twice; the second assignment (unconditional) always
    // won, even setting `position: 'static'` on every element unnecessarily.
    // FIX #5b: `boxSizing` was set to the invalid value 'box-sizing'; corrected
    // to the valid CSS value 'border-box'.
    const containerStyle = {
        // Background
        background: bg,
        ...(bgType === 'image' && bgImage ? {
            backgroundImage: `url(${bgImage})`,
            backgroundSize: bgImageSize,
            backgroundPosition: bgImagePosition,
            backgroundRepeat: bgImageRepeat,
        } : {}),

        // Spacing
        paddingTop: `${paddingTop}px`,
        paddingRight: `${paddingRight}px`,
        paddingBottom: `${paddingBottom}px`,
        paddingLeft: `${paddingLeft}px`,
        marginTop: `${marginTop}px`,
        marginRight: `${marginRight}px`,
        marginBottom: `${marginBottom}px`,
        marginLeft: `${marginLeft}px`,

        // Layout
        display,
        ...(display === 'flex' || display === 'inline-flex' ? {
            flexDirection,
            flexWrap,
            alignItems,
            justifyContent,
            gap: `${gap}px`,
        } : {}),
        ...(display === 'grid' ? {
            gap: `${gap}px`,
        } : {}),

        // Sizing
        width: width === 'auto' ? 'auto' : width === '100%' ? '100%' : width === '50%' ? '50%' : width,
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        minHeight: `${minHeight}px`,

        // Border
        borderStyle: borderWidth > 0 ? borderStyle : 'none',
        borderWidth: `${borderWidth}px`,
        borderColor,
        borderRadius: radius,

        // Shadow
        boxShadow: shadowMap[shadow] || 'none',

        // Effects
        opacity: opacity / 100,
        overflow,
        cursor: cursor !== 'default' ? cursor : undefined,

        // FIX #5a: Only set `position` when it differs from the default so we
        // don't pollute every element with an explicit `position: static`.
        ...(position && position !== 'static' ? { position } : {}),

        // Base — FIX #5b: corrected from the invalid string 'box-sizing'
        boxSizing: 'border-box',
        transition: 'box-shadow 0.2s, border-color 0.2s',
    };

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={containerStyle}
            className="relative group"
        >
            {/* Overlay for bg image */}
            {bgType === 'image' && bgImage && overlayOpacity > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: overlayColor,
                        opacity: overlayOpacity / 100,
                        pointerEvents: 'none',
                        borderRadius: radius,
                        zIndex: 0,
                    }}
                />
            )}

            {/* Editor hover outline — only visible in builder, not on frontend */}
            <div
                className="absolute inset-0 pointer-events-none transition-all duration-150"
                style={{
                    borderRadius: radius,
                    border: isSelected
                        ? '2px solid #6366f1'
                        : '1px dashed transparent',
                    outline: isSelected ? '2px solid #6366f155' : 'none',
                    zIndex: 9999,
                }}
            />

            {/* Empty state hint */}
            {!children && (
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ zIndex: 1 }}
                >
                    <span className="text-xs text-blue-400 bg-blue-50 border border-blue-200 rounded px-2 py-1 font-medium">
                        Drop elements here
                    </span>
                </div>
            )}

            {/* Content — above overlay */}
            <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {children}
            </div>
        </div>
    );
};

// ─── Settings helpers ──────────────────────────────────────────────────────

const Section = ({ title, children, defaultOpen = true, accent }) => {
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
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{value}{unit}</span>
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

const SpacingGrid = ({ label, values, onChange }) => {
    const [linked, setLinked] = useState(true);

    const handleChange = (side, val) => {
        const n = parseInt(val);
        if (linked) {
            onChange({ top: n, right: n, bottom: n, left: n });
        } else {
            onChange({ ...values, [side]: n });
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-gray-600 font-medium">{label}</label>
                <button
                    type="button"
                    onClick={() => setLinked(l => !l)}
                    className={`text-xs px-2 py-0.5 rounded border transition ${linked ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                >
                    {linked ? '🔗 Linked' : '⛓️ Unlink'}
                </button>
            </div>
            {linked ? (
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">All sides</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{values.top}px</span>
                    </div>
                    <input
                        type="range" min={0} max={200} value={values.top}
                        onChange={e => handleChange('top', e.target.value)}
                        className="w-full accent-indigo-500 h-1.5"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {[['top','↑ Top'], ['right','→ Right'], ['bottom','↓ Bottom'], ['left','← Left']].map(([side, lbl]) => (
                        <div key={side}>
                            <div className="flex items-center justify-between mb-0.5">
                                <span className="text-xs text-gray-400">{lbl}</span>
                                <span className="text-xs font-mono text-gray-400">{values[side]}px</span>
                            </div>
                            <input
                                type="range" min={0} max={200} value={values[side]}
                                onChange={e => handleChange(side, e.target.value)}
                                className="w-full accent-indigo-500 h-1.5"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const RadiusGrid = ({ useIndividual, onToggle, tl, tr, br, bl, all, onAllChange, onIndividualChange }) => (
    <div>
        <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-600 font-medium">Border Radius</label>
            <button
                type="button"
                onClick={onToggle}
                className={`text-xs px-2 py-0.5 rounded border transition ${useIndividual ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
            >
                {useIndividual ? '⛓️ Per Corner' : '🔗 Uniform'}
            </button>
        </div>
        {!useIndividual ? (
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">All corners</span>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{all}px</span>
                </div>
                <input type="range" min={0} max={100} value={all} onChange={e => onAllChange(parseInt(e.target.value))} className="w-full accent-indigo-500 h-1.5" />
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-2">
                {[['tl','↖ Top Left', tl], ['tr','↗ Top Right', tr], ['br','↘ Bottom Right', br], ['bl','↙ Bottom Left', bl]].map(([key, lbl, val]) => (
                    <div key={key}>
                        <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-400">{lbl}</span>
                            <span className="text-xs font-mono text-gray-400">{val}px</span>
                        </div>
                        <input type="range" min={0} max={100} value={val} onChange={e => onIndividualChange(key, parseInt(e.target.value))} className="w-full accent-indigo-500 h-1.5" />
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ─── Settings Panel ────────────────────────────────────────────────────────
export const ContainerSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;

    const set = (key, val) => setProp(pr => { pr[key] = val; });

    return (
        <div className="pb-6">
            
            {/* Added Duplicate Button Here */}
            <DuplicateButton />

            {/* ── Background ── */}
            <Section title="Background" accent="🎨" defaultOpen={true}>
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
                            className={`py-1.5 text-xs rounded-lg border transition font-medium flex flex-col items-center gap-0.5 ${
                                p.bgType === key
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-200'
                            }`}
                        >
                            <span>{icon}</span>
                            <span>{label}</span>
                        </button>
                    ))}
                </div>

                {p.bgType === 'color' && (
                    <ColorPicker label="Color" value={p.bgColor} onChange={e => set('bgColor', e.target.value)} />
                )}

                {p.bgType === 'gradient' && (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">From</label>
                                <input type="color" value={p.bgGradientFrom} onChange={e => set('bgGradientFrom', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 block mb-1">To</label>
                                <input type="color" value={p.bgGradientTo} onChange={e => set('bgGradientTo', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        <Slider
                            label="Direction"
                            value={p.bgGradientDirection}
                            min={0} max={360}
                            onChange={e => set('bgGradientDirection', parseInt(e.target.value))}
                            unit="°"
                        />
                        <div
                            className="h-8 rounded-lg border border-gray-100"
                            style={{ background: `linear-gradient(${p.bgGradientDirection}deg, ${p.bgGradientFrom}, ${p.bgGradientTo})` }}
                        />
                        <div className="flex gap-1 flex-wrap">
                            {[
                                ['#6366f1','#8b5cf6'], ['#ec4899','#f43f5e'], ['#f59e0b','#ef4444'],
                                ['#10b981','#06b6d4'], ['#1e293b','#334155'], ['#fafafa','#f1f5f9'],
                            ].map(([from, to], i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => { set('bgGradientFrom', from); set('bgGradientTo', to); }}
                                    className="w-8 h-6 rounded border border-white shadow-sm hover:scale-110 transition-transform"
                                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                                    title={`${from} → ${to}`}
                                />
                            ))}
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
                            <div className="h-16 rounded-lg border border-gray-200 overflow-hidden">
                                <img src={p.bgImage} className="w-full h-full object-cover" alt="" />
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Size</label>
                                <select value={p.bgImageSize} onChange={e => set('bgImageSize', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                    <option value="cover">Cover</option>
                                    <option value="contain">Contain</option>
                                    <option value="auto">Auto</option>
                                    <option value="100% 100%">Stretch</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Position</label>
                                <select value={p.bgImagePosition} onChange={e => set('bgImagePosition', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                    <option value="center">Center</option>
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                    <option value="top left">Top Left</option>
                                    <option value="top right">Top Right</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Repeat</label>
                            <select value={p.bgImageRepeat} onChange={e => set('bgImageRepeat', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                <option value="no-repeat">No Repeat</option>
                                <option value="repeat">Repeat</option>
                                <option value="repeat-x">Repeat X</option>
                                <option value="repeat-y">Repeat Y</option>
                            </select>
                        </div>
                        <div>
                            <ColorPicker label="Overlay Color" value={p.overlayColor} onChange={e => set('overlayColor', e.target.value)} />
                            <Slider
                                label="Overlay Opacity"
                                value={p.overlayOpacity}
                                min={0} max={100}
                                onChange={e => set('overlayOpacity', parseInt(e.target.value))}
                                unit="%"
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Spacing ── */}
            <Section title="Spacing" accent="📐" defaultOpen={true}>
                <SpacingGrid
                    label="Padding"
                    values={{ top: p.paddingTop, right: p.paddingRight, bottom: p.paddingBottom, left: p.paddingLeft }}
                    onChange={vals => setProp(pr => {
                        pr.paddingTop    = vals.top;
                        pr.paddingRight  = vals.right;
                        pr.paddingBottom = vals.bottom;
                        pr.paddingLeft   = vals.left;
                    })}
                />
                <SpacingGrid
                    label="Margin"
                    values={{ top: p.marginTop, right: p.marginRight, bottom: p.marginBottom, left: p.marginLeft }}
                    onChange={vals => setProp(pr => {
                        pr.marginTop    = vals.top;
                        pr.marginRight  = vals.right;
                        pr.marginBottom = vals.bottom;
                        pr.marginLeft   = vals.left;
                    })}
                />
            </Section>

            {/* ── Layout ── */}
            <Section title="Layout" accent="🗂️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-600 block mb-1">Display</label>
                    <div className="grid grid-cols-4 gap-1">
                        {['flex','grid','block','inline-flex'].map(d => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => set('display', d)}
                                className={`py-1 text-xs rounded border transition ${p.display === d ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {(p.display === 'flex' || p.display === 'inline-flex') && (
                    <>
                        <div>
                            <label className="text-xs text-gray-600 block mb-1">Direction</label>
                            <div className="grid grid-cols-4 gap-1">
                                {[
                                    { val: 'column',         icon: '↓',  label: 'Col'  },
                                    { val: 'row',            icon: '→',  label: 'Row'  },
                                    { val: 'column-reverse', icon: '↑',  label: 'Col↑' },
                                    { val: 'row-reverse',    icon: '←',  label: 'Row←' },
                                ].map(({ val, icon, label }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => set('flexDirection', val)}
                                        title={val}
                                        className={`py-1.5 text-xs rounded border transition flex flex-col items-center gap-0.5 ${p.flexDirection === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        <span className="text-base leading-none">{icon}</span>
                                        <span style={{ fontSize: '9px' }}>{label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-600 block mb-1">Align Items</label>
                            <div className="grid grid-cols-5 gap-1">
                                {[
                                    { val: 'flex-start', label: 'Start'   },
                                    { val: 'center',     label: 'Center'  },
                                    { val: 'flex-end',   label: 'End'     },
                                    { val: 'stretch',    label: 'Stretch' },
                                    { val: 'baseline',   label: 'Base'    },
                                ].map(({ val, label }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => set('alignItems', val)}
                                        className={`py-1 text-xs rounded border transition ${p.alignItems === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-600 block mb-1">Justify Content</label>
                            <div className="grid grid-cols-3 gap-1">
                                {[
                                    { val: 'flex-start',    label: 'Start'   },
                                    { val: 'center',        label: 'Center'  },
                                    { val: 'flex-end',      label: 'End'     },
                                    { val: 'space-between', label: 'Between' },
                                    { val: 'space-around',  label: 'Around'  },
                                    { val: 'space-evenly',  label: 'Evenly'  },
                                ].map(({ val, label }) => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => set('justifyContent', val)}
                                        className={`py-1 text-xs rounded border transition ${p.justifyContent === val ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-600 block mb-1">Wrap</label>
                            <div className="grid grid-cols-3 gap-1">
                                {['nowrap', 'wrap', 'wrap-reverse'].map(w => (
                                    <button
                                        key={w}
                                        type="button"
                                        onClick={() => set('flexWrap', w)}
                                        className={`py-1 text-xs rounded border transition ${p.flexWrap === w ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Slider
                    label="Gap between items"
                    value={p.gap}
                    min={0} max={80}
                    onChange={e => set('gap', parseInt(e.target.value))}
                />
            </Section>

            {/* ── Sizing ── */}
            <Section title="Sizing" accent="📏" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-600 block mb-1">Width</label>
                    <div className="grid grid-cols-4 gap-1">
                        {['100%', '75%', '50%', 'auto'].map(w => (
                            <button
                                key={w}
                                type="button"
                                onClick={() => set('width', w)}
                                className={`py-1 text-xs rounded border transition ${p.width === w ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>
                <Slider
                    label={`Max Width${p.maxWidth ? '' : ' (none)'}`}
                    value={p.maxWidth || 0}
                    min={0} max={1400} step={10}
                    onChange={e => set('maxWidth', parseInt(e.target.value) || null)}
                />
                {p.maxWidth > 0 && (
                    <div className="flex justify-end">
                        <button onClick={() => set('maxWidth', null)} className="text-xs text-gray-400 hover:text-red-500 transition">Remove max-width</button>
                    </div>
                )}
                <Slider
                    label="Min Height"
                    value={p.minHeight}
                    min={0} max={800} step={10}
                    onChange={e => set('minHeight', parseInt(e.target.value))}
                />
                <div>
                    <label className="text-xs text-gray-600 block mb-1">Overflow</label>
                    <div className="grid grid-cols-3 gap-1">
                        {['visible','hidden','auto'].map(ov => (
                            <button
                                key={ov}
                                type="button"
                                onClick={() => set('overflow', ov)}
                                className={`py-1 text-xs rounded border transition ${p.overflow === ov ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {ov}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── Border ── */}
            <Section title="Border" accent="🔲" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-600 block mb-1">Style</label>
                        <select
                            value={p.borderStyle}
                            onChange={e => set('borderStyle', e.target.value)}
                            className="w-full text-xs border-gray-300 rounded-lg"
                        >
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-600 block mb-1">Width ({p.borderWidth}px)</label>
                        <input type="range" min={0} max={12} value={p.borderWidth} onChange={e => set('borderWidth', parseInt(e.target.value))} className="w-full accent-indigo-500 h-1.5 mt-2" />
                    </div>
                </div>
                <ColorPicker label="Border Color" value={p.borderColor} onChange={e => set('borderColor', e.target.value)} />

                <RadiusGrid
                    useIndividual={p.useIndividualRadius}
                    onToggle={() => set('useIndividualRadius', !p.useIndividualRadius)}
                    all={p.borderRadius}
                    tl={p.borderTopLeftRadius}
                    tr={p.borderTopRightRadius}
                    br={p.borderBottomRightRadius}
                    bl={p.borderBottomLeftRadius}
                    onAllChange={val => set('borderRadius', val)}
                    onIndividualChange={(corner, val) => {
                        const map = { tl: 'borderTopLeftRadius', tr: 'borderTopRightRadius', br: 'borderBottomRightRadius', bl: 'borderBottomLeftRadius' };
                        set(map[corner], val);
                    }}
                />
            </Section>

            {/* ── Shadow ── */}
            <Section title="Shadow" accent="🌑" defaultOpen={false}>
                <ColorPicker label="Shadow Color" value={p.shadowColor} onChange={e => set('shadowColor', e.target.value)} />
                <div>
                    <label className="text-xs text-gray-600 block mb-2">Preset</label>
                    <div className="grid grid-cols-4 gap-1.5">
                        {[
                            { key: 'none',  label: 'None'  },
                            { key: 'xs',    label: 'XS'    },
                            { key: 'sm',    label: 'SM'    },
                            { key: 'md',    label: 'MD'    },
                            { key: 'lg',    label: 'LG'    },
                            { key: 'xl',    label: 'XL'    },
                            { key: '2xl',   label: '2XL'   },
                            { key: 'inner', label: 'Inner' },
                        ].map(({ key, label }) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => set('shadow', key)}
                                className={`py-2 text-xs rounded-lg border transition font-medium ${
                                    p.shadow === key
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── Effects ── */}
            <Section title="Effects" accent="✨" defaultOpen={false}>
                <Slider
                    label="Opacity"
                    value={p.opacity}
                    min={0} max={100}
                    onChange={e => set('opacity', parseInt(e.target.value))}
                    unit="%"
                />
                <div>
                    <label className="text-xs text-gray-600 block mb-1">Cursor</label>
                    <select value={p.cursor} onChange={e => set('cursor', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                        <option value="default">Default</option>
                        <option value="pointer">Pointer (hand)</option>
                        <option value="crosshair">Crosshair</option>
                        <option value="not-allowed">Not Allowed</option>
                        <option value="grab">Grab</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-600 block mb-1">Position</label>
                    <div className="grid grid-cols-4 gap-1">
                        {['static','relative','absolute','sticky'].map(pos => (
                            <button
                                key={pos}
                                type="button"
                                onClick={() => set('position', pos)}
                                className={`py-1 text-xs rounded border transition ${p.position === pos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                {pos}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Quick Presets */}
            <Section title="Quick Presets" accent="⚡" defaultOpen={false}>
                <p className="text-xs text-gray-400">One-click styles — applies multiple settings at once.</p>
                <div className="grid grid-cols-1 gap-1.5">
                    {[
                        {
                            label: '📦 Card',
                            apply: pr => {
                                pr.bgType = 'color'; pr.bgColor = '#ffffff';
                                pr.borderWidth = 1; pr.borderStyle = 'solid'; pr.borderColor = '#e5e7eb';
                                pr.borderRadius = 16; pr.useIndividualRadius = false;
                                pr.shadow = 'md'; pr.paddingTop = pr.paddingBottom = pr.paddingLeft = pr.paddingRight = 24;
                            },
                        },
                        {
                            label: '🌑 Dark Section',
                            apply: pr => {
                                pr.bgType = 'color'; pr.bgColor = '#0f172a';
                                pr.borderWidth = 0; pr.shadow = 'none';
                                pr.paddingTop = pr.paddingBottom = 80;
                                pr.paddingLeft = pr.paddingRight = 24;
                            },
                        },
                        {
                            label: '🌈 Gradient Hero',
                            apply: pr => {
                                pr.bgType = 'gradient'; pr.bgGradientFrom = '#6366f1'; pr.bgGradientTo = '#8b5cf6'; pr.bgGradientDirection = 135;
                                pr.paddingTop = pr.paddingBottom = 100;
                                pr.paddingLeft = pr.paddingRight = 24;
                                pr.minHeight = 400;
                                pr.alignItems = 'center'; pr.justifyContent = 'center';
                            },
                        },
                        {
                            label: '🔲 Bordered Box',
                            apply: pr => {
                                pr.bgType = 'color'; pr.bgColor = '#f9fafb';
                                pr.borderWidth = 2; pr.borderStyle = 'dashed'; pr.borderColor = '#d1d5db';
                                pr.borderRadius = 12; pr.shadow = 'none';
                                pr.paddingTop = pr.paddingBottom = pr.paddingLeft = pr.paddingRight = 32;
                            },
                        },
                        {
                            label: '📰 Two-Column Row',
                            apply: pr => {
                                pr.display = 'flex'; pr.flexDirection = 'row'; pr.flexWrap = 'wrap';
                                pr.gap = 24; pr.alignItems = 'flex-start'; pr.justifyContent = 'space-between';
                                pr.paddingTop = pr.paddingBottom = 40;
                                pr.paddingLeft = pr.paddingRight = 24;
                                pr.bgType = 'color'; pr.bgColor = '#ffffff';
                            },
                        },
                    ].map(({ label, apply }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setProp(apply)}
                            className="w-full py-2 px-3 text-left text-xs rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition font-medium text-gray-700"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </Section>
        </div>
    );
};

// ─── Default props & craft config ─────────────────────────────────────────
Container.craft = {
    displayName: 'Container',
    props: {
        // Background
        bgType: 'color',
        bgColor: 'transparent',
        bgGradientFrom: '#6366f1',
        bgGradientTo: '#8b5cf6',
        bgGradientDirection: 135,
        bgImage: '',
        bgImageSize: 'cover',
        bgImagePosition: 'center',
        bgImageRepeat: 'no-repeat',
        overlayColor: '#000000',
        overlayOpacity: 0,

        // Spacing
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,

        // Layout
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 0,

        // Sizing
        width: '100%',
        maxWidth: null,
        minHeight: 40,
        overflow: 'visible',

        // Border
        borderStyle: 'none',
        borderWidth: 0,
        borderColor: '#e5e7eb',
        borderRadius: 0,
        useIndividualRadius: false,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,

        // Shadow
        shadow: 'none',
        shadowColor: '#000000',

        // Effects
        opacity: 100,
        cursor: 'default',
        position: 'static',
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ContainerSettings,
    },
};