import { useState, useEffect, useRef, memo } from 'react';
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import ProductCard from '@/Components/ProductCard';
import TopSellingCard from '@/Components/TopSellingCard';
import HeroSlider from '@/Components/HeroSlider';
import FeaturedCategories from '@/Components/FeaturedCategories';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';

/* ─── CSS (Removed hardcoded :root color) ───────────────────────────────── */
const STYLES = `
/* Skeleton — pure CSS, zero JS animation cost */
@keyframes sk {
  0%,100% { opacity: 1; }
  50%      { opacity: .4; }
}
.sk {
  animation: sk 1.6s ease-in-out infinite;
  background: #e5e7eb;
  border-radius: 5px;
}

/* Reveal — GPU-composited (opacity + transform only) */
@keyframes reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  animation: reveal .28s ease both;
  will-change: opacity, transform;
}
`;

/* ─── Shared IntersectionObserver ───────────────────────────────────────────── */
let _observer = null;
const _cbs = new Map();

function getObserver() {
  if (_observer) return _observer;
  _observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const cb = _cbs.get(e.target);
          if (cb) { cb(); _cbs.delete(e.target); _observer.unobserve(e.target); }
        }
      });
    },
    { rootMargin: '220px', threshold: 0 }
  );
  return _observer;
}

function useReveal(eager) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || !ref.current) return;
    const el = ref.current;
    _cbs.set(el, () => setVisible(true));
    getObserver().observe(el);
    return () => { _cbs.delete(el); getObserver().unobserve(el); };
  }, []);

  return [ref, visible];
}

/* ─── LazyCard ────────────────────────────────────────────────────────────── */
const LazyCard = memo(({ skeleton, children, eager = false, className }) => {
  const [ref, visible] = useReveal(eager);
  return (
    <div ref={eager ? undefined : ref} className={className}>
      {visible ? <div className="reveal">{children}</div> : skeleton}
    </div>
  );
});

/* ─── Skeletons ────────────────────────────────────────────────────────────── */
const SKU_PRODUCT = (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    <div className="sk w-full" style={{ height: 160, borderRadius: 0 }} />
    <div className="p-3 flex flex-col gap-2">
      <div className="sk" style={{ height: 12, width: '80%' }} />
      <div className="sk" style={{ height: 12, width: '60%' }} />
      <div className="sk" style={{ height: 16, width: '40%', marginTop: 4 }} />
    </div>
  </div>
);

const SKU_TOP = (
  <>
    <div className="md:hidden flex flex-col bg-white rounded-2xl overflow-hidden w-full" style={{ height: 340 }}>
      <div className="sk w-full flex-shrink-0" style={{ height: 160, borderRadius: 0 }} />
      <div className="flex flex-col flex-1 px-3 pb-3 gap-2 pt-3">
        <div className="sk" style={{ height: 12, width: '80%' }} />
        <div className="sk" style={{ height: 12, width: '60%' }} />
        <div className="sk" style={{ height: 16, width: '50%', marginTop: 4 }} />
        <div className="sk" style={{ height: 32, width: '100%', marginTop: 'auto' }} />
      </div>
    </div>
    <div className="hidden md:flex bg-white rounded-2xl overflow-hidden w-full" style={{ minHeight: 220 }}>
      <div className="sk flex-shrink-0" style={{ width: 280, height: 220, borderRadius: 0 }} />
      <div className="flex flex-col justify-center flex-1 py-6 pr-8 gap-3 pl-6">
        <div className="sk" style={{ height: 16, width: '75%' }} />
        <div className="sk" style={{ height: 16, width: '50%' }} />
        <div className="sk" style={{ height: 20, width: '40%', marginTop: 4 }} />
        <div className="sk" style={{ height: 24, width: '33%' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div className="sk" style={{ height: 40, width: 128 }} />
          <div className="sk" style={{ height: 40, width: 112 }} />
        </div>
      </div>
    </div>
  </>
);

/* ─── Section Header ──────────────────────────────────────────────────────── */
const SectionHeader = memo(({ title, href }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <div style={{ marginTop: 4, height: 2, width: 40, borderRadius: 9999, backgroundColor: 'var(--theme-color)' }} />
    </div>
    {href && (
      <Link href={href} className="text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition" style={{ color: 'var(--theme-color)' }}>
        View All →
      </Link>
    )}
  </div>
));

/* ─── Top Selling Grid ────────────────────────────────────────────────────── */
const TopSellingGrid = memo(({ products }) => (
  <div className="grid grid-cols-2 gap-3 md:gap-6">
    {products.slice(0, 4).map((p, i) => (
      <LazyCard key={p.id} skeleton={SKU_TOP} eager={i < 2}>
        <TopSellingCard product={p} rank={i + 1} />
      </LazyCard>
    ))}
  </div>
));

/* ─── Category Section ────────────────────────────────────────────────────── */
const CategorySection = memo(({ category }) => {
  const products = category.products?.slice(0, 6);
  if (!products?.length) return null;
  return (
    <section className="mb-20">
      <SectionHeader title={category.name} href={route('shop', { category: category.id })} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((p, i) => (
          <LazyCard key={p.id} skeleton={SKU_PRODUCT} className={i === 5 ? 'block lg:hidden' : undefined}>
            <ProductCard product={p} />
          </LazyCard>
        ))}
      </div>
    </section>
  );
});

/* ─── All Products ────────────────────────────────────────────────────────── */
const PAGE_SIZE = 30;

const AllProducts = memo(({ products }) => {
  const [page, setPage] = useState(1);
  const slice = products.slice(0, page * PAGE_SIZE);
  const hasMore = slice.length < products.length;
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPage((p) => p + 1); },
      { rootMargin: '400px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {slice.map((p, i) => (
          <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 10}>
            <ProductCard product={p} />
          </LazyCard>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />}
    </>
  );
});

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function Home({
  topSelling = [],
  allProducts = [],
  brands,
  sliders = [],
  featuredCategories,
  homeProductCategories = [],
}) {
  const { global_settings } = usePage().props;
  
  // FIX 1: Retrieve primary color dynamically from settings, fallback to green
  const themeColor = global_settings?.primary_color || '#2d5a27';

  return (
    <>
      <SEO 
          title={global_settings?.seo_homepage_title || "Authentic Dates, Raw Honey & Premium Groceries"} 
          description={global_settings?.seo_meta_description || global_settings?.site_description || "Shop the best authentic products, top selling items, and featured categories at amazing prices."} 
      />
      
      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </Head>

      {/* FIX 1 applied here: Inject dynamic root color along with other styles */}
      <style>{`
        :root { --theme-color: ${themeColor}; }
        ${STYLES}
      `}</style>

      <h1 className="sr-only">
        {global_settings?.seo_meta_title || global_settings?.site_name || 'Welcome to our store'}
      </h1>

      <HeroSlider sliders={sliders} />

      <div className="pt-2 md:pt-4">
        <FeaturedCategories featuredCategories={featuredCategories} />

        {topSelling.length > 0 && (
          <section className="mb-20 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Top Selling Products</h2>
            <TopSellingGrid products={topSelling} />
          </section>
        )}

        {homeProductCategories.map((cat) => (
          <CategorySection key={cat.id} category={cat} />
        ))}

        {allProducts.length > 0 && (
          <section className="mb-20 mt-10 border-t border-gray-200 pt-16">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-10">All Products</h2>
            <AllProducts products={allProducts} />
          </section>
        )}
      </div>
    </>
  );
}

// FIX 2: Attach the layout persistently outside the component body
Home.layout = page => <ThemeLayout>{page}</ThemeLayout>;