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
        <section className="w-full relative px-2 sm:px-0">
            {/* Header Section */}
            <div className="relative flex items-center justify-center mb-6">
                {/* Updated Headline */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c0a00] tracking-tight text-center" style={{ fontFamily: "'Georgia', serif" }}>
                    Featured Categories
                </h2>
                
                {/* Navigation Arrows */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
                    <button className="cat-prev w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-[#e63b0a] hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button className="cat-next w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-gray-600 hover:bg-[#e63b0a] hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
            
            <div className="w-full relative">
                <Swiper
                    modules={[FreeMode, Navigation, Autoplay]}
                    freeMode={true}
                    grabCursor={true}
                    slidesPerView="auto"
                    navigation={{ nextEl: '.cat-next', prevEl: '.cat-prev' }}
                    className="pb-2"
                    breakpoints={{
                        320: { spaceBetween: 12 },
                        480: { spaceBetween: 16 },
                        768: { spaceBetween: 20 },
                        1024: { spaceBetween: 24 },
                    }}
                >
                    {featuredCategories.map((category) => (
                        <SwiperSlide key={category.id} className="!w-auto">
                            <Link
                                href={route('shop', { category: category.id })}
                                className="flex flex-col items-center group w-[90px] sm:w-[110px] md:w-[130px] lg:w-[150px]"
                            >
                                {/* Square Card */}
                                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-white border border-gray-100 group-hover:border-[#e63b0a] shadow-sm transition-all duration-300">
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        onError={handleImageError}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                                
                                {/* Bold Text */}
                                <h3 className="text-[12px] sm:text-sm font-bold text-center text-[#1c0a00] group-hover:text-[#e63b0a] transition-colors truncate w-full px-1">
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