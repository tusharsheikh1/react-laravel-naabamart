import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';

// Import Food specific components
import FoodHeroSlider from '@/Components/Sliders/Foodheroslider';
import Foodstaticbanner from '@/Components/Sliders/Foodstaticbanner'; 
import ProductCardFood from '@/Components/ProductCard/ProductCardFood';
import FoodFeaturedCategories from '@/Components/FeaturedCategories/FoodFeaturedCategories';

// Import features
import { HOME_STYLES, LazyCard, SKU_PRODUCT, SKU_TOP } from './HomeFeatures';

export default function FoodHome({ 
  sliders = [], 
  staticBanners = [], 
  banners = [],       
  topSelling = [], 
  homeProductCategories = [], 
  featuredCategories = [], 
  allProducts = [] 
}) {
  const { global_settings } = usePage().props;
  
  // Ensure we grab the correct banner data based on what the controller sends
  const activeBanners = staticBanners.length > 0 ? staticBanners : banners;

  return (
    <div className="bg-[#fff8f0] font-sans min-h-screen">
      <SEO 
          title={global_settings?.seo_homepage_title || "Fresh Grocery & Organic Food"} 
          description={global_settings?.seo_meta_description || "Shop the freshest products."} 
      />
      
      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={`/storage/${sliders[0].image}`} fetchpriority="high" />
        )}
      </Head>

      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      {/* Integrated Food Hero Slider & Static Banner Layout */}
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 sm:pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Main Hero Slider (Takes remaining width) */}
          <div className="w-full lg:flex-1 aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[480px] rounded-2xl overflow-hidden shadow-sm relative">
            <FoodHeroSlider sliders={sliders} />
          </div>

          {/* Static Banners Side Section (Visible on large screens - Stacked) */}
          {activeBanners?.length > 0 && (
            <div className="hidden lg:flex flex-col gap-4 w-full lg:w-[320px] xl:w-[360px] lg:h-[480px]">
              {activeBanners.slice(0, 2).map((banner, index) => (
                <div key={index} className="flex-1 w-full h-full relative rounded-2xl overflow-hidden shadow-sm">
                   <Foodstaticbanner banner={banner} className="absolute inset-0 w-full h-full" />
                </div>
              ))}
            </div>
          )}
          
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Integrated Food Featured Categories */}
        <div className="mb-12">
            <FoodFeaturedCategories featuredCategories={featuredCategories} />
        </div>

        {/* Top Selling Section */}
        {topSelling.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-extrabold text-[#1c0a00] tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
                  Fresh <span className="text-[#e63b0a]">Picks</span>
                </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topSelling.slice(0, 5).map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_TOP} eager={i < 2}>
                  <ProductCardFood product={p} priority={i < 2} />
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-16">
              <div className="flex items-center justify-between bg-gradient-to-r from-[#e63b0a] to-[#ff7043] text-white p-4 rounded-t-2xl shadow-sm">
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Georgia', serif" }}>{cat.name}</h2>
                <Link href={route('shop', { category: cat.id })} className="text-sm font-bold hover:underline tracking-wider">
                  VIEW ALL
                </Link>
              </div>
              <div className="bg-white border-x border-b border-[#fde8cc] p-4 sm:p-5 rounded-b-2xl shadow-sm grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cat.products.slice(0, 5).map(p => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCardFood product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          )
        ))}

        {/* All Products Section */}
        {allProducts.length > 0 && (
          <section className="mb-20 mt-10 border-t-2 border-[#fde8cc] pt-12">
            <h2 className="text-3xl font-bold text-[#1c0a00] text-center mb-10" style={{ fontFamily: "'Georgia', serif" }}>
              Discover More Deliciousness
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {allProducts.map((p) => (
                <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                  <ProductCardFood product={p} />
                </LazyCard>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}