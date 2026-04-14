// resources/js/Pages/Frontend/Products/ShowFood.jsx
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

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D';

/* ─── Styles ─────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

  .sf-root * { box-sizing: border-box; }
  .sf-root {
    font-family: 'Hind Siliguri', 'Plus Jakarta Sans', sans-serif;
    color: #1a1a1a;
  }

  .sf-hide-scroll::-webkit-scrollbar { display: none; }
  .sf-hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

  .sf-thumb-btn { transition: border-color .15s, box-shadow .15s; }
  .sf-thumb-btn.active { border-color: #f97316; box-shadow: 0 0 0 2px rgba(249,115,22,.2); }

  @keyframes sf-img-fade { from { opacity:0; transform:scale(.98); } to { opacity:1; transform:scale(1); } }
  .sf-img-fade { animation: sf-img-fade .25s ease both; }

  .sf-tab-active { color: #f97316; border-bottom: 2px solid #f97316; }

  /* ─── PREMIUM ACTION BUTTONS ─── */
  .sf-btn-cart, .sf-btn-buy, .sf-btn-wa, .sf-btn-call {
    position: relative;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
  
  /* Hover state: lift up, increase shadow, slightly brighten */
  .sf-btn-cart:hover:not(:disabled), .sf-btn-buy:hover:not(:disabled), 
  .sf-btn-wa:hover:not(:disabled), .sf-btn-call:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    filter: brightness(1.05);
  }

  /* Active/Click state: push down, shrink shadow */
  .sf-btn-cart:active:not(:disabled), .sf-btn-buy:active:not(:disabled), 
  .sf-btn-wa:active:not(:disabled), .sf-btn-call:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  }

  /* Hover "Shine" Animation for Cart & Buy buttons */
  .sf-btn-cart::after, .sf-btn-buy::after {
    content: '';
    position: absolute;
    top: 0; left: -100%;
    width: 50%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
    transform: skewX(-25deg);
    transition: all 0.6s ease-in-out;
  }
  .sf-btn-cart:hover:not(:disabled)::after, .sf-btn-buy:hover:not(:disabled)::after {
    left: 150%;
  }

  /* Specific Colors with Gradients */
  .sf-btn-cart       { background: linear-gradient(135deg, #fba15a, #f97316); }
  .sf-btn-buy        { background: linear-gradient(135deg, #1b3d38, #01201d); text-shadow: 0 1px 2px rgba(0,0,0,0.3); }
  .sf-btn-wa         { background: linear-gradient(135deg, #4ade80, #25d366); }
  .sf-btn-call       { background: linear-gradient(135deg, #60a5fa, #2563eb); }

  /* ────────────────────────────────────── */

  .sf-qty-btn { transition: background .15s; }
  .sf-qty-btn:hover { background: #fff7ed; }

  .sf-side-item { transition: background .15s; }
  .sf-side-item:hover { background: #fff8f3; }

  .sf-star-filled { color: #f97316; }
  .sf-star-empty  { color: #d1d5db; }
`;

/* ─── Icon components ────────────────────────────────────────── */
const Spinner = () => (
  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);
const CartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
  </svg>
);
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"/>
  </svg>
);
const WaIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

function StarRow({ filled = 0, count = 5, size = 'w-4 h-4' }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className={`${size} ${i < filled ? 'sf-star-filled' : 'sf-star-empty'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </span>
  );
}

/* ─── Lazy card ──────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); io.unobserve(el); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

const LazyProductCard = memo(({ product }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className="min-h-[240px]">
      {visible
        ? <ProductCard product={product} />
        : <div className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
            <div className="bg-gray-200 w-full h-40"/>
            <div className="p-3 space-y-2">
              <div className="bg-gray-200 h-3 w-4/5 rounded"/>
              <div className="bg-gray-200 h-3 w-3/5 rounded"/>
            </div>
          </div>
      }
    </div>
  );
});

/* ─── Sidebar item ───────────────────────────────────────────── */
function SidebarItem({ rel }) {
  const base = parseFloat(rel.price);
  let final = base;
  if (rel.discount_value > 0)
    final = rel.discount_type === 'percent' ? base - (base * rel.discount_value / 100) : base - rel.discount_value;
  return (
    <Link href={route('product.show', rel.slug)} className="sf-side-item flex gap-2.5 px-3 py-2.5">
      <div className="w-14 h-14 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex items-center justify-center">
        <img 
          src={rel.thumbnail ? `/storage/${rel.thumbnail}` : FALLBACK_IMAGE} 
          onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
          alt={rel.name} 
          className="w-full h-full object-contain p-1" 
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{rel.name}</p>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-orange-500">৳{Math.round(final).toLocaleString('en-IN')}</span>
          {rel.discount_value > 0 && <span className="text-xs text-gray-400 line-through">৳{base.toLocaleString('en-IN')}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ShowFood({ product, relatedProducts = [] }) {
  const { __ } = useTranslation();
  const { auth, global_settings } = usePage().props;

  const [selectedImage, setSelectedImage] = useState(product?.thumbnail);
  const [quantity, setQuantity]           = useState(1);
  const [activeTab, setActiveTab]         = useState('description');
  const [processing, setProcessing]       = useState(false);
  const [buyNowProcessing, setBuyNow]     = useState(false);
  const [toast, setToast]                 = useState({ show: false, message: '', type: 'success' });
  const [sidebarPage, setSidebarPage]     = useState(0);
  const SIDEBAR_PAGE = 6;

  const inFlightRef    = useRef(false);
  const viewTrackedRef = useRef(false);

  /* ── Variants ── */
  const hasVariants = product?.has_variants && Array.isArray(product.variants);

  // Safely extract colors checking for non-null entities to prevent rendering bugs
  const colors = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Map(product.variants.filter(v => v.color).map(v => [v.color.id, v.color])).values()];
  }, [hasVariants, product.variants]);

  const [selectedColor, setSelectedColor] = useState(() => colors[0]?.id ?? null);

  // Safely extract available sizes relative to selected color
  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    return [...new Map(
      product.variants
        .filter(v => (!selectedColor || v.color_id === selectedColor) && v.size)
        .map(v => [v.size.id, v.size])
    ).values()];
  }, [hasVariants, product.variants, selectedColor]);

  const [selectedSize, setSelectedSize] = useState(() => availableSizes[0]?.id ?? null);

  const selectedVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants.find(v =>
      (v.color_id === selectedColor || (!v.color_id && !selectedColor)) &&
      (v.size_id === selectedSize   || (!v.size_id  && !selectedSize))
    );
  }, [hasVariants, product.variants, selectedColor, selectedSize]);

  /* ── Pricing ── */
  const { price, finalPrice } = useMemo(() => {
    const extra = selectedVariant?.price_adjustment ? parseFloat(selectedVariant.price_adjustment) : 0;
    const p  = parseFloat(product?.price || 0) + extra;
    let   fp = p;
    if (product?.discount_value > 0)
      fp = product.discount_type === 'percent'
        ? p - (p * product.discount_value / 100)
        : p - product.discount_value;
    return { price: p, finalPrice: fp };
  }, [selectedVariant, product?.price, product?.discount_value, product?.discount_type]);

  const discountPercent = price > finalPrice ? Math.round(((price - finalPrice) / price) * 100) : 0;

  /* ── Analytics view ── */
  useEffect(() => {
    if (product?.id && !viewTrackedRef.current) {
      axios.post(route('analytics.track'), { product_id: product.id, event_type: 'view' }).catch(() => {});
      if (global_settings?.enable_meta_tracking !== '0') {
        trackEvent('view_item', {
          currency: 'BDT', value: finalPrice,
          items: [{ item_id: product.sku || String(product.id), item_name: product.name, price: finalPrice, quantity: 1, item_category: product.categories?.[0]?.name || 'Uncategorized' }],
        }, { em: auth?.user?.email || '', ph: auth?.user?.phone || '' });
      }
      viewTrackedRef.current = true;
    }
  }, [product, finalPrice, global_settings, auth]);

  /* ── Color change ── */
  const handleColorChange = useCallback((colorId) => {
    setSelectedColor(colorId);
    const sizes = [...new Map(product.variants.filter(v => v.color_id === colorId && v.size).map(v => [v.size.id, v.size])).values()];
    setSelectedSize(p => sizes.some(s => s.id === p) ? p : sizes[0]?.id ?? null);
  }, [product.variants]);

  /* ── Add to cart ── */
  const submitToCart = useCallback((e, isBuyNow = false) => {
    if (e?.preventDefault) e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    if (global_settings?.enable_meta_tracking !== '0') {
      trackEvent('add_to_cart', { currency: 'BDT', value: finalPrice * quantity, items: [{ item_id: product.sku || String(product.id), item_name: product.name, price: finalPrice, quantity }] }, { em: auth?.user?.email || '', ph: auth?.user?.phone || '' });
    }
    isBuyNow ? setBuyNow(true) : setProcessing(true);
    router.post(route('cart.add'), {
      product_id: product.id, quantity,
      color_id: selectedColor, size_id: selectedSize,
      ...(isBuyNow && { action: 'buy_now' }),
    }, {
      preserveScroll: true, preserveState: !isBuyNow,
      onSuccess: () => {
        axios.post(route('analytics.track'), { product_id: product.id, event_type: 'add_to_cart', metadata: { quantity } }).catch(() => {});
        if (!isBuyNow) setToast({ show: true, message: __('Successfully added to cart!'), type: 'success' });
      },
      onError:  () => setToast({ show: true, message: __('Error adding to cart. Please try again.'), type: 'error' }),
      onFinish: () => { inFlightRef.current = false; isBuyNow ? setBuyNow(false) : setProcessing(false); },
    });
  }, [product, quantity, selectedColor, selectedSize, __, finalPrice, global_settings, auth]);

  const isBusy = processing || buyNowProcessing;

  /* ── WhatsApp formatted text and link generation ── */
  const waNumber    = global_settings?.floating_whatsapp || '';
  const phoneNumber = global_settings?.floating_phone || global_settings?.site_phone || '';
  
  const waTextRaw = useMemo(() => {
    let text = `Hi, I want to order:\nProduct: ${product?.name}`;
    
    // Check and append active variants
    const activeColor = colors.find(c => c.id === selectedColor);
    if (activeColor) text += `\nColor: ${activeColor.name}`;
    
    const activeSize = availableSizes.find(s => s.id === selectedSize);
    if (activeSize) text += `\nSize/Weight: ${activeSize.name}`;
    
    text += `\nQty: ${quantity}`;
    
    // Breakdown price
    if (discountPercent > 0) {
      text += `\nRegular Price: ৳${Math.round(price * quantity).toLocaleString('en-IN')}`;
      text += `\nDiscounted Price: ৳${Math.round(finalPrice * quantity).toLocaleString('en-IN')}`;
    } else {
      text += `\nPrice: ৳${Math.round(finalPrice * quantity).toLocaleString('en-IN')}`;
    }
    return text;
  }, [product, colors, selectedColor, availableSizes, selectedSize, quantity, discountPercent, price, finalPrice]);

  const waHref = waNumber ? `https://wa.me/${waNumber}?text=${encodeURIComponent(waTextRaw)}` : '#';

  /* ── Gallery ── */
  const allImages = [product?.thumbnail, ...(product?.images?.map(i => i.image_path) || [])].filter(Boolean);
  const imgIndex  = allImages.indexOf(selectedImage);

  /* ── Sidebar pages ── */
  const totalPages   = Math.ceil(relatedProducts.length / SIDEBAR_PAGE);
  const sidebarItems = relatedProducts.slice(sidebarPage * SIDEBAR_PAGE, (sidebarPage + 1) * SIDEBAR_PAGE);

  return (
    <ThemeLayout>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Toast show={toast.show} message={toast.message} type={toast.type} onClose={() => setToast(t => ({ ...t, show: false }))} />
      <ProductEngagementTracker productId={product.id} />
      <SEO 
        title={product.name} 
        description={product.short_description || product.description} 
        image={product.thumbnail ? `/storage/${product.thumbnail}` : FALLBACK_IMAGE} 
      />
      <Head>
        {product.thumbnail && <link rel="preload" as="image" href={`/storage/${product.thumbnail}`} fetchpriority="high" />}
      </Head>

      {/* ── Outer wrapper — mirrors FoodLayout max-w-7xl exactly ── */}
      <div className="sf-root max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-5">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-3 sf-hide-scroll whitespace-nowrap overflow-x-auto">
          <Link href={route('home')} className="hover:text-orange-500 transition-colors">Home</Link>
          <span className="mx-1.5 text-gray-300">›</span>
          <Link href={route('shop')} className="hover:text-orange-500 transition-colors">Products</Link>
          {product.categories?.map(cat => (
            <span key={cat.id} className="flex items-center">
              <span className="mx-1.5 text-gray-300">›</span>
              <Link href={route('shop', { category: cat.id })} className="hover:text-orange-500 transition-colors">{cat.name}</Link>
            </span>
          ))}
        </nav>

        {/* ════════════════════════════════════════
            MAIN GRID
            Mobile:  stacked
            Desktop: 5 | 4 | 3 cols
        ════════════════════════════════════════ */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6">

          {/* ── GALLERY (col 1-5) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 lg:h-fit">
            <div className="flex gap-2 sm:gap-3">

              {/* Vertical thumb strip — same on mobile & desktop */}
              <div className="flex flex-col gap-1.5 flex-shrink-0 sf-hide-scroll overflow-y-auto" style={{ width: '62px', maxHeight: '400px' }}>
                {allImages.length > 0 ? allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`sf-thumb-btn w-full aspect-square rounded-lg border-2 bg-white overflow-hidden flex items-center justify-center flex-shrink-0 ${selectedImage === img ? 'active' : 'border-gray-200'}`}
                  >
                    <img 
                      src={img ? `/storage/${img}` : FALLBACK_IMAGE} 
                      onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                      className="w-full h-full object-contain p-0.5" 
                      alt="" 
                      loading="lazy"
                    />
                  </button>
                )) : (
                  <button className="sf-thumb-btn active w-full aspect-square rounded-lg border-2 border-[#f97316] bg-white overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img src={FALLBACK_IMAGE} className="w-full h-full object-contain p-0.5" alt="" loading="lazy" />
                  </button>
                )}
              </div>

              {/* Main image */}
              <div
                className="relative flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center"
                style={{ minHeight: '280px', maxHeight: '420px' }}
              >
                {/* Discount badge */}
                {discountPercent > 0 && (
                  <span className="absolute top-2.5 left-2.5 z-10 bg-[#22c55e] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                    Save {discountPercent}%
                  </span>
                )}

                <img 
                  key={selectedImage || 'fallback'} 
                  src={selectedImage ? `/storage/${selectedImage}` : FALLBACK_IMAGE} 
                  onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                  className="sf-img-fade w-full h-full object-contain p-3" 
                  alt={product.name} 
                  loading="eager" 
                  fetchpriority="high"
                />

                {/* Prev / Next arrows */}
                {imgIndex > 0 && (
                  <button onClick={() => setSelectedImage(allImages[imgIndex - 1])}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
                  </button>
                )}
                {imgIndex < allImages.length - 1 && (
                  <button onClick={() => setSelectedImage(allImages[imgIndex + 1])}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/90 rounded-full shadow flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── PRODUCT INFO (col 6-9) ── */}
          <div className="lg:col-span-4 flex flex-col gap-3">

            {/* Brand */}
            {product.brand && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Brand:</span>
                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
                  {product.brand.logo && <img src={`/storage/${product.brand.logo}`} className="w-4 h-4 object-contain" alt={product.brand.name}/>}
                  {product.brand.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-gray-900 leading-snug">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-500">৳{Math.round(finalPrice).toLocaleString('en-IN')}</span>
              {discountPercent > 0 && (
                <>
                  <span className="text-base sm:text-lg text-gray-400 line-through font-medium">৳{Math.round(price).toLocaleString('en-IN')}</span>
                  <span className="bg-[#dcfce7] text-[#15803d] text-xs font-bold px-2.5 py-0.5 rounded-full">Save {discountPercent}%</span>
                </>
              )}
            </div>

            <hr className="border-gray-100"/>

            {/* Variants */}
            {hasVariants && (
              <div className="space-y-2.5">
                {colors.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1.5">
                      {__('Color')}: <span className="font-normal text-gray-500">{colors.find(c => c.id === selectedColor)?.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(c => (
                        <button key={c.id} onClick={() => handleColorChange(c.id)} title={c.name}
                          className={`w-8 h-8 rounded-full border-4 transition-all ${selectedColor === c.id ? 'border-orange-400 ring-2 ring-orange-200 ring-offset-1 scale-110' : 'border-transparent shadow hover:scale-105'}`}
                          style={{ backgroundColor: c.code || '#000' }}/>
                      ))}
                    </div>
                  </div>
                )}
                {availableSizes.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1.5">{__('Size / Weight')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {availableSizes.map(s => (
                        <button key={s.id} onClick={() => setSelectedSize(s.id)}
                          className={`px-3.5 py-1 rounded-lg text-sm font-semibold border-2 transition-all ${selectedSize === s.id ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400'}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-600">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={isBusy}
                  className="sf-qty-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 text-xl font-bold disabled:opacity-40">−</button>
                <span className="w-10 sm:w-12 text-center font-bold text-gray-900 text-base select-none">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} disabled={isBusy}
                  className="sf-qty-btn w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-gray-600 text-xl font-bold disabled:opacity-40">+</button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">

              {/* Row 1: Add to Cart + Buy Now */}
              <div className="grid grid-cols-2 gap-2.5">
                <button onClick={e => submitToCart(e, false)} disabled={isBusy}
                  className="sf-btn-cart flex items-center justify-center gap-2 h-11 sm:h-12 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-50">
                  {processing ? <Spinner/> : <><CartIcon/><span>ADD TO CART</span></>}
                </button>
                <button onClick={e => submitToCart(e, true)} disabled={isBusy}
                  className="sf-btn-buy flex items-center justify-center gap-2 h-11 sm:h-12 rounded-lg font-bold text-sm text-white transition-colors disabled:opacity-50">
                  {buyNowProcessing ? <Spinner/> : 'BUY NOW'}
                </button>
              </div>

              {/* Row 2: WhatsApp + Call — only when numbers configured in settings */}
              {(waNumber || phoneNumber) && (
                <div className={`grid gap-2.5 ${waNumber && phoneNumber ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {waNumber && (
                    <a href={waHref} target="_blank" rel="noreferrer"
                      className="sf-btn-wa flex items-center justify-center gap-2 h-11 sm:h-12 rounded-lg font-bold text-sm text-white transition-colors">
                      <WaIcon/><span>Order On WhatsApp</span>
                    </a>
                  )}
                  {phoneNumber && (
                    <a href={`tel:${phoneNumber}`}
                      className="sf-btn-call flex items-center justify-center gap-2 h-11 sm:h-12 rounded-lg font-bold text-sm text-white transition-colors">
                      <PhoneIcon/>
                      <span className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-medium opacity-80">Call For Order</span>
                        <span className="text-xs font-bold">{phoneNumber}</span>
                      </span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── SIDEBAR (col 10-12, desktop only) ── */}
          {relatedProducts.length > 0 && (
            <div className="hidden lg:block lg:col-span-3">
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm sticky top-20">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 text-sm">More Products</h3>
                  <div className="flex gap-1">
                    <button onClick={() => setSidebarPage(p => Math.max(0, p - 1))} disabled={sidebarPage === 0}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"/></svg>
                    </button>
                    <button onClick={() => setSidebarPage(p => Math.min(totalPages - 1, p + 1))} disabled={sidebarPage >= totalPages - 1}
                      className="w-6 h-6 rounded border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 disabled:opacity-30 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {sidebarItems.map(rel => <SidebarItem key={rel.id} rel={rel}/>)}
                </div>
              </div>
            </div>
          )}

        </div>{/* /main grid */}

        {/* ════════════════
            TABS
        ════════════════ */}
        <div className="mt-4 lg:mt-5 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="flex border-b border-gray-200 sf-hide-scroll overflow-x-auto">
            {[{ id: 'description', label: 'Description' }, { id: 'reviews', label: 'Customer Reviews (0)' }].map(({ id, label }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${activeTab === id ? 'sf-tab-active' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'description' && (
              <div>
                <h2 className="text-base font-bold text-gray-900 pb-1 mb-3 border-b-2 border-orange-400 inline-block">Product Details</h2>
                {product.description
                  ? <div className="text-gray-600 text-sm leading-relaxed prose max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: product.description }}/>
                  : <p className="text-gray-400 italic text-sm">{__('No description provided.')}</p>
                }
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-5xl font-extrabold text-gray-900">0.0</span>
                    <div>
                      <StarRow filled={0}/>
                      <p className="text-sm text-gray-500 mt-1">0 Reviews</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">0.00% Recommended</p>
                  {[5, 4, 3, 2, 1].map(n => (
                    <div key={n} className="flex items-center gap-2.5 mb-1.5">
                      <StarRow filled={n} size="w-3.5 h-3.5"/>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full" style={{ width: '0%' }}/>
                      </div>
                      <span className="text-xs text-gray-400 w-5 text-right">0%</span>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900 pb-1 mb-3 border-b-2 border-orange-400 inline-block">Submit Your Review</h3>
                  <p className="text-xs text-gray-500 mt-3 mb-3">Your email address will not be published. Required fields are marked *</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Write your opinion about the product</label>
                      <textarea rows={4} placeholder="Write Your Review Here..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Rating:</label>
                      <StarRow filled={0}/>
                    </div>
                    <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors">
                      Submit Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ════════════════
            RELATED PRODUCTS
        ════════════════ */}
        {relatedProducts.length > 0 && (
          <section className="mt-5 lg:mt-7">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <h2 className="text-base lg:text-xl font-bold text-gray-900">Related Products</h2>
              <Link href={route('shop')} className="text-sm font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-0.5 transition-colors">
                More Products
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5"/></svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              {relatedProducts.map(rel => <LazyProductCard key={rel.id} product={rel}/>)}
            </div>
          </section>
        )}

      </div>
    </ThemeLayout>
  );
}