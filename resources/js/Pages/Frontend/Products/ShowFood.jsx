// resources/js/Pages/Frontend/Products/ShowFood.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Layout from '@/Layouts/Frontend/Layout';
import { Head, Link, router } from '@inertiajs/react';
import ProductCard from '@/Components/ProductCard';

// 1. IMPORT THE UNIVERSAL TRACKING UTILITY
import { trackEvent } from '@/utils/analytics';

export default function ShowFood({ product, relatedProducts }) {
    const [selectedImage, setSelectedImage] = useState(product?.thumbnail);
    const [quantity, setQuantity] = useState(1);
    
    // Separate loading states for the two buttons
    const [addingToCart, setAddingToCart] = useState(false);
    const [buyingNow, setBuyingNow] = useState(false);

    // Track to ensure view_item is only fired once per product load
    const viewTrackedRef = useRef(false);

    // Group variants by size
    const availableSizes = product.variants?.map(v => v.size).filter(Boolean) || [];
    const uniqueSizes = [...new Map(availableSizes.map(item => [item['id'], item])).values()];
    const [selectedSize, setSelectedSize] = useState(uniqueSizes.length > 0 ? uniqueSizes[0] : null);

    // Price Calculation
    const basePrice = parseFloat(product.price);
    let finalPrice = basePrice;
    if (product.discount_value > 0) {
        finalPrice = product.discount_type === 'percent' 
            ? basePrice - (basePrice * (parseFloat(product.discount_value) / 100))
            : basePrice - parseFloat(product.discount_value);
    }

    // --- Universal Product View Tracking ---
    useEffect(() => {
        if (product && product.id && !viewTrackedRef.current) {
            // 1. Internal Tracking
            axios.post(route('analytics.track'), { 
                product_id: product.id, 
                event_type: 'view' 
            }).catch(() => {});

            // 2. Universal View Item Tracking
            trackEvent('view_item', {
                currency: 'BDT',
                value: finalPrice,
                items: [
                    {
                        item_id: product.sku || product.id,
                        item_name: product.name,
                        price: finalPrice,
                        quantity: 1,
                        item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized'
                    }
                ]
            });

            viewTrackedRef.current = true;
        }
    }, [product, finalPrice]);
    // -----------------------------

    // --- Unified Cart Submission Logic ---
    const submitToCart = (e, isBuyNow = false) => {
        if (e && e.preventDefault) e.preventDefault();

        isBuyNow ? setBuyingNow(true) : setAddingToCart(true);

        // 3. TRIGGER UNIVERSAL ADD_TO_CART EVENT
        trackEvent('add_to_cart', {
            currency: 'BDT',
            value: finalPrice * quantity,
            items: [
                {
                    item_id: product.sku || product.id,
                    item_name: product.name,
                    price: finalPrice,
                    quantity: quantity,
                    item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized',
                    item_variant: selectedSize ? selectedSize.name : undefined
                }
            ]
        });

        // Internal Tracking
        axios.post(route('analytics.track'), { 
            product_id: product.id, 
            event_type: 'add_to_cart',
            metadata: { quantity, size_id: selectedSize?.id }
        }).catch(() => {});

        router.post(route('cart.add'), {
            product_id: product.id,
            quantity: quantity,
            size_id: selectedSize ? selectedSize.id : null,
            ...(isBuyNow && { action: 'buy_now' }),
        }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => {
                isBuyNow ? setBuyingNow(false) : setAddingToCart(false);
            }
        });
    };

    const isBusy = addingToCart || buyingNow;

    return (
        <Layout>
            <Head>
                <title>{`${product.name} | Premium Groceries`}</title>
                <style>{`
                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
            </Head>

            {/* Breadcrumbs */}
            <div className="bg-gray-50 py-2.5 sm:py-3 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap hide-scrollbar pb-1 sm:pb-0">
                        <Link href="/" className="hover:text-emerald-600 flex-shrink-0 transition-colors">Home</Link>
                        <span className="mx-2 flex-shrink-0">/</span>
                        <Link href="/products" className="hover:text-emerald-600 flex-shrink-0 transition-colors">Groceries</Link>
                        <span className="mx-2 flex-shrink-0">/</span>
                        {product.categories?.length > 0 && (
                            <>
                                <Link href={`/category/${product.categories[0].slug}`} className="hover:text-emerald-600 flex-shrink-0 transition-colors">
                                    {product.categories[0].name}
                                </Link>
                                <span className="mx-2 flex-shrink-0">/</span>
                            </>
                        )}
                        <span className="text-gray-800 font-medium truncate">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16">
                    
                    {/* LEFT: Image Gallery */}
                    <div className="lg:col-span-5">
                        <div className="space-y-3 sm:space-y-4 lg:sticky lg:top-24">
                            <div className="bg-gray-50 rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-10 relative">
                                {selectedImage ? (
                                    <img 
                                        key={selectedImage}
                                        src={`/storage/${selectedImage}`} 
                                        alt={product.name} 
                                        className="w-full h-full object-contain hover:scale-[1.03] transition-transform duration-500 mix-blend-multiply"
                                    />
                                ) : (
                                    <span className="text-gray-400">No Image Available</span>
                                )}
                            </div>

                            {(product.images?.length > 0 || product.thumbnail) && (
                                <div className="flex space-x-2 sm:space-x-3 overflow-x-auto py-2 hide-scrollbar snap-x">
                                    {product.thumbnail && (
                                        <button
                                            onClick={() => setSelectedImage(product.thumbnail)}
                                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 bg-gray-50 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === product.thumbnail ? 'border-emerald-500 shadow-sm' : 'border-transparent hover:border-emerald-300'}`}
                                        >
                                            <img src={`/storage/${product.thumbnail}`} alt="thumbnail" className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2" />
                                        </button>
                                    )}

                                    {product.images?.map((img) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setSelectedImage(img.image_path)}
                                            className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 xl:w-24 xl:h-24 bg-gray-50 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === img.image_path ? 'border-emerald-500 shadow-sm' : 'border-transparent hover:border-emerald-300'}`}
                                        >
                                            <img src={`/storage/${img.image_path}`} alt="gallery" className="w-full h-full object-contain mix-blend-multiply p-1 sm:p-2" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Product Details */}
                    <div className="lg:col-span-7 flex flex-col pt-2 lg:pt-0">
                        
                        <div className="mb-4 lg:mb-6">
                            {product.brand && (
                                <span className="text-emerald-600 font-semibold tracking-wider uppercase text-xs sm:text-sm mb-1.5 block">
                                    {product.brand.name}
                                </span>
                            )}
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight sm:leading-tight lg:leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        <div className="flex items-end flex-wrap gap-2 sm:gap-4 mb-5 lg:mb-6">
                            <span className="text-3xl sm:text-4xl xl:text-5xl font-bold text-gray-900 leading-none tracking-tight">
                                ৳{finalPrice.toLocaleString('en-IN')}
                            </span>
                            {product.discount_value > 0 && (
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-base sm:text-xl text-gray-400 line-through">
                                        ৳{basePrice.toLocaleString('en-IN')}
                                    </span>
                                    <span className="bg-red-100 text-red-700 text-xs sm:text-sm font-bold px-2 py-1.5 rounded-md">
                                        Save ৳{(basePrice - finalPrice).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            )}
                        </div>

                        <p className="text-gray-600 text-sm sm:text-base xl:text-lg mb-6 lg:mb-8 leading-relaxed">
                            {product.short_description || "Premium quality, fresh, and naturally sourced. Perfect for your daily nutritional needs and healthy lifestyle."}
                        </p>

                        <hr className="border-gray-100 mb-6 lg:mb-8" />

                        {uniqueSizes.length > 0 && (
                            <div className="mb-6 lg:mb-8">
                                <h3 className="text-sm font-medium text-gray-900 mb-3">Select Weight / Quantity</h3>
                                <div className="flex flex-wrap gap-2 sm:gap-3">
                                    {uniqueSizes.map((size) => (
                                        <button
                                            key={size.id}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 sm:px-6 py-2.5 min-h-[44px] rounded-xl border text-sm sm:text-base font-bold transition-colors ${
                                                selectedSize?.id === size.id
                                                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm'
                                                    : 'border-gray-200 text-gray-700 bg-white hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50/30'
                                            }`}
                                        >
                                            {size.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 w-full max-w-xl">
                            {/* Quantity Controller */}
                            <div className="flex items-center border-2 border-gray-100 bg-gray-50/50 rounded-xl h-[56px] sm:h-[60px] w-full sm:w-[150px] lg:w-[160px] shrink-0 overflow-hidden">
                                <button 
                                    onClick={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                                    disabled={isBusy}
                                    className="w-16 sm:w-14 h-full text-emerald-600 hover:bg-emerald-100/50 active:bg-emerald-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="flex-1 h-full flex items-center justify-center text-gray-900 font-bold text-lg sm:text-xl select-none">
                                    {quantity}
                                </span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)}
                                    disabled={isBusy}
                                    className="w-16 sm:w-14 h-full text-emerald-600 hover:bg-emerald-100/50 active:bg-emerald-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            {/* Dual Buttons */}
                            <div className="flex flex-row w-full flex-1 gap-2 sm:gap-3">
                                {/* Add to Cart Button */}
                                <button 
                                    onClick={(e) => submitToCart(e, false)}
                                    disabled={isBusy}
                                    className="flex-1 bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:border-emerald-300 disabled:text-emerald-400 h-[56px] sm:h-[60px] rounded-xl text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
                                >
                                    {addingToCart ? (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="whitespace-nowrap">Adding...</span>
                                        </span>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                            </svg>
                                            <span className="whitespace-nowrap">Add to Cart</span>
                                        </>
                                    )}
                                </button>

                                {/* Buy Now Button */}
                                <button 
                                    onClick={(e) => submitToCart(e, true)}
                                    disabled={isBusy}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white h-[56px] sm:h-[60px] rounded-xl text-sm sm:text-base lg:text-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98]"
                                >
                                    {buyingNow ? (
                                        <span className="flex items-center gap-1.5">
                                            <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span className="whitespace-nowrap">Loading...</span>
                                        </span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                            </svg>
                                            <span className="whitespace-nowrap">Buy Now</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm text-gray-600 mb-2 max-w-xl">
                            <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 p-3 sm:p-4 rounded-xl">
                                <div className="bg-emerald-100 text-emerald-600 p-2 sm:p-2.5 rounded-full shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">100% Authentic</p>
                                    <p className="text-xs sm:text-sm">Naturally Sourced</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 border border-gray-100 p-3 sm:p-4 rounded-xl">
                                <div className="bg-orange-100 text-orange-600 p-2 sm:p-2.5 rounded-full shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">Fast Delivery</p>
                                    <p className="text-xs sm:text-sm">Carefully Packed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 lg:mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 lg:p-10">
                    <h2 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900 mb-5 sm:mb-6 border-b border-gray-100 pb-4">
                        Product Information
                    </h2>
                    <div 
                        className="prose prose-sm sm:prose-base xl:prose-lg prose-emerald max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>

                {relatedProducts?.length > 0 && (
                    <div className="mt-16 lg:mt-24">
                        <div className="flex items-center justify-between mb-6 sm:mb-8">
                            <h2 className="text-xl sm:text-2xl xl:text-3xl font-bold text-gray-900">You Might Also Like</h2>
                            <Link href="/products" className="text-emerald-600 text-sm sm:text-base xl:text-lg font-bold hover:text-emerald-700 flex items-center transition-colors">
                                View all
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 ml-1">
                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                            {relatedProducts.map(relProduct => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}