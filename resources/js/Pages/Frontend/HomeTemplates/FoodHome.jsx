import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';
import TopSellingCard from '@/Components/TopSellingCard';
import FeaturedCategories from '@/Components/FeaturedCategories';

// Import features
import { HOME_STYLES, LazyCard, SKU_PRODUCT, SKU_TOP, AllProducts } from './HomeFeatures';

export default function FoodHome({ sliders = [], topSelling = [], homeProductCategories = [], featuredCategories = [], allProducts = [] }) {
  const { global_settings } = usePage().props;

  return (
    <div className="bg-green-50/30 font-sans">
      <SEO 
          title={global_settings?.seo_homepage_title || "Fresh Grocery & Organic Food"} 
          description={global_settings?.seo_meta_description || "Shop the freshest products."} 
      />
      
      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
      </Head>

      {/* Corrected CSS Injection */}
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      <HeroSlider sliders={sliders} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-green-100 mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 text-center">Shop by Aisle</h2>
            <FeaturedCategories featuredCategories={featuredCategories} />
        </div>

        {topSelling.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Fresh <span className="text-green-600">Picks</span></h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topSelling.slice(0, 4).map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_TOP} eager={i < 2}>
                  <TopSellingCard product={p} rank={i + 1} />
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-16">
              <div className="flex items-center justify-between bg-green-600 text-white p-4 rounded-t-xl">
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <Link href={route('shop', { category: cat.id })} className="text-sm font-medium hover:underline">View All</Link>
              </div>
              <div className="bg-white border border-t-0 border-green-200 p-4 rounded-b-xl grid grid-cols-2 md:grid-cols-5 gap-4">
                {cat.products.slice(0, 5).map(p => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCard product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          )
        ))}

        {allProducts.length > 0 && (
          <section className="mb-20 mt-10 border-t border-green-200 pt-16">
            <h2 className="text-2xl font-bold text-green-800 text-center mb-10">Discover More Groceries</h2>
            <AllProducts products={allProducts} />
          </section>
        )}
      </div>
    </div>
  );
}