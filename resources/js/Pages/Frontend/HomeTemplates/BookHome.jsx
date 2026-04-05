import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';
import FeaturedCategories from '@/Components/FeaturedCategories';

// Import shared performance features
import { HOME_STYLES, LazyCard, SKU_PRODUCT, AllProducts } from './HomeFeatures';

export default function BookHome({ 
  sliders = [], 
  topSelling = [], 
  featuredCategories = [], 
  homeProductCategories = [], 
  allProducts = [] 
}) {
  const { global_settings } = usePage().props;

  return (
    <div className="bg-[#FAF9F6] font-sans"> {/* Warm off-white paper color */}
      <SEO 
          title={global_settings?.seo_homepage_title || "Premium Bookstore"} 
          description={global_settings?.seo_meta_description || "Discover your next great read."} 
      />

      <Head>
        {sliders[0]?.image && (
          <link rel="preload" as="image" href={sliders[0].image} fetchpriority="high" />
        )}
      </Head>

      {/* Inject animation styles without the duplicate :root color */}
      <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Hero Section */}
        <div className="rounded-2xl overflow-hidden shadow-lg mb-12">
            <HeroSlider sliders={sliders} />
        </div>

        {/* Bestselling Books */}
        {topSelling.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900">Bestsellers</h2>
                <p className="text-gray-500 italic mt-2">Books everyone is talking about</p>
                <div className="h-1 w-24 bg-amber-600 mx-auto mt-4 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {topSelling.slice(0, 5).map((p, i) => (
                <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 3}>
                    <div className="hover:-translate-y-2 transition duration-300 h-full">
                        <ProductCard product={p} />
                    </div>
                </LazyCard>
              ))}
            </div>
          </section>
        )}

        {/* Browse by Genre */}
        {featuredCategories.length > 0 && (
            <section className="mb-16 bg-amber-50 p-8 rounded-2xl border border-amber-100 shadow-sm">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 text-center">Browse by Genre</h2>
                <FeaturedCategories featuredCategories={featuredCategories} />
            </section>
        )}

        {/* Bookshelves (Categories) */}
        {homeProductCategories.map((cat) => (
          cat.products?.length > 0 && (
            <section key={cat.id} className="mb-14">
              <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-2">
                <h2 className="text-2xl font-serif font-bold text-gray-800">{cat.name}</h2>
                <Link href={route('shop', { category: cat.id })} className="text-amber-700 font-semibold text-sm uppercase tracking-wider hover:text-amber-900 transition">
                    See All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {cat.products.slice(0, 6).map(p => (
                  <LazyCard key={p.id} skeleton={SKU_PRODUCT}>
                    <ProductCard product={p} />
                  </LazyCard>
                ))}
              </div>
            </section>
          )
        ))}

        {/* Infinite Scroll All Books */}
        {allProducts.length > 0 && (
          <section className="mb-20 mt-16 pt-10 border-t border-gray-200">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-gray-900">Explore The Library</h2>
                <div className="h-1 w-24 bg-amber-600 mx-auto mt-4 rounded"></div>
            </div>
            <AllProducts products={allProducts} />
          </section>
        )}

      </div>
    </div>
  );
}