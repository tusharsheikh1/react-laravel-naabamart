import { Link } from '@inertiajs/react';

export default function FeaturedCategories({ featuredCategories = [] }) {
    if (!featuredCategories || featuredCategories.length === 0) return null;

    const desktopCategories = featuredCategories.slice(0, 10);
    const mobileCategories  = featuredCategories.slice(0, 4);

    return (
        <section 
            className="mb-6 px-4 md:px-6"
            style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
        >
            <div className="flex items-center justify-between mb-3">
                <div>
                    <h2 className="text-base md:text-lg font-bold text-gray-900">Featured Categories</h2>
                    <div className="mt-1 h-[3px] w-8 bg-[#2d5a27] rounded-full" />
                </div>
                <Link
                    href={route('categories.index')}
                    className="flex items-center gap-1 text-xs font-semibold text-[#2d5a27] hover:text-[#1a3a1a] transition-colors underline underline-offset-2"
                >
                    SEE ALL
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 md:hidden">
                {mobileCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>

            <div className="hidden md:grid md:grid-cols-5 gap-2">
                {desktopCategories.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                ))}
            </div>
        </section>
    );
}

function CategoryCard({ category }) {
    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex flex-row items-center justify-between bg-white border border-gray-200 rounded-xl px-2 md:px-4 hover:border-[#c8e6c0] hover:shadow-sm transition-all duration-200"
            style={{ minHeight: '72px' }}
        >
            <span className="text-xs md:text-sm font-semibold text-gray-700 group-hover:text-[#2d5a27] transition-colors leading-tight flex-1 pr-1">
                {category.name}
            </span>

            <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 md:w-12 md:h-12">
                {category.image ? (
                    <img
                        src={`/storage/${category.image}`}
                        alt="" 
                        width="63"
                        height="63"
                        loading="lazy"
                        className="w-9 h-9 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 19.5h18M3.75 4.5h16.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z" />
                        </svg>
                    </div>
                )}
            </div>
        </Link>
    );
}