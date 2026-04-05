import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';
import TopSellingCard from '@/Components/TopSellingCard';
import FeaturedCategories from '@/Components/FeaturedCategories';

// Import features
import { HOME_STYLES, LazyCard, SKU_PRODUCT, SKU_TOP, AllProducts } from './HomeFeatures';

export default function GeneralHome({ sliders = [], topSelling = [], allProducts = [], featuredCategories = [], homeProductCategories = [] }) {
  const { global_settings } = usePage().props;

  return (
    <>
      <SEO 
          title={global_settings?.seo_homepage_title || "Premium Store"} 
          description={global_settings?.seo_meta_description || global_settings?.site_description} 
      />
      <Head>
        {sliders[0]?.image && <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />}
      </Head>
      
      {/* Corrected: Injecting only the animation styles without the duplicate :root color */}
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      <HeroSlider sliders={sliders} />

      <div className="pt-2 md:pt-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeaturedCategories featuredCategories={featuredCategories} />

        {topSelling.length > 0 && (
          <section className="mb-20 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Top Selling Products</h2>
            <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
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
             <section key={cat.id} className="mb-20">
               <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                   <div style={{ marginTop: 4, height: 2, width: 40, borderRadius: 9999, backgroundColor: 'var(--theme-color)' }} />
                 </div>
                 <Link href={route('shop', { category: cat.id })} className="text-xs font-semibold uppercase tracking-wider hover:opacity-70 transition" style={{ color: 'var(--theme-color)' }}>
                   View All →
                 </Link>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                 {cat.products.slice(0, 5).map((p, i) => (
                   <LazyCard key={p.id} skeleton={SKU_PRODUCT} className={i === 5 ? 'block lg:hidden' : undefined}>
                     <ProductCard product={p} />
                   </LazyCard>
                 ))}
               </div>
             </section>
          )
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