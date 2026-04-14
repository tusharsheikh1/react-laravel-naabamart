import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import FoodHeroSlider from '@/Components/Sliders/Foodheroslider';
import Foodstaticbanner from '@/Components/Sliders/Foodstaticbanner'; 
import FoodFeaturedCategories from '@/Components/FeaturedCategories/FoodFeaturedCategories';
import ProductCard from '@/Components/ProductCard';
import TopSellingCard from '@/Components/TopSellingCard';
import { HOME_STYLES, LazyCard, SKU_PRODUCT, SKU_TOP } from './HomeFeatures';

export default function FoodHome({ 
  sliders = [], staticBanners = [], banners = [],       
  topSelling = [], homeProductCategories = [], 
  featuredCategories = [], allProducts = [] 
}) {
  const { global_settings } = usePage().props;
  const activeBanners = staticBanners.length > 0 ? staticBanners : banners;

  return (
    <div className="font-sans min-h-screen pb-20">
      <SEO 
        title={global_settings?.seo_homepage_title || "Fresh Grocery & Organic Food"} 
        description={global_settings?.seo_meta_description || "Shop the freshest organic products."} 
      />
      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={`/storage/${sliders[0].image}`} fetchpriority="high" />
        )}
        <style>{`
          .font-serif-organic { font-family: 'Georgia', 'Hind Siliguri', serif; }
          
          /* Force hide slider navigation arrows on mobile for Featured Categories */
          @media (max-width: 768px) {
            .hide-arrows-on-mobile .slick-arrow,
            .hide-arrows-on-mobile .swiper-button-prev,
            .hide-arrows-on-mobile .swiper-button-next,
            .hide-arrows-on-mobile .react-multiple-carousel__arrow,
            .hide-arrows-on-mobile button.absolute {
              display: none !important;
            }
          }
        `}</style>
      </Head>
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      {/* ── Hero: Slider (left) + Single Banner (right) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-5">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Hero Slider — ~65% width */}
          <div
            className="w-full lg:flex-[1.85] rounded-xl lg:rounded-2xl overflow-hidden shadow-sm lg:shadow-lg bg-[#1c0a00] h-[180px] sm:h-[250px] md:h-[300px] lg:h-[370px]"
          >
            <FoodHeroSlider sliders={sliders} className="h-full w-full" />
          </div>

          {/* Single Side Banner — ~35% width, desktop only */}
          {activeBanners?.length > 0 && (
            <div
              className="hidden lg:block lg:flex-1 rounded-2xl overflow-hidden shadow-lg relative lg:h-[370px]"
            >
              <Foodstaticbanner
                banner={activeBanners[0]}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Featured Categories */}
        <div className="mt-6 lg:mt-10 mb-8 lg:mb-16 hide-arrows-on-mobile">
          <FoodFeaturedCategories featuredCategories={featuredCategories} />
        </div>

        {/* Top Selling */}
        {topSelling.length > 0 && (
          <section className="mb-14 lg:mb-20">
            <div className="relative flex items-center justify-center mb-6 lg:mb-8 pb-4 border-b border-orange-50">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1a3a1a] font-serif-organic tracking-tight text-center">
                Top Selling Products
              </h2>
              <Link href={route('shop')} className="absolute right-0 text-xs font-bold text-[#f97316] uppercase tracking-widest hover:underline hidden sm:block">
                View Collection →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              {topSelling.slice(0, 4).map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_TOP} eager={i < 2}>
                  <TopSellingCard product={p} index={i} priority={i < 2} />
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {/* Dynamic Category Sections */}
        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-14 lg:mb-20">
              <div className="flex items-center justify-between mb-6 lg:mb-8 pb-4 border-b border-orange-50">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#1a3a1a] font-serif-organic tracking-tight text-left">
                  {cat.name}
                </h2>
                <Link href={route('shop', { category: cat.id })} className="text-xs font-bold text-[#f97316] uppercase tracking-widest hover:underline hidden sm:block">
                  View Collection →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                {cat.products.slice(0, 5).map(p => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCard product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          )
        ))}

        {/* All Products */}
        {allProducts.length > 0 && (
          <section className="mt-16 lg:mt-24 pt-12 lg:pt-16 border-t border-orange-100">
            <div className="text-left mb-10 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c0a00] font-serif-organic tracking-tight">
                All <span className="text-[#f97316]">Products</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-transparent mt-4 lg:mt-6"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {allProducts.map((p) => (
                <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                  <ProductCard product={p} />
                </LazyCard>
              ))}
            </div>
            <div className="mt-12 lg:mt-16 text-center">
              <Link href={route('shop')} className="inline-flex items-center justify-center gap-3 bg-[#064e3b] text-white px-8 lg:px-12 py-3 lg:py-4 rounded-xl lg:rounded-2xl font-bold hover:bg-[#f97316] transition-all transform hover:-translate-y-1 shadow-xl lg:shadow-2xl">
                Show All Inventory
                <svg className="hidden sm:block w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17l-4 4m0 0l-4-4m4 4V3" />
                </svg>
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}