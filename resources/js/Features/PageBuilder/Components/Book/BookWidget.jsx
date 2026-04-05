import React, { useState, useEffect } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

// ─── Responsive hook (same as ProductWidget) ───────────────────────────────
function useWindowWidth() {
    const [w, setW] = React.useState(
        typeof window !== 'undefined' ? window.innerWidth : 1024
    );
    React.useEffect(() => {
        const fn = () => setW(window.innerWidth);
        window.addEventListener('resize', fn);
        return () => window.removeEventListener('resize', fn);
    }, []);
    return w;
}

// ─── Main Widget ───────────────────────────────────────────────────────────
export const BookWidget = ({
    // Content overrides
    selectedProductId,
    titleOverride,
    writerNameOverride, publicationNameOverride, totalPagesOverride, languageOverride,
    descriptionOverride, shortDescLength,

    // Display toggles
    showTitle, showGallery, showDescription, showMeta,
    showWriter, showPublication, showPages, showLanguage,
    showPrice, showRating,

    // Rating & Currency
    ratingValue, reviewCount, starColor, currencySymbol,

    // Layout
    layout, maxWidth,

    // Background
    bgType, bgColor, bgGradientFrom, bgGradientTo, bgGradientDirection,
    paddingTop, paddingBottom, paddingLeft, paddingRight,

    // Image
    imageBorderRadius, imageShadow,

    // Typography
    titleSize, titleWeight, titleColor,
    metaLabelColor, metaValueColor, descColor, descSize, priceColor, priceSize,

    // Meta badge style
    metaStyle,

    // CTA
    showCta, ctaText, ctaUrl, ctaBg, ctaTextColor, ctaRadius,
}) => {
    const { connectors: { connect, drag } } = useNode();
    const { enabled: isEditor } = useEditor((state) => ({ enabled: state.options.enabled }));
    const { page } = usePage().props;

    const vw = useWindowWidth();
    const isMobile = vw < 640;
    const isTablet = vw >= 640 && vw < 1024;

    const [activeImg, setActiveImg] = useState(0);
    const [expanded, setExpanded] = useState(false);

    // Hold product data fetched from backend
    const [dbProduct, setDbProduct] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    // Fetch product automatically based on selected ID or Landing Page ID
    useEffect(() => {
        let isMounted = true;

        const fetchId = selectedProductId || page?.product_id;

        if (fetchId) {
            setIsFetching(true);
            axios.get(`/api/widget-products/${fetchId}`)
                .then(res => {
                    if (isMounted) {
                        setDbProduct(res.data);
                        setIsFetching(false);
                        setActiveImg(0);
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch product data:', err);
                    if (isMounted) setIsFetching(false);
                });
        } else {
            setDbProduct(null);
        }

        return () => { isMounted = false; };
    }, [selectedProductId, page?.product_id]);

    // Resolve which product to display
    const activeProduct = dbProduct || page?.product || {};

    // Map fields
    const title = titleOverride || activeProduct.name || 'Book Title';
    const description = descriptionOverride || activeProduct.short_description || activeProduct.description || '';

    // ── Price logic — mirrors ProductWidget exactly ──────────────────────────
    const regularPrice = Number(activeProduct.price ?? 0);
    let finalPrice = regularPrice;
    if (Number(activeProduct.discount_value) > 0) {
        if (activeProduct.discount_type === 'percent') {
            finalPrice = regularPrice - (regularPrice * (Number(activeProduct.discount_value) / 100));
        } else if (activeProduct.discount_type === 'fixed') {
            finalPrice = regularPrice - Number(activeProduct.discount_value);
        }
    }
    const price = finalPrice > 0 ? finalPrice : null;
    const originalPrice = finalPrice < regularPrice ? regularPrice : null;
    const discountPct = originalPrice && price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : null;

    // Resolve metadata from many-to-many relations
    const writerName = writerNameOverride
        || (activeProduct?.authors?.length > 0 ? activeProduct.authors.map(a => a.name).join(', ') : null)
        || activeProduct?.author?.name
        || activeProduct?.writer
        || '';

    const publicationName = publicationNameOverride
        || (activeProduct?.publications?.length > 0 ? activeProduct.publications.map(p => p.name).join(', ') : null)
        || activeProduct?.publication?.name
        || activeProduct?.publisher
        || '';

    const totalPages = totalPagesOverride || activeProduct?.pages || activeProduct?.total_pages || '';
    const language = languageOverride || activeProduct?.language || '';

    // Resolve image URLs
    let images = [];
    if (activeProduct.images?.length > 0) {
        images = activeProduct.images.map(img => {
            const raw = img.image_url || img.url || img.image_path || '';
            if (!raw) return null;
            if (raw.startsWith('http') || raw.startsWith('/')) return raw;
            return '/storage/' + raw;
        }).filter(Boolean);
    }
    if (images.length === 0 && activeProduct.gallery?.length > 0) {
        images = activeProduct.gallery.filter(Boolean);
    }
    if (images.length === 0 && activeProduct.image_url) {
        images = [activeProduct.image_url];
    }
    if (images.length === 0 && activeProduct.thumbnail) {
        let thumb = activeProduct.thumbnail;
        if (!thumb.startsWith('http') && !thumb.startsWith('/')) thumb = '/storage/' + thumb;
        images = [thumb];
    }

    // Default open-source book cover (Open Library, CC0)
    const DEFAULT_BOOK_IMAGE = 'https://covers.openlibrary.org/b/id/8739161-L.jpg';

    const currentImage = images[activeImg] || DEFAULT_BOOK_IMAGE;
    const hasImage = true; // always render image column — worst case shows the default cover

    // On mobile always stack; on tablet/desktop respect the layout prop
    const isRow = layout === 'row' && !isMobile;

    const shadowMap = {
        none: 'none',
        sm:   '0 2px 8px rgba(0,0,0,0.10)',
        md:   '0 8px 32px rgba(0,0,0,0.14)',
        lg:   '0 16px 56px rgba(0,0,0,0.18)',
    };

    let bg = bgColor;
    if (bgType === 'gradient') bg = `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;

    const metaItems = [
        showWriter      && writerName      && { icon: '✍️', label: 'Writer',    value: writerName      },
        showPublication && publicationName && { icon: '🏢', label: 'Publisher', value: publicationName },
        showPages       && totalPages      && { icon: '📄', label: 'Pages',     value: totalPages      },
        showLanguage    && language        && { icon: '🌐', label: 'Language',  value: language        },
    ].filter(Boolean);

    const truncatedDesc = description && !expanded && description.length > shortDescLength
        ? description.slice(0, shortDescLength) + '…'
        : description;

    // Responsive font sizes
    const resolvedTitleSize = isMobile ? Math.max(20, titleSize * 0.75) : isTablet ? Math.max(22, titleSize * 0.88) : titleSize;
    const resolvedPriceSize = isMobile ? Math.max(22, priceSize * 0.78) : priceSize;

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                background: bg,
                paddingTop:    `${isMobile ? Math.min(paddingTop, 32)    : paddingTop}px`,
                paddingBottom: `${isMobile ? Math.min(paddingBottom, 32) : paddingBottom}px`,
                paddingLeft:   `${isMobile ? Math.min(paddingLeft, 16)   : paddingLeft}px`,
                paddingRight:  `${isMobile ? Math.min(paddingRight, 16)  : paddingRight}px`,
                opacity: isFetching ? 0.6 : 1,
                transition: 'opacity 0.2s',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto', width: '100%' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isRow ? 'row' : 'column',
                    gap: isRow ? (isTablet ? 24 : 40) : 20,
                    alignItems: isRow ? 'flex-start' : 'stretch',
                }}>

                    {/* ── Gallery Column — always shown; falls back to default book cover ── */}
                    {showGallery && (
                        <div style={{
                            flex: isRow ? '0 0 42%' : undefined,
                            width: '100%',
                            maxWidth: isRow ? '42%' : '100%',
                            boxSizing: 'border-box',
                        }}>
                            {/* Main image */}
                            <div style={{
                                borderRadius: `${imageBorderRadius}px`,
                                overflow: 'hidden',
                                boxShadow: shadowMap[imageShadow] || 'none',
                                background: '#f1f5f9',
                                position: 'relative',
                            }}>
                                <img
                                    src={currentImage}
                                    alt={title}
                                    style={{ width: '100%', display: 'block', objectFit: 'cover' }}
                                    onError={e => { e.currentTarget.src = DEFAULT_BOOK_IMAGE; }}
                                />
                            </div>

                            {/* Thumbnails */}
                            {images.length > 1 && (
                                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                                    {images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            style={{
                                                width: isMobile ? 48 : 56,
                                                height: isMobile ? 60 : 72,
                                                borderRadius: 6,
                                                overflow: 'hidden',
                                                border: `2px solid ${i === activeImg ? '#6366f1' : '#e2e8f0'}`,
                                                cursor: 'pointer',
                                                padding: 0,
                                                background: 'none',
                                                transition: 'border-color 0.15s',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Details Column ── */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>

                        {showTitle && (
                            <h2 style={{
                                fontSize: `${resolvedTitleSize}px`,
                                fontWeight: titleWeight,
                                color: titleColor,
                                lineHeight: 1.25,
                                marginBottom: 12,
                                wordBreak: 'break-word',
                            }}>
                                {title}
                            </h2>
                        )}

                        {showRating && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                                <span style={{ color: starColor, fontSize: isMobile ? 14 : 16, letterSpacing: '-1px' }}>
                                    {'★'.repeat(Math.min(5, Math.round(ratingValue)))}
                                    {'☆'.repeat(Math.max(0, 5 - Math.round(ratingValue)))}
                                </span>
                                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>
                                    {ratingValue.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
                                </span>
                            </div>
                        )}

                        {showPrice && price && (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: `${resolvedPriceSize}px`, fontWeight: 800, color: priceColor, lineHeight: 1 }}>
                                    {currencySymbol}{Number(price).toLocaleString()}
                                </span>
                                {originalPrice && (
                                    <span style={{ fontSize: isMobile ? 14 : 16, color: '#94a3b8', textDecoration: 'line-through', fontWeight: 500 }}>
                                        {currencySymbol}{Number(originalPrice).toLocaleString()}
                                    </span>
                                )}
                                {discountPct && (
                                    <span style={{
                                        fontSize: 12, fontWeight: 700, color: '#dc2626',
                                        backgroundColor: '#fef2f2', padding: '3px 8px',
                                        borderRadius: 6, border: '1px solid #fecaca',
                                    }}>
                                        Save {discountPct}%
                                    </span>
                                )}
                            </div>
                        )}

                        {showMeta && metaItems.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                {metaStyle === 'table' && (
                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                        <tbody>
                                            {metaItems.map((item, i) => (
                                                <tr key={i} style={{ borderBottom: i < metaItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                                    <td style={{
                                                        padding: '7px 12px 7px 0',
                                                        fontSize: isMobile ? 12 : 13,
                                                        fontWeight: 600, color: metaLabelColor,
                                                        whiteSpace: 'nowrap', verticalAlign: 'middle',
                                                    }}>
                                                        <span style={{ marginRight: 6 }}>{item.icon}</span>{item.label}
                                                    </td>
                                                    <td style={{
                                                        padding: '7px 0',
                                                        fontSize: isMobile ? 12 : 13,
                                                        color: metaValueColor, verticalAlign: 'middle',
                                                        wordBreak: 'break-word',
                                                    }}>
                                                        {item.value}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {metaStyle === 'pills' && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {metaItems.map((item, i) => (
                                            <span key={i} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                backgroundColor: '#f1f5f9', color: metaValueColor,
                                                fontSize: 12, fontWeight: 600,
                                                padding: '5px 10px', borderRadius: 999, border: '1px solid #e2e8f0',
                                            }}>
                                                <span>{item.icon}</span>
                                                <span style={{ color: metaLabelColor, fontWeight: 500 }}>{item.label}:</span>
                                                <span>{item.value}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {metaStyle === 'inline' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        {metaItems.map((item, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: isMobile ? 13 : 14 }}>
                                                <span style={{ fontSize: 15 }}>{item.icon}</span>
                                                <span style={{ fontWeight: 600, color: metaLabelColor }}>{item.label}:</span>
                                                <span style={{ color: metaValueColor }}>{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {showDescription && description && (
                            <div style={{ marginBottom: 18 }}>
                                <p style={{
                                    fontSize: `${isMobile ? Math.max(13, descSize - 1) : descSize}px`,
                                    color: descColor,
                                    lineHeight: 1.7,
                                    margin: 0,
                                    wordBreak: 'break-word',
                                }}>
                                    {truncatedDesc}
                                </p>
                                {description.length > shortDescLength && (
                                    <button
                                        onClick={() => setExpanded(e => !e)}
                                        style={{
                                            marginTop: 8, background: 'none', border: 'none',
                                            color: '#6366f1', fontSize: 13, fontWeight: 600,
                                            cursor: 'pointer', padding: 0,
                                        }}
                                    >
                                        {expanded ? '▲ Read Less' : '▼ Read More'}
                                    </button>
                                )}
                            </div>
                        )}

                        {showCta && ctaText && (
                            <a
                                href={ctaUrl || '#checkout'}
                                onClick={e => {
                                    if (isEditor) { e.preventDefault(); return; }
                                    if (ctaUrl && ctaUrl.startsWith('#')) {
                                        e.preventDefault();
                                        const target = document.getElementById(ctaUrl.slice(1));
                                        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }}
                                style={{
                                    display: 'block',
                                    backgroundColor: ctaBg,
                                    color: ctaTextColor,
                                    borderRadius: `${ctaRadius}px`,
                                    padding: isMobile ? '13px 20px' : '14px 32px',
                                    fontSize: isMobile ? 15 : 16,
                                    fontWeight: 800,
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    boxShadow: `0 4px 20px ${ctaBg}55`,
                                    letterSpacing: '0.01em',
                                    boxSizing: 'border-box',
                                    transition: 'transform 0.15s',
                                    width: '100%',
                                }}
                            >
                                {ctaText}
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Settings Panel ────────────────────────────────────────────────────────
const Section = ({ title, accent, children, defaultOpen = true }) => {
    const [open, setOpen] = React.useState(defaultOpen);
    return (
        <div className="border border-gray-100 rounded-xl overflow-hidden mb-2">
            <button type="button" onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-left">
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

const BookSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });
    const [productList, setProductList] = useState([]);

    useEffect(() => {
        axios.get('/api/widget-products')
            .then(res => setProductList(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="pb-6">
            <div className="p-3 mb-3 bg-indigo-50 text-indigo-700 text-xs rounded-xl border border-indigo-100 leading-relaxed">
                Configure your Book widget. You can link it dynamically to a specific database product below.
            </div>

            <Section title="Data Source" accent="🗄️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Select Book / Product</label>
                    <select
                        value={p.selectedProductId || ''}
                        onChange={e => set('selectedProductId', e.target.value)}
                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">-- Use Landing Page Default --</option>
                        {productList.map(prod => (
                            <option key={prod.id} value={prod.id}>{prod.name}</option>
                        ))}
                    </select>
                </div>
            </Section>

            <Section title="Book Details Overrides" accent="📖" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Title (Leave blank for DB)</label>
                    <input type="text" value={p.titleOverride} onChange={e => set('titleOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" placeholder="Auto from DB..." />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Writer / Author (Leave blank for DB)</label>
                    <input type="text" value={p.writerNameOverride} onChange={e => set('writerNameOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" placeholder="Auto from DB..." />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Publisher (Leave blank for DB)</label>
                    <input type="text" value={p.publicationNameOverride} onChange={e => set('publicationNameOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" placeholder="Auto from DB..." />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Pages Override</label>
                        <input type="text" value={p.totalPagesOverride} onChange={e => set('totalPagesOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" placeholder="Auto..." />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Language Override</label>
                        <input type="text" value={p.languageOverride} onChange={e => set('languageOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" placeholder="Auto..." />
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Description Override</label>
                    <textarea rows={4} value={p.descriptionOverride} onChange={e => set('descriptionOverride', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2 resize-none" placeholder="Leave blank to use DB description..." />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Short Preview Length ({p.shortDescLength} chars)</label>
                    <input type="range" min={50} max={500} step={10} value={p.shortDescLength} onChange={e => set('shortDescLength', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
            </Section>

            <Section title="Show / Hide" accent="👁️" defaultOpen={true}>
                {[
                    ['showTitle',       'Product / Book Title'],
                    ['showGallery',     'Image Gallery'],
                    ['showDescription', 'Description (with Read More)'],
                    ['showMeta',        'Book Info (author, pages, etc.)'],
                    ['showWriter',      '↳ Writer Name'],
                    ['showPublication', '↳ Publication Name'],
                    ['showPages',       '↳ Total Pages'],
                    ['showLanguage',    '↳ Language'],
                    ['showPrice',       'Price'],
                    ['showRating',      'Star Rating'],
                    ['showCta',         'CTA Button'],
                ].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p[key]} onChange={e => set(key, e.target.checked)} className="rounded accent-indigo-500" />
                        <span className="text-sm text-gray-700">{label}</span>
                    </label>
                ))}
            </Section>

            <Section title="Layout" accent="🗂️" defaultOpen={true}>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Layout</label>
                    <div className="grid grid-cols-2 gap-1">
                        {[['row', '↔ Side by Side'], ['stack', '↕ Stacked']].map(([v, l]) => (
                            <button key={v} type="button" onClick={() => set('layout', v)} className={`py-1.5 text-xs rounded-lg border font-medium transition ${p.layout === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{l}</button>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">On mobile, layout always stacks automatically.</p>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Meta Info Style</label>
                    <div className="grid grid-cols-3 gap-1">
                        {[['table', 'Table'], ['pills', 'Pills'], ['inline', 'Inline']].map(([v, l]) => (
                            <button key={v} type="button" onClick={() => set('metaStyle', v)} className={`py-1.5 text-xs rounded-lg border font-medium transition ${p.metaStyle === v ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>{l}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Max Width ({p.maxWidth}px)</label>
                    <input type="range" min={480} max={1200} step={20} value={p.maxWidth} onChange={e => set('maxWidth', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Image Border Radius ({p.imageBorderRadius}px)</label>
                    <input type="range" min={0} max={32} value={p.imageBorderRadius} onChange={e => set('imageBorderRadius', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Image Shadow</label>
                    <select value={p.imageShadow} onChange={e => set('imageShadow', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                        {['none', 'sm', 'md', 'lg'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {[['paddingTop', 'Pad Top'], ['paddingBottom', 'Pad Bottom'], ['paddingLeft', 'Pad Left'], ['paddingRight', 'Pad Right']].map(([k, l]) => (
                        <div key={k}>
                            <label className="text-xs text-gray-500 block mb-1">{l} ({p[k]}px)</label>
                            <input type="range" min={0} max={160} value={p[k]} onChange={e => set(k, parseInt(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Typography & Colors" accent="🎨" defaultOpen={false}>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Title Size ({p.titleSize}px)</label>
                        <input type="range" min={18} max={56} value={p.titleSize} onChange={e => set('titleSize', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Title Color</label>
                        <input type="color" value={p.titleColor} onChange={e => set('titleColor', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Desc Size ({p.descSize}px)</label>
                        <input type="range" min={12} max={22} value={p.descSize} onChange={e => set('descSize', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Desc Color</label>
                        <input type="color" value={p.descColor} onChange={e => set('descColor', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">Meta Label Color</label>
                    <input type="color" value={p.metaLabelColor} onChange={e => set('metaLabelColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">Meta Value Color</label>
                    <input type="color" value={p.metaValueColor} onChange={e => set('metaValueColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">Price Color</label>
                    <input type="color" value={p.priceColor} onChange={e => set('priceColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs text-gray-600">Star Color</label>
                    <input type="color" value={p.starColor} onChange={e => set('starColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                </div>
            </Section>

            {p.showCta && (
                <Section title="CTA Button" accent="🔘" defaultOpen={true}>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Button Text</label>
                        <input type="text" value={p.ctaText} onChange={e => set('ctaText', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Link URL</label>
                        <input type="text" value={p.ctaUrl} onChange={e => set('ctaUrl', e.target.value)} placeholder="#checkout" className="w-full text-xs border-gray-300 rounded-lg px-3 py-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Background</label>
                            <input type="color" value={p.ctaBg} onChange={e => set('ctaBg', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Text</label>
                            <input type="color" value={p.ctaTextColor} onChange={e => set('ctaTextColor', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Radius ({p.ctaRadius}px)</label>
                        <input type="range" min={0} max={50} value={p.ctaRadius} onChange={e => set('ctaRadius', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                </Section>
            )}
        </div>
    );
};

BookWidget.craft = {
    displayName: 'Book Information',
    props: {
        // Display toggles
        showTitle: true, showGallery: true, showDescription: true,
        showMeta: true, showWriter: true, showPublication: true,
        showPages: true, showLanguage: true,
        showPrice: true, showRating: true, showCta: true,

        // Content
        selectedProductId: '',
        titleOverride: '',
        writerNameOverride: '',
        publicationNameOverride: '',
        totalPagesOverride: '',
        languageOverride: '',
        descriptionOverride: '',
        shortDescLength: 200,

        // Rating
        ratingValue: 4.8,
        reviewCount: 312,
        starColor: '#f59e0b',
        currencySymbol: '৳',

        // Layout
        layout: 'row',
        maxWidth: 1000,
        metaStyle: 'table',

        // Background
        bgType: 'color', bgColor: '#ffffff',
        bgGradientFrom: '#f8fafc', bgGradientTo: '#f1f5f9', bgGradientDirection: 180,
        paddingTop: 56, paddingBottom: 56, paddingLeft: 24, paddingRight: 24,

        // Image
        imageBorderRadius: 12, imageShadow: 'md',

        // Typography
        titleSize: 28, titleWeight: '800', titleColor: '#0f172a',
        metaLabelColor: '#374151', metaValueColor: '#6b7280',
        descColor: '#475569', descSize: 15,
        priceColor: '#16a34a', priceSize: 32,

        // CTA
        ctaText: '🛒 Order Now — Cash on Delivery',
        ctaUrl: '#checkout',
        ctaBg: '#16a34a', ctaTextColor: '#ffffff', ctaRadius: 10,
    },
    related: { settings: BookSettings },
};