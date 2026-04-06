// resources/js/Components/FeaturedCategories/DigitalFeaturedCategories.jsx
import { Link } from '@inertiajs/react';

const GRADIENTS = [
    'from-violet-500 to-purple-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-indigo-500 to-violet-600',
    'from-sky-500 to-cyan-600',
    'from-fuchsia-500 to-pink-600',
    'from-lime-500 to-emerald-600',
    'from-red-500 to-rose-600',
];

export default function DigitalFeaturedCategories({ featuredCategories = [] }) {
    const desktop = featuredCategories.slice(0, 10);
    const mobile  = featuredCategories.slice(0, 4);

    return (
        <section className="mb-6 px-4 md:px-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-base md:text-lg font-black text-gray-900">Explore Categories</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Find exactly what you need</p>
                </div>
                <Link
                    href={route('categories.index')}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                >
                    All <span className="hidden md:inline">Categories</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 md:hidden">
                {mobile.map((cat, i) => <DigitalCard key={cat.id} category={cat} gradient={GRADIENTS[i % GRADIENTS.length]} />)}
            </div>
            <div className="hidden md:grid md:grid-cols-5 gap-3">
                {desktop.map((cat, i) => <DigitalCard key={cat.id} category={cat} gradient={GRADIENTS[i % GRADIENTS.length]} />)}
            </div>
        </section>
    );
}

function DigitalCard({ category, gradient }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex items-center gap-3 p-3 rounded-2xl bg-white border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
        >
            {/* Gradient icon container */}
            <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt={category.name}
                        className="w-7 h-7 md:w-8 md:h-8 object-contain brightness-0 invert"
                        loading="lazy"
                    />
                ) : (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-bold text-gray-800 group-hover:text-violet-700 transition-colors leading-tight line-clamp-2">
                    {category.name}
                </p>
            </div>

            {/* Arrow */}
            <svg className="w-4 h-4 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}