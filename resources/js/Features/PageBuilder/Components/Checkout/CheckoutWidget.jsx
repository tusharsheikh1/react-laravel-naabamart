import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { usePage, router } from '@inertiajs/react';
import axios from 'axios';
import CheckoutSettings from './CheckoutSettings';

// 1. IMPORT THE NEW GA4/UNIVERSAL TRACKING UTILITY
import { trackEvent } from '@/utils/analytics';

// ─── Small reusable helpers ────────────────────────────────────────────────

const TrustBadge = ({ icon, text }) => (
    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'inherit', opacity: 0.75 }}>
        <span>{icon}</span>
        <span>{text}</span>
    </div>
);

const StarRating = ({ count = 5, value = 5, color = '#f59e0b' }) => (
    <span style={{ color, letterSpacing: '-1px', fontSize: '14px' }}>
        {'★'.repeat(value)}{'☆'.repeat(count - value)}
    </span>
);

const getPrices = (p) => {
    if (!p) return { original: 0, final: 0, hasDiscount: false };

    const final = Number(p.final_price ?? p.price ?? 0);
    let original = Number(p.original_price || 0);

    if (original <= 0 || original <= final) {
        const discVal = Number(p.discount_value || 0);
        const basePrice = Number(p.price || 0);

        if (discVal > 0) {
            if (p.discount_type === 'percent') {
                original = Math.round(final / (1 - discVal / 100));
            } else if (p.discount_type === 'fixed') {
                original = final + discVal;
            }
        }

        if ((original <= 0 || original <= final) && basePrice > final) {
            original = basePrice;
        }
    }

    const hasDiscount = original > final && final > 0;

    return { original, final, hasDiscount };
};

// ─── Spam Prevention Modal ─────────────────────────────────────────────────
const SpamModal = ({ onClose, whatsappNumber }) => {
    const [countdown, setCountdown] = useState(30);
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: 16,
                padding: '32px 24px', maxWidth: 380, width: '100%',
                textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
                    Duplicate Order Detected
                </h3>
                <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20, lineHeight: 1.6 }}>
                    We noticed a recent order from this device. Please wait before placing another order, or contact us via WhatsApp if you need help.
                </p>

                <div style={{
                    width: 72, height: 72, borderRadius: '50%',
                    border: '4px solid #e2e8f0',
                    borderTopColor: '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, fontWeight: 800, color: '#6366f1',
                    margin: '0 auto 20px',
                    animation: 'spin 1s linear infinite',
                }}>
                    {countdown}
                </div>

                {whatsappNumber && (
                    <a
                        href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            backgroundColor: '#25d366', color: '#fff',
                            padding: '12px 24px', borderRadius: 10,
                            fontWeight: 700, fontSize: 15, textDecoration: 'none',
                            marginBottom: 12, width: '100%', justifyContent: 'center',
                        }}
                    >
                        <span>💬</span> Contact on WhatsApp
                    </a>
                )}

                {countdown === 0 && (
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%', padding: '12px', borderRadius: 10,
                            backgroundColor: '#f1f5f9', border: 'none',
                            fontSize: 14, fontWeight: 600, color: '#374151',
                            cursor: 'pointer',
                        }}
                    >
                        Try Again
                    </button>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

// ─── Main widget ───────────────────────────────────────────────────────────

export const CheckoutWidget = (props) => {
    const {
        maxWidth, bgColor, padding, borderRadius, shadow, borderWidth, borderColor,
        showHeader, headerText, headerBgColor, headerTextColor, headerSize,
        showProductSummary, summaryLayout, showRating, ratingValue, reviewCount,
        showMultiProduct, multiProductLabel, multiSelection,
        showQuantity, showAddress, showNote,
        nameLabel, phoneLabel, addressLabel, noteLabel, quantityLabel,
        unitLabel, presetQuantities, showCustomQty, defaultQuantity,
        showShippingMethod, shippingMethods: settingsShippingMethods, shippingMethodLabel, showDeliveryBreakdown,
        buttonText, buttonBgColor, buttonTextColor, buttonBorderRadius,
        buttonSize, buttonFullWidth, buttonIcon, buttonSubText,
        showTrustBadges, trustBadges,
        showUrgency, urgencyText, urgencyBgColor, urgencyTextColor,
        showSocialProof, socialProofText, socialProofIcon,
        enableSpamPrevention, spamIntervalMinutes, whatsappNumber,
        showMobileStickyCta, mobileStickyText, mobileStickyBg, mobileStickyTextColor,
        themeColor, labelColor, inputBorderColor, inputBgColor, formLayout, sectionId,
    } = props;

    const { connectors: { connect, drag } } = useNode();
    
    // EXTRACT GLOBAL SETTINGS AND AUTH FOR TRACKING
    const { product: pageProduct, page: landingPage, shippingMethods: dbShippingMethods, global_settings, auth } = usePage().props;

    const activeShippingMethods = useMemo(() => {
        if (dbShippingMethods && dbShippingMethods.length > 0) {
            return dbShippingMethods.map(sm => ({
                id: sm.id, 
                name: sm.name, 
                charge: Number(sm.base_charge || 0),
                free_delivery_threshold: sm.free_delivery_threshold ? Number(sm.free_delivery_threshold) : null
            }));
        }
        return (settingsShippingMethods || []).map((sm, idx) => ({
            id: `static_${idx}`, 
            name: sm.name, 
            charge: Number(sm.charge || 0),
            free_delivery_threshold: null
        }));
    }, [dbShippingMethods, settingsShippingMethods]);

    const allProducts = landingPage?.products && landingPage.products.length > 0 
        ? landingPage.products 
        : (pageProduct ? [pageProduct] : []);

    // Per-product quantity support
    const [selectedItems, setSelectedItems] = useState(() => 
        allProducts.length > 0 ? [{ ...allProducts[0], qty: defaultQuantity || 1 }] : []
    );

    const [formData, setFormData] = useState({
        name: '', phone: '', address: '', note: '',
        shippingMethodId: '', 
    });
    
    const [submitting, setSubmitting]   = useState(false);
    const [submitted, setSubmitted]     = useState(false);
    const [errors, setErrors]           = useState({});
    const [showSpamModal, setShowSpamModal] = useState(false);

    // ── Tracking state ────────────────────────────────────────────────────────
    const hasViewTracked       = useRef(false);
    const hasInitiateTracked   = useRef(false);

    // Memoize User Data for CAPI Tracking (Crucial for Meta Ads attribution)
    const trackingUserData = useMemo(() => ({
        em: auth?.user?.email || '',
        ph: formData.phone || auth?.user?.phone || '',
        fn: formData.name || auth?.user?.name || ''
    }), [auth, formData.phone, formData.name]);
    // ─────────────────────────────────────────────────────────────────────────

    const [isInCheckoutView, setIsInCheckoutView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInCheckoutView(entry.isIntersecting),
            { threshold: 0.5 }
        );

        const checkoutElement = document.getElementById(sectionId || 'checkout');
        if (checkoutElement) observer.observe(checkoutElement);

        return () => observer.disconnect();
    }, [sectionId]);

    // ── view_item: fire once on mount ───────────────────────────
    useEffect(() => {
        if (hasViewTracked.current || !pageProduct) return;
        hasViewTracked.current = true;

        const primaryProduct = selectedItems[0] || pageProduct;
        const prices = getPrices(primaryProduct);

        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('view_item', {
                currency: 'BDT',
                value: prices.final,
                items: [{
                    item_id: primaryProduct.id,
                    item_name: primaryProduct.name,
                    price: prices.final,
                    quantity: primaryProduct.qty || 1,
                    item_category: primaryProduct.category_name || 'Uncategorized'
                }]
            }, trackingUserData);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // ─────────────────────────────────────────────────────────────────────────

    // Calculate totals with per-product quantities and free delivery logic
    const calculateTotals = () => {
        let subtotal = 0;
        let origSubtotal = 0;
        let hasFreeShippingProduct = false;

        selectedItems.forEach(item => {
            const pr = getPrices(item);
            const q = item.qty || 1;
            subtotal += pr.final * q;
            origSubtotal += pr.original * q;
            
            // Check if any selected product has free shipping enabled
            if (item.is_free_shipping) {
                hasFreeShippingProduct = true;
            }
        });

        const totalDiscount = origSubtotal > subtotal ? origSubtotal - subtotal : 0;
        const selectedShipping = activeShippingMethods.find(sm => String(sm.id) === String(formData.shippingMethodId));
        
        let deliveryCharge = 0;
        if (selectedShipping) {
            if (hasFreeShippingProduct) {
                deliveryCharge = 0;
            } else if (selectedShipping.free_delivery_threshold && subtotal >= selectedShipping.free_delivery_threshold) {
                deliveryCharge = 0;
            } else {
                deliveryCharge = selectedShipping.charge;
            }
        }

        const totalAmount = subtotal + deliveryCharge;

        return { subtotal, totalDiscount, deliveryCharge, totalAmount, hasDiscount: totalDiscount > 0 };
    };

    const { subtotal, totalDiscount, deliveryCharge, totalAmount, hasDiscount } = calculateTotals();

    const handleProductSelect = (prod) => {
        if (multiSelection) {
            setSelectedItems(prev => {
                const exists = prev.findIndex(p => p.id === prod.id);
                if (exists !== -1) {
                    if (prev.length === 1) return prev;
                    return prev.filter(p => p.id !== prod.id);
                }
                
                // ── AddToCart when adding a new product ───────────────────────
                const pp = getPrices(prod);
                if (global_settings?.enable_meta_tracking !== '0') {
                    trackEvent('add_to_cart', {
                        currency: 'BDT',
                        value: pp.final,
                        items: [{
                            item_id: prod.id,
                            item_name: prod.name,
                            price: pp.final,
                            quantity: defaultQuantity || 1,
                            item_category: prod.category_name || 'Uncategorized'
                        }]
                    }, trackingUserData);
                }
                // ─────────────────────────────────────────────────────────────
                
                return [...prev, { ...prod, qty: defaultQuantity || 1 }];
            });
        } else {
            setSelectedItems([{ ...prod, qty: defaultQuantity || 1 }]);
        }
    };

    const updateProductQty = (productId, newQty) => {
        setSelectedItems(prev =>
            prev.map(item =>
                item.id === productId ? { ...item, qty: Math.max(1, newQty) } : item
            )
        );
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));

        // ── begin_checkout: fire once on first field interaction ──
        if (!hasInitiateTracked.current) {
            hasInitiateTracked.current = true;

            const currentSubtotal = selectedItems.reduce((sum, item) => {
                return sum + getPrices(item).final * (item.qty || 1);
            }, 0);

            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('begin_checkout', {
                    currency: 'BDT',
                    value: currentSubtotal,
                    items: selectedItems.map(i => ({
                        item_id: i.id,
                        item_name: i.name,
                        price: getPrices(i).final,
                        quantity: i.qty || 1,
                        item_category: i.category_name || 'Uncategorized'
                    }))
                }, trackingUserData);
            }
        }
        // ─────────────────────────────────────────────────────────────────────
    };

    // ─── Lead Capture (Incomplete Order) Logic ─────────────────────────────────
    const syncDraft = useCallback(() => {
        // Only trigger sync if user has typed at least a few digits of their phone
        if (formData.phone.length < 5) return;

        const draftData = {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            items: selectedItems.map(item => ({
                id: item.id,
                product_id: item.id,
                name: item.name,
                price: getPrices(item).final,
                quantity: item.qty || 1
            })),
            device_fingerprint: window.device_fingerprint || null,
        };

        // Fire & forget silent API request
        axios.post(route('checkout.draft'), draftData)
            .catch(err => console.error("Draft sync failed", err));
    }, [formData, selectedItems]);

    useEffect(() => {
        // Debounce: Wait 2 seconds after user stops typing before syncing
        const timer = setTimeout(() => {
            if (!submitted && !submitting) {
                syncDraft();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [formData.name, formData.phone, formData.address, selectedItems, syncDraft, submitted, submitting]);
    // ───────────────────────────────────────────────────────────────────────────

    const validate = () => {
        const e = {};
        if (!formData.name.trim())  e.name  = `${nameLabel || 'Name'} is required`;
        if (!formData.phone.trim()) e.phone = `${phoneLabel || 'Phone'} is required`;
        if (showAddress && !formData.address.trim()) e.address = `${addressLabel || 'Address'} is required`;
        if (showShippingMethod && !formData.shippingMethodId) e.shippingMethod = `Please select a delivery area`;
        if (selectedItems.length === 0) e.product = `Please select at least one product`;
        return e;
    };

    const checkSpam = () => {
        if (!enableSpamPrevention) return false;
        const key = `lp_last_order_${landingPage?.id || 'gen'}`;
        const last = localStorage.getItem(key);
        if (!last) return false;
        const elapsed = (Date.now() - parseInt(last)) / 60000;
        return elapsed < (spamIntervalMinutes || 30);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        if (checkSpam()) { setShowSpamModal(true); return; }

        setSubmitting(true);

        // ── Universal Pre-submit Events ──────────────────────────────────────────────
        const selectedShippingName = activeShippingMethods.find(sm => String(sm.id) === String(formData.shippingMethodId))?.name || 'Standard';
        
        const ga4Items = selectedItems.map(i => ({
            item_id: i.id,
            item_name: i.name,
            price: getPrices(i).final,
            quantity: i.qty || 1,
            item_category: i.category_name || 'Uncategorized'
        }));

        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('add_shipping_info', {
                currency: 'BDT',
                value: totalAmount,
                shipping_tier: selectedShippingName,
                items: ga4Items
            }, trackingUserData);

            trackEvent('add_payment_info', {
                currency: 'BDT',
                value: totalAmount,
                payment_type: 'Cash on Delivery',
                items: ga4Items
            }, trackingUserData);
        }
        // ───────────────────────────────────────────────────────────────────────

        const payload = {
            items: selectedItems.map(item => ({
                product_id: item.id,
                quantity: item.qty || 1
            })),
            name               : formData.name,
            phone              : formData.phone,
            address            : formData.address,
            shipping_method_id : formData.shippingMethodId,
            note               : formData.note,
            landing_page_id    : landingPage?.id ?? null,
            device_fingerprint : window.device_fingerprint || null,
        };

        router.post(route('landing_page.checkout'), payload, {
            onSuccess: (page) => {
                if (enableSpamPrevention) {
                    localStorage.setItem(`lp_last_order_${landingPage?.id || 'gen'}`, Date.now().toString());
                }
                
                // Purchase tracking has been REMOVED here. It will be handled by the CheckoutSuccess page.
                
                setSubmitted(true);
                setSubmitting(false);
                window.dispatchEvent(new CustomEvent('lp_conversion', { detail: { pageId: landingPage?.id } }));
            },
            onError: (errs) => {
                setErrors(errs);
                setSubmitting(false);
            },
        });
    };

    const btnPad  = buttonSize === 'sm' ? '10px 24px' : buttonSize === 'lg' ? '18px 36px' : '14px 28px';
    const btnFont = buttonSize === 'sm' ? '14px' : buttonSize === 'lg' ? '18px' : '16px';

    const inputClass = `w-full text-sm rounded-lg px-3 py-2.5 outline-none transition-all`;
    const inputStyle = { border: `1.5px solid ${inputBorderColor}`, backgroundColor: inputBgColor, color: '#1f2937' };
    const labelStyle = { color: labelColor, fontSize: '13px', fontWeight: 600, marginBottom: '4px', display: 'block' };

    const containerStyle = {
        backgroundColor: bgColor,
        padding: `${padding}px`,
        borderRadius: `${borderRadius}px`,
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
        boxShadow: shadow === 'sm' ? '0 1px 4px rgba(0,0,0,0.08)'
                 : shadow === 'md' ? '0 4px 20px rgba(0,0,0,0.1)'
                 : shadow === 'lg' ? '0 12px 48px rgba(0,0,0,0.15)'
                 : shadow === 'xl' ? '0 24px 64px rgba(0,0,0,0.2)'
                 : 'none',
        maxWidth: `${maxWidth}px`,
        width: '100%',
        margin: '0 auto',
    };

    if (submitted) {
        return (
            <div ref={ref => connect(drag(ref))} style={containerStyle}>
                <div className="text-center py-10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                    <p className="text-gray-500 text-sm">Thank you! We'll call you shortly to confirm your order.</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {showSpamModal && <SpamModal onClose={() => setShowSpamModal(false)} whatsappNumber={whatsappNumber} />}

            <div ref={ref => connect(drag(ref))} style={containerStyle} id={sectionId || 'checkout'}>

                {showUrgency && urgencyText && (
                    <div className="text-center text-sm font-semibold py-2 px-4 rounded-lg mb-4"
                        style={{ backgroundColor: urgencyBgColor, color: urgencyTextColor }}>
                        {urgencyText}
                    </div>
                )}

                {showHeader && headerText && (
                    <div className="text-center rounded-lg mb-5 py-3 px-4"
                        style={{ backgroundColor: headerBgColor, color: headerTextColor }}>
                        <h2 style={{ fontSize: `${headerSize}px`, fontWeight: 800, lineHeight: 1.2 }}>
                            {headerText}
                        </h2>
                    </div>
                )}

                {errors.product && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {errors.product}
                    </div>
                )}

                {/* ── Multi-Product Selector with Per-Item Quantity + Unit Label ── */}
                {showMultiProduct && allProducts.length > 1 && (
                    <div className="mb-6">
                        {multiProductLabel && (
                            <div className="flex justify-between items-center mb-3">
                                <p style={{ ...labelStyle, marginBottom: 0, fontSize: '15px' }}>
                                    {multiProductLabel}
                                </p>
                                {multiSelection && (
                                    <span className="text-xs font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                                        Select multiple
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            {allProducts.map((prod) => {
                                const item = selectedItems.find(p => p.id === prod.id);
                                const isSelected = !!item;
                                const qty = item?.qty || 1;
                                const prodPrices = getPrices(prod);
                                const discountPct = prodPrices.hasDiscount 
                                    ? Math.round(((prodPrices.original - prodPrices.final) / prodPrices.original) * 100) 
                                    : 0;

                                return (
                                    <div
                                        key={prod.id}
                                        className="border-2 rounded-2xl overflow-hidden transition-all hover:shadow-md"
                                        style={{
                                            borderColor: isSelected ? buttonBgColor : '#e5e7eb',
                                            backgroundColor: isSelected ? '#f8fafc' : '#ffffff',
                                            boxShadow: isSelected ? `0 0 0 3px ${buttonBgColor}20` : '0 1px 3px rgba(0,0,0,0.05)',
                                        }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleProductSelect(prod)}
                                            className="w-full text-left p-4 flex gap-4 border-b"
                                            style={{ borderColor: isSelected ? '#e5e7eb' : 'transparent' }}
                                        >
                                            {(prod.image_url || prod.thumbnail) && (
                                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                    <img 
                                                        src={(prod.image_url || prod.thumbnail).startsWith('http') || 
                                                             (prod.image_url || prod.thumbnail).startsWith('/') 
                                                            ? (prod.image_url || prod.thumbnail) 
                                                            : `/storage/${prod.image_url || prod.thumbnail}`}
                                                        alt={prod.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-semibold text-gray-900 leading-tight pr-8">
                                                        {prod.name}
                                                    </h4>

                                                    <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all
                                                        ${isSelected ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}
                                                    >
                                                        {isSelected && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-baseline gap-2">
                                                    <span className="text-2xl font-bold text-emerald-600">
                                                        ৳{prodPrices.final.toLocaleString()}
                                                    </span>
                                                    {prodPrices.hasDiscount && (
                                                        <>
                                                            <span className="text-sm text-gray-400 line-through">
                                                                ৳{prodPrices.original.toLocaleString()}
                                                            </span>
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded">
                                                                -{discountPct}%
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>

                                        {/* Quantity Controller with Unit Label */}
                                        {isSelected && (
                                            <div className="px-4 pb-4 pt-2 flex items-center justify-between">
                                                <span className="text-sm font-medium" style={{ color: labelColor }}>
                                                    {quantityLabel || 'Quantity'} {unitLabel && `(${unitLabel})`}
                                                </span>
                                                <div className="flex items-center border rounded-lg overflow-hidden"
                                                    style={{ borderColor: inputBorderColor, backgroundColor: inputBgColor }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateProductQty(prod.id, qty - 1)}
                                                        className="w-9 h-9 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
                                                        style={{ color: labelColor }}
                                                    >
                                                        −
                                                    </button>
                                                    <span className="px-5 font-bold text-sm" style={{ color: labelColor }}>
                                                        {qty} {unitLabel}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateProductQty(prod.id, qty + 1)}
                                                        className="w-9 h-9 flex items-center justify-center text-xl font-bold hover:bg-gray-100 transition"
                                                        style={{ color: labelColor }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Product Summary */}
                {showProductSummary && selectedItems.length > 0 && (
                    <div className="mb-6 pb-5 border-b border-gray-100 space-y-4">
                        {selectedItems.map((item, idx) => {
                            const pPrices = getPrices(item);
                            const discountPct = pPrices.hasDiscount ? Math.round((1 - pPrices.final / pPrices.original) * 100) : 0;

                            return (
                                <div key={item.id} className={`${summaryLayout === 'row' ? 'flex items-center gap-4' : 'text-center'} ${idx > 0 ? 'pt-4 border-t border-gray-50' : ''}`}>
                                    {(item.image_url || item.thumbnail) && (
                                        <img 
                                            src={(item.image_url || item.thumbnail).startsWith('http') || (item.image_url || item.thumbnail).startsWith('/') 
                                                ? (item.image_url || item.thumbnail) 
                                                : `/storage/${item.image_url || item.thumbnail}`}
                                            alt={item.name}
                                            className={`object-cover rounded-lg border border-gray-100 shadow-sm ${summaryLayout === 'row' ? 'w-16 h-16 shrink-0' : 'w-32 h-32 mx-auto mb-3'}`} 
                                        />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-1">{item.name}</h3>
                                        <div className="text-xs text-gray-500 mb-1">
                                            Qty: {item.qty || 1} {unitLabel}
                                        </div>
                                        <div className="flex items-baseline gap-2 flex-wrap"
                                            style={{ justifyContent: summaryLayout === 'row' ? 'flex-start' : 'center' }}>
                                            <span className="text-xl font-extrabold" style={{ color: '#16a34a' }}>
                                                ৳{(pPrices.final * (item.qty || 1)).toLocaleString()}
                                            </span>
                                            {pPrices.hasDiscount && (
                                                <>
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ৳{(pPrices.original * (item.qty || 1)).toLocaleString()}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded-md">
                                                        {discountPct}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Social Proof */}
                {showSocialProof && socialProofText && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-5 font-medium">
                        <span>{socialProofIcon}</span>
                        <span>{socialProofText}</span>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                    <div className={formLayout === 'two-col' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
                        <div className={formLayout === 'two-col' ? 'col-span-1' : ''}>
                            <label style={labelStyle}>{nameLabel || 'Your Name'} <span className="text-red-500">*</span></label>
                            <input type="text" placeholder="e.g. Rafiqul Islam" value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className={inputClass}
                                style={{ ...inputStyle, borderColor: errors.name ? '#ef4444' : inputBorderColor }} />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className={formLayout === 'two-col' ? 'col-span-1' : ''}>
                            <label style={labelStyle}>{phoneLabel || 'Phone Number'} <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <span className="inline-flex items-center px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 shrink-0">🇧🇩 +880</span>
                                <input type="tel" placeholder="01XXXXXXXXX" value={formData.phone}
                                    onChange={e => handleChange('phone', e.target.value)}
                                    className={inputClass}
                                    style={{ ...inputStyle, borderColor: errors.phone ? '#ef4444' : inputBorderColor }} />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>

                        {showAddress && (
                            <div className="col-span-2">
                                <label style={labelStyle}>{addressLabel || 'Full Address'} <span className="text-red-500">*</span></label>
                                <input type="text" placeholder="House, Road, Area..." value={formData.address}
                                    onChange={e => handleChange('address', e.target.value)}
                                    className={inputClass}
                                    style={{ ...inputStyle, borderColor: errors.address ? '#ef4444' : inputBorderColor }} />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                        )}

                        {showShippingMethod && activeShippingMethods.length > 0 && (
                            <div className={formLayout === 'two-col' ? 'col-span-1' : ''}>
                                <label style={labelStyle}>{shippingMethodLabel || 'Delivery Area'} <span className="text-red-500">*</span></label>
                                <select 
                                    value={formData.shippingMethodId} 
                                    onChange={e => handleChange('shippingMethodId', e.target.value)}
                                    className={inputClass} 
                                    style={{ ...inputStyle, borderColor: errors.shippingMethod ? '#ef4444' : inputBorderColor }}
                                >
                                    <option value="" disabled>-- Select Area --</option>
                                    {activeShippingMethods.map((sm) => (
                                        <option key={sm.id} value={sm.id}>
                                            {sm.name} - ৳{sm.charge}
                                        </option>
                                    ))}
                                </select>
                                {errors.shippingMethod && <p className="text-red-500 text-xs mt-1">{errors.shippingMethod}</p>}
                            </div>
                        )}

                        {showNote && (
                            <div className="col-span-2">
                                <label style={labelStyle}>{noteLabel || 'Order Note (optional)'}</label>
                                <textarea rows={2} placeholder="Any special instructions..." value={formData.note}
                                    onChange={e => handleChange('note', e.target.value)}
                                    className={inputClass} style={inputStyle} />
                            </div>
                        )}
                    </div>

                    {/* Price Breakdown */}
                    {showShippingMethod && showDeliveryBreakdown && formData.shippingMethodId && (
                        <div className="mt-5 p-4 rounded-xl border"
                            style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}>
                            <div className="space-y-2">
                                {selectedItems.map(item => {
                                    const pPrice = getPrices(item);
                                    return (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span style={{ color: labelColor }} className="pr-4 truncate">
                                                {(item.qty || 1)} × {item.name} {unitLabel && `(${unitLabel})`}
                                            </span>
                                            <span className="font-semibold whitespace-nowrap" style={{ color: labelColor }}>
                                                ৳{(pPrice.final * (item.qty || 1)).toLocaleString()}
                                            </span>
                                        </div>
                                    );
                                })}

                                {hasDiscount && (
                                    <div className="flex justify-between text-sm text-green-600 font-medium">
                                        <span>Total Discount Savings</span>
                                        <span className="font-semibold">−৳{totalDiscount.toLocaleString()}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 border-dashed mt-2">
                                    <span style={{ color: labelColor }}>
                                        {activeShippingMethods.find(sm => String(sm.id) === String(formData.shippingMethodId))?.name || 'Delivery Charge'}
                                    </span>
                                    <span className="font-semibold" style={{ color: labelColor }}>
                                        {deliveryCharge === 0 ? (
                                            <span className="text-green-600">Free</span>
                                        ) : (
                                            `৳${deliveryCharge.toLocaleString()}`
                                        )}
                                    </span>
                                </div>

                                <div className="flex justify-between font-extrabold text-lg pt-3 mt-1 border-t" style={{ borderColor: '#e2e8f0' }}>
                                    <span style={{ color: '#0f172a' }}>Total to Pay</span>
                                    <span style={{ color: buttonBgColor }}>
                                        ৳{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="mt-5">
                        <button type="submit" disabled={submitting} style={{
                            backgroundColor: submitting ? '#9ca3af' : buttonBgColor,
                            color: buttonTextColor,
                            padding: btnPad,
                            fontSize: btnFont,
                            borderRadius: `${buttonBorderRadius}px`,
                            width: buttonFullWidth ? '100%' : 'auto',
                            display: buttonFullWidth ? 'block' : 'inline-block',
                            fontWeight: 800, border: 'none',
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 4px 20px ${buttonBgColor}55`,
                            letterSpacing: '0.02em', textAlign: 'center',
                        }}>
                            {submitting ? '⏳ Placing Order…' : (
                                <>
                                    {buttonIcon && <span className="mr-2">{buttonIcon}</span>}
                                    {buttonText}
                                </>
                            )}
                            {!submitting && buttonSubText && (
                                <div style={{ fontSize: '11px', fontWeight: 500, opacity: 0.9, marginTop: '4px' }}>
                                    {buttonSubText}
                                </div>
                            )}
                        </button>
                    </div>
                </form>

                {/* Trust Badges */}
                {showTrustBadges && trustBadges?.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-5 border-t border-gray-100"
                        style={{ color: labelColor }}>
                        {trustBadges.map((badge, i) => badge.show && (
                            <TrustBadge key={i} icon={badge.icon} text={badge.text} />
                        ))}
                    </div>
                )}
            </div>

            {/* Mobile Sticky CTA */}
            {showMobileStickyCta && mobileStickyText && !isInCheckoutView && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    zIndex: 1000, padding: '12px 16px',
                    backgroundColor: mobileStickyBg,
                    boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
                }} className="md:hidden">
                    <a
                        href={`#${sectionId || 'checkout'}`}
                        onClick={e => {
                            e.preventDefault();
                            document.getElementById(sectionId || 'checkout')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                            display: 'block', width: '100%',
                            textAlign: 'center', padding: '14px',
                            backgroundColor: buttonBgColor,
                            color: buttonTextColor,
                            borderRadius: `${buttonBorderRadius}px`,
                            fontWeight: 800, fontSize: '16px',
                            textDecoration: 'none', boxShadow: `0 4px 16px ${buttonBgColor}55`,
                        }}
                    >
                        {mobileStickyText}
                    </a>
                </div>
            )}
        </>
    );
};

CheckoutWidget.craft = {
    displayName: 'Checkout Form',
    props: {
        maxWidth: 560, bgColor: '#ffffff', padding: 32, borderRadius: 16,
        shadow: 'lg', borderWidth: 1, borderColor: '#e5e7eb',

        showHeader: true, headerText: '🛒 Complete Your Order',
        headerBgColor: '#f0fdf4', headerTextColor: '#15803d', headerSize: 20,

        showProductSummary: true, summaryLayout: 'row',
        showRating: true, ratingValue: 5, reviewCount: 142,

        showMultiProduct: false, multiProductLabel: 'Choose your package:', multiSelection: false,

        showQuantity: true, showAddress: true, showNote: false,
        nameLabel: 'Your Name', phoneLabel: 'Phone Number',
        addressLabel: 'Full Delivery Address', shippingMethodLabel: 'Delivery Area',
        noteLabel: 'Order Note', quantityLabel: 'Quantity',
        unitLabel: 'Pcs', 
        presetQuantities: '1, 2, 3', showCustomQty: false, defaultQuantity: 1,

        showShippingMethod: true, showDeliveryBreakdown: true,
        shippingMethods: [
            { name: 'Inside Dhaka', charge: 60 },
            { name: 'Outside Dhaka', charge: 120 }
        ],

        buttonText: 'Confirm Order — Cash on Delivery',
        buttonBgColor: '#16a34a', buttonTextColor: '#ffffff',
        buttonBorderRadius: 10, buttonSize: 'lg', buttonFullWidth: true,
        buttonIcon: '✅', buttonSubText: 'No advance payment • Pay on delivery',

        showTrustBadges: true,
        trustBadges: [
            { icon: '🔒', text: '100% Secure', show: true },
            { icon: '🚚', text: 'Fast Delivery', show: true },
            { icon: '💵', text: 'Cash on Delivery', show: true },
            { icon: '↩️', text: '7-Day Return', show: true },
        ],

        showUrgency: false, urgencyText: '🔥 Only 7 items left!',
        urgencyBgColor: '#fef2f2', urgencyTextColor: '#dc2626',

        showSocialProof: true, socialProofText: '142 people ordered in the last 24 hours', socialProofIcon: '👥',

        enableSpamPrevention: true, spamIntervalMinutes: 30, whatsappNumber: '',

        showMobileStickyCta: true, mobileStickyText: '🛒 Order Now — COD Available',
        mobileStickyBg: '#ffffff',

        themeColor: '#16a34a',
        labelColor: '#374151', inputBorderColor: '#d1d5db', inputBgColor: '#f9fafb',
        sectionId: 'checkout',
    },
    related: { settings: CheckoutSettings },
};