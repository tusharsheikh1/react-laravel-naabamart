import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ProductCard({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);
    
    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountAmount = 0;
    let discountPercentage = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            const discountPercent = parseFloat(product.discount_value);
            discountAmount = price * (discountPercent / 100);
            finalPrice = price - discountAmount;
            discountPercentage = Math.round(discountPercent);
        } else if (product.discount_type === 'fixed') {
            discountAmount = parseFloat(product.discount_value);
            finalPrice = price - discountAmount;
            discountPercentage = Math.round((discountAmount / price) * 100);
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        // --- Meta AddToCart Tracking ---
        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const customData = {
            value: finalPrice,
            currency: 'BDT',
            content_ids: [product.id],
            content_type: 'product',
            contents: [{ id: product.id, quantity: 1 }]
        };

        // 1. Fire Client-Side Pixel
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        }

        // 2. Fire Server-Side CAPI
        axios.post('/tracking/meta-event', {
            event_name: 'AddToCart',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData
        }).catch(() => {});
        // -------------------------------

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1,
            color_id: null,
            size_id: null
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setIsAdded(true);
                setTimeout(() => {
                    setIsAdded(false);
                }, 2000);

                axios.post(route('analytics.track'), {
                    product_id: product.id,
                    event_type: 'add_to_cart',
                }).catch(e => console.log('Analytics tracking blocked'));
            }
        });
    };

    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    return (
        <Link
            href={route('product.show', product.slug)}
            className="group flex flex-col h-full cursor-pointer relative pb-1"
            style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
        >
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-3 shrink-0"
                style={{
                    backgroundColor: '#F8F8F8', 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}>

                {hasDiscount && discountPercentage > 0 && (
                    <div 
                        className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded text-[9px] font-bold text-white tracking-wider shadow-sm pointer-events-none"
                        style={{ backgroundColor: '#56ab2f' }}
                    >
                        Save {discountPercentage}%
                    </div>
                )}

                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none rounded-2xl"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
                    }}
                />

                {product.thumbnail ? (
                    <img
                        src={`/storage/${product.thumbnail}`}
                        alt={product.name}
                        width="285"
                        height="403"
                        loading={priority ? "eager" : "lazy"}
                        fetchpriority={priority ? "high" : "auto"}
                        className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.06]"
                        style={{ mixBlendMode: 'multiply' }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium tracking-widest uppercase">
                        No Image
                    </div>
                )}

                <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 whitespace-nowrap text-xs font-semibold px-4 py-1.5 rounded-full pointer-events-none"
                    style={{
                        background: 'rgba(255,255,255,0.92)',
                        color: '#2d5a27', 
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        letterSpacing: '0.04em',
                    }}
                >
                    View Product →
                </div>
            </div>

            <div className="px-0.5 flex-1 flex flex-col">
                <h3
                    className="font-semibold text-sm leading-snug line-clamp-2 h-[44px] overflow-hidden group-hover:opacity-60 transition-opacity duration-200"
                    style={{ color: '#1a3a1a', letterSpacing: '-0.01em' }}
                >
                    {product.name}
                </h3>

                <div className="mt-auto flex flex-col pt-2 gap-2.5">
                    <div className="flex items-end gap-1.5 flex-wrap min-h-[24px]">
                        <span
                            className="font-bold text-lg leading-none"
                            style={{ color: '#1a3a1a', letterSpacing: '-0.02em' }}
                        >
                            ৳{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                        {hasDiscount && (
                            <span
                                className="text-xs font-medium line-through leading-none pb-[1px]"
                                style={{ color: '#888', textDecorationColor: '#ccc' }}
                            >
                                ৳{price.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </span>
                        )}
                        {hasDiscount && (
                            <span className="text-[10px] font-bold ml-auto leading-none pb-[2px]" style={{ color: '#56ab2f' }}>
                                Save ৳{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border font-bold text-xs transition-all duration-200 cursor-pointer z-20 ${
                            isAdded 
                            ? 'bg-green-50 border-green-500 text-green-700' 
                            : 'bg-white border-gray-300 text-[#1a3a1a] hover:bg-[#f4faf0] hover:border-[#c8e6c0] hover:text-[#2d5a27]'
                        }`}
                    >
                        {isAdded ? (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                Added!
                            </>
                        ) : (
                            <>
                                <CartIcon />
                                Add To Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}