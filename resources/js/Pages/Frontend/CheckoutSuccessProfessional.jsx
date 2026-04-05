// resources/js/Pages/Frontend/CheckoutSuccessProfessional.jsx
import React, { useEffect, useState, useRef } from 'react';
import FrontendLayout from '@/Layouts/Frontend/Layout';
import { Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import useTranslation from '@/Hooks/useTranslation';
import { trackEvent } from '@/utils/analytics'; // Unified Tracking Utility

export default function CheckoutSuccessProfessional({ order }) {
    const { __ } = useTranslation();
    const { global_settings } = usePage().props;
    const [mounted, setMounted] = useState(false);
    
    // Track to ensure purchase events are only fired once per page load
    const purchaseTrackedRef = useRef(false);

    // --- Unified Tracking (GA4, Meta Pixel & Server-Side CAPI) ---
    useEffect(() => {
        setMounted(true);

        if (order && order.id && !purchaseTrackedRef.current) {
            
            // Format Items exactly to GA4 and Meta Standards
            const gtmItems = order.items?.map(item => {
                // Safely extract category
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

            // Fire Unified Purchase Event (WITH MASTER SWITCH)
            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('purchase', {
                    transaction_id: order.order_number || order.id.toString(),
                    value: parseFloat(order.total_amount),
                    tax: 0,
                    shipping: parseFloat(order.shipping_charge || 0),
                    currency: 'BDT',
                    coupon: order.coupon_code || undefined, // Track which promo codes drive sales
                    items: gtmItems
                }, {
                    // User data for Meta CAPI Advanced Matching (Crucial for ad attribution)
                    ph: order.customer_phone || '',
                    em: order.customer_email || '',
                    fn: order.customer_name || ''
                });
            }

            // Mark as tracked to prevent duplicates on page refresh
            purchaseTrackedRef.current = true;
        }
    }, [order, global_settings]);
    // ------------------------------------

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

            <div 
                className="min-h-screen bg-gray-50/50 py-10 md:py-16"
                style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
            >
                <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    
                    <div className="bg-white shadow-xl shadow-gray-200/50 rounded-3xl overflow-hidden border border-gray-100">
                        
                        {/* --- Success Header --- */}
                        <div className="p-10 md:p-16 text-center border-b border-gray-100">
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                                <svg className="w-10 h-10 md:w-12 md:h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            <div className="inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-4">
                                {__('Order Confirmed')}
                            </div>

                            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                                {__('Thank you! Your order has been placed successfully')}
                            </h1>
                            <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto mb-2 leading-relaxed">
                                {__('We have received your order and are arranging delivery very soon. Your product will reach your address within 3 to 5 working days.')}
                            </p>
                            <p className="text-indigo-600 font-medium bg-indigo-50 inline-block px-4 py-1.5 rounded-full text-sm mt-2">
                                {__('We will notify you once your order is shipped.')}
                            </p>
                        </div>

                        {/* --- Order Details Section --- */}
                        <div className="px-5 py-8 md:px-16 md:py-12 bg-white">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                {__('Order Details')}
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
                                {/* Summary Column */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500">{__('Order Number:')}</span>
                                        <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-md">
                                            {order.order_number}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                        <span className="text-gray-500">{__('Payment Method:')}</span>
                                        <span className="font-semibold text-gray-800">
                                            {paymentMethodTranslate(order.payment_method)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center pt-4">
                                        <span className="text-gray-900 font-bold text-lg">{__('Grand Total')}</span>
                                        <span className="font-extrabold text-2xl text-gray-900">
                                            ৳ {formatBDT(order.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Address Column */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <h4 className="font-bold text-gray-900">{__('Delivery Address')}</h4>
                                    </div>
                                    <div className="space-y-1">
                                        {/* Added Fallbacks here */}
                                        <p className="text-gray-900 font-bold">{order.customer_name || __('Customer')}</p>
                                        <p className="text-gray-600 font-medium">{order.customer_phone || __('N/A')}</p>
                                        <p className="text-gray-600 text-sm md:text-base leading-relaxed mt-2">
                                            {order.shipping_address || __('Address not provided')}
                                        </p>
                                        {order.shipping_area && (
                                            <p className="font-bold text-gray-800 pt-1">{order.shipping_area}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Action Buttons --- */}
                        <div className="p-6 md:p-10 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <a 
                                    href={route('checkout.invoice', order.id)} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    {__('View Invoice')}
                                </a>

                                <Link 
                                    href={route('shop')} 
                                    className="w-full sm:w-auto text-center bg-gray-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md"
                                >
                                    {__('Continue Shopping')}
                                </Link>

                                {order.user_id && (
                                    <Link 
                                        href={route('user.orders')} 
                                        className="w-full sm:w-auto text-center bg-gray-200 text-gray-800 px-8 py-3.5 rounded-xl font-bold hover:bg-gray-300 transition-all"
                                    >
                                        {__('My Orders')}
                                    </Link>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </FrontendLayout>
    );
}