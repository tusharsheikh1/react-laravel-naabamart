// resources/js/Pages/Frontend/CheckoutSuccess.jsx
import React, { useEffect, useRef } from 'react';
import FrontendLayout from '@/Layouts/Frontend/Layout';
import { Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import useTranslation from '@/Hooks/useTranslation';

// 1. IMPORT THE UNIVERSAL TRACKING UTILITY
import { trackEvent } from '@/utils/analytics';

export default function CheckoutSuccess({ order }) {
    const { __ } = useTranslation();
    const { global_settings } = usePage().props;
    
    // Track to ensure purchase events are only fired once per page load
    const purchaseTrackedRef = useRef(false);

    // --- Unified Tracking (GA4, Meta Pixel & Server-Side CAPI) ---
    useEffect(() => {
        if (order && order.id && !purchaseTrackedRef.current) {
            
            // 1. Prepare standardized items array
            const ga4Items = order.items?.map(item => {
                // Safely extract category if product relation is loaded
                const categoryName = item.product?.categories?.length > 0 
                    ? item.product.categories[item.product.categories.length - 1].name 
                    : (item.product?.category?.name || 'Uncategorized');

                return {
                    item_id: item.product?.sku || item.product_id?.toString() || item.id?.toString() || 'unknown',
                    item_name: item.product_name || item.product?.name || 'Unknown Product',
                    price: parseFloat(item.price),
                    quantity: item.quantity,
                    item_category: categoryName,
                    item_variant: [item.color_name, item.size_name].filter(Boolean).join(' ') || undefined
                };
            }) || [];

            // 2. Fire Universal Purchase Event (WITH MASTER SWITCH)
            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('purchase', {
                    transaction_id: order.order_number || order.id.toString(),
                    value: parseFloat(order.total_amount),
                    tax: 0,
                    shipping: parseFloat(order.shipping_charge || 0),
                    currency: 'BDT',
                    coupon: order.coupon_code || undefined, // Track which promo codes drive sales
                    items: ga4Items
                }, {
                    // User data for Meta CAPI Advanced Matching & GA4 Enhanced Conversions
                    ph: order.customer_phone || '',
                    em: order.customer_email || '',
                    fn: order.customer_name || ''
                });
            }

            // Mark as tracked
            purchaseTrackedRef.current = true;
        }
    }, [order, global_settings]);
    // -------------------------------------------------------------

    const formatBDT = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const paymentMethodTranslate = (method) => {
        if (method === 'cod') return __('Cash on Delivery (COD)');
        if (method === 'online') return __('Online Payment');
        return method;
    };

    return (
        <FrontendLayout>
            <SEO title={__('Order Successful')} />

            {/* Main Container: Reduced padding for mobile */}
            <div 
                className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 lg:py-20"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                    
                    {/* Success Header */}
                    <div className="p-5 md:p-12 text-center border-b border-gray-100">
                        <div className="w-16 h-16 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                            <svg className="w-8 h-8 md:w-12 md:h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                            {__('Thank you! Your order has been placed successfully')}
                        </h1>
                        <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto mb-8 md:mb-12">
                            {__('We have received your order and are arranging delivery very soon. Your product will reach your address within 3 to 5 working days.')}
                        </p>

                        {/* --- ATTRACTIVE AI CALL NOTE --- */}
                        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50 via-white to-purple-50 border border-indigo-100 rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-3xl mx-auto mt-4 text-left">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-40 blur-3xl pointer-events-none"></div>
                            
                            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <div className="relative flex-shrink-0 mt-1">
                                    <div className="absolute inset-0 bg-indigo-300 rounded-full animate-ping opacity-30" style={{ animationDuration: '2s' }}></div>
                                    <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-4 rounded-full shadow-lg text-white">
                                        <svg className="w-7 h-7 md:w-9 md:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="text-center sm:text-left flex-1">
                                    <h3 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 mb-2">
                                        {__('Be ready to confirm the order!')}
                                    </h3>
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-5">
                                        {__('Shortly, our Smart AI will call your number. Please receive the call and follow the instructions below:')}
                                    </p>
                                    
                                    <div className="flex flex-col sm:flex-row gap-3 md:gap-5 justify-center sm:justify-start">
                                        <div className="flex items-center gap-3 bg-white border border-indigo-50 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                                            <span className="inline-flex items-center justify-center bg-green-100 text-green-700 font-bold px-3 py-1.5 rounded-lg border border-green-200 text-sm md:text-base whitespace-nowrap">
                                                {__('Press 1')}
                                            </span>
                                            <span className="text-gray-700 font-medium text-sm md:text-base">{__('To confirm the order')}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-3 bg-white border border-indigo-50 px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition duration-300">
                                            <span className="inline-flex items-center justify-center bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-lg border border-amber-200 text-sm md:text-base whitespace-nowrap">
                                                {__('Press 2')}
                                            </span>
                                            <span className="text-gray-700 font-medium text-sm md:text-base">{__('To talk to a representative')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details & Address Section */}
                    <div className="p-5 md:p-12 bg-gray-50/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 pb-2 md:pb-3 border-b border-gray-200">
                                    {__('Order Summary')}
                                </h3>
                                <div className="space-y-3 md:space-y-4 text-sm md:text-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">{__('Order Number:')}</span>
                                        <span className="font-bold text-gray-900 bg-white px-2.5 py-1 border border-gray-200 rounded-md tracking-wider shadow-sm text-xs md:text-base">
                                            {order.order_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 font-medium">{__('Payment Method:')}</span>
                                        <span className="font-semibold text-gray-800">
                                            {paymentMethodTranslate(order.payment_method)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 md:pt-4 border-t border-gray-200 mt-2">
                                        <span className="text-gray-700 font-bold">{__('Grand Total')}:</span>
                                        <span className="font-bold text-lg md:text-2xl text-green-600">
                                            ৳ {formatBDT(order.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 pb-2 md:pb-3 border-b border-gray-200">
                                    {__('Delivery Address')}
                                </h3>
                                <div className="space-y-2 md:space-y-3 bg-white p-4 md:p-5 rounded-xl border border-gray-200 shadow-sm text-sm md:text-base">
                                    <p className="text-gray-900 font-bold flex items-center gap-2 md:gap-3">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        {/* Added fallback to prevent blank name */}
                                        {order.customer_name || __('Customer')}
                                    </p>
                                    <p className="text-gray-600 flex items-center gap-2 md:gap-3">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        {/* Added fallback for phone */}
                                        {order.customer_phone || __('N/A')}
                                    </p>
                                    <p className="text-gray-600 flex items-start gap-2 md:gap-3 mt-1">
                                        <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span>
                                            {/* Added fallback for address */}
                                            {order.shipping_address || __('Address not provided')}<br/>
                                            {order.shipping_area && (
                                                <span className="font-semibold text-gray-800">{order.shipping_area}</span>
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="p-5 md:p-10 bg-white border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center">
                            <a 
                                href={route('checkout.invoice', order.id)} 
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border-2 border-gray-900 text-gray-900 px-6 py-2.5 md:py-3.5 rounded-full font-bold text-sm md:text-lg hover:bg-gray-50 transition"
                            >
                                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                {__('View Invoice')}
                            </a>

                            <Link 
                                href={route('shop')} 
                                className="w-full sm:w-auto text-center bg-black text-white px-6 py-3 md:py-4 rounded-full font-bold text-sm md:text-lg hover:bg-gray-800 transition shadow-md"
                            >
                                {__('Continue Shopping')}
                            </Link>

                            {order.user_id && (
                                <Link 
                                    href={route('user.orders')} 
                                    className="w-full sm:w-auto text-center bg-gray-100 text-gray-900 px-6 py-3 md:py-4 rounded-full font-bold text-sm md:text-lg hover:bg-gray-200 transition"
                                >
                                    {__('My Orders')}
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </FrontendLayout>
    );
}