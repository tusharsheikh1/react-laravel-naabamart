import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from '@inertiajs/react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/**
 * HeroSlider — Carousel component
 *
 * Props:
 * sliders  {Array}   — Array of slider objects for this group.
 * Pass only the sliders for the group you want,
 * e.g. sliders filtered by group === 'slider_1'.
 * height   {string}  — Optional Tailwind height classes override.
 * Default: 'h-[160px] sm:h-[240px] md:h-[320px] lg:h-[360px]'
 * className {string} — Optional extra wrapper classes.
 */
export default function HeroSlider({ sliders, height, className = '' }) {
    if (!sliders || sliders.length === 0) return null;

    const heightClasses = height ?? 'h-[160px] sm:h-[240px] md:h-[320px] lg:h-[360px]';

    return (
        <div className={`w-full relative rounded-none sm:rounded-lg overflow-hidden shadow-sm group ${className}`}>
            <Swiper
                spaceBetween={0}
                centeredSlides={true}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                navigation={{ nextEl: '.hs-next', prevEl: '.hs-prev' }}
                modules={[Autoplay, Pagination, Navigation]}
                className={`w-full ${heightClasses}`}
            >
                {sliders.map((slider, index) => (
                    <SwiperSlide key={slider.id}>
                        <SlideContent slider={slider} index={index} />
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Custom nav arrows */}
            <button className="hs-prev absolute top-1/2 left-3 z-10 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow cursor-pointer hidden md:flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>
            <button className="hs-next absolute top-1/2 right-3 z-10 -translate-y-1/2 w-9 h-9 bg-white/90 rounded-full shadow cursor-pointer hidden md:flex items-center justify-center text-gray-700 hover:bg-white transition-all opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </button>
        </div>
    );
}

function SlideContent({ slider, index }) {
    const defaultDesktopImage = 'https://img.freepik.com/free-vector/black-friday-wide-orange-sale-grunge-banner_1017-34783.jpg?semt=ais_hybrid&w=740&q=80';
    const defaultMobileImage = 'https://img.freepik.com/free-vector/horizontal-banner-template-black-friday-sales_23-2150867247.jpg?semt=ais_hybrid&w=740&q=80';
    
    const desktopImgSrc = slider.image ? `/storage/${slider.image}` : defaultDesktopImage;
    const showMobileSpecificImage = Boolean(slider.mobile_image || !slider.image);
    const mobileImgSrc = slider.mobile_image ? `/storage/${slider.mobile_image}` : defaultMobileImage;
    
    const imgEl = (
        <>
            {/* Desktop image */}
            <img
                src={desktopImgSrc}
                alt={slider.title || 'Slide'}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchpriority={index === 0 ? 'high' : 'auto'}
                className={`w-full h-full object-cover object-center ${showMobileSpecificImage ? 'hidden md:block' : ''}`}
                onError={(e) => {
                    // If the uploaded image is broken, swap to default
                    if (e.target.src !== defaultDesktopImage) {
                        e.target.src = defaultDesktopImage;
                    }
                }}
            />
            
            {/* Mobile image */}
            {showMobileSpecificImage && (
                <img
                    src={mobileImgSrc}
                    alt={slider.title || 'Slide'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchpriority={index === 0 ? 'high' : 'auto'}
                    className="w-full h-full object-cover object-center block md:hidden"
                    onError={(e) => {
                        // If the uploaded mobile image is broken, swap to default
                        if (e.target.src !== defaultMobileImage) {
                            e.target.src = defaultMobileImage;
                        }
                    }}
                />
            )}
        </>
    );

    if (slider.link) {
        return (
            <Link href={slider.link} className="block w-full h-full">
                {imgEl}
            </Link>
        );
    }

    return <div className="w-full h-full">{imgEl}</div>;
}