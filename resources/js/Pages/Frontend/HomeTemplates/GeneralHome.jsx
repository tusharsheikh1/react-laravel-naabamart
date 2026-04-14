import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import SEO from '@/Components/SEO';
import HeroSlider from '@/Components/HeroSlider';
import ProductCard from '@/Components/ProductCard';
import FeaturedCategories from '@/Components/FeaturedCategories';
import { HOME_STYLES, LazyCard, SKU_PRODUCT, AllProducts } from './HomeFeatures';

export default function GeneralHome({
    sliders = [],
    topSelling = [],
    allProducts = [],
    featuredCategories = [],
    homeProductCategories = [],
}) {
    const { global_settings } = usePage().props;

    return (
        <>
            <SEO
                title={global_settings?.seo_homepage_title || 'Premium Store'}
                description={global_settings?.seo_meta_description || global_settings?.site_description}
            />
            <Head>
                {sliders[0]?.image && (
                    <link rel="preload" as="image" href={`/storage/${sliders[0].image}`} fetchPriority="high" />
                )}
            </Head>

            <style dangerouslySetInnerHTML={{ __html: HOME_STYLES }} />
            <style>{`
                .gh-root { padding-bottom: 0; width: 100%; overflow-x: hidden; }

                /* Full Bleed Layout */
                .gh-container { width: 100%; margin: 0; padding: 0; }

                .gh-content { padding-top: 28px; }
                @media (min-width: 768px) { .gh-content { padding-top: 36px; } }

                .gh-section { margin-bottom: 48px; width: 100%; }
                
                /* Headings Padding */
                .gh-section-head, .gh-all-header {
                    padding-left: 16px; padding-right: 16px;
                }
                @media (min-width: 1024px) {
                    .gh-section-head, .gh-all-header { padding-left: 24px; padding-right: 24px; }
                }

                .gh-section-head {
                    display: flex; align-items: flex-end; justify-content: space-between;
                    margin-bottom: 20px;
                }
                .gh-section-title {
                    font-family: 'Georgia', serif;
                    font-size: clamp(17px, 2.5vw, 22px);
                    font-weight: 700; color: #1a3a1a;
                    margin: 0 0 5px;
                }
                .gh-section-bar {
                    height: 3px; width: 28px; border-radius: 2px;
                    background: linear-gradient(90deg, #2d5a27, #7dc46a);
                }
                .gh-view-all {
                    font-size: 11px; font-weight: 800; letter-spacing: .1em;
                    text-transform: uppercase; color: #2d5a27;
                    text-decoration: none; display: inline-flex; align-items: center; gap: 4px;
                }

                /* Standard Grid for Top Selling & Categories */
                .gh-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                @media (min-width: 640px) { .gh-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; } }
                @media (min-width: 1024px) { .gh-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; } }
                @media (min-width: 1536px) { .gh-grid { grid-template-columns: repeat(6, 1fr); } }

                /* Full width divider */
                .gh-divider { height: 1px; background: #ddd8ce; margin: 16px 0 48px; width: 100%; }

                /* All Products Header - Fixed Centering */
                .gh-all-header { text-align: center; width: 100%; display: block; clear: both; }
                .gh-all-title {
                    font-family: 'Georgia', serif;
                    font-size: clamp(22px, 4vw, 32px);
                    font-weight: 700; color: #1a3a1a;
                    margin-bottom: 8px;
                }
                .gh-all-sub { font-size: 14px; color: #7a8a7a; margin-bottom: 40px; }
                
                /* Full Bleed Wrapper for external components */
                .full-bleed-component { width: 100%; margin: 0; padding: 0; }
            `}</style>

            <div className="gh-root">
                <HeroSlider sliders={sliders} />

                <div className="gh-container gh-content">
                    <div className="full-bleed-component">
                        <FeaturedCategories featuredCategories={featuredCategories} />
                    </div>

                    {/* Top Selling */}
                    {topSelling.length > 0 && (
                        <section className="gh-section">
                            <div className="gh-section-head">
                                <div><h2 className="gh-section-title">Top Selling</h2><div className="gh-section-bar" /></div>
                                <Link href={route('shop')} className="gh-view-all">
                                    VIEW ALL
                                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                            <div className="gh-grid">
                                {topSelling.slice(0, 6).map((p, i) => (
                                    <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 2}>
                                        <ProductCard product={p} priority={i < 2} />
                                    </LazyCard>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Category Sections */}
                    {homeProductCategories.map(cat =>
                        cat.products?.length > 0 ? (
                            <section key={cat.id} className="gh-section">
                                <div className="gh-section-head">
                                    <div><h2 className="gh-section-title">{cat.name}</h2><div className="gh-section-bar" /></div>
                                    <Link href={route('shop', { category: cat.id })} className="gh-view-all">
                                        VIEW ALL
                                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                                <div className="gh-grid">
                                    {cat.products.slice(0, 6).map(p => (
                                        <LazyCard key={p.id} skeleton={SKU_PRODUCT}><ProductCard product={p} /></LazyCard>
                                    ))}
                                </div>
                            </section>
                        ) : null
                    )}

                    {/* All Products - Final Fix */}
                    {allProducts.length > 0 && (
                        <section className="full-bleed-component" style={{ paddingBottom: 80 }}>
                            <div className="gh-divider" />
                            <div className="gh-all-header">
                                <h2 className="gh-all-title">All Products</h2>
                                <p className="gh-all-sub">Browse our complete collection</p>
                            </div>
                            {/* Removed gh-grid wrapper here because AllProducts generates its own grid */}
                            <div className="full-bleed-component">
                                <AllProducts products={allProducts} />
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}