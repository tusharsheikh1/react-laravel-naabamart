import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';

import { HOME_STYLES, LazyCard, SKU_PRODUCT, AllProducts } from './HomeFeatures';

export default function DigitalHome({
  sliders = [],
  topSelling = [],
  homeProductCategories = [],
  featuredCategories = [],
  allProducts = [],
}) {
  const { global_settings } = usePage().props;

  return (
    <div className="bg-white font-sans">
      <SEO
        title={global_settings?.seo_homepage_title || 'Digital Products'}
        description={global_settings?.seo_meta_description || 'Shop the best digital products.'}
      />

      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
      </Head>

      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      <HeroSlider sliders={sliders} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Browse Categories</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={route('shop', { category: cat.id })}
                  className="px-5 py-2.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 font-semibold text-sm hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Top Selling */}
        {topSelling.length > 0 && (
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Top Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {topSelling.slice(0, 5).map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 3}>
                  <ProductCard product={p} />
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {/* Category Sections */}
        {homeProductCategories.map((cat) =>
          cat.products?.length > 0 ? (
            <section key={cat.id} className="mb-12">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900">{cat.name}</h2>
                <Link
                  href={route('shop', { category: cat.id })}
                  className="text-sm font-semibold text-indigo-600 hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cat.products.slice(0, 5).map((p) => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCard product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          ) : null
        )}

        {/* All Products */}
        {allProducts.length > 0 && (
          <section className="mb-20 mt-10 border-t border-gray-100 pt-14">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">All Products</h2>
            <AllProducts products={allProducts} />
          </section>
        )}
      </div>
    </div>
  );
}