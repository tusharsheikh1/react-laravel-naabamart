import React from 'react';
import { Link } from '@inertiajs/react';

// High-quality fashion placeholder (e.g., if a user forgets to upload an image)
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";

export default function ProductCardGadget({ product }) {
    if (!product) return null;

    // Helper to safely format image URLs
    const getImageUrl = (path) => {
        if (!path) return FALLBACK_IMAGE;
        if (path.startsWith('http')) return path;
        return `/storage/${path}`;
    };

    // --- Restored Accurate Discount Calculation Logic ---
    const price = parseFloat(product.price || 0);
    let finalPrice = price;
    let hasDiscount = false;
    let discountAmount = 0;
    let discountPercentage = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            discountPercentage = Math.round(parseFloat(product.discount_value));
            discountAmount = price * (discountPercentage / 100);
            finalPrice = price - discountAmount;
        } else {
            // Calculate percentage for the badge if it's a fixed amount discount
            discountAmount = parseFloat(product.discount_value);
            finalPrice = price - discountAmount;
            discountPercentage = Math.round((discountAmount / price) * 100);
        }
    }

    return (
        <div className="group relative flex flex-col w-full bg-white transition-all duration-300">
            
            {/* Image Container (Portrait Aspect Ratio is crucial for fashion) */}
            <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-50 mb-4 rounded-sm">
                
                {/* Product Link wrapping the image */}
                <Link href={route('product.show', product.slug)} className="block w-full h-full">
                    <img
                        // Checks for thumbnail first, then standard image
                        src={getImageUrl(product.thumbnail_image || product.thumbnail || product.image)}
                        alt={product.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                    />
                </Link>

                {/* Badges (Top Left) */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                    {hasDiscount && (
                        <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                            -{discountPercentage}%
                        </span>
                    )}
                    {product.is_new && (
                        <span className="bg-black text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                            New
                        </span>
                    )}
                </div>

                {/* Wishlist Button (Top Right) - Appears on Hover on Desktop */}
                <button className="absolute top-2 right-2 p-2 rounded-full bg-white/70 backdrop-blur-sm text-gray-600 hover:text-black hover:bg-white opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                {/* Slide-Up "Quick View / Options" Button (Bottom) */}
                <div className="absolute bottom-0 left-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-10">
                    <Link 
                        href={route('product.show', product.slug)}
                        className="block w-full bg-black/90 backdrop-blur-sm text-white text-center py-3 text-xs uppercase tracking-[0.2em] font-medium hover:bg-black transition-colors"
                    >
                        View Details
                    </Link>
                </div>
            </div>

            {/* Product Details (Text Content) */}
            <div className="flex flex-col items-center text-center px-1">
                
                {/* Optional Brand Name */}
                {product.brand && (
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mb-1.5">
                        {product.brand.name}
                    </span>
                )}

                {/* Product Name */}
                <Link 
                    href={route('product.show', product.slug)}
                    className="text-xs sm:text-sm text-gray-900 font-medium line-clamp-1 hover:text-gray-500 transition-colors mb-1.5"
                >
                    {product.name}
                </Link>

                {/* Pricing Structure */}
                <div className="flex items-center justify-center gap-2 text-sm sm:text-base">
                    {hasDiscount ? (
                        <>
                            {/* Offer Price */}
                            <span className="text-red-600 font-semibold">
                                ৳{Math.round(finalPrice).toLocaleString()}
                            </span>
                            {/* Strikethrough Regular Price */}
                            <span className="text-gray-400 line-through text-xs sm:text-sm">
                                ৳{Math.round(price).toLocaleString()}
                            </span>
                        </>
                    ) : (
                        // Regular Price (No Discount)
                        <span className="text-gray-900 font-semibold">
                            ৳{Math.round(price).toLocaleString()}
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}