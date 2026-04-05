import React, { useState, useEffect } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

// ─── UI Primitives ────────────────────────────────────────────────────────

const Section = ({ title, accent, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-left">
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
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange}
            className="w-full accent-indigo-500 h-1.5" />
    </div>
);

const ColorPicker = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-xs text-gray-600">{label}</label>
        <div className="flex items-center gap-1.5">
            <input type="color" value={value || '#000000'} onChange={onChange}
                className="h-6 w-8 rounded border border-gray-200 cursor-pointer p-0" />
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
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
                className={`flex-1 py-1.5 text-xs font-medium transition min-w-0 ${
                    value === opt.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}>
                {opt.label}
            </button>
        ))}
    </div>
);

// ─── Main Settings ────────────────────────────────────────────────────────
export default function ProductSettings() {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    // Product list for the data-source dropdown
    const [productList, setProductList] = useState([]);
    useEffect(() => {
        axios.get('/api/widget-products')
            .then(res => setProductList(res.data))
            .catch(err => console.error('Failed to load products:', err));
    }, []);

    // Spec helpers
    const setSpec    = (i, field, val) => setProp(pr => { pr.specs[i][field] = val; });
    const addSpec    = () => setProp(pr => { pr.specs.push({ icon: '✅', label: 'Feature', value: 'Value', show: true }); });
    const removeSpec = (i) => setProp(pr => { pr.specs.splice(i, 1); });
    const moveSpec   = (i, dir) => setProp(pr => {
        const to = i + dir;
        if (to < 0 || to >= pr.specs.length) return;
        [pr.specs[i], pr.specs[to]] = [pr.specs[to], pr.specs[i]];
    });

    // Trust helpers
    const setTrust    = (i, field, val) => setProp(pr => { pr.trustItems[i][field] = val; });
    const addTrust    = () => setProp(pr => { pr.trustItems.push({ icon: '✅', text: 'New Badge', bg: '#f0fdf4', color: '#15803d', show: true }); });
    const removeTrust = (i) => setProp(pr => { pr.trustItems.splice(i, 1); });

    return (
        <div className="pb-6">

            {/* ══ DATA SOURCE ══════════════════════════════════════════ */}
            <Section title="Data Source" accent="🗄️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Select Product</label>
                    <select
                        value={p.selectedProductId || ''}
                        onChange={e => set('selectedProductId', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">— Use Landing Page Default —</option>
                        {productList.map(prod => (
                            <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                        Leave blank to use the product linked to this landing page.
                    </p>
                </div>
            </Section>

            {/* ── Info note ── */}
            <div className="p-3 mb-3 bg-indigo-50 text-indigo-700 text-xs rounded-xl border border-indigo-100 leading-relaxed">
                Product name, image, price, and description are pulled automatically. Configure display options below.
            </div>

            {/* ══ LAYOUT ═══════════════════════════════════════════════ */}
            <Section title="Layout" accent="🗂️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Display Layout</label>
                    <TabGroup value={p.layout} onChange={v => set('layout', v)}
                        options={[
                            { value: 'side-by-side', label: 'Side by Side' },
                            { value: 'image-right',  label: 'Image Right'  },
                            { value: 'stack',        label: 'Stack'        },
                            { value: 'centered',     label: 'Centered'     },
                        ]}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        {p.layout === 'side-by-side' && 'Image left, details right — classic product layout'}
                        {p.layout === 'image-right'  && 'Details left, image right — editorial style'}
                        {p.layout === 'stack'        && 'Image above, details below — mobile-first'}
                        {p.layout === 'centered'     && 'All content centered — hero product style'}
                    </p>
                </div>
                <Slider label="Max Content Width" value={p.maxWidth} min={480} max={1400} step={20}
                    onChange={e => set('maxWidth', parseInt(e.target.value))} />
            </Section>

            {/* ══ BACKGROUND ═══════════════════════════════════════════ */}
            <Section title="Background" accent="🎨" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-1">
                    {[
                        { key: 'color',    label: '🎨 Solid'    },
                        { key: 'gradient', label: '🌈 Gradient' },
                    ].map(({ key, label }) => (
                        <button key={key} type="button" onClick={() => set('bgType', key)}
                            className={`py-2 text-xs rounded-lg border font-medium transition ${
                                p.bgType === key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                            }`}>
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
                                <input type="color" value={p.bgGradientFrom} onChange={e => set('bgGradientFrom', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">To</label>
                                <input type="color" value={p.bgGradientTo} onChange={e => set('bgGradientTo', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        <Slider label="Direction" value={p.bgGradientDirection} min={0} max={360}
                            onChange={e => set('bgGradientDirection', parseInt(e.target.value))} unit="°" />
                        <div className="h-8 rounded-lg"
                            style={{ background: `linear-gradient(${p.bgGradientDirection}deg, ${p.bgGradientFrom}, ${p.bgGradientTo})` }} />
                    </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                    <Slider label="Padding Top"    value={p.paddingTop}    min={0} max={160} onChange={e => set('paddingTop',    parseInt(e.target.value))} />
                    <Slider label="Padding Bottom" value={p.paddingBottom} min={0} max={160} onChange={e => set('paddingBottom', parseInt(e.target.value))} />
                    <Slider label="Padding Left"   value={p.paddingLeft}   min={0} max={80}  onChange={e => set('paddingLeft',   parseInt(e.target.value))} />
                    <Slider label="Padding Right"  value={p.paddingRight}  min={0} max={80}  onChange={e => set('paddingRight',  parseInt(e.target.value))} />
                </div>
            </Section>

            {/* ══ IMAGE ════════════════════════════════════════════════ */}
            <Section title="Product Image" accent="🖼️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Aspect Ratio</label>
                    <TabGroup value={p.imageRatio} onChange={v => set('imageRatio', v)}
                        options={[
                            { value: '1:1',   label: '1:1'    },
                            { value: '4:3',   label: '4:3'    },
                            { value: '3:4',   label: '3:4'    },
                            { value: '16:9',  label: '16:9'   },
                            { value: 'auto',  label: 'Auto'   },
                        ]}
                    />
                </div>
                <Slider label="Border Radius" value={p.imageBorderRadius} min={0} max={40}
                    onChange={e => set('imageBorderRadius', parseInt(e.target.value))} />
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Shadow</label>
                    <TabGroup value={p.imageShadow} onChange={v => set('imageShadow', v)}
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'sm',   label: 'SM'   },
                            { value: 'md',   label: 'MD'   },
                            { value: 'lg',   label: 'LG'   },
                        ]}
                    />
                </div>
                <Toggle label="Show Image Gallery (thumbnails)"
                    checked={p.showGallery}
                    onChange={e => set('showGallery', e.target.checked)}
                    hint="Uses product.gallery array from your store. Falls back to single image." />
            </Section>

            {/* ══ BADGE ════════════════════════════════════════════════ */}
            <Section title="Product Badge" accent="🏷️" defaultOpen={false}>
                <Toggle label="Show Badge on Image" checked={p.showBadge}
                    onChange={e => set('showBadge', e.target.checked)} />
                {p.showBadge && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Badge Text</label>
                            <input type="text" value={p.badgeText} onChange={e => set('badgeText', e.target.value)}
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Background</label>
                                <input type="color" value={p.badgeBg} onChange={e => set('badgeBg', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                                <input type="color" value={p.badgeColor} onChange={e => set('badgeColor', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        {/* Preview */}
                        <div className="flex justify-center">
                            <div style={{
                                backgroundColor: p.badgeBg, color: p.badgeColor,
                                fontSize: 12, fontWeight: 700,
                                padding: '4px 12px', borderRadius: 999,
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                            }}>
                                {p.badgeText}
                            </div>
                        </div>
                    </>
                )}
            </Section>

            {/* ══ TITLE & TYPOGRAPHY ═══════════════════════════════════ */}
            <Section title="Title & Typography" accent="🔤" defaultOpen={true}>
                <Toggle label="Show Product Title" checked={p.showTitle}
                    onChange={e => set('showTitle', e.target.checked)} />
                {p.showTitle && (
                    <>
                        <Slider label="Title Size" value={p.titleSize} min={16} max={56}
                            onChange={e => set('titleSize', parseInt(e.target.value))} />
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Font Weight</label>
                            <TabGroup value={p.titleWeight} onChange={v => set('titleWeight', v)}
                                options={[
                                    { value: '400', label: 'Normal' },
                                    { value: '600', label: 'Semi'   },
                                    { value: '700', label: 'Bold'   },
                                    { value: '800', label: 'Extra'  },
                                    { value: '900', label: 'Black'  },
                                ]}
                            />
                        </div>
                        <Slider label="Line Height" value={p.titleLineHeight} min={1} max={2} step={0.05}
                            onChange={e => set('titleLineHeight', parseFloat(e.target.value))} unit="" />
                        <ColorPicker label="Title Color" value={p.titleColor}
                            onChange={e => set('titleColor', e.target.value)} />
                    </>
                )}
            </Section>

            {/* ══ PRICE ════════════════════════════════════════════════ */}
            <Section title="Price" accent="💰" defaultOpen={true}>
                <Toggle label="Show Price" checked={p.showPrice}
                    onChange={e => set('showPrice', e.target.checked)} />
                {p.showPrice && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Currency Symbol</label>
                            <input type="text" value={p.currencySymbol} onChange={e => set('currencySymbol', e.target.value)}
                                className="w-20 text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <Slider label="Price Font Size" value={p.priceSize} min={18} max={56}
                            onChange={e => set('priceSize', parseInt(e.target.value))} />
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Price Weight</label>
                            <TabGroup value={p.priceWeight} onChange={v => set('priceWeight', v)}
                                options={[
                                    { value: '600', label: 'Semi'  },
                                    { value: '700', label: 'Bold'  },
                                    { value: '800', label: 'Extra' },
                                    { value: '900', label: 'Black' },
                                ]}
                            />
                        </div>
                        <ColorPicker label="Price Color" value={p.priceColor}
                            onChange={e => set('priceColor', e.target.value)} />
                        <Toggle label="Show Original / Crossed-out Price"
                            checked={p.showOriginalPrice}
                            onChange={e => set('showOriginalPrice', e.target.checked)} />
                        <Toggle label="Show Discount % Badge"
                            checked={p.showDiscountBadge}
                            onChange={e => set('showDiscountBadge', e.target.checked)} />
                    </>
                )}
            </Section>

            {/* ══ RATING ═══════════════════════════════════════════════ */}
            <Section title="Star Rating" accent="⭐" defaultOpen={false}>
                <Toggle label="Show Star Rating" checked={p.showRating}
                    onChange={e => set('showRating', e.target.checked)} />
                {p.showRating && (
                    <>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Rating (0–5)</label>
                                <input type="number" min={0} max={5} step={0.1} value={p.ratingValue}
                                    onChange={e => set('ratingValue', parseFloat(e.target.value))}
                                    className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Review Count</label>
                                <input type="number" min={0} value={p.reviewCount}
                                    onChange={e => set('reviewCount', parseInt(e.target.value))}
                                    className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                            </div>
                        </div>
                        <ColorPicker label="Star Color" value={p.starColor}
                            onChange={e => set('starColor', e.target.value)} />
                    </>
                )}
            </Section>

            {/* ══ DESCRIPTION ══════════════════════════════════════════ */}
            <Section title="Description" accent="📝" defaultOpen={false}>
                <Toggle label="Show Short Description" checked={p.showDescription}
                    onChange={e => set('showDescription', e.target.checked)}
                    hint="Pulled from product.short_description" />
                {p.showDescription && (
                    <>
                        <Slider label="Font Size" value={p.descriptionSize} min={12} max={22}
                            onChange={e => set('descriptionSize', parseInt(e.target.value))} />
                        <ColorPicker label="Text Color" value={p.descriptionColor}
                            onChange={e => set('descriptionColor', e.target.value)} />
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Line Clamp (0 = no limit)</label>
                            <input type="number" min={0} max={20} value={p.descriptionLines}
                                onChange={e => set('descriptionLines', parseInt(e.target.value) || 0)}
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                    </>
                )}
            </Section>

            {/* ══ BOOK INFO ════════════════════════════════════════════ */}
            <Section title="Book Info" accent="📖" defaultOpen={false}>
                <Toggle
                    label="Show Book Info Table"
                    checked={p.showBookInfo !== false}
                    onChange={e => set('showBookInfo', e.target.checked)}
                    hint="Automatically shown when the linked product is of type 'book'. Displays author, publisher, pages, and language."
                />
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700 leading-relaxed">
                    The table only appears when the product's type is <strong>book</strong>. Fields with no data are hidden automatically.
                </div>
            </Section>

            {/* ══ STOCK INDICATOR ══════════════════════════════════════ */}
            <Section title="Stock Indicator" accent="📦" defaultOpen={false}>
                <Toggle label="Show Stock / Scarcity Message" checked={p.showStock}
                    onChange={e => set('showStock', e.target.checked)}
                    hint="Creates urgency — e.g. 'Only 12 left!'" />
                {p.showStock && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Stock Text</label>
                            <input type="text" value={p.stockText} onChange={e => set('stockText', e.target.value)}
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Background</label>
                                <input type="color" value={p.stockBg} onChange={e => set('stockBg', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                                <input type="color" value={p.stockColor} onChange={e => set('stockColor', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        {/* Preview */}
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            backgroundColor: p.stockBg, color: p.stockColor,
                            fontSize: 12, fontWeight: 700,
                            padding: '5px 12px', borderRadius: 8,
                        }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: p.stockColor, display: 'inline-block' }} />
                            {p.stockText}
                        </div>
                    </>
                )}
            </Section>

            {/* ══ SPECS / KEY POINTS ═══════════════════════════════════ */}
            <Section title="Specs / Key Points" accent="📋" defaultOpen={true}>
                <Toggle label="Show Specs List" checked={p.showSpecs}
                    onChange={e => set('showSpecs', e.target.checked)}
                    hint="Each row shows icon + label + value" />
                {p.showSpecs && (
                    <>
                        <div className="space-y-2">
                            {p.specs?.map((spec, i) => (
                                <div key={i} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <input type="checkbox" checked={spec.show !== false}
                                        onChange={e => setSpec(i, 'show', e.target.checked)}
                                        className="rounded accent-indigo-500 shrink-0" />
                                    <input type="text" value={spec.icon} onChange={e => setSpec(i, 'icon', e.target.value)}
                                        className="w-8 text-center text-xs border-gray-200 rounded shrink-0"
                                        placeholder="✅" />
                                    <input type="text" value={spec.label} onChange={e => setSpec(i, 'label', e.target.value)}
                                        className="w-16 text-xs border-gray-200 rounded shrink-0"
                                        placeholder="Label" />
                                    <input type="text" value={spec.value} onChange={e => setSpec(i, 'value', e.target.value)}
                                        className="flex-1 text-xs border-gray-200 rounded min-w-0"
                                        placeholder="Value" />
                                    <div className="flex gap-0.5 shrink-0">
                                        <button onClick={() => moveSpec(i, -1)} disabled={i === 0}
                                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                                        <button onClick={() => moveSpec(i, 1)} disabled={i === p.specs.length - 1}
                                            className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                                        <button onClick={() => removeSpec(i)}
                                            className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 font-bold text-sm">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addSpec}
                            className="w-full py-2 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Add Spec Row
                        </button>
                    </>
                )}
            </Section>

            {/* ══ TRUST BADGES ═════════════════════════════════════════ */}
            <Section title="Trust Badges" accent="🛡️" defaultOpen={true}>
                <Toggle label="Show Trust Badges" checked={p.showTrust}
                    onChange={e => set('showTrust', e.target.checked)} />
                {p.showTrust && (
                    <>
                        <div className="space-y-2">
                            {p.trustItems?.map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                    <input type="checkbox" checked={item.show !== false}
                                        onChange={e => setTrust(i, 'show', e.target.checked)}
                                        className="rounded accent-indigo-500 shrink-0" />
                                    <input type="text" value={item.icon} onChange={e => setTrust(i, 'icon', e.target.value)}
                                        className="w-8 text-center text-xs border-gray-200 rounded shrink-0"
                                        placeholder="🔒" />
                                    <input type="text" value={item.text} onChange={e => setTrust(i, 'text', e.target.value)}
                                        className="flex-1 text-xs border-gray-200 rounded min-w-0"
                                        placeholder="Trust text" />
                                    <input type="color" value={item.bg || '#f0fdf4'} onChange={e => setTrust(i, 'bg', e.target.value)}
                                        title="Background" className="h-5 w-6 rounded cursor-pointer border border-gray-200 p-0 shrink-0" />
                                    <input type="color" value={item.color || '#15803d'} onChange={e => setTrust(i, 'color', e.target.value)}
                                        title="Text color" className="h-5 w-6 rounded cursor-pointer border border-gray-200 p-0 shrink-0" />
                                    <button onClick={() => removeTrust(i)}
                                        className="text-red-400 hover:text-red-600 font-bold text-sm leading-none shrink-0">×</button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addTrust}
                            className="w-full py-2 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Add Badge
                        </button>
                    </>
                )}
            </Section>

            {/* ══ CTA BUTTON ═══════════════════════════════════════════ */}
            <Section title="CTA Button" accent="🔘" defaultOpen={true}>
                <Toggle label="Show CTA Button" checked={p.showCta}
                    onChange={e => set('showCta', e.target.checked)} />
                {p.showCta && (
                    <>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Button Text</label>
                            <input type="text" value={p.ctaText} onChange={e => set('ctaText', e.target.value)}
                                className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Link URL</label>
                            <input type="text" value={p.ctaUrl} onChange={e => set('ctaUrl', e.target.value)}
                                placeholder="#checkout" className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Sub-text (below button)</label>
                            <input type="text" value={p.ctaSubText || ''} onChange={e => set('ctaSubText', e.target.value)}
                                placeholder="No advance payment..." className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                        </div>
                        <div className="grid grid-cols-3 gap-1.5">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Background</label>
                                <input type="color" value={p.ctaBg} onChange={e => set('ctaBg', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Text</label>
                                <input type="color" value={p.ctaTextColor} onChange={e => set('ctaTextColor', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">Border</label>
                                <input type="color" value={p.ctaBorderColor || '#ffffff'} onChange={e => set('ctaBorderColor', e.target.value)}
                                    className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Button Size</label>
                            <TabGroup value={p.ctaSize} onChange={v => set('ctaSize', v)}
                                options={[
                                    { value: 'sm', label: 'SM' },
                                    { value: 'md', label: 'MD' },
                                    { value: 'lg', label: 'LG' },
                                ]}
                            />
                        </div>
                        <Slider label="Border Radius" value={p.ctaRadius} min={0} max={50}
                            onChange={e => set('ctaRadius', parseInt(e.target.value))} />
                        {/* Live preview */}
                        <div className="flex justify-center pt-1">
                            <div style={{
                                backgroundColor: p.ctaBg, color: p.ctaTextColor,
                                border: p.ctaBorderColor ? `2px solid ${p.ctaBorderColor}` : 'none',
                                borderRadius: `${p.ctaRadius}px`,
                                padding: '8px 20px', fontSize: 12, fontWeight: 700,
                                display: 'inline-block',
                            }}>
                                {p.ctaText}
                            </div>
                        </div>
                    </>
                )}
            </Section>

            {/* ══ ANIMATION ════════════════════════════════════════════ */}
            <Section title="Animation" accent="🎬" defaultOpen={false}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Entrance Animation</label>
                    <select value={p.animation} onChange={e => set('animation', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2">
                        <option value="none">None</option>
                        <option value="fadeUp">Fade Up</option>
                        <option value="fadeIn">Fade In</option>
                    </select>
                </div>
            </Section>

        </div>
    );
}