// resources/js/Pages/Frontend/Products/ShowBook.jsx
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import ProductCard from '@/Components/ProductCard';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import SEO from '@/Components/SEO';
import useTranslation from '@/Hooks/useTranslation';
import ProductEngagementTracker from '@/Components/ProductEngagementTracker';

// Import analytics helper
import { trackEvent } from '@/utils/analytics'; 

export default function ShowBook({ product, relatedProducts }) {
    const { __ } = useTranslation();
    const { global_settings, auth } = usePage().props; 
    
    const [quantity, setQuantity] = useState(1);
    const [isSquareCover, setIsSquareCover] = useState(false);
    
    // Loading States
    const [buyingNow, setBuyingNow] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    
    // UI States
    const [descExpanded, setDescExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState('desc');
    const [currentIndex, setCurrentIndex] = useState(0);

    // Synchronous locks to completely prevent double-firing
    const inFlightRef = useRef(false);
    const viewTrackedRef = useRef(false);
    const trackLockRef = useRef(false);

    const galleryImages = [
        ...(product.thumbnail ? [{ url: `/storage/${product.thumbnail}`, id: 'thumb' }] : []),
        ...(product.images || []).map(img => ({ url: `/storage/${img.image_path}`, id: img.id }))
    ];

    const price = parseFloat(product.price);
    let finalPrice = price;
    if (product.discount_value > 0) {
        finalPrice = product.discount_type === 'percent'
            ? price - (price * (parseFloat(product.discount_value) / 100))
            : price - parseFloat(product.discount_value);
    }
    const discountPercent = product.discount_value > 0
        ? Math.round(((price - finalPrice) / price) * 100)
        : 0;
    const savings = price - finalPrice;

    // --- Product View Tracking (GA4 view_item + Meta ViewContent) ---
    useEffect(() => {
        if (product && product.id && !viewTrackedRef.current) {
            axios.post(route('analytics.track'), { 
                product_id: product.id, 
                event_type: 'view' 
            }).catch(() => {});

            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('view_item', {
                    currency: 'BDT',
                    value: finalPrice,
                    items: [{
                        item_id: product.sku || product.id.toString(),
                        item_name: product.name,
                        price: finalPrice,
                        item_category: product.categories?.length > 0 ? product.categories[product.categories.length - 1].name : 'Books',
                        quantity: 1
                    }]
                }, {
                    em: auth?.user?.email || '',
                    ph: auth?.user?.phone || ''
                });
            }
            viewTrackedRef.current = true;
        }
    }, [product, finalPrice, global_settings, auth]);

    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % galleryImages.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

    // --- Slider Refs & Handlers ---
    const mobileSliderRef = useRef(null);
    const desktopSliderRef = useRef(null);
    const [activeRef, setActiveRef] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasDragged, setHasDragged] = useState(false);
    const [startX, setStartX] = useState(0);
    const [initialScrollLeft, setInitialScrollLeft] = useState(0);

    useEffect(() => {
        let animationId;
        const scroll = () => {
            const sliders = [mobileSliderRef.current, desktopSliderRef.current].filter(Boolean);
            if (!isHovered && !isDragging) {
                sliders.forEach(slider => {
                    if (slider.offsetParent !== null && slider.scrollWidth > slider.clientWidth) {
                        slider.scrollLeft += 0.2; 
                        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 1) slider.scrollLeft = 0;
                    }
                });
            }
            animationId = requestAnimationFrame(scroll);
        };
        animationId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationId);
    }, [isHovered, isDragging]);

    const handleMouseDown = (e, ref) => {
        setIsDragging(true); setIsHovered(true); setHasDragged(false);
        setStartX(e.pageX - ref.current.offsetLeft);
        setInitialScrollLeft(ref.current.scrollLeft);
        setActiveRef(ref);
    };
    const handleMouseLeave = () => { setIsDragging(false); setIsHovered(false); setActiveRef(null); };
    const handleMouseUp = () => { setIsDragging(false); setActiveRef(null); };
    const handleMouseMove = (e, ref) => {
        if (!isDragging || activeRef !== ref) return;
        e.preventDefault(); setHasDragged(true);
        const x = e.pageX - ref.current.offsetLeft;
        const walk = (x - startX) * 1.5; 
        ref.current.scrollLeft = initialScrollLeft - walk;
    };
    const handleLinkClick = (e) => { if (hasDragged) e.preventDefault(); };

    const handleCoverLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        const ratio = naturalWidth / naturalHeight;
        setIsSquareCover(ratio >= 0.95 && ratio <= 1.05);
    };

    // --- Unified Submit logic ---
    const submitToCart = (e, isBuyNow = false) => {
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();

        if (inFlightRef.current) return;
        inFlightRef.current = true;

        if (!trackLockRef.current) {
            trackLockRef.current = true;
            
            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('add_to_cart', {
                    currency: 'BDT',
                    value: finalPrice * quantity,
                    items: [{
                        item_id: product.sku || product.id.toString(),
                        item_name: product.name,
                        price: finalPrice,
                        item_category: product.categories?.length > 0 ? product.categories[product.categories.length - 1].name : 'Books',
                        quantity: quantity
                    }]
                }, {
                    em: auth?.user?.email || '',
                    ph: auth?.user?.phone || ''
                });
            }

            setTimeout(() => { trackLockRef.current = false; }, 2000);
        }

        isBuyNow ? setBuyingNow(true) : setAddingToCart(true);

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: quantity,
            ...(isBuyNow && { action: 'buy_now' })
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                axios.post(route('analytics.track'), { 
                    product_id: product.id, 
                    event_type: 'add_to_cart' 
                }).catch(() => {});
                // REMOVED local toast. FrontendLayout handles the global flash message natively.
            },
            onError: (errors) => {
                console.error("Cart Add Error:", errors);
            },
            onFinish: () => {
                inFlightRef.current = false;
                isBuyNow ? setBuyingNow(false) : setAddingToCart(false);
            }
        });
    };

    const formatDescription = (text) => {
        if (!text) return null;
        let formatted = text.replace(/\s+-\s+/g, ' — ');
        if (/<[a-z][\s\S]*>/i.test(formatted)) {
            return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
        }
        return (
            <div className="sp-formatted-text">
                {formatted.split('\n').map((paragraph, index) => {
                    if (!paragraph.trim()) return <div key={index} style={{ height: '0.8em' }} />; 
                    return <p key={index}>{paragraph.trim()}</p>;
                })}
            </div>
        );
    };

    const authorNames = product.authors?.map(a => a.name).join(', ') || '';
    const seoTitle = authorNames ? `${product.name} - ${authorNames}` : product.name;

    const renderMetaItems = () => (
        <>
            {product.language && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Language')}</span>
                    <span className="sp-meta-mid">
                        {product.language === 'বাংলা' || product.language === 'Bangla' ? 'BN' : product.language.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="sp-meta-bot">{product.language}</span>
                </div>
            )}
            {product.publications?.length > 0 && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Publication')}</span>
                    <span className="sp-meta-mid">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    </span>
                    <Link onClick={handleLinkClick} href={route('shop', { publication: product.publications[0].id })} className="sp-meta-bot sp-meta-link">
                        {product.publications[0].name}
                    </Link>
                </div>
            )}
            {product.authors?.length > 0 && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Author')}</span>
                    <span className="sp-meta-mid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
                    </span>
                    <Link onClick={handleLinkClick} href={route('shop', { author: product.authors[0].id })} className="sp-meta-bot sp-meta-link">
                        {product.authors[0].name}
                    </Link>
                </div>
            )}
            {product.isbn ? (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('ISBN')}</span>
                    <span className="sp-meta-mid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M7 7h.01"/><path d="M11 7h.01"/><path d="M15 7h.01"/><path d="M7 11h.01"/><path d="M11 11h.01"/><path d="M15 11h.01"/><path d="M7 15h.01"/><path d="M11 15h.01"/><path d="M15 15h.01"/></svg>
                    </span>
                    <span className="sp-meta-bot">{product.isbn}</span>
                </div>
            ) : product.categories?.length > 0 && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Category')}</span>
                    <span className="sp-meta-mid">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                    </span>
                    <Link onClick={handleLinkClick} href={route('shop', { category: product.categories[product.categories.length - 1].id })} className="sp-meta-bot sp-meta-link">
                        {product.categories[product.categories.length - 1].name}
                    </Link>
                </div>
            )}
            {product.edition && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Edition Label')}</span>
                    <span className="sp-meta-mid">{product.edition}</span>
                    <span className="sp-meta-bot">{__('Edition')}</span>
                </div>
            )}
            {product.pages && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Pages Label')}</span>
                    <span className="sp-meta-mid">{product.pages}</span>
                    <span className="sp-meta-bot">{__('Pages')}</span>
                </div>
            )}
            {product.country && (
                <div className="sp-meta-item">
                    <span className="sp-meta-lbl">{__('Country')}</span>
                    <span className="sp-meta-mid">
                        {product.country === 'বাংলাদেশ' || product.country === 'Bangladesh' ? 'BD' : product.country.substring(0, 2).toUpperCase()}
                    </span>
                    <span className="sp-meta-bot">{product.country}</span>
                </div>
            )}
        </>
    );

    const renderMetaSlider = (ref) => (
        <div
            className="sp-meta-slider-wrap"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
        >
            <div 
                className="sp-meta-slider" 
                ref={ref}
                onMouseDown={(e) => handleMouseDown(e, ref)}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={(e) => handleMouseMove(e, ref)}
            >
                {renderMetaItems()}
            </div>
        </div>
    );

    return (
        <ThemeLayout>
            <SEO 
                title={seoTitle} 
                description={product.short_description || product.description} 
                image={product.thumbnail ? `/storage/${product.thumbnail}` : undefined} 
            />
            
            <ProductEngagementTracker productId={product.id} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700;800&display=swap');

                *, *::before, *::after { box-sizing: border-box; }

                /* Added padding-bottom on mobile so content doesn't get hidden behind the sticky footer */
                .sp { font-family: 'Hind Siliguri', sans-serif; background: #f4f6f8; min-height: 100vh; color: #1a1a2e; padding-bottom: 80px; }
                @media(min-width:768px){ .sp { padding-bottom: 0; } }
                
                .sp-container { max-width: 1280px; margin: 0 auto; padding: 0 8px; }
                @media(min-width:768px){ .sp-container { padding: 0 20px; } }

                /* ── Breadcrumb ── */
                .sp-bc { display:flex; align-items:center; flex-wrap:wrap; gap:4px; padding: 10px 0; margin-bottom:10px; }
                @media(min-width:768px){ .sp-bc { padding: 16px 0; margin-bottom:24px; gap:5px; } }
                .sp-bc a { font-size:0.8rem; color:#6b7280; text-decoration:none; transition:color .15s; }
                .sp-bc a:hover { color: #166534; }
                .sp-bc-sep { color:#d1d5db; font-size:0.85rem; }
                .sp-bc-cur { font-size:0.8rem; color:#374151; font-weight:600; max-width:240px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

                /* ── Main layout ── */
                .sp-main { display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:24px; }
                @media(min-width:768px){ .sp-main { grid-template-columns: 280px 1fr; gap:32px; align-items:start; margin-bottom:40px; } }
                @media(min-width:1100px){ .sp-main { grid-template-columns: 330px 1fr 270px; gap:36px; } }

                /* ── Cover column ── */
                .sp-cover-col { display:flex; flex-direction:column; align-items:center; gap:8px; width: 100%; min-width:0; }
                @media(min-width:768px){ .sp-cover-col { gap:16px; } }
                .sp-sticky { position:sticky; top:90px; width:100%; display:flex; flex-direction:column; align-items:center; gap:8px; }

                /* ── NEW GALLERY SYSTEM ── */
                .sp-product-gallery { position: relative; width: 100%; max-width: 320px; margin: 0 auto; display: flex; align-items: center; justify-content: center; }
                
                .sp-gallery-viewport { overflow: hidden; width: 100%; padding: 5px 0 20px; margin: -5px 0 -20px; }
                @media(min-width:768px){ .sp-gallery-viewport { padding: 20px 0 35px; margin: -20px 0 -35px; } }
                
                .sp-gallery-track { display: flex; width: 100%; transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1); }
                .sp-gallery-slide { min-width: 100%; display: flex; justify-content: center; align-items: center; }

                .sp-gallery-arrow { position: absolute; top: 50%; transform: translateY(-50%); width: 36px; height: 36px; background: rgba(255, 255, 255, 0.95); border: 1px solid #e5e7eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4b5563; cursor: pointer; z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
                @media(min-width:768px){ .sp-gallery-arrow { width: 42px; height: 42px; } }
                .sp-gallery-arrow:hover { background: #f0fdf4; color: #166534; border-color: #bbf7d0; transform: translateY(-50%) scale(1.08); }
                .sp-gallery-arrow:active { transform: translateY(-50%) scale(0.95); }
                .sp-gallery-prev { left: -10px; }
                .sp-gallery-next { right: -10px; }

                /* 3D Book Styles for Slider */
                .sp-book-3d { position: relative; width: 100%; max-width: 220px; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.15)) drop-shadow(0 4px 10px rgba(0,0,0,0.06)); transition: transform .4s cubic-bezier(.22,.68,0,1.15), filter .4s; }
                @media(min-width:768px){ .sp-book-3d { max-width: 250px; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.18)) drop-shadow(0 4px 10px rgba(0,0,0,0.08)); } }
                .sp-book-3d:hover { transform: translateY(-6px) rotate(-1deg) scale(1.02); filter: drop-shadow(0 20px 30px rgba(0,0,0,0.22)) drop-shadow(0 6px 14px rgba(0,0,0,0.12)); }
                
                .sp-book-3d-sq { border-radius:12px; max-width:100%; filter: none; }
                .sp-book-3d-sq:hover { transform: translateY(-6px) scale(1.02); filter: none; }

                /* Image inside 3D container */
                .sp-cover-img { display:block; width:100%; height:auto; max-height: 400px; object-fit:contain; border-radius:3px 8px 8px 3px; background:transparent; }
                .sp-cover-img-sq { display:block; width:100%; aspect-ratio:1/1; object-fit:contain; border-radius:12px; }
                
                .sp-spine { position:absolute; left:0; top:0; bottom:0; width:18px; background:linear-gradient(to right,rgba(0,0,0,0.36) 0%,rgba(0,0,0,0.08) 60%,transparent 100%); border-radius:3px 0 0 3px; pointer-events:none; z-index:1; }
                .sp-gloss { position:absolute; inset:0; background:linear-gradient(140deg,rgba(255,255,255,0.22) 0%,transparent 48%); border-radius:3px 10px 10px 3px; pointer-events:none; z-index:2; }

                /* ── Scrollable Thumbnails Strip ── */
                .sp-thumbnail-strip { display:flex; gap:6px; width:100%; max-width: 320px; overflow-x:auto; padding: 2px 2px 8px 2px; scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
                @media(min-width:768px){ .sp-thumbnail-strip { padding: 4px 4px 12px 4px; gap:10px; } }
                .sp-thumbnail-strip::-webkit-scrollbar { height: 4px; }
                .sp-thumbnail-strip::-webkit-scrollbar-track { background: transparent; }
                .sp-thumbnail-strip::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                
                .sp-thumb-box { flex-shrink:0; width:48px; height:64px; background:#fff; border-radius:6px; cursor:pointer; border:2px solid transparent; transition:all 0.2s ease-out; box-shadow:0 2px 5px rgba(0,0,0,0.08); overflow: hidden; }
                @media(min-width:768px){ .sp-thumb-box { width:56px; height:76px; } }
                .sp-thumb-box:hover { transform:translateY(-2px); box-shadow:0 4px 10px rgba(0,0,0,0.12); }
                .sp-thumb-box.active { border-color:#166534; box-shadow:0 0 0 1px rgba(22,101,52,0.4), 0 4px 10px rgba(22,101,52,0.15); transform:translateY(-2px); }
                .sp-thumb-box img { width: 100%; height: 100%; object-fit: contain; padding: 2px; }

                /* ── Info column ── */
                .sp-info { min-width:0; }
                
                .sp-info-card { background:white; border-radius:12px; border:1px solid #e5e7eb; padding:16px; margin-bottom:12px; }
                
                @media(min-width:768px){ 
                    .sp-info-card { border-radius:16px; padding:28px; margin-bottom:20px; }
                }

                .sp-title { font-family:'Hind Siliguri', sans-serif; font-size:clamp(1.4rem, 2.5vw, 1.8rem); font-weight:700; color:#0f172a; line-height:1.2; margin-bottom:10px; display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; }
                @media(min-width:768px){ .sp-title { margin-bottom:14px; } }
                .sp-author-link { font-size:0.8rem; font-weight:600; color:#166534; text-decoration:none; border-bottom:1px solid #bbf7d0; transition:all .15s; line-height:1.5; }
                @media(min-width:768px){ .sp-author-link { border-bottom:1.5px solid #bbf7d0; } }
                .sp-author-link:hover { color:#14532d; border-color:#14532d; }

                .sp-divider { height:1px; background:#f0f0f0; margin:14px 0; }
                @media(min-width:768px){ .sp-divider { margin:20px 0; } }

                .sp-price-block { margin-bottom:16px; }
                @media(min-width:768px){ .sp-price-block { margin-bottom:22px; } }
                
                .sp-price-row { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap; margin-bottom:4px; }
                .sp-price-final { font-size:clamp(2rem,4vw,2.8rem); font-weight:700; color:#0f172a; line-height:1; }
                .sp-price-orig { font-size:1.15rem; color:#9ca3af; text-decoration:line-through; font-weight:400; }
                .sp-price-save { font-size:0.82rem; color:#166534; font-weight:600; margin-top:4px; display:block; }
                .sp-disc-pill { display:inline-flex; align-items:center; padding:3px 10px; background:#fef2f2; border:1px solid #fecaca; border-radius:100px; font-size:0.72rem; font-weight:700; color:#dc2626; }

                /* ── META INFO SLIDER ── */
                .sp-meta-card { display: none; }
                @media(min-width:768px) {
                    .sp-meta-card { display: block; background:white; border-radius:16px; border:1px solid #e5e7eb; padding:20px 10px; margin-bottom:24px; }
                }

                .sp-mobile-meta-wrap { margin-top: 16px; padding-top: 16px; border-top: 1px solid #f0f0f0; }
                @media(min-width:768px) { .sp-mobile-meta-wrap { display: none; } }

                .sp-meta-slider-wrap { width: 100%; overflow: hidden; position: relative; }
                .sp-meta-slider-wrap::after { content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 30px; background: linear-gradient(to right, transparent, white); pointer-events: none; }
                .sp-meta-slider { display: flex; align-items: center; overflow-x: auto; gap: 0; scrollbar-width: none; -ms-overflow-style: none; padding-bottom: 5px; cursor: grab; }
                .sp-meta-slider:active { cursor: grabbing; }
                .sp-meta-slider::-webkit-scrollbar { display: none; }
                .sp-meta-item { display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; padding: 0 16px; border-right: 1px solid #e5e7eb; min-width: 120px; }
                @media(min-width:768px){ .sp-meta-item { padding: 0 18px; } }
                .sp-meta-item:last-child { border-right: none; }
                
                .sp-meta-lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
                .sp-meta-mid { font-size: 1.1rem; font-weight: 700; color: #111827; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; height: 24px; }
                .sp-meta-bot { font-size: 0.85rem; color: #4b5563; text-align: center; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .sp-meta-link { color: #4b5563; text-decoration: none; transition: color 0.15s; }
                .sp-meta-link:hover { color: #166534; text-decoration: underline; }

                /* ── ACTION WRAP (Sticky on Mobile, Solid Desktop Box) ── */
                .sp-action-wrap { 
                    position: fixed; bottom: 0; left: 0; width: 100%; background: white; 
                    padding: 12px 16px; box-shadow: 0 -4px 15px rgba(0,0,0,0.08); z-index: 50; 
                    border-radius: 16px 16px 0 0; display: flex; flex-direction: row; align-items: center; 
                    gap: 12px; margin: 0; 
                }
                @media(min-width:768px){ 
                    .sp-action-wrap { 
                        position: static; padding: 24px; margin-bottom: 20px; border-radius: 12px; 
                        box-shadow: none; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 20px;
                    } 
                }

                .sp-qty-row { display:none; }
                @media(min-width:768px){ .sp-qty-row { display:flex; align-items:center; gap:16px; margin-bottom:0; flex-shrink: 0; width: 100%; } }
                
                .sp-qty-lbl { display:none; }
                @media(min-width:768px){ .sp-qty-lbl { display:block; font-size:1.05rem; font-weight:700; color:#4b5563; min-width:60px; } }
                
                .sp-qty-total { display:none; }
                @media(min-width:768px){ 
                    .sp-qty-total { display:inline; font-size:0.95rem; color:#6b7280; font-weight:500; margin-left:8px; } 
                    .sp-qty-total strong { color:#0f172a; font-weight:800; font-size:1.05rem; }
                }

                .sp-qty-ctrl { display:flex; align-items:stretch; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; background:white; height:42px; }
                @media(min-width:768px){ .sp-qty-ctrl { height:46px; border-radius:8px; border-color:#d1d5db; } }
                
                .sp-qty-btn { width:38px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:400; color:#6b7280; cursor:pointer; background:none; border:none; transition:background .12s, color .12s; user-select:none; }
                @media(min-width:768px){ .sp-qty-btn { width:42px; font-size:1.2rem; color:#4b5563; } }
                .sp-qty-btn:hover:not(:disabled) { background:#f8fafc; color:#0f172a; }
                .sp-qty-btn:disabled { opacity:.4; cursor:not-allowed; }
                
                .sp-qty-num { min-width:38px; text-align:center; font-size:1rem; font-weight:700; color:#0f172a; border-left:1px solid #f3f4f6; border-right:1px solid #f3f4f6; display:flex; align-items:center; justify-content:center; }
                @media(min-width:768px){ .sp-qty-num { min-width:50px; font-size:1.05rem; border-color:#d1d5db; } }

                .sp-action-buttons { display: flex; width: 100%; gap: 12px; align-items: center; }

                /* ── ADD TO CART BUTTON (Square Icon on Mobile, Solid Text on Desktop) ── */
                .sp-add-btn {
                    width: 48px; height: 48px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
                    border: 2px solid #166534; color: #166534; background: white; border-radius: 10px; cursor: pointer; transition: all 0.2s;
                }
                .sp-add-btn:hover:not(:disabled) { background: #f0fdf4; }
                .sp-add-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .sp-add-text { display: none; }

                @media(min-width:768px) {
                    .sp-add-btn { width: auto; flex: 1; height: 56px; gap: 8px; font-size: 1.25rem; font-weight: 700; }
                    .sp-add-text { display: inline; }
                }

                /* ── BUY NOW BUTTON (Mobile = Attractive/Pulse, Desktop = Solid Dark Green) ── */
                .sp-buy-btn { 
                    flex: 1; height: 48px; background: linear-gradient(135deg, #10b981 0%, #166534 100%); 
                    color: white; border: none; border-radius: 10px; font-size: 1.1rem; font-weight: 800; letter-spacing: 0.02em; 
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; 
                    position: relative; overflow: hidden; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); 
                    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1); animation: btn-pulse 2.5s infinite; text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }
                .sp-buy-btn::before { 
                    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; 
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); 
                    transform: skewX(-25deg); animation: btn-shine 3s infinite; pointer-events: none; 
                }
                .sp-buy-btn:hover:not(:disabled) { 
                    transform: translateY(-3px) scale(1.01); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5); filter: brightness(1.1); animation: none; 
                }
                .sp-buy-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
                .sp-buy-btn:disabled { opacity: .7; cursor: not-allowed; filter: grayscale(0.5); animation: none; }

                @keyframes btn-shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
                @keyframes btn-pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); } 70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

                @media(min-width:768px){ 
                    .sp-buy-btn { 
                        height: 56px; font-size: 1.25rem; font-weight: 700; border-radius: 10px; gap: 10px; 
                        background: #144f2b; box-shadow: 0 6px 16px rgba(20, 79, 43, 0.2); animation: none; text-shadow: none; width: 100%;
                    }
                    .sp-buy-btn::before { display: none; }
                    .sp-buy-btn:hover:not(:disabled) { transform: translateY(-2px); scale: 1; background: #0f3d20; box-shadow: 0 8px 20px rgba(20, 79, 43, 0.3); filter: none; }
                }

                /* ── Sidebar ── */
                .sp-sidebar { display:none; }
                @media(min-width:1100px){ .sp-sidebar { display:flex; flex-direction:column; gap:16px; } }
                .sp-sidebar-sticky { position:sticky; top:90px; display:flex; flex-direction:column; gap:16px; }
                .sp-sidebar-card { background:white; border:1px solid #e5e7eb; border-radius:14px; padding:20px; }
                .sp-sidebar-head { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.13em; color:#9ca3af; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
                .sp-sidebar-head::after { content:''; flex:1; height:1px; background:#f3f4f6; }

                /* ── Desktop Sidebar Related Books ── */
                .sp-rel-list { display: flex; flex-direction: column; }
                .sp-rel-item { display:flex; gap:12px; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #f9fafb; text-decoration: none; transition: all 0.2s; }
                .sp-rel-item:last-child { margin-bottom:0; padding-bottom:0; border-bottom:none; }
                .sp-rel-item:hover { transform: translateX(4px); }
                .sp-rel-img-wrap { width:54px; flex-shrink:0; border-radius:6px; overflow:hidden; border:1px solid #f3f4f6; background:#f9fafb; aspect-ratio: 1/1.3; display:flex; align-items:center; justify-content:center; }
                .sp-rel-img { width:100%; height:100%; object-fit:contain; padding: 2px; mix-blend-mode: multiply; }
                .sp-rel-title { font-size:0.8rem; font-weight:600; color:#1f2937; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; transition: color 0.2s; }
                .sp-rel-item:hover .sp-rel-title { color: #166534; }
                .sp-rel-price { font-size:0.85rem; font-weight:700; color:#166534; margin-top:4px; }
                .sp-rel-old-price { font-size:0.7rem; color:#9ca3af; text-decoration:line-through; margin-left:6px; font-weight:400; }

                /* ── Description section ── */
                .sp-content-section { margin-bottom:32px; }
                @media(min-width:768px){ .sp-content-section { margin-bottom:48px; } }
                
                .sp-tabs-bar { display:flex; border-bottom:1px solid #e5e7eb; margin-bottom:16px; gap:0; overflow-x:auto; background:white; border-radius:10px 10px 0 0; border:1px solid #e5e7eb; border-bottom:none; padding:0 4px; }
                @media(min-width:768px){ .sp-tabs-bar { border-bottom:2px solid #e5e7eb; margin-bottom:28px; border-radius:12px 12px 0 0; padding:0 8px; } }
                
                .sp-tab-btn { padding:14px 18px; font-size:0.92rem; font-weight:600; color:#9ca3af; border:none; border-bottom:2px solid transparent; margin-bottom:-1px; cursor:pointer; background:none; white-space:nowrap; transition:all .18s; }
                @media(min-width:768px){ .sp-tab-btn { padding:14px 22px; } }
                .sp-tab-btn.active { color:#166534; border-bottom-color:#166534; }
                .sp-tab-btn:hover:not(.active) { color:#374151; }

                .sp-tab-content { background:white; border:1px solid #e5e7eb; border-radius:0 0 10px 10px; padding:16px; }
                @media(min-width:768px){ .sp-tab-content { border-radius:0 0 12px 12px; padding:28px; } }

                .sp-desc-body { font-size: 1.05rem; line-height: 1.8; color: #374151; max-width: 800px; overflow-wrap: anywhere; word-break: break-word; }
                @media(min-width:768px){ .sp-desc-body { line-height: 1.9; } }
                .sp-desc-body p { margin-bottom: 1.2em; text-align: justify; overflow-wrap: anywhere; word-break: break-word; }
                .sp-desc-body h2, .sp-desc-body h3 { font-weight: 700; color: #0f172a; margin: 1.6em 0 .4em; }
                
                .sp-desc-clamp { max-height: 220px; overflow: hidden; position: relative; }
                .sp-desc-clamp::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 90px; background: linear-gradient(to bottom, transparent, white); pointer-events: none; }
                
                .sp-read-more { display:inline-flex; align-items:center; gap:5px; margin-top:16px; font-size:0.9rem; font-weight:700; color:#166534; background:none; border:none; cursor:pointer; padding:0; transition:opacity .15s; }
                @media(min-width:768px){ .sp-read-more { margin-top:18px; } }
                .sp-read-more:hover { opacity:.75; }

                .sp-spec-full { width:100%; border-collapse:collapse; }
                .sp-spec-full tr { border-bottom:1px solid #f3f4f6; }
                .sp-spec-full tr:last-child { border-bottom:none; }
                .sp-spec-full td { padding:10px 12px; font-size:0.9rem; vertical-align:middle; }
                @media(min-width:768px){ .sp-spec-full td { padding:13px 16px; } }
                .sp-spec-full td:first-child { color:#9ca3af; font-weight:700; width:40%; font-size:0.78rem; text-transform:uppercase; letter-spacing:0.09em; }
                @media(min-width:768px){ .sp-spec-full td:first-child { width:38%; } }
                .sp-spec-full td:last-child { color:#111827; font-weight:500; }
                .sp-spec-full tr:nth-child(even) td { background:#fafafa; }

                .sp-related-hdr { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
                @media(min-width:768px){ .sp-related-hdr { gap:14px; margin-bottom:24px; } }
                .sp-related-title { font-size:1.4rem; font-weight:700; color:#0f172a; white-space:nowrap; }
                .sp-related-line { flex:1; height:2px; background:linear-gradient(to right,#bbf7d0,transparent); border-radius:2px; }
            `}</style>

            <div className="sp">
                <div className="sp-container">

                    {/* ── Breadcrumb ── */}
                    <nav className="sp-bc">
                        <Link href={route('home')}>{__('Home')}</Link>
                        <span className="sp-bc-sep">›</span>
                        <Link href={route('shop')}>{__('Books')}</Link>
                        {product.categories?.map((cat) => (
                            <span key={cat.id} style={{display:'contents'}}>
                                <span className="sp-bc-sep">›</span>
                                <Link href={route('shop', { category: cat.id })}>{cat.name}</Link>
                            </span>
                        ))}
                        <span className="sp-bc-sep">›</span>
                        <span className="sp-bc-cur">{product.name}</span>
                    </nav>

                    {/* ── Main 3-column grid ── */}
                    <div className="sp-main">

                        {/* ── Column 1: Cover Slider (sticky) ── */}
                        <div className="sp-cover-col">
                            <div className="sp-sticky">
                                
                                <div className="sp-product-gallery">
                                    {galleryImages.length > 1 && (
                                        <button className="sp-gallery-arrow sp-gallery-prev" onClick={prevImage} aria-label="Previous Image">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                                        </button>
                                    )}

                                    <div className="sp-gallery-viewport">
                                        <div className="sp-gallery-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                                            {galleryImages.length > 0 ? galleryImages.map((img, idx) => (
                                                <div className="sp-gallery-slide" key={img.id}>
                                                    <div className={`sp-book-3d${isSquareCover ? ' sp-book-3d-sq' : ''}`}>
                                                        {!isSquareCover && <div className="sp-spine" />}
                                                        <img
                                                            src={img.url}
                                                            className={isSquareCover ? 'sp-cover-img-sq' : 'sp-cover-img'}
                                                            alt={`${product.name} - image ${idx + 1}`}
                                                            onLoad={handleCoverLoad}
                                                            loading={idx === 0 ? "eager" : "lazy"}
                                                            fetchpriority={idx === 0 ? "high" : "auto"}
                                                        />
                                                        {!isSquareCover && <div className="sp-gloss" />}
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="sp-gallery-slide">
                                                    <div className={`sp-book-3d${isSquareCover ? ' sp-book-3d-sq' : ''}`}>
                                                        {!isSquareCover && <div className="sp-spine" />}
                                                        <div className="sp-cover-img" style={{background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',color:'#9ca3af',fontSize:'0.9rem', height: '350px'}}>
                                                            {__('No Cover')}
                                                        </div>
                                                        {!isSquareCover && <div className="sp-gloss" />}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {galleryImages.length > 1 && (
                                        <button className="sp-gallery-arrow sp-gallery-next" onClick={nextImage} aria-label="Next Image">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                        </button>
                                    )}
                                </div>

                                {galleryImages.length > 1 && (
                                    <div className="sp-thumbnail-strip">
                                        {galleryImages.map((img, idx) => (
                                            <div
                                                key={`thumb-${img.id}`}
                                                className={`sp-thumb-box ${currentIndex === idx ? 'active' : ''}`}
                                                onClick={() => setCurrentIndex(idx)}
                                            >
                                                <img src={img.url} alt={`Thumbnail ${idx + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Column 2: Info ── */}
                        <div className="sp-info">

                            <div className="sp-info-card">
                                <h1 className="sp-title">
                                    <span>{product.name}</span>
                                    {product.authors?.length > 0 && (
                                        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#4b5563' }}>
                                            {__('by')}{' '}
                                            {product.authors.map((author, i) => (
                                                <span key={author.id}>
                                                    <Link href={route('shop', { author: author.id })} className="sp-author-link">{author.name}</Link>
                                                    {i < product.authors.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </span>
                                    )}
                                </h1>

                                <div className="sp-divider" />

                                <div className="sp-price-block">
                                    <div className="sp-price-row">
                                        <span className="sp-price-final">৳{finalPrice.toLocaleString()}</span>
                                        {product.discount_value > 0 && (
                                            <>
                                                <span className="sp-price-orig">৳{price.toLocaleString()}</span>
                                                <span className="sp-disc-pill">{discountPercent}% {__('Discount')}</span>
                                            </>
                                        )}
                                    </div>
                                    {savings > 0 && (
                                        <span className="sp-price-save">{__('You are saving')} ৳{savings.toLocaleString()}</span>
                                    )}
                                </div>

                                {/* ── INLINE MOBILE ACTION BLOCK ── */}
                                <div className="md:hidden mb-5 mt-4 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="font-bold text-gray-700">{__('Quantity')}</span>
                                        <div className="sp-qty-ctrl flex">
                                            <button className="sp-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={buyingNow || addingToCart}>−</button>
                                            <span className="sp-qty-num text-lg font-bold flex justify-center items-center">{quantity}</span>
                                            <button className="sp-qty-btn" onClick={() => setQuantity(q => q + 1)} disabled={buyingNow || addingToCart}>+</button>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            className="flex-1 bg-white border-2 border-[#166534] text-[#166534] font-bold rounded-[10px] py-2.5 flex items-center justify-center gap-2 hover:bg-green-50 disabled:opacity-50" 
                                            onClick={(e) => submitToCart(e, false)} 
                                            disabled={addingToCart || buyingNow}
                                        >
                                            {addingToCart ? (
                                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                                    {__('Add to Cart')}
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="flex-1 sp-buy-btn" 
                                            style={{height: 'auto', padding: '10px 0', animation: 'none'}} 
                                            onClick={(e) => submitToCart(e, true)} 
                                            disabled={buyingNow || addingToCart}
                                        >
                                            {buyingNow ? (
                                                <>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}>
                                                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                    </svg>
                                                    {__('Please wait...')}
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                                        <line x1="3" y1="6" x2="21" y2="6"/>
                                                        <path d="M16 10a4 4 0 0 1-8 0"/>
                                                    </svg>
                                                    এখনি কিনুন
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="sp-mobile-meta-wrap">
                                    {renderMetaSlider(mobileSliderRef)}
                                </div>
                            </div>

                            <div className="sp-action-wrap">
                                <div className="sp-qty-row">
                                    <span className="sp-qty-lbl">{__('Quantity')}</span>
                                    <div className="sp-qty-ctrl">
                                        <button className="sp-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={buyingNow || addingToCart}>−</button>
                                        <span className="sp-qty-num">{quantity}</span>
                                        <button className="sp-qty-btn" onClick={() => setQuantity(q => q + 1)} disabled={buyingNow || addingToCart}>+</button>
                                    </div>
                                    <span className="sp-qty-total">
                                        {__('Total:')} <strong>৳{(finalPrice * quantity).toLocaleString('en-IN')}</strong>
                                    </span>
                                </div>

                                <div className="sp-action-buttons">
                                    <button 
                                        className="sp-add-btn" 
                                        onClick={(e) => submitToCart(e, false)} 
                                        disabled={addingToCart || buyingNow} 
                                        aria-label="Add to cart"
                                    >
                                        {addingToCart ? (
                                            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                                        ) : (
                                            <>
                                                <svg className="w-6 h-6 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                                                <span className="sp-add-text">{__('Add to Cart')}</span>
                                            </>
                                        )}
                                    </button>

                                    <button className="sp-buy-btn" onClick={(e) => submitToCart(e, true)} disabled={buyingNow || addingToCart}>
                                        {buyingNow ? (
                                            <>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}>
                                                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                                                </svg>
                                                <span className="hidden md:inline">{__('Please wait...')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                                    <path d="M16 10a4 4 0 0 1-8 0"/>
                                                </svg>
                                                {__('Buy Now')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Column 3: Sidebar (desktop only) ── */}
                        <div className="sp-sidebar">
                            <div className="sp-sidebar-sticky">
                                {relatedProducts?.length > 0 && (
                                    <div className="sp-sidebar-card">
                                        <p className="sp-sidebar-head">{__('Similar Books')}</p>
                                        <div className="sp-rel-list">
                                            {relatedProducts.slice(0, 4).map(rel => {
                                                const relPrice = parseFloat(rel.price);
                                                let relFinalPrice = relPrice;
                                                if (rel.discount_value > 0) {
                                                    relFinalPrice = rel.discount_type === 'percent'
                                                        ? relPrice - (relPrice * (parseFloat(rel.discount_value) / 100))
                                                        : relPrice - parseFloat(rel.discount_value);
                                                }
                                                return (
                                                    <Link key={rel.id} href={route('product.show', rel.slug)} className="sp-rel-item">
                                                        <div className="sp-rel-img-wrap">
                                                            <img src={`/storage/${rel.thumbnail}`} alt={rel.name} className="sp-rel-img" />
                                                        </div>
                                                        <div>
                                                            <h4 className="sp-rel-title">{rel.name}</h4>
                                                            <div className="sp-rel-price">
                                                                ৳{relFinalPrice.toLocaleString()}
                                                                {rel.discount_value > 0 && (
                                                                    <span className="sp-rel-old-price">৳{relPrice.toLocaleString()}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="sp-meta-card hidden md:block">
                        {renderMetaSlider(desktopSliderRef)}
                    </div>

                    <div className="sp-content-section">
                        <div className="sp-tabs-bar">
                            <button className={`sp-tab-btn${activeTab === 'desc' ? ' active' : ''}`} onClick={() => setActiveTab('desc')}>{__('Book Description')}</button>
                            <button className={`sp-tab-btn${activeTab === 'specs' ? ' active' : ''}`} onClick={() => setActiveTab('specs')}>{__('Detailed Information')}</button>
                        </div>

                        <div className="sp-tab-content">
                            {activeTab === 'desc' && (
                                <div>
                                    <div className={`sp-desc-body${descExpanded ? '' : ' sp-desc-clamp'}`}>
                                        {product.description ? (
                                            formatDescription(product.description)
                                        ) : product.short_description ? (
                                            formatDescription(product.short_description)
                                        ) : (
                                            <p style={{color:'#9ca3af',fontStyle:'italic'}}>{__('No description available for this book.')}</p>
                                        )}
                                    </div>
                                    {!descExpanded && (
                                        <button className="sp-read-more" onClick={() => setDescExpanded(true)}>
                                            {__('Read More')}
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                        </button>
                                    )}
                                </div>
                            )}

                            {activeTab === 'specs' && (
                                <table className="sp-spec-full">
                                    <tbody>
                                        <tr><td>{__('Book Name')}</td><td>{product.name}</td></tr>
                                        {product.authors?.length > 0 && <tr><td>{__('Author')}</td><td>
                                            {product.authors.map((a, i) => (
                                                <span key={a.id}>
                                                    <Link href={route('shop', { author: a.id })} style={{color: '#166534', textDecoration: 'none', fontWeight: '600'}}>{a.name}</Link>
                                                    {i < product.authors.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </td></tr>}
                                        {product.publications?.length > 0 && <tr><td>{__('Publication')}</td><td>
                                            {product.publications.map((p, i) => (
                                                <span key={p.id}>
                                                    <Link href={route('shop', { publication: p.id })} style={{color: '#166534', textDecoration: 'none', fontWeight: '600'}}>{p.name}</Link>
                                                    {i < product.publications.length - 1 && ', '}
                                                </span>
                                            ))}
                                        </td></tr>}
                                        {product.language && <tr><td>{__('Language')}</td><td>{product.language}</td></tr>}
                                        {product.pages && <tr><td>{__('Number of Pages')}</td><td>{product.pages}</td></tr>}
                                        {product.edition && <tr><td>{__('Edition')}</td><td>{product.edition}</td></tr>}
                                        {product.country && <tr><td>{__('Country')}</td><td>{product.country}</td></tr>}
                                        <tr><td>{__('Category')}</td><td>{product.categories?.map(c => c.name).join(', ') || '—'}</td></tr>
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {relatedProducts.length > 0 && (
                        <section style={{marginBottom:48}}>
                            <div className="sp-related-hdr">
                                <h2 className="sp-related-title">{__('View More')}</h2>
                                <div className="sp-related-line" />
                                <Link href={route('shop')} style={{fontSize:'0.8rem',fontWeight:700,color:'#166534',textDecoration:'none',whiteSpace:'nowrap',letterSpacing:'0.01em'}}>{__('View All Books →')}</Link>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
                                {relatedProducts.map(rel => <ProductCard key={rel.id} product={rel} />)}
                            </div>
                        </section>
                    )}
                </div>
            </div>
       </ThemeLayout>
    );
}