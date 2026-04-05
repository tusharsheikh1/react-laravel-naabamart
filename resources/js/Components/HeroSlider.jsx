import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Link } from '@inertiajs/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function HeroSlider({ sliders }) {
    if (!sliders || sliders.length === 0) {
        return null;
    }

    // Extract the second slider (index 1) to use as the static banner
    const staticBanner = sliders.length > 1 ? sliders[1] : null;
    
    // The rest of the sliders go into the main carousel
    const mainSliders = sliders.filter((_, index) => index !== 1);

    return (
        <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6">
            <div className="flex flex-col lg:flex-row gap-4">
                
                <div className={`w-full ${staticBanner ? 'lg:w-[70%] xl:w-[75%]' : ''} rounded-none sm:rounded-lg overflow-hidden relative shadow-sm group`}>
                    <Swiper
                        spaceBetween={0}
                        centeredSlides={true}
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        pagination={{
                            clickable: true,
                        }}
                        navigation={{
                            nextEl: '.custom-next',
                            prevEl: '.custom-prev',
                        }}
                        modules={[Autoplay, Pagination, Navigation]}
                        className="w-full h-[160px] sm:h-[240px] md:h-[320px] lg:h-[360px]"
                    >
                        {mainSliders.map((slider, index) => (
                            <SwiperSlide key={slider.id}>
                                {slider.link ? (
                                    <Link href={slider.link} className="block w-full h-full">
                                        <img
                                            src={`/storage/${slider.image}`}
                                            alt={slider.title || 'Slider Image'}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            fetchpriority={index === 0 ? "high" : "auto"}
                                            className="w-full h-full object-cover object-center"
                                        />
                                    </Link>
                                ) : (
                                    <img
                                        src={`/storage/${slider.image}`}
                                        alt={slider.title || 'Slider Image'}
                                        loading={index === 0 ? "eager" : "lazy"}
                                        fetchpriority={index === 0 ? "high" : "auto"}
                                        className="w-full h-full object-cover object-center"
                                    />
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className="custom-prev absolute top-1/2 left-4 z-10 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md cursor-pointer hidden md:flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </div>

                    <div className="custom-next absolute top-1/2 right-4 z-10 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md cursor-pointer hidden md:flex items-center justify-center text-gray-800 hover:bg-gray-50 transition-all duration-300 opacity-0 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </div>
                </div>

                {staticBanner && (
                    <div className="hidden lg:flex lg:w-[30%] xl:w-[25%] flex-col h-auto">
                        <div className="w-full h-[160px] sm:h-[240px] lg:h-[360px] rounded-lg overflow-hidden shadow-sm hover:opacity-95 transition-opacity duration-300">
                            {staticBanner.link ? (
                                <Link href={staticBanner.link} className="block w-full h-full">
                                    <img
                                        src={`/storage/${staticBanner.image}`}
                                        alt={staticBanner.title || 'Side Banner'}
                                        loading="lazy"
                                        className="w-full h-full object-cover object-center"
                                    />
                                </Link>
                            ) : (
                                <img
                                    src={`/storage/${staticBanner.image}`}
                                    alt={staticBanner.title || 'Side Banner'}
                                    loading="lazy"
                                    className="w-full h-full object-cover object-center"
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}