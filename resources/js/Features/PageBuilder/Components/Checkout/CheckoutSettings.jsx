import React from 'react';
import { useNode } from '@craftjs/core';

// ─── Tiny helpers ──────────────────────────────────────────────────────────

const Section = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
            <button type="button" onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left outline-none">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</span>
                <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
            </button>
            {open && <div className="p-4 space-y-3">{children}</div>}
        </div>
    );
};

const Field = ({ label, hint, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
        {children}
    </div>
);

const Toggle = ({ label, checked, onChange, hint }) => (
    <label className="flex items-start gap-3 cursor-pointer group">
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

const Slider = ({ label, value, min, max, step = 1, onChange, unit = 'px' }) => (
    <div>
        <div className="flex items-center justify-between mb-1">
            <label className="text-sm text-gray-700">{label}</label>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full accent-indigo-500" />
    </div>
);

const ColorRow = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="text-sm text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={onChange} className="h-7 w-10 rounded border border-gray-200 cursor-pointer p-0.5 outline-none" />
            <span className="text-xs font-mono text-gray-400">{value}</span>
        </div>
    </div>
);

// ─── Main settings panel ───────────────────────────────────────────────────

export default function CheckoutSettings() {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    const [copied, setCopied] = React.useState(false);
    const anchorLink = `#${p.sectionId || 'checkout'}`;

    const copyLink = () => {
        navigator.clipboard.writeText(anchorLink).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Badge helpers
    const setBadge = (i, field, val) => setProp(pr => { pr.trustBadges[i][field] = val; });
    const addBadge  = () => setProp(pr => { pr.trustBadges.push({ icon: '✅', text: 'New Badge', show: true }); });
    const delBadge  = (i) => setProp(pr => { pr.trustBadges.splice(i, 1); });

    // Shipping Method helpers
    const setShippingMethod = (i, field, val) => setProp(pr => {
        if (!pr.shippingMethods) pr.shippingMethods = [];
        pr.shippingMethods[i][field] = val;
    });
    const addShippingMethod = () => setProp(pr => {
        if (!pr.shippingMethods) pr.shippingMethods = [];
        pr.shippingMethods.push({ name: 'Standard Delivery', charge: 60 });
    });
    const removeShippingMethod = (i) => setProp(pr => {
        if (!pr.shippingMethods) pr.shippingMethods = [];
        pr.shippingMethods.splice(i, 1);
    });

    return (
        <div className="space-y-3 pb-6">

            {/* ── Section Link / Anchor ── */}
            <Section title="🔗 Section Link (Move to Checkout)">
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-800 leading-relaxed">
                    Use this link in any button, hero CTA, or nav to scroll visitors directly to this checkout form.
                </div>

                {/* Anchor ID field */}
                <Field label="Section ID (anchor)">
                    <div className="flex gap-2 items-center">
                        <span className="text-sm text-gray-400 font-mono shrink-0">#</span>
                        <input
                            type="text"
                            value={p.sectionId || 'checkout'}
                            onChange={e => set('sectionId', e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                            className="flex-1 text-sm border-gray-300 rounded-md font-mono outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="checkout"
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Only letters, numbers, hyphens and underscores.</p>
                </Field>

                {/* Copyable link display */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link to copy</label>
                    <div className="flex items-center gap-2">
                        <div style={{
                            flex: 1, backgroundColor: '#f8fafc',
                            border: '1.5px solid #e2e8f0', borderRadius: 8,
                            padding: '8px 12px', fontFamily: 'monospace',
                            fontSize: 14, fontWeight: 700,
                            color: '#6366f1', letterSpacing: '0.01em',
                            userSelect: 'all',
                        }}>
                            {anchorLink}
                        </div>
                        <button
                            type="button"
                            onClick={copyLink}
                            style={{
                                padding: '8px 14px', borderRadius: 8,
                                backgroundColor: copied ? '#dcfce7' : '#6366f1',
                                color: copied ? '#15803d' : '#fff',
                                border: 'none', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700,
                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                    </div>
                </div>
            </Section>

            <Section title="Theme Color">
                <div className="p-2 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100">
                    Sets the <code>--theme-color</code> CSS variable used across this page for consistent branding.
                </div>
                <ColorRow label="Theme / Brand Color" value={p.themeColor || p.buttonBgColor} onChange={e => set('themeColor', e.target.value)} />
            </Section>

            {/* ── Container ── */}
            <Section title="Container & Layout">
                <Slider label="Max Width" value={p.maxWidth} min={320} max={900} step={10} onChange={e => set('maxWidth', parseInt(e.target.value))} />
                <Slider label="Padding" value={p.padding} min={8} max={80} onChange={e => set('padding', parseInt(e.target.value))} />
                <Slider label="Border Radius" value={p.borderRadius} min={0} max={40} onChange={e => set('borderRadius', parseInt(e.target.value))} />
                <ColorRow label="Background" value={p.bgColor} onChange={e => set('bgColor', e.target.value)} />
                <Field label="Shadow">
                    <select value={p.shadow} onChange={e => set('shadow', e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                        <option value="none">None</option><option value="sm">Small</option>
                        <option value="md">Medium</option><option value="lg">Large</option><option value="xl">Extra Large</option>
                    </select>
                </Field>
                <Slider label="Border Width" value={p.borderWidth} min={0} max={4} onChange={e => set('borderWidth', parseInt(e.target.value))} />
                {p.borderWidth > 0 && <ColorRow label="Border Color" value={p.borderColor} onChange={e => set('borderColor', e.target.value)} />}
            </Section>

            {/* ── Multi-Product ── */}
            <Section title="Multi-Product Selector" defaultOpen={true}>
                <Toggle
                    label="Show Product Selection Grid"
                    checked={p.showMultiProduct}
                    onChange={e => set('showMultiProduct', e.target.checked)}
                    hint="Shows all products linked to this page as a visual grid for customers to choose from."
                />
                {p.showMultiProduct && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                        <Field label="Selection Label">
                            <input type="text" value={p.multiProductLabel || ''} onChange={e => set('multiProductLabel', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>

                        {/* NEW: Multi-Selection Toggle */}
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <Toggle
                                label="Enable Multiple Selection"
                                checked={p.multiSelection}
                                onChange={e => set('multiSelection', e.target.checked)}
                                hint="If ON, customers can select multiple products at once (checkbox style). If OFF, they can only pick one product (radio button style)."
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Urgency Banner ── */}
            <Section title="Urgency Banner" defaultOpen={false}>
                <Toggle label="Show Urgency Banner" checked={p.showUrgency} onChange={e => set('showUrgency', e.target.checked)} />
                {p.showUrgency && (
                    <div className="mt-3 space-y-3">
                        <Field label="Banner Text">
                            <input type="text" value={p.urgencyText || ''} onChange={e => set('urgencyText', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                        <div className="flex gap-2">
                            <div className="flex-1"><ColorRow label="Background" value={p.urgencyBgColor} onChange={e => set('urgencyBgColor', e.target.value)} /></div>
                            <div className="flex-1"><ColorRow label="Text" value={p.urgencyTextColor} onChange={e => set('urgencyTextColor', e.target.value)} /></div>
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Header ── */}
            <Section title="Form Header" defaultOpen={false}>
                <Toggle label="Show Header" checked={p.showHeader} onChange={e => set('showHeader', e.target.checked)} />
                {p.showHeader && (
                    <div className="mt-3 space-y-3">
                        <Field label="Header Text">
                            <input type="text" value={p.headerText || ''} onChange={e => set('headerText', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                        <Slider label="Font Size" value={p.headerSize} min={14} max={36} onChange={e => set('headerSize', parseInt(e.target.value))} />
                        <ColorRow label="Background" value={p.headerBgColor} onChange={e => set('headerBgColor', e.target.value)} />
                        <ColorRow label="Text Color" value={p.headerTextColor} onChange={e => set('headerTextColor', e.target.value)} />
                    </div>
                )}
            </Section>

            {/* ── Product Summary ── */}
            <Section title="Product Summary" defaultOpen={false}>
                <Toggle label="Show Product Summary" checked={p.showProductSummary} onChange={e => set('showProductSummary', e.target.checked)} />
                {p.showProductSummary && (
                    <div className="mt-3 space-y-3">
                        <Field label="Layout">
                            <select value={p.summaryLayout} onChange={e => set('summaryLayout', e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                                <option value="row">Horizontal (image + text side by side)</option>
                                <option value="stack">Vertical (image above text)</option>
                            </select>
                        </Field>
                        <Toggle label="Show Star Rating" checked={p.showRating} onChange={e => set('showRating', e.target.checked)} />
                        {p.showRating && (
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Rating (1–5)">
                                    <select value={p.ratingValue} onChange={e => set('ratingValue', parseInt(e.target.value))} className="w-full text-sm border-gray-300 rounded-md">
                                        {[5,4,3,2,1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                                    </select>
                                </Field>
                                <Field label="Review Count">
                                    <input type="number" value={p.reviewCount || 0} onChange={e => set('reviewCount', parseInt(e.target.value))} min={0} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                                </Field>
                            </div>
                        )}
                    </div>
                )}
            </Section>

            {/* ── Form Fields ── */}
            <Section title="Form Fields" defaultOpen={false}>
                <Field label="Form Layout">
                    <select value={p.formLayout} onChange={e => set('formLayout', e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                        <option value="single">Single Column</option>
                        <option value="two-col">Two Columns</option>
                    </select>
                </Field>
                <div className="space-y-2 pt-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Field Labels</p>
                    {[['nameLabel','Name'],['phoneLabel','Phone'],['addressLabel','Address'],['shippingMethodLabel','Shipping Method'],['noteLabel','Note'],['quantityLabel','Quantity']].map(([key, placeholder]) => (
                        <div key={key} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-24 shrink-0">{placeholder}</span>
                            <input type="text" value={p[key] || ''} onChange={e => set(key, e.target.value)} className="flex-1 text-xs border-gray-300 rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500" placeholder={placeholder} />
                        </div>
                    ))}
                </div>
                <div className="space-y-2 pt-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Show / Hide Fields</p>
                    <Toggle label="Address Input" checked={p.showAddress} onChange={e => set('showAddress', e.target.checked)} />
                    <Toggle label="Quantity Selector" checked={p.showQuantity} onChange={e => set('showQuantity', e.target.checked)} />
                    <Toggle label="Order Note" checked={p.showNote} onChange={e => set('showNote', e.target.checked)} />
                </div>
            </Section>

            {/* ── Shipping Methods ── */}
            <Section title="Shipping Methods" defaultOpen={false}>
                <Toggle
                    label="Enable Shipping Methods"
                    checked={p.showShippingMethod}
                    onChange={e => set('showShippingMethod', e.target.checked)}
                    hint="Allows customers to select a delivery area (e.g., Inside/Outside Dhaka) and calculates total."
                />
                {p.showShippingMethod && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Options & Charges</p>
                        {p.shippingMethods?.map((sm, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <input type="text" value={sm.name} onChange={e => setShippingMethod(i, 'name', e.target.value)} className="flex-1 text-xs border-gray-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Inside Dhaka" />
                                <span className="text-xs font-medium text-gray-500">৳</span>
                                <input type="number" min={0} value={sm.charge} onChange={e => setShippingMethod(i, 'charge', parseInt(e.target.value) || 0)} className="w-16 text-xs border-gray-300 rounded text-center outline-none focus:ring-1 focus:ring-indigo-500" />
                                <button type="button" onClick={() => removeShippingMethod(i)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none shrink-0 px-1">×</button>
                            </div>
                        ))}
                        <button type="button" onClick={addShippingMethod} className="w-full py-2 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Add Option
                        </button>
                        
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <Toggle
                                label="Show Price Breakdown"
                                checked={p.showDeliveryBreakdown}
                                onChange={e => set('showDeliveryBreakdown', e.target.checked)}
                                hint="Displays subtotal, shipping charge, and final total before the submit button."
                            />
                        </div>
                    </div>
                )}
            </Section>

            {/* ── Unit & Quantity ── */}
            <Section title="Unit & Quantity Selector" defaultOpen={false}>
                <Field label="Unit Label (e.g. KG, Pcs, Box)" hint="Shown next to quantity number">
                    <input type="text" value={p.unitLabel || ''} onChange={e => set('unitLabel', e.target.value)} placeholder="Pcs" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <Field label="Preset Quantity Buttons" hint="Comma-separated numbers, e.g. 1, 2, 5">
                    <input type="text" value={p.presetQuantities || ''} onChange={e => set('presetQuantities', e.target.value)} placeholder="1, 2, 3, 5" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <Field label="Default Quantity">
                    <input type="number" min={1} value={p.defaultQuantity || 1} onChange={e => set('defaultQuantity', parseInt(e.target.value) || 1)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <Toggle label="Allow Custom Quantity Input" checked={p.showCustomQty} onChange={e => set('showCustomQty', e.target.checked)} hint="Lets customers type any number" />
            </Section>

            {/* ── Submit Button ── */}
            <Section title="Submit Button" defaultOpen={false}>
                <Field label="Button Text">
                    <input type="text" value={p.buttonText || ''} onChange={e => set('buttonText', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <Field label="Sub-text (below button text)">
                    <input type="text" value={p.buttonSubText || ''} onChange={e => set('buttonSubText', e.target.value)} placeholder="No advance payment • Pay on delivery" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <Field label="Button Icon (emoji)">
                    <input type="text" value={p.buttonIcon || ''} onChange={e => set('buttonIcon', e.target.value)} placeholder="✅ 🛒 🎁" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                </Field>
                <div className="flex gap-2">
                    <div className="flex-1"><ColorRow label="Background" value={p.buttonBgColor} onChange={e => set('buttonBgColor', e.target.value)} /></div>
                    <div className="flex-1"><ColorRow label="Text" value={p.buttonTextColor} onChange={e => set('buttonTextColor', e.target.value)} /></div>
                </div>
                <Slider label="Border Radius" value={p.buttonBorderRadius} min={0} max={50} onChange={e => set('buttonBorderRadius', parseInt(e.target.value))} />
                <Field label="Size">
                    <select value={p.buttonSize} onChange={e => set('buttonSize', e.target.value)} className="w-full text-sm border-gray-300 rounded-md">
                        <option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option>
                    </select>
                </Field>
                <Toggle label="Full Width Button" checked={p.buttonFullWidth} onChange={e => set('buttonFullWidth', e.target.checked)} />
            </Section>

            {/* ── Mobile Sticky CTA ── */}
            <Section title="Mobile Sticky Footer CTA" defaultOpen={false}>
                <Toggle
                    label="Show Sticky CTA on Mobile"
                    checked={p.showMobileStickyCta}
                    onChange={e => set('showMobileStickyCta', e.target.checked)}
                    hint="A fixed 'Order Now' bar at the bottom of screen on mobile devices only."
                />
                {p.showMobileStickyCta && (
                    <div className="mt-3 space-y-3">
                        <Field label="Button Text">
                            <input type="text" value={p.mobileStickyText || ''} onChange={e => set('mobileStickyText', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                        <ColorRow label="Bar Background" value={p.mobileStickyBg || '#ffffff'} onChange={e => set('mobileStickyBg', e.target.value)} />
                    </div>
                )}
            </Section>

            {/* ── Social Proof ── */}
            <Section title="Social Proof" defaultOpen={false}>
                <Toggle label="Show Social Proof Line" checked={p.showSocialProof} onChange={e => set('showSocialProof', e.target.checked)} />
                {p.showSocialProof && (
                    <div className="mt-3 space-y-3">
                        <Field label="Icon (emoji)">
                            <input type="text" value={p.socialProofIcon || ''} onChange={e => set('socialProofIcon', e.target.value)} placeholder="👥" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                        <Field label="Text">
                            <input type="text" value={p.socialProofText || ''} onChange={e => set('socialProofText', e.target.value)} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                    </div>
                )}
            </Section>

            {/* ── Trust Badges ── */}
            <Section title="Trust Badges" defaultOpen={false}>
                <Toggle label="Show Trust Badges" checked={p.showTrustBadges} onChange={e => set('showTrustBadges', e.target.checked)} />
                {p.showTrustBadges && (
                    <div className="space-y-2 mt-2">
                        {p.trustBadges?.map((badge, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <input type="checkbox" checked={badge.show} onChange={e => setBadge(i, 'show', e.target.checked)} className="rounded shrink-0 accent-indigo-500" />
                                <input type="text" value={badge.icon} onChange={e => setBadge(i, 'icon', e.target.value)} className="w-10 text-center text-sm border-gray-300 rounded shrink-0 outline-none focus:ring-1 focus:ring-indigo-500" placeholder="🔒" />
                                <input type="text" value={badge.text} onChange={e => setBadge(i, 'text', e.target.value)} className="flex-1 text-xs border-gray-300 rounded outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Badge text" />
                                <button onClick={() => delBadge(i)} className="text-red-400 hover:text-red-600 font-bold text-base leading-none shrink-0">×</button>
                            </div>
                        ))}
                        <button onClick={addBadge} className="w-full py-2 text-xs text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                            + Add Badge
                        </button>
                    </div>
                )}
            </Section>

            {/* ── Spam Prevention ── */}
            <Section title="Spam / Duplicate Order Prevention" defaultOpen={false}>
                <Toggle
                    label="Enable Spam Prevention"
                    checked={p.enableSpamPrevention}
                    onChange={e => set('enableSpamPrevention', e.target.checked)}
                    hint="Detects repeated orders from the same browser within a time window and shows a warning."
                />
                {p.enableSpamPrevention && (
                    <div className="mt-3 space-y-3">
                        <Field label="Block Window (minutes)" hint="How long to block re-orders after a successful submission">
                            <input type="number" min={5} max={1440} value={p.spamIntervalMinutes || 30} onChange={e => set('spamIntervalMinutes', parseInt(e.target.value))} className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                        <Field label="WhatsApp Number (optional)" hint="Shown in spam modal so customer can contact you directly (e.g. 8801712345678)">
                            <input type="text" value={p.whatsappNumber || ''} onChange={e => set('whatsappNumber', e.target.value)} placeholder="880XXXXXXXXXX" className="w-full text-sm border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-indigo-500" />
                        </Field>
                    </div>
                )}
            </Section>

            {/* ── Input Styling ── */}
            <Section title="Input Field Styling" defaultOpen={false}>
                <ColorRow label="Label Color" value={p.labelColor} onChange={e => set('labelColor', e.target.value)} />
                <ColorRow label="Input Border" value={p.inputBorderColor} onChange={e => set('inputBorderColor', e.target.value)} />
                <ColorRow label="Input Background" value={p.inputBgColor} onChange={e => set('inputBgColor', e.target.value)} />
            </Section>

            {/* Info note */}
            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-xl border border-blue-100 leading-relaxed">
                <strong>Note:</strong> This form posts to <code className="bg-blue-100 px-1 rounded">/lp/checkout</code> and orders appear in Admin → Orders with source <code className="bg-blue-100 px-1 rounded">landing_page</code>.
            </div>
        </div>
    );
}