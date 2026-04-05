import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';
import FeaturedCategories from '@/Components/FeaturedCategories';

// Import shared performance features
import { HOME_STYLES, LazyCard, SKU_PRODUCT, AllProducts } from './HomeFeatures';

export default function GadgetHome({ 
  sliders = [], 
  topSelling = [], 
  brands = [], 
  homeProductCategories = [], 
  featuredCategories = [], 
  allProducts = [] 
}) {
  const { global_settings } = usePage().props;

  return (
    <div className="bg-gray-100 font-sans">
      <SEO 
          title={global_settings?.seo_homepage_title || "Premium Tech & Gadgets"} 
          description={global_settings?.seo_meta_description || "Shop the latest devices and accessories."} 
      />

      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
      </Head>

      {/* Inject animation styles without the duplicate :root color */}
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      {/* Dark background wrapper specifically for the Hero Slider to make tech pop */}
      <div className="bg-gray-900">
        <HeroSlider sliders={sliders} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Featured Categories */}
        <div className="mb-8">
            <FeaturedCategories featuredCategories={featuredCategories} />
        </div>

        {/* Top Brands Banner */}
        {brands.length > 0 && (
            <div className="flex justify-center gap-8 items-center bg-white p-6 rounded-lg shadow-sm mb-12 overflow-x-auto">
                <span className="text-gray-500 font-semibold uppercase tracking-widest text-sm">Top Brands:</span>
                {brands.map(brand => (
                    <div key={brand.id} className="font-bold text-xl text-gray-800">{brand.name}</div>
                ))}
            </div>
        )}

        {/* Trending Gadgets */}
        {topSelling.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-6 border-l-4 border-blue-600 pl-4">
                Trending Devices
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {topSelling.map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 3}>
                    <div className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition h-full">
                        <ProductCard product={p} />
                    </div>
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {/* Category Grids */}
        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-12 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>
                  <Link href={route('shop', { category: cat.id })} className="text-sm font-bold text-blue-600 hover:underline uppercase tracking-wider">
                      See All
                  </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {cat.products.slice(0, 5).map(p => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCard product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          )
        ))}

        {/* Infinite Scroll All Products */}
        {allProducts.length > 0 && (
          <section className="mb-20 mt-10 pt-10 border-t border-gray-300">
            <h2 className="text-2xl font-black uppercase tracking-wider text-gray-900 mb-8 text-center">Explore All Gadgets</h2>
            <AllProducts products={allProducts} />
          </section>
        )}
      </div>
    </div>
  );
}