// resources/js/Components/FeaturedCategories/GeneralFeaturedCategories.jsx
import { Link } from '@inertiajs/react';

export default function GeneralFeaturedCategories({ featuredCategories = [] }) {
    const desktop = featuredCategories.slice(0, 10);
    const mobile  = featuredCategories.slice(0, 4);

    return (
        <section className="mb-6 px-4 md:px-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <SectionHeader title="Featured Categories" />

            {/* Mobile: 2 cols */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
                {mobile.map(cat => <GeneralCard key={cat.id} category={cat} />)}
            </div>
            {/* Desktop: 5 cols */}
            <div className="hidden md:grid md:grid-cols-5 gap-3">
                {desktop.map(cat => <GeneralCard key={cat.id} category={cat} />)}
            </div>
        </section>
    );
}

function GeneralCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-3 py-3 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
        >
            <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors leading-tight flex-1 pr-2">
                {category.name}
            </span>
            <CategoryImage category={category} size="w-10 h-10 md:w-12 md:h-12" />
        </Link>
    );
}

function SectionHeader({ title }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <div>
                <h2 className="text-base md:text-lg font-bold text-gray-900">{title}</h2>
                <div className="mt-1 h-[3px] w-8 bg-indigo-600 rounded-full" />
            </div>
            <Link
                href={route('categories.index')}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                SEE ALL
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </Link>
        </div>
    );
}

function CategoryImage({ category, size = "w-10 h-10" }) {
    return (
        <div className={`flex-shrink-0 ${size}`}>
            {category.image ? (
                <img
                    src={`/storage/${category.image}`}
                    alt={category.name}
                    className={`${size} object-contain group-hover:scale-110 transition-transform duration-300`}
                    loading="lazy"
                />
            ) : (
                <div className={`${size} rounded-lg bg-gray-100 flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </div>
            )}
        </div>
    );
}