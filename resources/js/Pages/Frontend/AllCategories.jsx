import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import SEO from '@/Components/SEO'; // <-- Added SEO Component

export default function AllCategories({ categories }) {
    const [search, setSearch] = useState('');

    // Flatten all categories + their children into one list
    const allCategories = [];
    categories.forEach(cat => {
        allCategories.push(cat);
        if (cat.children && cat.children.length > 0) {
            cat.children.forEach(child => allCategories.push(child));
        }
    });

    const filtered = allCategories.filter(cat =>
        cat.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <ThemeLayout>
            {/* Using the Dynamic SEO Component */}
            <SEO title="All Categories" />

            <div className="min-h-screen bg-gray-50">

                {/* Page Header */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                            <Link href={route('home')} className="hover:text-orange-500 transition-colors">Home</Link>
                            <span>/</span>
                            <span className="text-gray-600 font-medium">All Categories</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">
                                All Categories
                                <span className="ml-3 text-sm font-normal text-gray-400">({filtered.length})</span>
                            </h1>

                            {/* Search */}
                            <div className="relative w-full md:w-72">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search categories..."
                                    className="w-full border border-gray-200 rounded-full px-5 py-2.5 pr-10 text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-300 transition"
                                />
                                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    {filtered.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-lg">No categories found for "{search}"</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {filtered.map(category => (
                                <CategoryCard key={`${category.id}-${category.name}`} category={category} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </ThemeLayout>
    );
}

function CategoryCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-orange-300 hover:shadow-sm transition-all duration-200"
            style={{ minHeight: '80px' }}
        >
            {/* Category Name — left */}
            <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors leading-tight flex-1 pr-3">
                {category.name}
            </span>

            {/* Image — right */}
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12">
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt={category.name}
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18M3.75 4.5h16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z" />
                        </svg>
                    </div>
                )}
            </div>
        </Link>
    );
}