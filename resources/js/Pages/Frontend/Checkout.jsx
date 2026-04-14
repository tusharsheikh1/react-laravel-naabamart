// resources/js/Pages/Frontend/Checkout.jsx
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import SEO from '@/Components/SEO';
import { confirmAction, closeConfirm, setConfirmProcessing } from '@/Components/ConfirmModal';
import useTranslation from '@/Hooks/useTranslation';
import { trackEvent } from '@/utils/analytics';

// ── Elegant Icons ─────────────────────────────────────────────────────────────
const Icon = {
    User: () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    Phone: () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>),
    Location: () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    MapPin: () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>),
    Minus: () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg>),
    Plus: () => (<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>),
    Trash: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
    Check: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>),
    ChevronDown: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>),
    Spinner: () => (<svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>),
    Shield: () => (<svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>),
    CreditCard: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>),
    Banknotes: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
};

// ── Elegant Input Field Wrapper ───────────────────────────────────────────────
function Field({ label, id, icon, error, children }) {
    return (
        <div className="flex flex-col">
            <label htmlFor={id} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-700 mb-1.5 tracking-wide">
                <span className="text-[#c5a05f]">{icon}</span>
                {label}
            </label>
            {children}
            {error && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5 ml-0.5 font-medium">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}

const inputBase = "w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-gray-900 text-[15px] shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#c5a05f]/30 focus:border-[#c5a05f] transition-all duration-300";
const inputError = "border-red-300 focus:ring-red-100 focus:border-red-400";

const generateDeviceFingerprint = () => {
    try {
        const { userAgent, language } = navigator;
        const { width, height, colorDepth } = screen;
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return btoa(`${userAgent}-${language}-${width}x${height}-${colorDepth}-${timeZone}`).substring(0, 255);
    } catch (e) {
        return 'unknown-device';
    }
};

export default function Checkout({ cart, auth, shippingMethods, cartDetails }) {
    const { __ } = useTranslation();
    const { props } = usePage();
    const global_settings = props.global_settings;
    
    const { data, setData, post, processing, errors, transform } = useForm({
        full_name: auth?.user ? auth.user.name : '',
        phone: '',
        address: '',
        shipping_method_id: shippingMethods.length > 0 ? shippingMethods[0].id : '',
        payment_method: 'cod',
        device_fingerprint: '',
    });

    const [savingDraft, setSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [isCartBusy, setIsCartBusy] = useState(false);
    const checkoutTrackedRef = useRef(false);

    // Get checkout type from URL to help controller identify session key
    const getCheckoutType = () => new URLSearchParams(window.location.search).get('checkout_type') || 'cart';

    const trackingUserData = useMemo(() => ({
        em: auth?.user?.email || '',
        ph: data.phone || auth?.user?.phone || '',
        fn: data.full_name || auth?.user?.name || ''
    }), [auth, data.phone, data.full_name]);

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (Object.keys(cart).length > 0 && !checkoutTrackedRef.current) {
            const hasTrackedInSession = sessionStorage.getItem('checkout_tracked');
            if (!hasTrackedInSession) {
                if (global_settings?.enable_meta_tracking !== '0') {
                    trackEvent('begin_checkout', {
                        currency: 'BDT',
                        value: cartDetails.subtotal,
                        items: ga4Items
                    }, trackingUserData);
                }
                sessionStorage.setItem('checkout_tracked', 'true');
            }
            checkoutTrackedRef.current = true;
        }
    }, [cart, cartDetails.subtotal, ga4Items, trackingUserData, global_settings]);

    useEffect(() => {
        setData('device_fingerprint', generateDeviceFingerprint());
    }, []);

    transform((submitData) => ({
        ...submitData,
        device_fingerprint: submitData.device_fingerprint || generateDeviceFingerprint(),
    }));

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
        if (newQty < 1 || isCartBusy || processing) return;
        
        setIsCartBusy(true);
        router.patch(route('cart.update'), { 
            cart_key: cartKey, 
            quantity: newQty,
            checkout_type: getCheckoutType()
        }, { 
            preserveScroll: true,
            onFinish: () => setIsCartBusy(false) 
        });
    };

    const removeItem = (cartKey, productId) => {
        if (isCartBusy || processing) return;

        confirmAction({
            title: __('Remove Item'),
            message: __('Are you sure you want to remove this product from the cart?'),
            confirmText: __('Yes, Remove'),
            cancelText: __('No'),
            isDanger: true,
            onConfirm: () => {
                setConfirmProcessing(true);
                setIsCartBusy(true);
                router.delete(route('cart.remove'), {
                    data: { 
                        cart_key: cartKey,
                        checkout_type: getCheckoutType()
                    },
                    preserveScroll: true,
                    onSuccess: () => {
                        if (productId) axios.post(route('analytics.track'), { product_id: productId, event_type: 'remove_from_cart' }).catch(() => {});
                        const removedItem = ga4Items.find(item => item.item_id === productId);
                        if (removedItem && global_settings?.enable_meta_tracking !== '0') {
                            trackEvent('remove_from_cart', {
                                currency: 'BDT',
                                value: removedItem.price * removedItem.quantity,
                                items: [removedItem]
                            }, trackingUserData);
                        }
                        closeConfirm();
                    },
                    onFinish: () => {
                        setConfirmProcessing(false);
                        setIsCartBusy(false);
                    },
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
        if (isCartBusy) return;
        
        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('add_shipping_info', {
                currency: 'BDT',
                value: grandTotal,
                shipping_tier: selectedMethod ? selectedMethod.name : 'Standard',
                items: ga4Items
            }, trackingUserData);
            
            trackEvent('add_payment_info', {
                currency: 'BDT',
                value: grandTotal,
                payment_type: data.payment_method === 'cod' ? 'Cash on Delivery' : data.payment_method,
                items: ga4Items
            }, trackingUserData);
        }
        post(route('checkout.store'));
    };

    const cartCount = Object.keys(cart).length;
    const isSubmitDisabled = processing || isCartBusy || cartCount === 0;

    return (
        <ThemeLayout>
            <SEO title={__('Checkout')} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Hind+Siliguri:wght@400;500;600;700&display=swap');
                
                .checkout-root { 
                    font-family: 'Inter', 'Hind Siliguri', sans-serif; 
                    background-color: #fcfbfa; 
                }

                .submit-btn {
                    background-color: #112b18; 
                    color: #ffffff;
                    box-shadow: 0 4px 14px 0 rgba(17, 43, 24, 0.2);
                    transition: all 0.25s ease;
                }
                .submit-btn:hover:not(:disabled) {
                    background-color: #1a4024;
                    transform: translateY(-1.5px);
                    box-shadow: 0 8px 20px rgba(17, 43, 24, 0.25);
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .submit-btn:disabled { 
                    opacity: 0.7; 
                    cursor: not-allowed; 
                    background-color: #2a3d2e;
                }

                .cart-scroll::-webkit-scrollbar { width: 4px; }
                .cart-scroll::-webkit-scrollbar-track { background: transparent; }
                .cart-scroll::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .cart-scroll:hover::-webkit-scrollbar-thumb { background: #c5a05f; }

                .qty-btn {
                    display: flex; align-items: center; justify-content: center;
                    width: 24px; height: 24px;
                    border-radius: 6px;
                    background: transparent;
                    color: #6b7280;
                    transition: all 0.2s ease;
                }
                .qty-btn:hover:not(:disabled) { background: #f3f4f6; color: #112b18; }
                .qty-btn:disabled { opacity: 0.4; cursor: not-allowed; }

                .elegant-shadow {
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>

            <div className="checkout-root min-h-screen py-8 lg:py-12 pb-32 md:pb-16">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-3xl font-bold text-[#112b18] tracking-tight">{__('Secure Checkout')}</h1>
                        <p className="text-sm text-gray-500 mt-1">{__('Complete your order swiftly and securely.')}</p>
                    </div>

                    <form onSubmit={handleSubmit} id="checkout-form" className="flex flex-col lg:flex-row gap-8 items-start">

                        <div className="flex-1 w-full space-y-6">

                            {/* Delivery Card */}
                            <div className="bg-white rounded-2xl elegant-shadow border border-[#f0ece1] overflow-hidden">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-white">
                                    <h2 className="text-lg font-semibold text-[#112b18] flex items-center gap-2.5">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#112b18] text-[#c5a05f] text-sm font-bold shrink-0 shadow-inner">1</span>
                                        {__('Delivery Details')}
                                    </h2>
                                    
                                    <div className="text-right min-w-[80px]">
                                        {savingDraft && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                <Icon.Spinner />
                                                {__('Saving...')}
                                            </span>
                                        )}
                                        {draftSaved && !savingDraft && (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#c5a05f] bg-[#c5a05f]/10 px-2 py-1 rounded-md">
                                                <Icon.Check />
                                                {__('Saved')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <Field id="full_name" label={__('Full Name')} icon={<Icon.User />} error={errors.full_name}>
                                            <input
                                                id="full_name"
                                                type="text"
                                                value={data.full_name}
                                                onChange={e => setData('full_name', e.target.value)}
                                                className={`${inputBase} ${errors.full_name ? inputError : ''}`}
                                                placeholder={__('e.g. John Doe')}
                                                autoComplete="name"
                                            />
                                        </Field>

                                        <Field id="phone" label={__('Mobile Number')} icon={<Icon.Phone />} error={errors.phone}>
                                            <input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={e => setData('phone', e.target.value)}
                                                className={`${inputBase} ${errors.phone ? inputError : ''}`}
                                                placeholder="01XXXXXXXXX"
                                                autoComplete="tel"
                                            />
                                        </Field>
                                    </div>

                                    <Field id="shipping_method" label={__('Delivery Zone')} icon={<Icon.Location />}>
                                        <div className="relative">
                                            <select
                                                id="shipping_method"
                                                value={data.shipping_method_id}
                                                onChange={e => setData('shipping_method_id', e.target.value)}
                                                className={`${inputBase} appearance-none pr-10 cursor-pointer font-medium text-gray-800`}
                                            >
                                                {shippingMethods.map(method => (
                                                    <option key={method.id} value={method.id}>
                                                        {method.name} 
                                                        {cartDetails.hasFreeShipping || (method.free_delivery_threshold && cartDetails.subtotal >= method.free_delivery_threshold)
                                                            ? __(' — Free Delivery')
                                                            : ` — ৳${method.base_charge}`}
                                                    </option>
                                                ))}
                                            </select>
                                            <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-[#c5a05f]">
                                                <Icon.ChevronDown />
                                            </span>
                                        </div>
                                    </Field>

                                    <Field id="address" label={__('Full Address')} icon={<Icon.MapPin />} error={errors.address}>
                                        <textarea
                                            id="address"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows={2}
                                            className={`${inputBase} resize-none ${errors.address ? inputError : ''}`}
                                            placeholder={__('House No, Road No, Area, Thana & District')}
                                            autoComplete="street-address"
                                        />
                                    </Field>

                                    {showFreeShippingProgress && (
                                        <div className="mt-2 rounded-xl border border-[#c5a05f]/20 bg-[#fdfaf5] p-5">
                                            <div className="flex items-center justify-between mb-2.5">
                                                <p className="text-[13px] font-medium text-[#112b18]">
                                                    {__('Add')} <span className="font-bold text-[#c5a05f]">৳{amountToFreeShipping.toLocaleString()}</span> {__('more to unlock Free Delivery!')}
                                                </p>
                                                <span className="text-[11px] text-[#112b18] font-bold uppercase tracking-wider">
                                                    {Math.round(freeShippingProgress)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-[#f3efe6] rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-[#c5a05f] h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                                                    style={{ width: `${freeShippingProgress}%` }}
                                                >
                                                    <div className="absolute top-0 left-0 bottom-0 right-0 bg-white/20" style={{ animation: 'shimmer 2s infinite' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method Card */}
                            <div className="bg-white rounded-2xl elegant-shadow border border-[#f0ece1] overflow-hidden">
                                <div className="flex items-center px-6 py-5 border-b border-gray-50 bg-white">
                                    <h2 className="text-lg font-semibold text-[#112b18] flex items-center gap-2.5">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#112b18] text-[#c5a05f] text-sm font-bold shrink-0 shadow-inner">2</span>
                                        {__('Payment Method')}
                                    </h2>
                                </div>
                                
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label 
                                        className={`relative flex items-start gap-4 p-4 rounded-xl border-[1.5px] cursor-pointer transition-all duration-200 ${
                                            data.payment_method === 'cod' 
                                                ? 'border-[#c5a05f] bg-[#fdfbf7] shadow-sm' 
                                                : 'border-gray-100 hover:border-[#c5a05f]/40 bg-white'
                                        }`}
                                        onClick={() => setData('payment_method', 'cod')}
                                    >
                                        <div className="flex-1 mt-0.5">
                                            <p className={`font-semibold flex items-center gap-2 ${data.payment_method === 'cod' ? 'text-[#112b18]' : 'text-gray-800'}`}>
                                                <span className={data.payment_method === 'cod' ? 'text-[#c5a05f]' : 'text-gray-400'}><Icon.Banknotes /></span>
                                                {__('Cash on Delivery')}
                                            </p>
                                            <p className="text-[12px] text-gray-500 mt-1.5 leading-snug">
                                                {__('Pay securely in cash when your order arrives at your door.')}
                                            </p>
                                        </div>
                                        <div className={`mt-0.5 flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 shrink-0 transition-colors ${data.payment_method === 'cod' ? 'border-[#c5a05f] bg-[#c5a05f]' : 'border-gray-200'}`}>
                                            {data.payment_method === 'cod' && <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />}
                                        </div>
                                    </label>

                                    {/* Online Payment - Disabled / Coming Soon */}
                                    <div 
                                        className="relative flex items-start gap-4 p-4 rounded-xl border-[1.5px] border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed transition-all duration-200"
                                    >
                                        <div className="flex-1 mt-0.5">
                                            <p className="font-semibold flex items-center gap-2 text-gray-500">
                                                <span className="text-gray-400"><Icon.CreditCard /></span>
                                                {__('Online Payment')}
                                                <span className="ml-1 text-[9px] font-bold text-[#c5a05f] bg-[#c5a05f]/10 border border-[#c5a05f]/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                    {__('Coming Soon')}
                                                </span>
                                            </p>
                                            <p className="text-[12px] text-gray-400 mt-1.5 leading-snug">
                                                {__('Pay instantly via bKash, Nagad, Rocket, or Debit/Credit Cards.')}
                                            </p>
                                        </div>
                                        <div className="mt-0.5 flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 shrink-0 border-gray-200 bg-gray-100">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:w-[400px] shrink-0">
                            <div className="bg-white rounded-2xl elegant-shadow border border-[#f0ece1] overflow-hidden sticky top-8">
                                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 bg-[#fdfbf7]">
                                    <h2 className="text-base font-bold text-[#112b18]">{__('Order Summary')}</h2>
                                    <span className="text-[11px] font-bold text-[#c5a05f] bg-white border border-[#c5a05f]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                        {cartCount} {__('Items')}
                                    </span>
                                </div>

                                <div className="cart-scroll max-h-[360px] overflow-y-auto px-6 py-2">
                                    {Object.entries(cart).map(([key, item]) => (
                                        <div key={key} className={`flex gap-4 items-start py-4 border-b border-gray-50 last:border-0 transition-opacity ${isCartBusy ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <div className="w-16 h-16 bg-[#fcfbfa] rounded-lg overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center p-1.5 relative">
                                                <img
                                                    src={`/storage/${item.thumbnail}`}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain mix-blend-multiply"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                                                
                                                {(item.color_name || item.size_name) && (
                                                    <p className="text-[11px] text-[#c5a05f] font-medium mt-1 uppercase tracking-wide">
                                                        {item.color_name} {item.color_name && item.size_name && '·'} {item.size_name}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between mt-2.5">
                                                    <div className="flex items-center gap-1 bg-white rounded-md border border-gray-200 p-0.5">
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={e => { e.preventDefault(); updateQuantity(key, item.quantity - 1); }}
                                                            disabled={item.quantity <= 1 || isCartBusy || processing}
                                                        >
                                                            <Icon.Minus />
                                                        </button>
                                                        <span className="text-xs font-bold text-gray-700 min-w-[20px] text-center">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            className="qty-btn"
                                                            onClick={e => { e.preventDefault(); updateQuantity(key, item.quantity + 1); }}
                                                            disabled={isCartBusy || processing}
                                                        >
                                                            <Icon.Plus />
                                                        </button>
                                                    </div>

                                                    <p className="text-[14px] font-bold text-[#112b18]">
                                                        ৳{(item.price * item.quantity).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={e => { e.preventDefault(); removeItem(key, item.id); }}
                                                disabled={isCartBusy || processing}
                                                className="text-gray-300 hover:text-red-500 transition-colors pt-1 disabled:opacity-30"
                                            >
                                                <Icon.Trash />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-[#fdfbf7] p-6 space-y-3.5 border-t border-[#f0ece1]">
                                    <div className="flex justify-between text-[14px] text-gray-600">
                                        <span>{__('Subtotal')}</span>
                                        <span className={`font-semibold text-gray-900 ${isCartBusy ? 'animate-pulse' : ''}`}>
                                            ৳{cartDetails.subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center text-[14px] text-gray-600">
                                        <span>{__('Delivery Charge')}</span>
                                        <span>
                                            {shippingCharge === 0
                                                ? <span className="text-[#c5a05f] font-bold tracking-wide uppercase text-[11px] bg-white border border-[#c5a05f]/20 px-2 py-0.5 rounded shadow-sm">{__('Free')}</span>
                                                : <span className="font-semibold text-gray-900">৳{shippingCharge.toLocaleString()}</span>
                                            }
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-gray-200/80 flex justify-between items-end">
                                        <div>
                                            <p className="text-[15px] font-bold text-gray-900">{__('Total')}</p>
                                            <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest">
                                                {__('Including all taxes')}
                                            </p>
                                        </div>
                                        <span className={`text-2xl font-black text-[#112b18] ${isCartBusy ? 'animate-pulse' : ''}`}>
                                            ৳{grandTotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="hidden md:block pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitDisabled}
                                            className="submit-btn w-full rounded-xl py-3.5 font-bold text-[15px] tracking-wide flex items-center justify-center gap-2.5"
                                        >
                                            {processing ? (
                                                <><Icon.Spinner /> <span className="text-[#c5a05f]">{data.payment_method === 'online' ? __('Redirecting...') : __('Processing Order...')}</span></>
                                            ) : isCartBusy ? (
                                                <><Icon.Spinner /> <span className="text-[#c5a05f]">{__('Updating Cart...')}</span></>
                                            ) : (
                                                <>{data.payment_method === 'online' ? __('Pay Securely Now') : __('Confirm Order')} <span className="text-[#c5a05f]"><Icon.Check /></span></>
                                            )}
                                        </button>
                                        
                                        <div className="flex items-center justify-center gap-2 mt-4 text-[#c5a05f]">
                                            <Icon.Shield />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#112b18]/60">
                                                {data.payment_method === 'online' ? __('256-bit Secure Payment Gateway') : __('Safe & Secure Checkout')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* MOBILE Sticky Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
                <div className="bg-white border-t border-[#f0ece1] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-4 pt-3 pb-safe-6 pb-6">
                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={isSubmitDisabled}
                        className="submit-btn w-full rounded-xl active:scale-[0.98] disabled:cursor-not-allowed overflow-hidden"
                        style={{ minHeight: 56 }}
                    >
                        {processing || isCartBusy ? (
                            <span className="flex items-center justify-center gap-2.5 py-3.5 font-bold text-[15px] w-full text-[#c5a05f]">
                                <Icon.Spinner /> {isCartBusy ? __('Updating...') : (data.payment_method === 'online' ? __('Redirecting...') : __('Processing...'))}
                            </span>
                        ) : (
                            <span className="flex items-stretch w-full">
                                <span className="flex flex-1 items-center justify-center gap-2 py-3.5 pl-4 font-bold text-[15px] tracking-wide">
                                    {data.payment_method === 'online' ? __('Pay Now') : __('Confirm Order')}
                                </span>
                                <span className="w-px bg-white/20 my-2.5" />
                                <span className="flex flex-col items-center justify-center px-4 py-2 min-w-[90px]">
                                    <span className="text-[18px] font-black leading-none tracking-tight text-white">
                                        ৳{grandTotal.toLocaleString()}
                                    </span>
                                </span>
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </ThemeLayout>
    );
}