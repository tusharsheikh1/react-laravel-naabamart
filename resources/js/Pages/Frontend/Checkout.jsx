// resources/js/Pages/Frontend/Checkout.jsx
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import SEO from '@/Components/SEO';
import { confirmAction, closeConfirm, setConfirmProcessing } from '@/Components/ConfirmModal';
import useTranslation from '@/Hooks/useTranslation';

// 1. IMPORT THE NEW UNIVERSAL TRACKING UTILITY
import { trackEvent } from '@/utils/analytics';

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
    User: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    Phone: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>),
    Location: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    MapPin: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>),
    Truck: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0zM1 1h4l2.68 13.39a2 2 0 001.974 1.61h9.72a2 2 0 001.974-1.61L23 6H6" /></svg>),
    Minus: () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 12H4" /></svg>),
    Plus: () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>),
    Trash: () => (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
    Check: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>),
    ChevronDown: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>),
    Spinner: () => (<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>),
    Gift: () => (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>),
    Shield: () => (<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
};

// ── Field wrapper with floating label style ───────────────────────────────────
function Field({ label, icon, error, children }) {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span className="text-[#2d5a27]">{icon}</span>
                {label}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 ml-1 font-medium">
                    <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

const inputBase = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d5a27]/30 focus:border-[#2d5a27] transition-all duration-200";
const inputError = "border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400";

export default function Checkout({ cart, auth, shippingMethods, cartDetails }) {
    const { __ } = useTranslation();
    const { global_settings } = usePage().props; 
    
    const { data, setData, post, processing, errors } = useForm({
        full_name: auth?.user ? auth.user.name : '',
        phone: '',
        address: '',
        shipping_method_id: shippingMethods.length > 0 ? shippingMethods[0].id : '',
        payment_method: 'cod',
        device_fingerprint: '',
    });

    const [savingDraft, setSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);

    // Track to ensure begin_checkout is only fired once per page load
    const checkoutTrackedRef = useRef(false);

    // Memoized User Data for CAPI Tracking
    const trackingUserData = useMemo(() => ({
        em: auth?.user?.email || '',
        ph: data.phone || auth?.user?.phone || '',
        fn: data.full_name || auth?.user?.name || ''
    }), [auth, data.phone, data.full_name]);

    // Pre-calculate Items Array
    const ga4Items = useMemo(() => {
        return Object.values(cart).map((item) => ({
            item_id: item.sku || item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
            item_category: item.category_name || 'Uncategorized',
            item_variant: [item.color_name, item.size_name].filter(Boolean).join(' ') || undefined
        }));
    }, [cart]);

    // Track begin_checkout on load (with Master Switch)
    useEffect(() => {
        if (Object.keys(cart).length > 0 && !checkoutTrackedRef.current) {
            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('begin_checkout', {
                    currency: 'BDT',
                    value: cartDetails.subtotal,
                    items: ga4Items
                }, trackingUserData);
            }
            checkoutTrackedRef.current = true;
        }
    }, [cart, cartDetails.subtotal, ga4Items, trackingUserData, global_settings]);

    // Device fingerprint
    useEffect(() => {
        try {
            const { userAgent, language } = navigator;
            const { width, height, colorDepth } = screen;
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const fpString = `${userAgent}-${language}-${width}x${height}-${colorDepth}-${timeZone}`;
            setData('device_fingerprint', btoa(fpString).substring(0, 255));
        } catch (e) {}
    }, []);

    // Auto-save draft with visual feedback
    useEffect(() => {
        if (!data.phone && !data.full_name) return;
        setSavingDraft(true);
        setDraftSaved(false);
        const timer = setTimeout(() => {
            axios.post(route('checkout.draft'), {
                full_name: data.full_name,
                phone: data.phone,
                address: data.address,
            }).then(() => {
                setSavingDraft(false);
                setDraftSaved(true);
                setTimeout(() => setDraftSaved(false), 2500);
            }).catch(() => setSavingDraft(false));
        }, 1500);
        return () => clearTimeout(timer);
    }, [data.full_name, data.phone, data.address]);

    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        router.patch(route('cart.update'), { cart_key: cartKey, quantity: newQty }, { preserveScroll: true });
    };

    const removeItem = (cartKey, productId) => {
        confirmAction({
            title: __('Remove Item'),
            message: __('Are you sure you want to remove this product from the cart?'),
            confirmText: __('Yes, Remove'),
            cancelText: __('No'),
            isDanger: true,
            onConfirm: () => {
                setConfirmProcessing(true);
                router.delete(route('cart.remove'), {
                    data: { cart_key: cartKey },
                    preserveScroll: true,
                    onSuccess: () => {
                        // Internal Analytics
                        if (productId) {
                            axios.post(route('analytics.track'), { product_id: productId, event_type: 'remove_from_cart' }).catch(() => {});
                        }
                        
                        // Universal remove_from_cart (with Master Switch)
                        const removedItem = ga4Items.find(item => item.item_id === productId);
                        if (removedItem) {
                            if (global_settings?.enable_meta_tracking !== '0') {
                                trackEvent('remove_from_cart', {
                                    currency: 'BDT',
                                    value: removedItem.price * removedItem.quantity,
                                    items: [removedItem]
                                }, trackingUserData);
                            }
                        }
                        
                        closeConfirm();
                    },
                    onFinish: () => setConfirmProcessing(false),
                });
            },
        });
    };

    const { selectedMethod, shippingCharge, grandTotal } = useMemo(() => {
        const method = shippingMethods.find(m => m.id == data.shipping_method_id);
        let charge = 0;
        if (method) {
            if (cartDetails.hasFreeShipping || (method.free_delivery_threshold && cartDetails.subtotal >= method.free_delivery_threshold)) {
                charge = 0;
            } else {
                charge = parseFloat(method.base_charge);
                if (cartDetails.totalWeight > method.base_weight) {
                    const extraWeight = Math.ceil(cartDetails.totalWeight - method.base_weight);
                    charge += extraWeight * parseFloat(method.additional_charge_per_kg);
                }
            }
        }
        return { selectedMethod: method, shippingCharge: charge, grandTotal: cartDetails.subtotal + charge };
    }, [data.shipping_method_id, shippingMethods, cartDetails]);

    const freeShippingProgress = selectedMethod?.free_delivery_threshold > 0
        ? Math.min((cartDetails.subtotal / selectedMethod.free_delivery_threshold) * 100, 100)
        : 0;
    const amountToFreeShipping = selectedMethod?.free_delivery_threshold
        ? Math.max(selectedMethod.free_delivery_threshold - cartDetails.subtotal, 0)
        : 0;
    const showFreeShippingProgress = !cartDetails.hasFreeShipping
        && selectedMethod?.free_delivery_threshold > 0
        && cartDetails.subtotal < selectedMethod.free_delivery_threshold;

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Log shipping info addition (with Master Switch)
        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('add_shipping_info', {
                currency: 'BDT',
                value: grandTotal,
                shipping_tier: selectedMethod ? selectedMethod.name : 'Standard',
                items: ga4Items
            }, trackingUserData);
        }

        // 2. Log payment info addition (with Master Switch)
        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('add_payment_info', {
                currency: 'BDT',
                value: grandTotal,
                payment_type: data.payment_method === 'cod' ? 'Cash on Delivery' : data.payment_method,
                items: ga4Items
            }, trackingUserData);
        }

        // 3. Submit form to backend
        post(route('checkout.store'));
    };

    const cartCount = Object.keys(cart).length;
    const isSubmitDisabled = processing || cartCount === 0;

    return (
        <ThemeLayout>
            <SEO title={__('Checkout')} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
                
                .checkout-root { font-family: 'Hind Siliguri', sans-serif; }

                /* Submit button */
                @keyframes shine {
                    0%   { left: -100%; }
                    18%  { left: 110%; }
                    100% { left: 110%; }
                }
                @keyframes ring-pulse {
                    0%   { box-shadow: 0 0 0 0 rgba(45,90,39,0.35); }
                    70%  { box-shadow: 0 0 0 14px rgba(45,90,39,0); }
                    100% { box-shadow: 0 0 0 0 rgba(45,90,39,0); }
                }
                .submit-btn {
                    position: relative;
                    overflow: hidden;
                    background: linear-gradient(135deg, #2d5a27 0%, #3e7a35 100%);
                    animation: ring-pulse 2.4s infinite;
                    transition: transform 0.18s ease, filter 0.18s ease, box-shadow 0.18s ease;
                }
                .submit-btn::after {
                    content: '';
                    position: absolute;
                    top: 0; left: -100%;
                    width: 55%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent);
                    transform: skewX(-20deg);
                    animation: shine 3.6s infinite;
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    filter: brightness(1.08);
                    box-shadow: 0 12px 28px rgba(45,90,39,0.35);
                    animation: none;
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0) scale(0.975);
                }
                .submit-btn:disabled { opacity: 0.5; animation: none; }

                /* Scrollbar for cart list */
                .cart-scroll::-webkit-scrollbar { width: 4px; }
                .cart-scroll::-webkit-scrollbar-track { background: transparent; }
                .cart-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

                /* Qty button */
                .qty-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 28px; height: 28px;
                    border-radius: 8px;
                    background: white;
                    border: 1.5px solid #e5e7eb;
                    color: #374151;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                    cursor: pointer;
                }
                .qty-btn:hover:not(:disabled) { background: #2d5a27; border-color: #2d5a27; color: white; }
                .qty-btn:disabled { opacity: 0.35; cursor: not-allowed; }

                /* Card hover */
                .cart-item { transition: background 0.15s; }
                .cart-item:hover { background: #fafafa; }

                /* Save indicator */
                .draft-pill {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 10px; font-weight: 600; letter-spacing: .04em;
                    padding: 2px 8px; border-radius: 999px;
                    transition: opacity 0.3s;
                }
            `}</style>

            <div className="checkout-root max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-14 pb-32 md:pb-14">

                {/* ── Page header ─────────────────────────────── */}
                <div className="mb-8 lg:mb-10">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{__('Checkout')}</h1>
                        {cartCount > 0 && (
                            <span className="text-xs font-bold bg-[#2d5a27]/10 text-[#2d5a27] px-2.5 py-1 rounded-full">
                                {cartCount} {__('Items')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{__('Provide your information and confirm order')}</p>
                </div>

                <form onSubmit={handleSubmit} id="checkout-form" className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

                    {/* ══════════════════════════════════════════
                        LEFT — Delivery details
                    ══════════════════════════════════════════ */}
                    <div className="flex-1 w-full space-y-5">

                        {/* Delivery card */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            {/* Card header */}
                            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2d5a27] text-white text-xs font-bold shrink-0">1</span>
                                    <h2 className="text-base font-bold text-gray-800">{__('Delivery Information')}</h2>
                                </div>
                                {/* Auto-save indicator */}
                                <div style={{ minWidth: 80 }} className="text-right">
                                    {savingDraft && (
                                        <span className="draft-pill text-gray-400">
                                            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                            </svg>
                                            {__('Saving...')}
                                        </span>
                                    )}
                                    {draftSaved && !savingDraft && (
                                        <span className="draft-pill bg-green-50 text-green-600">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                                            </svg>
                                            {__('Saved')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-5 space-y-5">

                                {/* Name + Phone — side by side on md+ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <Field label={__('Full Name')} icon={<Icon.User />} error={errors.full_name}>
                                        <input
                                            type="text"
                                            value={data.full_name}
                                            onChange={e => setData('full_name', e.target.value)}
                                            className={`${inputBase} ${errors.full_name ? inputError : ''}`}
                                            placeholder={__('Enter your name')}
                                            autoComplete="name"
                                        />
                                    </Field>

                                    <Field label={__('Mobile Number')} icon={<Icon.Phone />} error={errors.phone}>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className={`${inputBase} ${errors.phone ? inputError : ''}`}
                                            placeholder="01XXXXXXXXX"
                                            autoComplete="tel"
                                        />
                                    </Field>
                                </div>

                                {/* Shipping zone */}
                                <Field label={__('Delivery Area')} icon={<Icon.Location />}>
                                    <div className="relative">
                                        <select
                                            value={data.shipping_method_id}
                                            onChange={e => setData('shipping_method_id', e.target.value)}
                                            className={`${inputBase} appearance-none pr-10 cursor-pointer`}
                                        >
                                            {shippingMethods.map(method => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                    {cartDetails.hasFreeShipping || (method.free_delivery_threshold && cartDetails.subtotal >= method.free_delivery_threshold)
                                                        ? __(' — Free Delivery 🎉')
                                                        : ` — ৳${method.base_charge}`}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-400">
                                            <Icon.ChevronDown />
                                        </span>
                                    </div>
                                </Field>

                                {/* Full address */}
                                <Field label={__('Detailed Address')} icon={<Icon.MapPin />} error={errors.address}>
                                    <textarea
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows={3}
                                        className={`${inputBase} resize-none ${errors.address ? inputError : ''}`}
                                        placeholder={__('House No, Road No, Area, Thana & District')}
                                        autoComplete="street-address"
                                    />
                                </Field>

                                {/* Free-shipping progress (inside delivery card for context) */}
                                {showFreeShippingProgress && (
                                    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-bold text-green-800">
                                                {__('Only')} <span className="text-[#2d5a27]">৳{amountToFreeShipping.toLocaleString()}</span> {__('Free Delivery!')}
                                            </p>
                                            <span className="text-[10px] text-green-600 font-semibold">
                                                {Math.round(freeShippingProgress)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-green-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-[#2d5a27] h-1.5 rounded-full transition-all duration-700"
                                                style={{ width: `${freeShippingProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>

                        {/* Payment method card */}
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-gray-50">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2d5a27] text-white text-xs font-bold shrink-0">2</span>
                                <h2 className="text-base font-bold text-gray-800">{__('Payment Method')}</h2>
                            </div>
                            <div className="p-5">
                                <label className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#2d5a27] bg-[#2d5a27]/5 cursor-pointer">
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-sm">{__('Cash on Delivery')}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{__('Pay when you receive the product — no advance payment required')}</p>
                                    </div>
                                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#2d5a27] bg-[#2d5a27] shrink-0">
                                        <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-3">
                            {[
                                { icon: <Icon.Shield />, text: __('Secure Order') },
                                { icon: <Icon.Truck />, text: __('Fast Delivery') },
                                { icon: <Icon.Gift />, text: __('Easy Returns') },
                            ].map(({ icon, text }) => (
                                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5">
                                    <span className="text-[#2d5a27]">{icon}</span>
                                    {text}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════
                        RIGHT — Order summary
                    ══════════════════════════════════════════ */}
                    <div className="w-full lg:w-[390px] shrink-0">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden sticky top-6">

                            {/* Header */}
                            <div className="flex items-center gap-2.5 px-5 pt-5 pb-4 border-b border-gray-50">
                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#2d5a27] text-white text-xs font-bold shrink-0">3</span>
                                <h2 className="text-base font-bold text-gray-800">{__('Order Summary')}</h2>
                                <span className="ml-auto text-xs font-semibold text-gray-400">{cartCount} {__('Items')}</span>
                            </div>

                            {/* Cart items */}
                            <div className="cart-scroll max-h-[320px] overflow-y-auto divide-y divide-gray-50 px-5">
                                {Object.entries(cart).map(([key, item]) => (
                                    <div key={key} className="cart-item flex gap-3 items-center py-4 rounded-lg -mx-1 px-1">
                                        {/* Thumbnail */}
                                        <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1">
                                            <img
                                                src={`/storage/${item.thumbnail}`}
                                                alt={item.name}
                                                className="max-w-full max-h-full object-contain mix-blend-multiply"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{item.name}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5">৳{item.price.toLocaleString()} {__('/pcs')}</p>

                                            {/* Qty controls */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-0.5 border border-gray-200">
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={e => { e.preventDefault(); updateQuantity(key, item.quantity - 1); }}
                                                        disabled={item.quantity <= 1 || processing}
                                                    >
                                                        <Icon.Minus />
                                                    </button>
                                                    <span className="text-xs font-bold min-w-[20px] text-center text-gray-800">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="qty-btn"
                                                        onClick={e => { e.preventDefault(); updateQuantity(key, item.quantity + 1); }}
                                                        disabled={processing}
                                                    >
                                                        <Icon.Plus />
                                                    </button>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={e => { e.preventDefault(); removeItem(key, item.id); }}
                                                    disabled={processing}
                                                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                                                >
                                                    <Icon.Trash />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Line total */}
                                        <p className="text-sm font-black text-[#2d5a27] shrink-0 self-start mt-1">
                                            ৳{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="px-5 pb-5 pt-4 border-t border-gray-50 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>{__('Subtotal')}</span>
                                    <span className="font-bold text-gray-900">৳{cartDetails.subtotal.toLocaleString()}</span>
                                </div>

                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Icon.Truck />
                                        {__('Delivery Charge')}
                                    </span>
                                    <span className="font-bold">
                                        {shippingCharge === 0
                                            ? <span className="text-green-600 font-black">{__('Free 🎉')}</span>
                                            : <span className="text-gray-900">৳{shippingCharge.toLocaleString()}</span>
                                        }
                                    </span>
                                </div>

                                {/* Grand total */}
                                <div className="flex justify-between items-center pt-3 border-t border-dashed border-gray-200">
                                    <span className="font-bold text-gray-900">{__('Grand Total')}</span>
                                    <span className="text-2xl font-black text-[#2d5a27]">৳{grandTotal.toLocaleString()}</span>
                                </div>

                                {/* Desktop submit */}
                                <div className="hidden md:block pt-1">
                                    <button
                                        type="submit"
                                        disabled={isSubmitDisabled}
                                        className="submit-btn w-full text-white rounded-xl py-4 font-black text-lg flex items-center justify-center gap-2.5 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <><Icon.Spinner /> {__('Ordering...')}</>
                                        ) : (
                                            <>{__('Confirm Order')} <Icon.Check /></>
                                        )}
                                    </button>
                                    <p className="text-[10px] text-center text-gray-400 mt-2.5 uppercase tracking-widest font-semibold">
                                        {__('Cash on Delivery · Secure Order')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            {/* ══════════════════════════════════════════
                MOBILE sticky bottom bar
            ══════════════════════════════════════════ */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                {/* Free shipping nudge — floats just above the bar */}
                {showFreeShippingProgress && (
                    <div className="mx-4 mb-1 bg-green-600 text-white text-[10px] font-bold text-center py-1.5 rounded-xl shadow-lg tracking-wide">
                        {__('Only')} ৳{amountToFreeShipping.toLocaleString()} {__('Free Delivery!')}
                    </div>
                )}

                <div className="bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.10)] px-4 pt-3 pb-6">
                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitDisabled}
                        className="submit-btn w-full text-white rounded-2xl active:scale-[0.97] disabled:cursor-not-allowed overflow-hidden"
                        style={{ minHeight: 60 }}
                    >
                        {processing ? (
                            <span className="flex items-center justify-center gap-2.5 py-4 font-black text-base w-full">
                                <Icon.Spinner /> {__('Ordering...')}
                            </span>
                        ) : (
                            <span className="flex items-stretch w-full">
                                {/* Left — CTA text */}
                                <span className="flex flex-1 items-center justify-center gap-2 py-4 pl-5 font-black text-[17px] tracking-tight">
                                    {__('Confirm Order')}
                                    <svg className="w-[18px] h-[18px] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>

                                {/* Divider */}
                                <span className="w-px bg-white/25 my-3" />

                                {/* Right — amount block */}
                                <span className="flex flex-col items-center justify-center px-5 py-2 min-w-[80px]">
                                    <span className="text-[9px] font-bold uppercase tracking-widest opacity-70 leading-none mb-1">{__('Grand Total')}</span>
                                    <span className="text-[19px] font-black leading-none tracking-tight">
                                        ৳{grandTotal.toLocaleString()}
                                    </span>
                                    {shippingCharge === 0 && (
                                        <span className="text-[8px] font-bold mt-1 bg-white/25 rounded-full px-1.5 py-0.5 leading-none">
                                            {__('Free Shipping ✓')}
                                        </span>
                                    )}
                                </span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </ThemeLayout>
    );
}