// resources/js/Pages/Frontend/Products/ShowGadget.jsx
import { useState, useCallback, useMemo, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import ProductCard from '@/Components/ProductCard';
import ProductEngagementTracker from '@/Components/ProductEngagementTracker';
import Toast from '@/Components/Toast';
import SEO from '@/Components/SEO';
import useTranslation from '@/Hooks/useTranslation';
import { trackEvent } from '@/utils/analytics';

const Icons = {
  Home: <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  Shop: <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>,
  Cart: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>,
  Lightning: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  Spinner: <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>,
  ChevronUp: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>,
  ChevronDown: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
  Shield: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>,
  Chip: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>,
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
    <div ref={ref}>
      {visible ? (
        <div className="reveal"><ProductCard product={product} /></div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
          <div className="bg-gray-200 w-full h-40" />
          <div className="p-3 flex flex-col gap-2">
            <div className="bg-gray-200 h-3 w-4/5 rounded" />
            <div className="bg-gray-200 h-3 w-3/5 rounded" />
          </div>
        </div>
      )}
    </div>
  );
});

const GadgetTrustBadges = memo(() => {
  const { __ } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2 lg:gap-3 text-xs lg:text-sm text-gray-600 bg-slate-50 border border-slate-200 p-3 rounded-xl mt-4">
      {[
        { color: 'text-blue-600', bg: 'bg-blue-100', label: __('Official Warranty'), path: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z' },
        { color: 'text-violet-600', bg: 'bg-violet-100', label: __('Genuine Product'), path: 'M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z' },
        { color: 'text-sky-500', bg: 'bg-sky-100', label: __('Free Returns'), path: 'M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99' },
        { color: 'text-indigo-500', bg: 'bg-indigo-100', label: __('Secure Checkout'), path: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25-2.25v6.75a2.25 2.25 0 002.25 2.25z' },
      ].map(({ color, bg, label, path }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`${bg} p-1 rounded-full`}>
            <svg className={`w-3.5 h-3.5 ${color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
          </div>
          <span className="font-medium">{label}</span>
        </div>
      ))}
    </div>
  );
});

export default function ShowGadget({ product, relatedProducts = [] }) {
  const { __ } = useTranslation();
  const { auth, global_settings } = usePage().props;

  const [selectedImage, setSelectedImage] = useState(product?.thumbnail);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [processing, setProcessing] = useState(false);
  const [buyNowProcessing, setBuyNowProcessing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const thumbContainerRef = useRef(null);
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

  const totalImages = 1 + (product?.images?.length || 0);
  const showArrows = totalImages > 5;

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
        if (!isBuyNow) setToast({ show: true, message: __('Successfully added to cart!'), type: 'success' });
      },
      onError: () => setToast({ show: true, message: __('Error adding to cart. Please refresh the page and try again.'), type: 'error' }),
      onFinish: () => { inFlightRef.current = false; isBuyNow ? setBuyNowProcessing(false) : setProcessing(false); }
    });
  }, [product, quantity, selectedColor, selectedSize, __, finalPrice, selectedVariant, global_settings, auth]);

  const scrollThumbs = useCallback((dir) => {
    thumbContainerRef.current?.scrollBy({ top: dir === 'up' ? -124 : 124, behavior: 'smooth' });
  }, []);

  const incQty = useCallback(() => setQuantity(q => q + 1), []);
  const decQty = useCallback(() => setQuantity(q => Math.max(1, q - 1)), []);
  const isBusy = processing || buyNowProcessing;
  const discountPct = product.discount_value > 0 ? Math.round(((price - finalPrice) / price) * 100) : 0;

  return (
    <ThemeLayout>
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <ProductEngagementTracker productId={product.id} />

      <SEO title={product.name} description={product.short_description || product.description} image={product.thumbnail ? `/storage/${product.thumbnail}` : undefined} />

      <Head>
        {product.thumbnail && <link rel="preload" as="image" href={`/storage/${product.thumbnail}`} fetchpriority="high" />}
        <style>{`
          :root { --gadget-blue: #1d4ed8; --gadget-dark: #1e3a8a; --gadget-accent: #7c3aed; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .gadget-tab-active { color: var(--gadget-blue); border-bottom: 2px solid var(--gadget-blue); }
          .cv-section { content-visibility: auto; contain-intrinsic-size: 0 500px; }
          @keyframes reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          .reveal { animation: reveal .25s ease both; }
          .editor-content { white-space: pre-wrap; word-break: break-word; }
          .editor-content p { margin-bottom: 1.2em !important; display: block !important; }
          .editor-content h1 { font-size: 2em !important; font-weight: 700 !important; margin: 1em 0 0.5em 0 !important; color: #111827 !important; }
          .editor-content h2 { font-size: 1.5em !important; font-weight: 700 !important; margin: 1em 0 0.5em 0 !important; color: #111827 !important; }
          .editor-content ul { list-style-type: disc !important; padding-left: 2em !important; margin-bottom: 1.2em !important; }
          .editor-content ol { list-style-type: decimal !important; padding-left: 2em !important; margin-bottom: 1.2em !important; }
          .editor-content strong, .editor-content b { font-weight: 700 !important; color: #111827 !important; }
          .editor-content a { color: var(--gadget-blue) !important; text-decoration: underline !important; }
          .editor-content img { max-width: 100% !important; height: auto !important; border-radius: 0.5rem !important; margin: 1.2em 0 !important; }
          .gadget-spec-table tr { border-bottom: 1px solid #f1f5f9; }
          .gadget-spec-table td { padding: 10px 12px; font-size: 0.875rem; vertical-align: middle; }
          .gadget-spec-table td:first-child { color: #64748b; font-weight: 600; width: 40%; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
          .gadget-spec-table td:last-child { color: #111827; font-weight: 500; }
          .gadget-spec-table tr:nth-child(even) td { background: #f8fafc; }
        `}</style>
      </Head>

      {/* Breadcrumbs */}
      <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-4 lg:mb-6 py-2 border-b overflow-x-auto whitespace-nowrap hide-scrollbar">
        <div className="flex items-center flex-nowrap">
          <Link href={route('home')} className="flex items-center hover:text-blue-600 transition">{Icons.Home} {__('Home')}</Link>
          <span className="mx-2 flex-shrink-0">/</span>
          <Link href={route('shop')} className="flex items-center hover:text-blue-600 transition">{Icons.Shop} {__('Shop')}</Link>
          {product.categories?.map((cat) => (
            <span key={cat.id} className="flex items-center flex-nowrap">
              <span className="mx-2 flex-shrink-0">/</span>
              <Link href={route('shop', { category: cat.id })} className="hover:text-blue-600 transition">{cat.name}</Link>
            </span>
          ))}
          <span className="mx-2 flex-shrink-0">/</span>
          <span className="text-blue-700 font-medium truncate">{product.name}</span>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 mb-8 lg:mb-12">

        {/* Mobile Gallery */}
        <div className="lg:hidden flex flex-col gap-3">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-6 relative shadow-lg">
            {discountPct > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">-{discountPct}%</div>
            )}
            {product.stock_quantity === 0 && (
              <div className="absolute top-3 right-3 bg-gray-700 text-white text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</div>
            )}
            {selectedImage
              ? <img key={selectedImage} src={`/storage/${selectedImage}`} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" alt={product.name} loading="eager" fetchpriority="high" />
              : <span className="text-gray-400">{__('No Image Available')}</span>}
          </div>
          {(product.images && product.images.length > 0) && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x px-1">
              <button onClick={() => setSelectedImage(product.thumbnail)} className={`w-16 h-16 flex-shrink-0 bg-slate-100 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === product.thumbnail ? 'border-blue-600 shadow-md' : 'border-transparent'}`}>
                <img src={`/storage/${product.thumbnail}`} className="w-full h-full object-contain p-1.5" alt="Thumbnail" />
              </button>
              {product.images.map((img) => (
                <button key={img.id} onClick={() => setSelectedImage(img.image_path)} className={`w-16 h-16 flex-shrink-0 bg-slate-100 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === img.image_path ? 'border-blue-600 shadow-md' : 'border-transparent'}`}>
                  <img src={`/storage/${img.image_path}`} className="w-full h-full object-contain p-1.5" alt="Gallery" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Gallery — Col 1 (4 cols) */}
        <div className="hidden lg:flex lg:col-span-4 flex-row gap-4 h-fit lg:sticky lg:top-20 overflow-hidden">
          <div className="flex flex-col items-center flex-shrink-0 w-20 xl:w-24">
            {showArrows && <button onClick={() => scrollThumbs('up')} className="flex items-center justify-center w-full h-6 mb-1 text-gray-400 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-all">{Icons.ChevronUp}</button>}
            <div ref={thumbContainerRef} className="flex flex-col gap-2.5 overflow-y-auto w-full hide-scrollbar pb-0 snap-y" style={{ maxHeight: '484px' }}>
              <button onClick={() => setSelectedImage(product.thumbnail)} className={`w-full h-24 xl:h-28 flex-shrink-0 bg-slate-100 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === product.thumbnail ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                <img src={`/storage/${product.thumbnail}`} className="w-full h-full object-contain p-2" alt="Thumbnail" />
              </button>
              {product.images?.map((img) => (
                <button key={img.id} onClick={() => setSelectedImage(img.image_path)} className={`w-full h-24 xl:h-28 flex-shrink-0 bg-slate-100 rounded-xl border-2 overflow-hidden snap-start transition-all ${selectedImage === img.image_path ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-slate-300'}`}>
                  <img src={`/storage/${img.image_path}`} className="w-full h-full object-contain p-2" alt="Gallery" />
                </button>
              ))}
            </div>
            {showArrows && <button onClick={() => scrollThumbs('down')} className="flex items-center justify-center w-full h-6 mt-1 text-gray-400 hover:text-blue-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-all">{Icons.ChevronDown}</button>}
          </div>

          <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center p-6 relative shadow-xl">
            {discountPct > 0 && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">-{discountPct}%</div>
            )}
            {product.stock_quantity === 0 && (
              <div className="absolute top-4 right-4 bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</div>
            )}
            {selectedImage
              ? <img key={selectedImage} src={`/storage/${selectedImage}`} className="w-full h-full object-contain hover:scale-105 transition-transform duration-500" alt={product.name} loading="eager" fetchpriority="high" />
              : <span className="text-gray-400">{__('No Image Available')}</span>}
          </div>
        </div>

        {/* Product Info — Col 2 (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          {/* Brand + SKU */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.brand && (
              <span className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">{product.brand.name}</span>
            )}
            {product.sku && (
              <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">SKU: {product.sku}</span>
            )}
            {product.stock_quantity > 0
              ? <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2 py-1 rounded-full">✓ In Stock</span>
              : <span className="text-xs font-bold text-red-700 bg-red-100 border border-red-200 px-2 py-1 rounded-full">Out of Stock</span>
            }
          </div>

          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>

          {/* Price Block — Tech style */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl lg:text-4xl font-black text-blue-700">৳{finalPrice.toLocaleString('en-IN')}</span>
              {product.discount_value > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through mb-1">৳{price.toLocaleString('en-IN')}</span>
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded mb-1">-{discountPct}% OFF</span>
                </>
              )}
            </div>
            {product.discount_value > 0 && (
              <p className="text-xs text-blue-600 font-semibold mt-1.5">
                💰 {__('You save')} ৳{(price - finalPrice).toLocaleString('en-IN')} {__('on this item')}
              </p>
            )}
          </div>

          <p className="text-gray-600 text-sm lg:text-base leading-relaxed mb-4 lg:mb-5 editor-content">{product.short_description}</p>
          <hr className="mb-4 lg:mb-5 border-slate-200" />

          {/* Variants */}
          {hasVariants && (
            <div className="space-y-4 mb-5">
              {colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{__('Color')}: <span className="text-gray-500 font-normal">{colors.find(c => c.id === selectedColor)?.name}</span></h3>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map(color => (
                      <button key={color.id} onClick={() => handleColorChange(color.id)} title={color.name} className={`w-9 h-9 lg:w-10 lg:h-10 rounded-full border-2 focus:outline-none transition-all ${selectedColor === color.id ? 'border-blue-600 ring-2 ring-blue-200 ring-offset-2 scale-110' : 'border-transparent shadow-sm hover:scale-105'}`} style={{ backgroundColor: color.code || '#000' }} />
                    ))}
                  </div>
                </div>
              )}
              {availableSizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">{__('Storage / Variant')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                      <button key={size.id} onClick={() => setSelectedSize(size.id)} className={`min-w-[3.5rem] px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${selectedSize === size.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-800 border-slate-200 hover:border-blue-500 hover:text-blue-600'}`}>{size.name}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Qty + Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-5 w-full">
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl h-14 w-full sm:w-36 flex-shrink-0 overflow-hidden">
              <button onClick={decQty} disabled={isBusy} className="flex-1 flex items-center justify-center text-slate-600 hover:bg-slate-50 h-full transition-colors disabled:opacity-50 text-xl font-bold">−</button>
              <span className="font-black text-gray-900 text-lg w-10 text-center select-none">{quantity}</span>
              <button onClick={incQty} disabled={isBusy} className="flex-1 flex items-center justify-center text-slate-600 hover:bg-slate-50 h-full transition-colors disabled:opacity-50 text-xl font-bold">+</button>
            </div>

            <div className="flex gap-3 w-full flex-1">
              <button onClick={(e) => submitToCart(e, false)} disabled={isBusy} className="flex-1 bg-white text-blue-700 border-2 border-blue-600 rounded-xl font-bold h-14 hover:bg-blue-50 transition-all text-sm lg:text-base disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
                {processing ? Icons.Spinner : <>{Icons.Cart} <span>{__('Add To Cart')}</span></>}
              </button>
              <button onClick={(e) => submitToCart(e, true)} disabled={isBusy} className="flex-1 text-white rounded-xl font-bold h-14 transition-all shadow-lg text-sm lg:text-base disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)' }}>
                {buyNowProcessing ? <>{Icons.Spinner} {__('Loading...')}</> : <>{Icons.Lightning} <span>{__('Buy Now')}</span></>}
              </button>
            </div>
          </div>

          <GadgetTrustBadges />

          {/* Tabs */}
          <div className="mt-8 lg:mt-10 mb-2">
            <div className="flex gap-5 lg:gap-8 border-b border-gray-200 mb-5 lg:mb-6 overflow-x-auto hide-scrollbar">
              {[
                { id: 'details', label: __('Description') },
                { id: 'specs', label: __('Specifications') },
                { id: 'shipping', label: __('Shipping & Returns') }
              ].map(({ id, label }) => (
                <button key={id} onClick={() => setActiveTab(id)} className={`pb-2.5 lg:pb-3 text-sm lg:text-base font-semibold whitespace-nowrap transition-colors ${activeTab === id ? 'gadget-tab-active' : 'text-gray-500 hover:text-blue-600'}`}>{label}</button>
              ))}
            </div>
            <div className="text-gray-600 text-sm lg:text-base">
              {activeTab === 'details' && (product.description ? <div className="editor-content" dangerouslySetInnerHTML={{ __html: product.description }} /> : <p>{__('No detailed description provided.')}</p>)}
              {activeTab === 'specs' && (
                <table className="gadget-spec-table w-full border-collapse">
                  <tbody>
                    {product.brand && <tr><td>{__('Brand')}</td><td>{product.brand.name}</td></tr>}
                    {product.sku && <tr><td>{__('SKU')}</td><td className="font-mono">{product.sku}</td></tr>}
                    {product.categories?.length > 0 && <tr><td>{__('Category')}</td><td>{product.categories.map(c => c.name).join(', ')}</td></tr>}
                    {product.weight && <tr><td>{__('Weight')}</td><td>{product.weight} kg</td></tr>}
                    {availableSizes.length > 0 && <tr><td>{__('Available Variants')}</td><td>{availableSizes.map(s => s.name).join(', ')}</td></tr>}
                    {colors.length > 0 && <tr><td>{__('Available Colors')}</td><td>{colors.map(c => c.name).join(', ')}</td></tr>}
                  </tbody>
                </table>
              )}
              {activeTab === 'shipping' && <p>{__('We offer standard and express shipping. Items are carefully packaged. Returns accepted within 7 days for electronics (unopened).')}</p>}
            </div>
          </div>
        </div>

        {/* Sidebar — Col 3 (3 cols, desktop only) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col">
          <div className="lg:sticky lg:top-20 bg-slate-50 border border-slate-200 rounded-2xl p-4 lg:p-5 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-4 border-b border-slate-200 pb-2 flex items-center gap-2">
              <span className="text-blue-600">{Icons.Chip}</span> {__('Related Products')}
            </h3>
            <div className="flex flex-col gap-3">
              {relatedProducts?.length > 0 ? relatedProducts.slice(0, 5).map(rel => {
                const relBase = parseFloat(rel.price);
                let relFinal = relBase;
                if (rel.discount_value > 0) relFinal = rel.discount_type === 'percent' ? relBase - (relBase * rel.discount_value / 100) : relBase - rel.discount_value;
                return (
                  <Link key={rel.id} href={route('product.show', rel.slug)} className="flex gap-3 group bg-white p-2 rounded-xl border border-transparent hover:border-slate-300 hover:shadow-sm transition-all">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      <img src={`/storage/${rel.thumbnail}`} alt={rel.name} className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{rel.name}</h4>
                      <div className="mt-1 font-bold text-blue-700 text-sm">৳{relFinal.toLocaleString('en-IN')}</div>
                      {rel.discount_value > 0 && <div className="text-xs text-gray-400 line-through">৳{relBase.toLocaleString('en-IN')}</div>}
                    </div>
                  </Link>
                );
              }) : <p className="text-xs text-gray-400 italic text-center py-4">{__('No recommendations available.')}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts?.length > 0 && (
        <section className="mb-8 lg:mb-12 cv-section">
          <h2 className="text-xl lg:text-2xl font-black text-gray-900 mb-4 lg:mb-6 border-b border-slate-200 pb-2 lg:pb-3">{__('You might also like')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5">
            {relatedProducts.map(rel => <LazyProductCard key={rel.id} product={rel} />)}
          </div>
        </section>
      )}
    </ThemeLayout>
  );
}