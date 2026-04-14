import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';

// Import Specific Fashion/Gadget UI Components
import GadgetHeroSlider from '@/Components/Sliders/GadgetHeroSlider';
import GadgetFeaturedCategories from '@/Components/FeaturedCategories/GadgetFeaturedCategories';
import ProductCardGadget from '@/Components/ProductCard/ProductCardGadget';
import GadgetStaticBanner from '@/Components/Sliders/GadgetStaticBanner';

// Import Shared Performance Utilities
import { HOME_STYLES, LazyCard, SKU_PRODUCT } from './HomeFeatures';

export default function GadgetHome({ 
  sliders = [], 
  banners = [], 
  topSelling = [], 
  brands = [], 
  homeProductCategories = [], 
  featuredCategories = [], 
  allProducts = [] // Used here to extract the latest arrivals
}) {
  const { global_settings } = usePage().props;

  // Logic to get the latest 6 products for the "New Arrivals" section
  const newArrivals = allProducts.slice(0, 6);

  return (
    <div className="bg-white font-sans text-gray-900 selection:bg-black selection:text-white">
      <SEO 
          title={global_settings?.seo_homepage_title || "Premium Fashion & Lifestyle"} 
          description={global_settings?.seo_meta_description || "Discover the latest trends in fashion and accessories."} 
      />

      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
      </Head>

      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      {/* 1. Hero Showcase */}
      <div className="bg-gray-50 mb-12">
        <GadgetHeroSlider sliders={sliders} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. Lookbook Categories */}
        <div className="mb-16">
            <GadgetFeaturedCategories featuredCategories={featuredCategories} />
        </div>

        {/* 3. NEW ARRIVALS SECTION (The Latest Edit) */}
        {newArrivals.length > 0 && (
          <section className="mb-24">
            <div className="flex flex-col items-center justify-center mb-12">
                <h2 className="text-xl md:text-2xl font-serif tracking-[0.15em] uppercase text-center">
                    The Latest Edit
                </h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-2">Just Landed: New Season Essentials</p>
                <div className="mt-4 h-[1px] w-12 bg-black" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
              {newArrivals.map((p, i) => (
                <div key={p.id} className={i === 5 ? "lg:hidden" : ""}>
                    <LazyCard skeleton={SKU_PRODUCT} eager={i < 3}>
                        <ProductCardGadget product={p} />
                    </LazyCard>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Dynamic Promotional Banners */}
        {banners && banners.length > 0 && (
            <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {banners.map((banner) => (
                    <GadgetStaticBanner key={banner.id} banner={banner} />
                ))}
            </div>
        )}

        {/* 5. Trending Now (5 on Desktop, 6 on Mobile) */}
        {topSelling.length > 0 && (
          <section className="mb-24">
            <div className="flex flex-col items-center justify-center mb-12">
                <h2 className="text-xl md:text-2xl font-serif tracking-[0.15em] uppercase text-center">
                    Trending Now
                </h2>
                <div className="mt-4 h-[1px] w-12 bg-black" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
              {topSelling.slice(0, 6).map((p, i) => (
                <div key={p.id} className={i === 5 ? "lg:hidden" : ""}>
                    <LazyCard skeleton={SKU_PRODUCT}>
                        <ProductCardGadget product={p} />
                    </LazyCard>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Partner Brands (Minimalist) */}
        {brands.length > 0 && (
            <div className="flex justify-center gap-12 items-center py-12 mb-20 overflow-x-auto hide-scrollbar border-b border-gray-50">
                {brands.map(brand => (
                    <div key={brand.id} className="font-serif font-bold text-lg text-gray-300 hover:text-black transition-colors tracking-[0.3em] uppercase flex-shrink-0">
                        {brand.name}
                    </div>
                ))}
            </div>
        )}

        {/* 7. Categorized Collections */}
        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-24">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4 border-b border-gray-100 pb-6">
                  <div className="text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-serif tracking-wider text-black">{cat.name}</h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Explore the {cat.name} collection</p>
                  </div>
                  <Link href={route('shop', { category: cat.id })} className="text-[10px] font-bold text-black border-b border-black pb-1 hover:text-gray-500 hover:border-gray-500 uppercase tracking-[0.2em] transition-all">
                      View Collection
                  </Link>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
                {cat.products.slice(0, 6).map((p, i) => (
                  <div key={p.id} className={i === 5 ? "lg:hidden" : ""}>
                    <LazyCard skeleton={SKU_PRODUCT}>
                        <ProductCardGadget product={p} />
                    </LazyCard>
                  </div>
                ))}
              </div>
            </section>
          )
        ))}

        {/* 8. The Complete Edit (Infinite Scroll Area) */}
        {allProducts.length > 0 && (
          <section className="mb-24 mt-16 pt-16 border-t border-gray-100">
            <div className="flex flex-col items-center justify-center mb-16">
                <h2 className="text-xl md:text-2xl font-serif tracking-[0.15em] uppercase text-center">
                    The Complete Edit
                </h2>
                <div className="mt-4 h-[1px] w-12 bg-black" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-12">
                {allProducts.map((p) => (
                    <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                        <ProductCardGadget product={p} />
                    </LazyCard>
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <Link 
                    href={route('shop')} 
                    className="bg-black text-white px-12 py-4 text-[10px] tracking-[0.3em] uppercase font-bold hover:bg-gray-800 transition-all duration-300 shadow-lg"
                >
                    Discover All Products
                </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}