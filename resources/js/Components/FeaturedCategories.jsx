import { useRef } from 'react';
import { Link } from '@inertiajs/react';

export default function FeaturedCategories({ featuredCategories = [] }) {
    const scrollContainerRef = useRef(null);

    if (!featuredCategories || featuredCategories.length === 0) return null;

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = 400; // Adjust scroll distance
            scrollContainerRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    return (
        <section 
            className="mb-6 px-4 md:px-6 py-6 bg-white rounded-lg shadow-sm border border-gray-100"
            style={{ fontFamily: "'DM Sans', 'Hind Siliguri', sans-serif" }}
        >
            <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-medium text-gray-900">
                    Popular Categories
                </h2>
            </div>

            <div className="relative group">
                {/* Left Navigation Button */}
                <button 
                    onClick={() => scroll('left')}
                    className="absolute -left-4 top-[40px] z-10 w-10 h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#00a676] hover:bg-gray-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll left"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 pr-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Scrollable Container */}
                <div 
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto gap-4 md:gap-8 snap-x px-2 pb-4 [&::-webkit-scrollbar]:hidden"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {featuredCategories.map((category) => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>

                {/* Right Navigation Button */}
                <button 
                    onClick={() => scroll('right')}
                    className="absolute -right-4 top-[40px] z-10 w-10 h-10 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.1)] flex items-center justify-center text-[#00a676] hover:bg-gray-50 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    aria-label="Scroll right"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 pl-0.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </section>
    );
}

function CategoryCard({ category }) {
    const defaultImage = 'https://cdn-icons-png.freepik.com/256/9667/9667791.png?semt=ais_white_label';
    const imgSrc = category.image ? `/storage/${category.image}` : defaultImage;

    return (
        <Link
            href={route('shop', { category: category.id })}
            className="group flex flex-col items-center gap-3 min-w-[90px] md:min-w-[110px] snap-start"
        >
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-full bg-[#f4f6f8] flex items-center justify-center overflow-hidden border border-transparent group-hover:border-[#c8e6c0] group-hover:shadow-sm transition-all duration-300">
                <img
                    src={imgSrc}
                    alt={category.name || "Category"} 
                    loading="lazy"
                    className="w-14 h-14 md:w-[70px] md:h-[70px] object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                        if (e.target.src !== defaultImage) {
                            e.target.src = defaultImage;
                        }
                    }}
                />
            </div>
            
            <span className="text-xs md:text-sm font-normal text-gray-800 text-center leading-snug px-1 group-hover:text-[#2d5a27] transition-colors line-clamp-2">
                {category.name}
            </span>
        </Link>
    );
}