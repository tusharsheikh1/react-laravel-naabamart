import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import { Link, useForm } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import { confirmAction, closeConfirm, setConfirmProcessing } from '@/Components/ConfirmModal';
import ProductCard from '@/Components/ProductCard';
import useTranslation from '@/Hooks/useTranslation';
import axios from 'axios';

export default function Cart({ cart, shippingMethods, cartDetails, suggestedProducts = [] }) {
    const { patch, delete: destroy } = useForm();
    const { __ } = useTranslation();

    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        patch(route('cart.update', { cart_key: cartKey, quantity: newQty }), {
            preserveScroll: true
        });
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
                destroy(route('cart.remove', { cart_key: cartKey }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (productId) {
                            axios.post(route('analytics.track'), {
                                product_id: productId,
                                event_type: 'remove_from_cart',
                            }).catch(e => {});
                        }
                        closeConfirm();
                    },
                    onFinish: () => setConfirmProcessing(false)
                });
            }
        });
    };

    // --- Calculations ---
    const subtotal = Object.values(cart).reduce((acc, item) => {
        const base = parseFloat(item.base_price || item.price);
        return acc + (base * item.quantity);
    }, 0);

    const totalFinalItems = Object.values(cart).reduce((acc, item) => {
        return acc + (parseFloat(item.price) * item.quantity);
    }, 0);

    const totalDiscount = subtotal - totalFinalItems;
    const grandTotal = totalFinalItems;

    // --- Free Shipping Threshold ---
    const defaultShipping = shippingMethods?.length > 0 ? shippingMethods[0] : null;
    const threshold = defaultShipping ? parseFloat(defaultShipping.free_delivery_threshold) : 0;
    const isFreeByThreshold = threshold > 0 && totalFinalItems >= threshold;

    const handleCheckoutStart = () => {
        // --- Meta InitiateCheckout Tracking ---
        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const customData = {
            value: grandTotal,
            currency: 'BDT',
            content_ids: Object.values(cart).map(item => item.id),
            content_type: 'product',
            num_items: Object.keys(cart).length
        };

        // 1. Client-Side
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
        }

        // 2. Server-Side
        axios.post('/tracking/meta-event', {
            event_name: 'InitiateCheckout',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData
        }).catch(() => {});
        // --------------------------------------

        axios.post(route('analytics.track'), {
            event_type: 'checkout_start',
            metadata: { cart_total: grandTotal, item_count: Object.keys(cart).length }
        }).catch(e => {});
    };

    return (
        <ThemeLayout>
            <SEO title={__('Your Cart')} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12 pb-32 md:pb-12" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>
                {Object.keys(cart).length > 0 ? (
                    <>
                        <h1 className="text-2xl lg:text-4xl font-black uppercase tracking-tighter mb-6 lg:mb-10">{__('Your Shopping List')}</h1>
                        
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* 1. Item List */}
                            <div className="flex-1 space-y-3 md:space-y-4">
                                {Object.entries(cart).map(([key, item]) => (
                                    <div key={key} className="flex gap-3 md:gap-4 bg-white border border-gray-100 rounded-xl md:rounded-[20px] p-3 md:p-5 shadow-sm relative">
                                        <div className="w-20 h-20 md:w-32 md:h-32 bg-[#F0F0F0] rounded-lg overflow-hidden shrink-0">
                                            <img src={`/storage/${item.thumbnail}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-0.5">
                                            <div className="flex justify-between items-start pr-6 md:pr-0">
                                                <div>
                                                    <h3 className="font-bold text-sm md:text-lg leading-tight mb-1 line-clamp-1">{item.name}</h3>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                                        {item.options?.size && <p className="text-[11px] md:text-sm text-gray-500">{__('Size')}: <span className="text-gray-900 font-semibold">{item.options.size}</span></p>}
                                                        {item.options?.color && <p className="text-[11px] md:text-sm text-gray-500">{__('Color')}: <span className="text-gray-900 font-semibold">{item.options.color}</span></p>}
                                                    </div>
                                                </div>
                                                {/* Desktop Remove Button */}
                                                <button onClick={() => removeItem(key, item.id)} className="hidden md:block text-[#FF3333] hover:bg-red-50 p-2 rounded-full transition">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>

                                            {/* Mobile Remove Button */}
                                            <button onClick={() => removeItem(key, item.id)} className="md:hidden absolute top-2 right-2 text-gray-400 p-1">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>

                                            <div className="flex justify-between items-end mt-2">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-base md:text-xl text-[#2d5a27]">৳{parseFloat(item.price).toLocaleString('en-IN')}</span>
                                                    {item.base_price && parseFloat(item.base_price) > parseFloat(item.price) && (
                                                        <span className="text-[11px] md:text-sm text-gray-400 line-through">৳{parseFloat(item.base_price).toLocaleString('en-IN')}</span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center bg-gray-100 rounded-lg md:rounded-full px-2 md:px-4 py-1 md:py-2 gap-3 md:gap-4">
                                                    <button type="button" onClick={() => updateQuantity(key, item.quantity - 1)} className="text-lg md:text-xl font-medium text-gray-500">-</button>
                                                    <span className="font-bold text-xs md:text-sm w-4 text-center">{item.quantity}</span>
                                                    <button type="button" onClick={() => updateQuantity(key, item.quantity + 1)} className="text-lg md:text-xl font-medium text-gray-500">+</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 2. Order Summary */}
                            <div className="lg:w-[400px]">
                                <div className="bg-white border border-gray-100 rounded-[20px] p-6 sticky top-24 shadow-sm hidden md:block">
                                    <h2 className="text-xl font-bold mb-6 border-b pb-3">{__('Order Summary')}</h2>
                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-gray-500">
                                            <span>{__('Subtotal')}</span>
                                            <span className="text-black font-bold">৳{subtotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {totalDiscount > 0 && (
                                            <div className="flex justify-between text-gray-500">
                                                <span>{__('Discount')}</span>
                                                <span className="text-[#FF3333] font-bold">- ৳{totalDiscount.toLocaleString('en-IN')}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-100 pt-4 flex justify-between">
                                            <span className="text-lg font-medium">{__('Grand Total')}</span>
                                            <span className="text-2xl font-black text-[#2d5a27]">৳{grandTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <Link href={route('checkout.index')} onClick={handleCheckoutStart} className="w-full text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-green-900/20" style={{ background: 'linear-gradient(90deg, #2d5a27, #3a7a30)' }}>
                                        {__('Proceed to Checkout')}
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Suggested Products */}
                        {suggestedProducts?.length > 0 && (
                            <div className="mt-12 md:mt-16 border-t border-gray-100 pt-8 md:pt-12">
                                <h2 className="text-xl md:text-2xl font-bold mb-6 text-[#1a3a1a]">{__('Buy More')}</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                                    {suggestedProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- MOBILE STICKY BOTTOM ACTIONS --- */}
                        <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] rounded-t-2xl">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <span className="text-sm font-bold text-gray-500">{__('Total Price:')}</span>
                                <span className="text-xl font-black text-[#2d5a27]">৳{grandTotal.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex gap-2">
                                <Link href={route('shop')} className="flex-1 bg-gray-100 text-gray-700 text-center py-3.5 rounded-xl font-bold text-sm transition active:scale-95">
                                    {__('View More')}
                                </Link>
                                <Link href={route('checkout.index')} onClick={handleCheckoutStart} className="flex-[1.5] text-white text-center py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-green-900/20 active:scale-95" style={{ background: 'linear-gradient(90deg, #2d5a27, #3a7a30)' }}>
                                    {__('Place Order')}
                                </Link>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20 border border-dashed border-gray-200 rounded-[20px] bg-white">
                        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 11-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        <h2 className="text-xl font-bold mb-2">{__('Your Cart is Empty!')}</h2>
                        <p className="text-gray-500 mb-8">{__('Click the button below to start shopping.')}</p>
                        <Link href={route('shop')} className="inline-block text-white px-10 py-3 rounded-full font-medium shadow-lg shadow-green-900/20" style={{ background: 'linear-gradient(90deg, #2d5a27, #3a7a30)' }}>
                            {__('Start Shopping')}
                        </Link>
                    </div>
                )}
            </div>
        </ThemeLayout>
    );
}