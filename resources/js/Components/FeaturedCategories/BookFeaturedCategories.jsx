// resources/js/Components/FeaturedCategories/BookFeaturedCategories.jsx
import { Link } from '@inertiajs/react';

export default function BookFeaturedCategories({ featuredCategories = [] }) {
    const items = featuredCategories.slice(0, 8);

    return (
        <section className="mb-8 px-4 md:px-6" style={{ fontFamily: "'Georgia', 'DM Serif Display', serif" }}>
            {/* Header with decorative rule */}
            <div className="flex items-center gap-4 mb-5">
                <div className="flex-1 h-px bg-amber-900/20" />
                <div className="text-center">
                    <h2 className="text-sm md:text-base font-bold text-amber-900 uppercase tracking-[0.15em]">Browse by Genre</h2>
                </div>
                <div className="flex-1 h-px bg-amber-900/20" />
            </div>

            {/* Mobile: horizontal scroll */}
            <div className="flex gap-3 overflow-x-auto pb-2 md:hidden scrollbar-hide">
                {items.map(cat => <BookCard key={cat.id} category={cat} />)}
            </div>

            {/* Desktop: grid */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-8 gap-3">
                {items.map(cat => <BookCard key={cat.id} category={cat} />)}
            </div>

            {/* Footer link */}
            <div className="text-center mt-4">
                <Link
                    href={route('categories.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 hover:text-amber-600 font-semibold tracking-wide border-b border-amber-800/40 hover:border-amber-600 transition-colors pb-0.5"
                >
                    Explore all categories
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>
        </section>
    );
}

function BookCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex-shrink-0 flex flex-col items-center gap-2 min-w-[80px] md:min-w-0"
        >
            {/* Book-spine style card */}
            <div className="relative w-16 md:w-full aspect-[3/4] rounded-sm overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1.5"
                style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
            >
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-2 gap-1">
                        <div className="w-6 h-6 rounded bg-amber-300/60 flex items-center justify-center">
                            <svg className="w-4 h-4 text-amber-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <p className="text-[9px] text-amber-900/70 font-bold text-center leading-tight line-clamp-3 px-1">{category.name}</p>
                    </div>
                )}
                {/* Bottom label overlay */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-amber-900/70 to-transparent pt-4 pb-1.5 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-[9px] text-amber-50 font-bold text-center leading-tight line-clamp-2">{category.name}</p>
                </div>
            </div>
            <span className="text-[11px] font-semibold text-amber-900 group-hover:text-amber-600 text-center leading-tight transition-colors line-clamp-2 max-w-[80px] md:max-w-full"
                style={{ fontFamily: "Georgia, serif" }}>
                {category.name}
            </span>
        </Link>
    );
}