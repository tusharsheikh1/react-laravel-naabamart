import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ProductCard({ product, priority = false }) {
    const { global_settings } = usePage().props;
    const currentTheme = String(global_settings?.site_theme || 'general').toLowerCase();
    const [isAdded, setIsAdded] = useState(false);
    
    // --- Shared E-commerce Logic ---
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

        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() : `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const customData = {
            value: finalPrice, currency: 'BDT', content_ids: [product.id],
            content_type: 'product', contents: [{ id: product.id, quantity: 1 }]
        };

        if (typeof window !== 'undefined' && window.fbq) window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        axios.post('/tracking/meta-event', { event_name: 'AddToCart', event_id: eventId, event_url: window.location.href, custom_data: customData }).catch(() => {});

        router.post(route('cart.add'), { product_id: product.id, quantity: 1, color_id: null, size_id: null }, {
            preserveScroll: true, preserveState: true,
            onSuccess: () => {
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
                axios.post(route('analytics.track'), { product_id: product.id, event_type: 'add_to_cart' }).catch(() => {});
            }
        });
    };

    // --- Shared UI Components ---
    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const ProductImage = ({ className = "" }) => {
        const defaultImage = 'https://bms.com.tr/wp-content/uploads/2025/06/A-Chair_auditorium_thumb_01.webp';
        const imgSrc = product.thumbnail ? `/storage/${product.thumbnail}` : defaultImage;

        return (
            <img 
                src={imgSrc} 
                alt={product.name || 'Product'} 
                loading={priority ? "eager" : "lazy"} 
                fetchpriority={priority ? "high" : "auto"} 
                className={`w-full h-full object-cover ${className}`}
                onError={(e) => {
                    // If the uploaded image is broken, swap to default
                    if (e.target.src !== defaultImage) {
                        e.target.src = defaultImage;
                    }
                }}
            />
        );
    };

    // ==============================================
    // THEME 1: BOOK (Focus on Author & Publication)
    // ==============================================
    if (currentTheme === 'book') {
        return (
            <Link href={route('product.show', product.slug)} className="group flex flex-col h-full bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[3/4] bg-gray-50 p-4 flex items-center justify-center">
                    {hasDiscount && <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm">-{discountPercentage}%</div>}
                    <div className="w-[85%] h-full shadow-md group-hover:scale-105 transition-transform duration-300">
                        <ProductImage />
                    </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                    {product.author && <p className="text-xs text-blue-600 font-medium mb-1">{product.author.name}</p>}
                    <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between">
                        <div>
                            <span className="font-bold text-lg text-gray-900">৳{finalPrice}</span>
                            {hasDiscount && <span className="text-xs text-gray-400 line-through ml-2">৳{price}</span>}
                        </div>
                        <button onClick={handleAddToCart} className={`p-2 rounded-full ${isAdded ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'} transition-colors`}>
                            {isAdded ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : <CartIcon />}
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // ==============================================
    // THEME 2: GADGET (Techy, Focus on Brand)
    // ==============================================
    if (currentTheme === 'gadget') {
        return (
            <Link href={route('product.show', product.slug)} className="group flex flex-col h-full bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors duration-300 overflow-hidden relative">
                {hasDiscount && <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">SAVE ৳{discountAmount}</div>}
                <div className="relative aspect-square p-6 bg-white flex items-center justify-center">
                    <div className="w-full h-full group-hover:scale-110 transition-transform duration-500">
                        <ProductImage className="object-contain mix-blend-multiply" />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex flex-col flex-1 border-t border-gray-100">
                    {product.brand && <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{product.brand.name}</p>}
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-3">{product.name}</h3>
                    <div className="mt-auto space-y-3">
                        <div className="flex items-end gap-2">
                            <span className="font-black text-xl text-gray-900">৳{finalPrice}</span>
                            {hasDiscount && <span className="text-sm text-gray-400 line-through pb-0.5">৳{price}</span>}
                        </div>
                        <button onClick={handleAddToCart} className={`w-full py-2 text-sm font-bold uppercase tracking-wide rounded transition-all ${isAdded ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-blue-600'}`}>
                            {isAdded ? 'Added' : 'Add to Cart'}
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // ==============================================
    // THEME 3: FOOD (Appetizing, Quick Action)
    // ==============================================
    if (currentTheme === 'food') {
        return (
            <Link href={route('product.show', product.slug)} className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 p-3">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                    {hasDiscount && <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">-{discountPercentage}%</div>}
                    <ProductImage className="group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex flex-col flex-1 px-1">
                    <h3 className="font-bold text-gray-800 text-base line-clamp-2 mb-1">{product.name}</h3>
                    <div className="mt-auto pt-3 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-orange-600">৳{finalPrice}</span>
                            {hasDiscount && <span className="text-xs text-gray-400 line-through">৳{price}</span>}
                        </div>
                        <button onClick={handleAddToCart} className={`w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-transform active:scale-95 ${isAdded ? 'bg-green-500 text-white' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                            {isAdded ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> : <CartIcon />}
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // ==============================================
    // THEME 4: DIGITAL (Minimalist, Software/Templates)
    // ==============================================
    if (currentTheme === 'digital') {
        return (
            <Link href={route('product.show', product.slug)} className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl hover:border-indigo-500 transition-colors duration-300 overflow-hidden">
                <div className="relative aspect-[16/9] bg-gray-100 border-b border-gray-200 overflow-hidden">
                    <ProductImage className="group-hover:opacity-90 transition-opacity duration-300" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">{product.name}</h3>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="font-bold text-indigo-600 text-lg">৳{finalPrice}</span>
                        <button onClick={handleAddToCart} className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isAdded ? 'bg-green-100 text-green-700' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white'}`}>
                            {isAdded ? 'Added' : 'Get Now'}
                        </button>
                    </div>
                </div>
            </Link>
        );
    }

    // ==============================================
    // DEFAULT THEME: GENERAL (Original Style)
    // ==============================================
    return (
        <Link href={route('product.show', product.slug)} className="group flex flex-col h-full cursor-pointer relative pb-1">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-3 shrink-0 bg-[#F8F8F8] shadow-sm">
                {hasDiscount && discountPercentage > 0 && (
                    <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded text-[9px] font-bold text-white tracking-wider bg-[#56ab2f]">
                        Save {discountPercentage}%
                    </div>
                )}
                <ProductImage className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
            </div>

            <div className="px-0.5 flex-1 flex flex-col">
                <h3 className="font-semibold text-sm leading-snug line-clamp-2 h-[44px] text-[#1a3a1a]">{product.name}</h3>
                <div className="mt-auto flex flex-col pt-2 gap-2.5">
                    <div className="flex items-end gap-1.5 flex-wrap min-h-[24px]">
                        <span className="font-bold text-lg leading-none text-[#1a3a1a]">৳{finalPrice}</span>
                        {hasDiscount && <span className="text-xs font-medium line-through text-gray-400 pb-[1px]">৳{price}</span>}
                    </div>

                    <button onClick={handleAddToCart} className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border font-bold text-xs transition-all duration-200 ${isAdded ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 text-[#1a3a1a] hover:bg-[#f4faf0] hover:text-[#2d5a27]'}`}>
                        {isAdded ? 'Added!' : <><CartIcon /> Add To Cart</>}
                    </button>
                </div>
            </div>
        </Link>
    );
}