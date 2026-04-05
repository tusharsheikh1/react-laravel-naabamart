import React from 'react';

// Common Cart Icon SVG
const CartIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// 1. Featured Category Bubble
export const FeaturedCategoryCard = ({ category }) => (
    <div className="flex flex-col items-center justify-center min-w-[130px] md:min-w-[150px] bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 snap-center cursor-pointer hover:border-[#ea580c] transition-colors">
        <div className="h-16 w-16 mb-3 flex items-center justify-center">
            <img src={category.image || "https://placehold.co/100x100/png?text=Icon"} alt={category.name} className="max-h-full max-w-full object-contain" />
        </div>
        <span className="text-[15px] text-gray-700 font-medium text-center">{category.name}</span>
    </div>
);

// 2. Top Selling Horizontal Card (Two Buttons)
export const TopSellingCard = ({ product }) => (
    <div className="bg-white rounded-2xl p-5 relative border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex flex-row items-center gap-6 group hover:shadow-lg transition-shadow">
        {/* Top Right Red Badge */}
        {product.badge && (
            <div className="absolute top-4 right-4 z-10">
                <span className="bg-[#ff4d4f] text-white text-[11px] font-bold px-2.5 py-1 rounded-sm flex items-center gap-1 uppercase tracking-wide">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                    {product.badge}
                </span>
            </div>
        )}

        {/* Product Image */}
        <div className="w-1/3 min-w-[120px] aspect-square flex items-center justify-center bg-white rounded-lg">
            <img src={product.image || "https://placehold.co/300x300/png?text=Product"} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col py-2">
            <h3 className="text-[18px] font-semibold text-gray-900 mb-2 leading-tight">{product.name}</h3>
            
            <div className="flex items-center gap-3 mb-2">
                <span className="text-[#ea580c] font-bold text-xl">৳{product.price}</span>
                {product.oldPrice && <span className="text-gray-400 text-[15px] font-medium line-through">৳{product.oldPrice}</span>}
            </div>

            {product.discount && (
                <div className="mb-5">
                    <span className="bg-[#84cc16] text-white text-[12px] font-bold px-3 py-0.5 rounded-full">
                        Save ৳{product.discount}
                    </span>
                </div>
            )}

            {/* Actions (Exact Matching Buttons) */}
            <div className="flex items-center gap-3 mt-auto">
                <button className="flex-1 border border-[#ea580c] text-[#ea580c] py-2.5 rounded-md text-[14px] font-semibold hover:bg-[#fff7f2] flex justify-center items-center gap-2 transition-colors">
                    <CartIcon /> Add To Cart
                </button>
                <button className="flex-1 bg-[#ea580c] border border-[#ea580c] text-white py-2.5 rounded-md text-[14px] font-semibold hover:bg-[#d84c06] flex justify-center items-center gap-2 transition-colors">
                    <CartIcon /> Buy now
                </button>
            </div>
        </div>
    </div>
);

// 3. Category Product Card (Vertical layout, Single Full-Width Button)
export const CategoryProductCard = ({ product }) => (
    <div className="bg-white rounded-xl p-4 relative border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col group hover:shadow-lg transition-shadow h-full">
        {/* Left Orange Badge */}
        {product.badge && (
            <div className="absolute top-3 left-3 z-10">
                <span className="bg-[#f97316] text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">{product.badge}</span>
            </div>
        )}
        {/* Right Green Discount Badge */}
        {product.discountValue && (
            <div className="absolute top-3 right-3 z-10">
                <span className="bg-[#10b981] text-white text-[10px] font-semibold px-2 py-0.5 rounded-sm">
                    {product.discountType === 'percent' ? `Save ${product.discountValue}` : `Save ৳${product.discountValue}`}
                </span>
            </div>
        )}

        <div className="w-full aspect-square flex items-center justify-center mb-4 mt-6">
            <img src={product.image || "https://placehold.co/250x250/png?text=Item"} alt={product.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
        </div>

        <h3 className="text-[15px] font-medium text-gray-800 mb-2 leading-snug line-clamp-2 min-h-[44px]">{product.name}</h3>
        
        <div className="flex items-center gap-2 mb-4">
            <span className="text-[#ea580c] font-bold text-[17px]">৳{product.price}</span>
            {product.oldPrice && <span className="text-gray-400 text-[13px] line-through">৳{product.oldPrice}</span>}
        </div>

        {/* Full width button */}
        <button className="w-full mt-auto border border-[#ea580c] text-[#ea580c] py-2 rounded-md text-[14px] font-semibold hover:bg-[#fff7f2] flex justify-center items-center gap-2 transition-colors">
            <CartIcon /> Add To Cart
        </button>
    </div>
);

// 4. Brand Logo Card
export const BrandCard = ({ name }) => (
    <div className="min-w-[200px] h-24 bg-white rounded-xl border border-gray-100 flex items-center justify-center shadow-sm p-4 hover:border-gray-300 transition-colors cursor-pointer">
        {/* Replace with actual image parsing from props in real usage */}
        <span className="text-xl font-black tracking-wider text-gray-800 uppercase text-center w-full">{name}</span>
    </div>
);