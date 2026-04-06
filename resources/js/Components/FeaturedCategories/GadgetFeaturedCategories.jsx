// resources/js/Components/FeaturedCategories/GadgetFeaturedCategories.jsx
import { Link } from '@inertiajs/react';

export default function GadgetFeaturedCategories({ featuredCategories = [] }) {
    const desktop = featuredCategories.slice(0, 10);
    const mobile  = featuredCategories.slice(0, 4);

    return (
        <section className="mb-6 px-4 md:px-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base md:text-lg font-black text-gray-900 tracking-tight uppercase">
                        Shop by Category
                    </h2>
                    <div className="mt-1 h-[3px] w-12 rounded-full" style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }} />
                </div>
                <Link
                    href={route('categories.index')}
                    className="text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-500 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                >
                    All Categories
                </Link>
            </div>

            {/* Mobile */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
                {mobile.map(cat => <GadgetCard key={cat.id} category={cat} />)}
            </div>
            {/* Desktop */}
            <div className="hidden md:grid md:grid-cols-5 gap-3">
                {desktop.map(cat => <GadgetCard key={cat.id} category={cat} />)}
            </div>
        </section>
    );
}

function GadgetCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group relative flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-2xl bg-gray-900 border border-gray-700 hover:border-indigo-500 transition-all duration-300 overflow-hidden"
            style={{ minHeight: '100px' }}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"
                style={{ background: 'radial-gradient(circle at center, #6366f1, transparent 70%)' }}
            />

            {/* Image */}
            <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center relative z-10">
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt={category.name}
                        className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                        style={{ filter: 'brightness(0.9) contrast(1.1)' }}
                        loading="lazy"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
                        </svg>
                    </div>
                )}
            </div>

            <span className="text-[11px] md:text-xs font-bold text-gray-300 group-hover:text-indigo-400 text-center leading-tight transition-colors relative z-10 line-clamp-2">
                {category.name}
            </span>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                style={{ background: 'linear-gradient(90deg, #6366f1, #06b6d4)' }}
            />
        </Link>
    );
}