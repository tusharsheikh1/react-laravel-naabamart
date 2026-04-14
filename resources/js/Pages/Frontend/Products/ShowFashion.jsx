// resources/js/Pages/Frontend/Products/ShowFashion.jsx
import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import ProductCardGadget from '@/Components/ProductCard/ProductCardGadget';
import ProductEngagementTracker from '@/Components/ProductEngagementTracker';
import Toast from '@/Components/Toast';
import SEO from '@/Components/SEO';
import useTranslation from '@/Hooks/useTranslation';
import { trackEvent } from '@/utils/analytics';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80";

const Icons = {
  Home: <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  Shop: <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  Spinner: <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>,
};

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); }
    }, { rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, visible];
}

const LazyProductCard = memo(({ product }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="h-full">
      {visible ? (
        <div className="reveal h-full">
            {/* Swapped to use the beautiful Gadget/Fashion Product Card */}
            <ProductCardGadget product={product} />
        </div>
      ) : (
        <div className="bg-white rounded-none overflow-hidden animate-pulse border border-gray-100 h-full">
          <div className="bg-gray-100 w-full aspect-[3/4]" />
          <div className="p-3 flex flex-col items-center gap-2 mt-2">
            <div className="bg-gray-200 h-3 w-3/5 rounded" />
            <div className="bg-gray-200 h-3 w-2/5 rounded" />
          </div>
        </div>
      )}
    </div>
  );
});

const MinimalistTrustBadges = memo(() => {
  const { __ } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-8 border-t border-gray-200 pt-6">
      {[
        { label: __('Free Standard Returns'), path: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
        { label: __('Guaranteed Authenticity'), path: 'M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z' },
        { label: __('Express Shipping Available'), path: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' },
        { label: __('Secure Checkout'), path: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z' },
      ].map(({ label, path }) => (
        <div key={label} className="flex items-center gap-2">
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
          </svg>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
});

export default function ShowFashion({ product, relatedProducts = [] }) {
  const { __ } = useTranslation();
  const { auth, global_settings } = usePage().props;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [processing, setProcessing] = useState(false);
  const [buyNowProcessing, setBuyNowProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const inFlightRef = useRef(false);
  const viewTrackedRef = useRef(false);

  const hasVariants = product?.has_variants && Array.isArray(product.variants);

  const colors = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Map(product.variants.map(v => [v.color?.id, v.color])).values()].filter(Boolean);
  }, [hasVariants, product.variants]);

  const [selectedColor, setSelectedColor] = useState(() => colors.length > 0 ? colors[0].id : null);

  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Map(
      product.variants
        .filter(v => !selectedColor || v.color_id === selectedColor)
        .map(v => [v.size?.id, v.size])
    ).values()].filter(Boolean);
  }, [hasVariants, product.variants, selectedColor]);

  const [selectedSize, setSelectedSize] = useState(() => availableSizes.length > 0 ? availableSizes[0].id : null);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants.find(v =>
      (v.color_id === selectedColor || (!v.color_id && !selectedColor)) &&
      (v.size_id === selectedSize || (!v.size_id && !selectedSize))
    );
  }, [hasVariants, product.variants, selectedColor, selectedSize]);

  const { price, finalPrice } = useMemo(() => {
    const variantExtra = selectedVariant?.price_adjustment ? parseFloat(selectedVariant.price_adjustment) : 0;
    const base = parseFloat(product?.price || 0);
    const p = base + variantExtra;
    let fp = p;
    if (product?.discount_value > 0) {
      fp = product.discount_type === 'percent'
        ? p - (p * parseFloat(product.discount_value) / 100)
        : p - parseFloat(product.discount_value);
    }
    return { price: p, finalPrice: fp };
  }, [selectedVariant, product?.price, product?.discount_value, product?.discount_type]);

  useEffect(() => {
    if (product?.id && !viewTrackedRef.current) {
      axios.post(route('analytics.track'), { product_id: product.id, event_type: 'view' }).catch(() => {});
      if (global_settings?.enable_meta_tracking !== '0') {
        trackEvent('view_item', {
          currency: 'BDT', value: finalPrice,
          items: [{ item_id: product.sku || product.id.toString(), item_name: product.name, price: finalPrice, quantity: 1, item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized' }]
        }, { em: auth?.user?.email || '', ph: auth?.user?.phone || '' });
      }
      viewTrackedRef.current = true;
    }
  }, [product, finalPrice, global_settings, auth]);

  const handleColorChange = useCallback((colorId) => {
    setSelectedColor(colorId);
    const newSizes = [...new Map(product.variants.filter(v => v.color_id === colorId).map(v => [v.size?.id, v.size])).values()].filter(Boolean);
    setSelectedSize(prev => newSizes.some(s => s.id === prev) ? prev : (newSizes[0]?.id ?? null));
  }, [product.variants]);

  const submitToCart = useCallback((e, isBuyNow = false) => {
    if (e && e.preventDefault) e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    if (global_settings?.enable_meta_tracking !== '0') {
      trackEvent('add_to_cart', {
        currency: 'BDT', value: finalPrice * quantity,
        items: [{ item_id: product.sku || product.id.toString(), item_name: product.name, price: finalPrice, quantity, item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized', item_variant: selectedVariant ? `${selectedVariant.color?.name || ''} ${selectedVariant.size?.name || ''}`.trim() : undefined }]
      }, { em: auth?.user?.email || '', ph: auth?.user?.phone || '' });
    }

    isBuyNow ? setBuyNowProcessing(true) : setProcessing(true);

    router.post(route('cart.add'), {
      product_id: product.id, quantity,
      color_id: selectedColor, size_id: selectedSize,
      ...(isBuyNow && { action: 'buy_now' }),
    }, {
      preserveScroll: true, preserveState: !isBuyNow,
      onSuccess: () => {
        axios.post(route('analytics.track'), { product_id: product.id, event_type: 'add_to_cart', metadata: { quantity, color_id: selectedColor, size_id: selectedSize } }).catch(() => {});
        if (!isBuyNow) setToast({ show: true, message: __('Added to bag'), type: 'success' });
      },
      onError: () => setToast({ show: true, message: __('Error adding to bag. Please try again.'), type: 'error' }),
      onFinish: () => { inFlightRef.current = false; isBuyNow ? setBuyNowProcessing(false) : setProcessing(false); }
    });
  }, [product, quantity, selectedColor, selectedSize, __, finalPrice, selectedVariant, global_settings, auth]);

  const incQty = useCallback(() => setQuantity(q => q + 1), []);
  const decQty = useCallback(() => setQuantity(q => Math.max(1, q - 1)), []);
  const isBusy = processing || buyNowProcessing;
  const discountPct = product.discount_value > 0 ? Math.round(((price - finalPrice) / price) * 100) : 0;

  // Gather all images (thumbnail first, then gallery)
  const allImages = useMemo(() => {
    const imgs = [];
    if (product?.thumbnail) imgs.push(product.thumbnail);
    if (product?.images?.length) imgs.push(...product.images.map(i => i.image_path));
    return imgs.length > 0 ? imgs : [null]; 
  }, [product]);

  const getImageUrl = (path) => path ? (path.startsWith('http') ? path : `/storage/${path}`) : FALLBACK_IMAGE;

  return (
    <ThemeLayout>
      {/* GLOBAL FULL-WIDTH WRAPPER: Enforces strict white background */}
      <div className="w-full bg-white min-h-screen">
        
        {/* CONTAINER BOUNDARY */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 font-sans text-gray-900 selection:bg-black selection:text-white">
          
          <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
          <ProductEngagementTracker productId={product.id} />

          <SEO title={product.name} description={product.short_description || product.description} image={product.thumbnail ? `/storage/${product.thumbnail}` : undefined} />

          <Head>
            {product.thumbnail && <link rel="preload" as="image" href={`/storage/${product.thumbnail}`} fetchpriority="high" />}
            <style>{`
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
              .fashion-tab-active { color: #000; border-bottom: 2px solid #000; font-weight: 600; }
              .cv-section { content-visibility: auto; contain-intrinsic-size: 0 500px; }
              @keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
              .reveal { animation: reveal .4s ease both; }
              
              /* Editorial text formatting */
              .editor-content { white-space: pre-wrap; word-break: break-word; color: #4b5563; font-size: 0.9rem; line-height: 1.7; }
              .editor-content p { margin-bottom: 1.5em !important; display: block !important; }
              .editor-content strong { font-weight: 600 !important; color: #000; }
              .editor-content ul { list-style-type: disc !important; padding-left: 1.5em !important; margin-bottom: 1.5em !important; }
            `}</style>
          </Head>

          {/* Minimalist Breadcrumbs */}
          <nav className="flex justify-start md:justify-center items-center text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mb-6 lg:mb-10 py-4 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <div className="flex items-center flex-nowrap">
              <Link href={route('home')} className="hover:text-black transition">{__('Home')}</Link>
              <span className="mx-3 flex-shrink-0">/</span>
              <Link href={route('shop')} className="hover:text-black transition">{__('Shop')}</Link>
              {product.categories?.map((cat) => (
                <span key={cat.id} className="flex items-center flex-nowrap">
                  <span className="mx-3 flex-shrink-0">/</span>
                  <Link href={route('shop', { category: cat.id })} className="hover:text-black transition">{cat.name}</Link>
                </span>
              ))}
              <span className="mx-3 flex-shrink-0">/</span>
              <span className="text-black font-semibold truncate">{product.name}</span>
            </div>
          </nav>

          {/* Main High-End Layout (2 Columns on Desktop) */}
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-16 lg:mb-24">

            {/* LEFT COLUMN: Image Grids */}
            <div className="w-full lg:w-[60%]">
                
                {/* Mobile Swipe Gallery */}
                <div className="lg:hidden flex overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 sm:-mx-6 px-4 sm:px-6 gap-2 pb-4">
                    {allImages.map((imgPath, idx) => (
                        <div key={idx} className="w-full flex-shrink-0 snap-center aspect-[4/5] sm:aspect-[3/4] bg-gray-50 relative">
                            <img 
                                src={getImageUrl(imgPath)} 
                                className="w-full h-full object-cover object-center" 
                                alt={`${product.name} - View ${idx + 1}`} 
                                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                loading={idx === 0 ? "eager" : "lazy"} 
                            />
                            {discountPct > 0 && idx === 0 && (
                                <div className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold shadow-sm">
                                    Sale {discountPct}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Desktop Masonry/Grid Gallery */}
                <div className="hidden lg:grid grid-cols-2 gap-4">
                    {allImages.map((imgPath, idx) => (
                        <div key={idx} className={`bg-gray-50 relative group ${idx === 0 && allImages.length % 2 !== 0 ? 'col-span-2 aspect-[4/5]' : 'aspect-[3/4]'}`}>
                            <img 
                                src={getImageUrl(imgPath)} 
                                className="w-full h-full object-cover object-center" 
                                alt={`${product.name} - View ${idx + 1}`} 
                                onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                loading={idx < 2 ? "eager" : "lazy"} 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500 pointer-events-none" />
                            
                            {discountPct > 0 && idx === 0 && (
                                <div className="absolute top-4 left-4 bg-black text-white text-[10px] uppercase tracking-widest px-3 py-1 font-bold shadow-sm">
                                    Sale {discountPct}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: Sticky Product Information */}
            <div className="w-full lg:w-[40%]">
              <div className="sticky top-24 pr-2">
                
                {/* Brand */}
                {product.brand && (
                    <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 font-semibold">
                        {product.brand.name}
                    </div>
                )}

                {/* Title */}
                <h1 className="text-2xl lg:text-3xl font-serif text-black leading-tight mb-4 tracking-wide">
                    {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-lg lg:text-xl font-medium text-black">৳{finalPrice.toLocaleString('en-IN')}</span>
                  {product.discount_value > 0 && (
                    <span className="text-sm text-gray-400 line-through">৳{price.toLocaleString('en-IN')}</span>
                  )}
                </div>

                {/* Short Description */}
                {product.short_description && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-8">
                        {product.short_description}
                    </p>
                )}

                {/* Color Swatches */}
                {hasVariants && colors.length > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs uppercase tracking-widest text-gray-900 font-bold">{__('Color')}</span>
                        <span className="text-xs text-gray-500">{colors.find(c => c.id === selectedColor)?.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colors.map(color => (
                        <button 
                            key={color.id} 
                            onClick={() => handleColorChange(color.id)} 
                            title={color.name} 
                            className={`w-7 h-7 rounded-full transition-all ${selectedColor === color.id ? 'ring-1 ring-black ring-offset-2' : 'border border-gray-300 hover:border-gray-500'}`} 
                            style={{ backgroundColor: color.code || '#000' }} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {hasVariants && availableSizes.length > 0 && (
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs uppercase tracking-widest text-gray-900 font-bold">{__('Size')}</span>
                        <button className="text-[10px] uppercase tracking-widest text-gray-500 underline hover:text-black transition-colors">{__('Size Guide')}</button>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {availableSizes.map(size => (
                        <button 
                            key={size.id} 
                            onClick={() => setSelectedSize(size.id)} 
                            className={`h-10 flex items-center justify-center text-xs tracking-widest uppercase transition-all ${selectedSize === size.id ? 'bg-black text-white border border-black' : 'bg-transparent text-gray-800 border border-gray-300 hover:border-black'}`}
                        >
                            {size.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PERFECTED ACTION BUTTONS (ADD TO BAG / BUY NOW) */}
                <div className="flex flex-col gap-3 mb-8">
                  
                  {/* Row: Quantity Selector + Add to Bag (Always side-by-side on all screens) */}
                  <div className="flex gap-3 h-12 w-full">
                      {/* QTY Box */}
                      <div className="flex items-center border border-gray-300 w-24 sm:w-28 flex-shrink-0 bg-white">
                        <button onClick={decQty} disabled={isBusy} className="flex-1 text-gray-500 hover:text-black transition-colors h-full flex items-center justify-center">−</button>
                        <span className="font-medium text-sm text-center w-8">{quantity}</span>
                        <button onClick={incQty} disabled={isBusy} className="flex-1 text-gray-500 hover:text-black transition-colors h-full flex items-center justify-center">+</button>
                      </div>

                      {/* Add to Bag Button */}
                      <button 
                        onClick={(e) => submitToCart(e, false)} 
                        disabled={isBusy || product.stock_quantity <= 0} 
                        className="flex-1 bg-white text-black border border-black text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold hover:bg-black hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {processing ? Icons.Spinner : (product.stock_quantity > 0 ? __('Add to Bag') : __('Out of Stock'))}
                      </button>
                  </div>

                  {/* Buy Now Button (Always full width stacked below) */}
                  <button 
                    onClick={(e) => submitToCart(e, true)} 
                    disabled={isBusy || product.stock_quantity <= 0} 
                    className="w-full bg-black text-white border border-black text-[11px] sm:text-xs uppercase tracking-[0.2em] font-bold h-12 hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    {buyNowProcessing ? Icons.Spinner : __('Buy Now')}
                  </button>
                </div>

                <MinimalistTrustBadges />

                {/* Clean Accordion/Tabs for Details */}
                <div className="mt-10 border-t border-gray-200">
                  <div className="flex gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
                    {[
                      { id: 'details', label: __('Details') },
                      { id: 'care', label: __('Care') },
                      { id: 'shipping', label: __('Delivery') }
                    ].map(({ id, label }) => (
                      <button 
                        key={id} 
                        onClick={() => setActiveTab(id)} 
                        className={`py-4 text-[11px] uppercase tracking-[0.15em] transition-colors ${activeTab === id ? 'fashion-tab-active' : 'text-gray-400 hover:text-black'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="pt-6 pb-4">
                    {activeTab === 'details' && (product.description ? <div className="editor-content" dangerouslySetInnerHTML={{ __html: product.description }} /> : <p className="text-sm text-gray-500">{__('No detailed description provided.')}</p>)}
                    {activeTab === 'care' && <p className="text-sm text-gray-500">{__('Machine wash cold. Do not tumble dry. Iron on low heat.')}</p>}
                    {activeTab === 'shipping' && <p className="text-sm text-gray-500">{__('Standard delivery within 3-5 business days. Free returns available within 14 days of purchase. Items must be in original condition.')}</p>}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Complete The Look & Related Products (Unified Bottom Grid using Gadget Cards) */}
          {relatedProducts?.length > 0 && (
            <section className="mb-16 lg:mb-24 cv-section border-t border-gray-200 pt-16">
              <div className="flex flex-col items-center justify-center mb-10 px-4">
                  <h2 className="text-xl md:text-2xl font-serif tracking-[0.15em] text-black uppercase text-center">
                      {__('Complete The Look')}
                  </h2>
                  <div className="mt-4 h-[1px] w-12 bg-black" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10">
                {relatedProducts.slice(0, 10).map(rel => <LazyProductCard key={rel.id} product={rel} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </ThemeLayout>
  );
}