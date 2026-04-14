import React from 'react';
import { Link } from '@inertiajs/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';

export default function FoodFeaturedCategories({ featuredCategories = [] }) {
    if (!featuredCategories || featuredCategories.length === 0) return null;

    const defaultImage = "https://backoffice.ghorerbazar.com/category_images/HJOrw1774766749.png";

    const getImageUrl = (img) => {
        if (!img) return defaultImage; 
        if (img.startsWith('http') || img.startsWith('https')) return img;
        return `/storage/${img}`;
    };

    const handleImageError = (e) => { e.target.src = defaultImage; };

    return (
        <section className="w-full">
            {/* Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c0a00] tracking-tight"
                    style={{ fontFamily: "'Georgia', serif" }}>
                    Featured Categories
                </h2>
            </div>
            
            {/* Slider with edge arrows */}
            <div className="relative">
                {/* Prev Arrow */}
                <button className="cat-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-[#f97316] text-white shadow-md hover:bg-[#ea580c] transition-all"
                    style={{ transform: 'translateY(-50%) translateX(-50%)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Next Arrow */}
                <button className="cat-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center bg-[#f97316] text-white shadow-md hover:bg-[#ea580c] transition-all"
                    style={{ transform: 'translateY(-50%) translateX(50%)' }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <Swiper
                    modules={[FreeMode, Navigation, Autoplay]}
                    freeMode={true}
                    grabCursor={true}
                    slidesPerView="auto"
                    spaceBetween={16}
                    loop={true}
                    loopedSlides={featuredCategories.length}
                    autoplay={{
                        delay: 0,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    speed={4500}
                    allowTouchMove={true}
                    navigation={{
                        nextEl: '.cat-next',
                        prevEl: '.cat-prev',
                    }}
                    onSwiper={(swiper) => {
                        swiper.wrapperEl.style.transitionTimingFunction = 'linear';
                    }}
                    className="px-2 pb-2"
                    breakpoints={{
                        320: { spaceBetween: 10 },
                        480: { spaceBetween: 14 },
                        768: { spaceBetween: 16 },
                        1024: { spaceBetween: 20 },
                    }}
                >
                    {featuredCategories.map((category) => (
                        <SwiperSlide key={category.id} className="!w-auto">
                            <Link
                                href={route('shop', { category: category.id })}
                                className="flex flex-col items-center group w-[100px] sm:w-[120px] md:w-[140px] lg:w-[160px]"
                            >
                                {/* Circular white card with border */}
                                <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] rounded-2xl overflow-hidden mb-3 bg-white border border-gray-100 group-hover:border-[#f97316] shadow-sm transition-all duration-300 flex items-center justify-center">
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        onError={handleImageError}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                <h3 className="text-[12px] sm:text-[13px] font-semibold text-center text-[#1c0a00] group-hover:text-[#f97316] transition-colors truncate w-full px-1">
                                    {category.name}
                                </h3>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}