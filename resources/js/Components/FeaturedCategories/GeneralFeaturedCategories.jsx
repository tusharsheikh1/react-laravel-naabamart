import { Link } from '@inertiajs/react';

export default function GeneralFeaturedCategories({ featuredCategories = [] }) {
    const desktop = featuredCategories.slice(0, 10);
    const mobile  = featuredCategories.slice(0, 6);

    if (!featuredCategories.length) return null;

    return (
        <>
            <style>{`
                .fc-root { margin-bottom: 32px; font-family: 'DM Sans', sans-serif; }

                /* Section header */
                .fc-header {
                    display: flex; align-items: flex-end; justify-content: space-between;
                    margin-bottom: 16px;
                }
                .fc-title-wrap {}
                .fc-title {
                    font-family: 'Georgia', serif;
                    font-size: clamp(16px, 2.5vw, 20px);
                    font-weight: 700; color: #1a3a1a;
                    letter-spacing: -0.02em; margin: 0 0 5px;
                }
                .fc-underline {
                    height: 3px; width: 28px; border-radius: 2px;
                    background: linear-gradient(90deg, #2d5a27, #7dc46a);
                }
                .fc-see-all {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 11px; font-weight: 800; letter-spacing: .1em;
                    text-transform: uppercase; color: #2d5a27; text-decoration: none;
                    padding: 6px 12px; border-radius: 50px;
                    border: 1.5px solid rgba(45,90,39,.25);
                    transition: background 0.2s, border-color 0.2s, color 0.2s;
                    background: transparent;
                }
                .fc-see-all:hover { background: #2d5a27; color: #fff; border-color: #2d5a27; }

                /* Grids */
                .fc-grid-mobile {
                    display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
                }
                @media (min-width: 768px) { .fc-grid-mobile { display: none; } }

                .fc-grid-desktop {
                    display: none;
                    grid-template-columns: repeat(5, 1fr); gap: 10px;
                }
                @media (min-width: 768px) { .fc-grid-desktop { display: grid; } }
                @media (min-width: 1024px) { .fc-grid-desktop { grid-template-columns: repeat(10, 1fr); } }

                /* Card */
                .fc-card {
                    display: flex; flex-direction: column; align-items: center;
                    gap: 8px; padding: 12px 8px 10px;
                    background: #fff;
                    border: 1.5px solid #e8e4dc;
                    border-radius: 14px;
                    text-decoration: none;
                    cursor: pointer;
                    transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s;
                    position: relative; overflow: hidden;
                }
                .fc-card::before {
                    content: '';
                    position: absolute; inset: 0;
                    background: linear-gradient(135deg, rgba(45,90,39,.04), transparent);
                    opacity: 0; transition: opacity 0.22s;
                }
                .fc-card:hover { border-color: #7dc46a; box-shadow: 0 6px 24px rgba(45,90,39,.12); transform: translateY(-3px); }
                .fc-card:hover::before { opacity: 1; }

                .fc-img-wrap {
                    width: 44px; height: 44px; position: relative; flex-shrink: 0;
                }
                @media (min-width: 768px) { .fc-img-wrap { width: 52px; height: 52px; } }

                .fc-img {
                    width: 100%; height: 100%; object-fit: contain;
                    transition: transform 0.3s cubic-bezier(.23,1,.32,1);
                }
                .fc-card:hover .fc-img { transform: scale(1.12); }

                .fc-img-placeholder {
                    width: 100%; height: 100%; border-radius: 10px;
                    background: linear-gradient(135deg, #e8f5e2, #d0e8c8);
                    display: flex; align-items: center; justify-content: center;
                }

                .fc-name {
                    font-size: 10px; font-weight: 700; color: #3a4a3a;
                    text-align: center; line-height: 1.3;
                    letter-spacing: 0.01em;
                    transition: color 0.2s;
                    /* 2-line clamp */
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                @media (min-width: 768px) { .fc-name { font-size: 11px; } }
                .fc-card:hover .fc-name { color: #2d5a27; }
            `}</style>

            <section className="fc-root">
                <div className="fc-header">
                    <div className="fc-title-wrap">
                        <h2 className="fc-title">Featured Categories</h2>
                        <div className="fc-underline" />
                    </div>
                    <Link href={route('categories.index')} className="fc-see-all">
                        See All
                        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>

                {/* Mobile grid (3-col) */}
                <div className="fc-grid-mobile">
                    {mobile.map(cat => <CategoryCard key={cat.id} category={cat} />)}
                </div>

                {/* Desktop grid (5 or 10-col) */}
                <div className="fc-grid-desktop">
                    {desktop.map(cat => <CategoryCard key={cat.id} category={cat} />)}
                </div>
            </section>
        </>
    );
}

function CategoryCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="fc-card"
        >
            <div className="fc-img-wrap">
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt={category.name}
                        className="fc-img"
                        loading="lazy"
                    />
                ) : (
                    <div className="fc-img-placeholder">
                        <svg width="22" height="22" fill="none" stroke="#7dc46a" viewBox="0 0 24 24" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
                        </svg>
                    </div>
                )}
            </div>
            <span className="fc-name">{category.name}</span>
        </Link>
    );
}