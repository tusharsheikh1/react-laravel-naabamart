import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function TopSellingCard({ product, rank }) {
    const [isAdded, setIsAdded] = useState(false);
    
    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountAmount = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            const discountPercent = parseFloat(product.discount_value);
            discountAmount = price * (discountPercent / 100);
            finalPrice = price - discountAmount;
        } else if (product.discount_type === 'fixed') {
            discountAmount = parseFloat(product.discount_value);
            finalPrice = price - discountAmount;
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
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
            }
        });
    };

    const handleBuyNow = (e) => {
        e.preventDefault();
        e.stopPropagation();
        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: 1,
            color_id: null,
            size_id: null
        }, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                router.get(route('checkout.index'));
            }
        });
    };

    const badgeLabel = product.is_offered ? 'Offered Items' : 'Best Selling';
    const badgeBg = product.is_offered ? '#f97316' : '#ef4444';

    const BadgeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2c0 0-5 4.5-5 9a5 5 0 0010 0c0-4.5-5-9-5-9zm0 14a3 3 0 01-3-3c0-2.5 3-6 3-6s3 3.5 3 6a3 3 0 01-3 3z"/>
        </svg>
    );

    const CartIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    );

    const BagIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    );

    return (
        <>
            {/* ── MOBILE CARD (Remains intact to preserve your preferred mobile layout) ── */}
            <Link
                href={route('product.show', product.slug)}
                className="md:hidden group flex flex-col h-full w-full cursor-pointer relative bg-white pb-1"
                style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
            >
                <div
                    className="relative rounded-2xl overflow-hidden aspect-[4/5] mb-3 shrink-0"
                    style={{
                        backgroundColor: '#F8F8F8', 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    }}
                >
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
                            loading="lazy"
                            className="w-full h-full object-contain transition-all duration-700 ease-out group-hover:scale-[1.06]"
                            style={{ mixBlendMode: 'multiply' }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-medium tracking-widest uppercase">
                            No Image
                        </div>
                    )}

                    <div
                        className="absolute top-2 right-2 z-10 flex items-center gap-1 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md shadow"
                        style={{ backgroundColor: badgeBg }}
                    >
                        <BadgeIcon />
                        <span>{badgeLabel}</span>
                    </div>

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

                <div className="px-1 flex-1 flex flex-col">
                    <h3
                        className="font-semibold text-sm leading-snug line-clamp-2 h-[44px] group-hover:opacity-60 transition-opacity duration-200 overflow-hidden"
                        style={{ color: '#1a3a1a', letterSpacing: '-0.01em' }}
                    >
                        {product.name}
                    </h3>

                    <div className="mt-1 h-[48px] flex flex-col justify-end">
                        <div className="flex items-end gap-1.5 flex-wrap">
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
                    </div>

                    <div className="mt-auto pt-3 z-20">
                        <button
                            onClick={handleAddToCart}
                            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border font-bold text-xs transition-all duration-200 cursor-pointer ${
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

            {/* ── DESKTOP CARD (Redesigned for best practices) ── */}
            <div
                className="hidden md:flex group relative flex-row bg-white rounded-2xl overflow-hidden w-full h-full border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-out"
                style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
            >
                {/* Status Badge */}
                <div
                    className="absolute top-4 right-4 z-10 flex items-center gap-1.5 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm tracking-wide"
                    style={{ backgroundColor: badgeBg }}
                >
                    <BadgeIcon />
                    <span className="uppercase">{badgeLabel}</span>
                </div>

                {/* Left Side: Responsive Image Container */}
                <Link
                    href={route('product.show', product.slug)}
                    className="relative w-2/5 max-w-[260px] flex-shrink-0 bg-[#F8F8F8] flex items-center justify-center overflow-hidden"
                >
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 60%)',
                        }}
                    />
                    
                    {product.thumbnail ? (
                        <img
                            src={`/storage/${product.thumbnail}`}
                            alt={product.name}
                            loading="lazy"
                            className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                    ) : (
                        <span className="text-gray-300 text-xs font-medium uppercase tracking-widest">No Image</span>
                    )}

                    {/* Rank Indicator */}
                    {rank && (
                        <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur-sm text-gray-800 font-black text-xl px-4 py-2 rounded-tr-2xl border-t border-r border-white/60 shadow-[2px_-2px_12px_rgba(0,0,0,0.06)] z-20">
                            #{rank}
                        </div>
                    )}
                </Link>

                {/* Right Side: Content & Actions */}
                <div className="flex flex-col flex-1 p-6 lg:p-7 min-w-0 justify-between bg-white">
                    <div>
                        <Link href={route('product.show', product.slug)}>
                            <h3
                                className="font-bold text-lg lg:text-xl leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-[#2d5a27]"
                                style={{ color: '#1a1a1a', letterSpacing: '-0.01em' }}
                            >
                                {product.name}
                            </h3>
                        </Link>

                        {/* Fluid Pricing without empty gaps */}
                        <div className="mt-3 flex flex-col">
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="font-extrabold text-2xl leading-none" style={{ color: '#f97316' }}> 
                                    ৳{finalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </span>
                                {hasDiscount && (
                                    <span className="text-sm font-medium line-through leading-none text-gray-400">
                                        ৳{price.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                            
                            {hasDiscount && (
                                <div className="mt-2.5">
                                    <span
                                        className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-md"
                                        style={{ backgroundColor: '#ecfccb', color: '#4d7c0f' }}
                                    >
                                        Save ৳{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call To Actions */}
                    <div className="mt-6 flex flex-col xl:flex-row items-center gap-3 z-20">
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                isAdded 
                                ? 'bg-green-50 border-green-500 text-green-700 shadow-inner' 
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-[#f4faf0] hover:border-[#c8e6c0] hover:text-[#2d5a27] shadow-sm hover:shadow'
                            }`}
                        >
                            {isAdded ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                                    Added!
                                </>
                            ) : (
                                <>
                                    <CartIcon />
                                    Add To Cart
                                </>
                            )}
                        </button>

                        <button
                            onClick={handleBuyNow}
                            className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer whitespace-nowrap"
                            style={{ background: 'linear-gradient(135deg, #2d5a27 0%, #1a3a1a 100%)' }}
                        >
                            <BagIcon />
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}