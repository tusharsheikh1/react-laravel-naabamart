// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE: HomeController.php  (how to pass sliders/banners to the page)
// ─────────────────────────────────────────────────────────────────────────────
//
// public function index()
// {
//     return Inertia::render('Frontend/Home', [
//         // Each key maps to a group — only active sliders, ordered
//         'slider1'  => Slider::forGroup('slider_1'),
//         'slider2'  => Slider::forGroup('slider_2'),
//         'banner1'  => Slider::forGroup('banner_1'),
//         'banner2'  => Slider::forGroup('banner_2'),
//         // ... add more as needed
//     ]);
// }


// ─────────────────────────────────────────────────────────────────────────────
// EXAMPLE: GeneralHome.jsx  (how to use HeroSlider + StaticBanner)
// ─────────────────────────────────────────────────────────────────────────────

import HeroSlider  from '@/Components/HeroSlider';
import StaticBanner from '@/Components/StaticBanner';

export default function GeneralHome({ slider1, slider2, banner1, banner2 }) {
    return (
        <div>

            {/* ── Hero area: main carousel + side banner ───────────────────── */}
            <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-2 sm:py-6">
                <div className="flex flex-col lg:flex-row gap-4">

                    {/* Main hero carousel (Slider 1) */}
                    <div className={`w-full ${banner1?.length ? 'lg:w-[70%] xl:w-[75%]' : ''}`}>
                        <HeroSlider sliders={slider1} />
                    </div>

                    {/* Side static banner (Banner 1) — hidden on mobile */}
                    {banner1?.length > 0 && (
                        <div className="hidden lg:block lg:w-[30%] xl:w-[25%]">
                            <div className="w-full h-[360px] rounded-lg overflow-hidden shadow-sm">
                                <StaticBanner banners={banner1} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Secondary slider (e.g. promotions strip) ────────────────── */}
            {slider2?.length > 0 && (
                <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mb-6">
                    <HeroSlider
                        sliders={slider2}
                        height="h-[100px] sm:h-[140px] md:h-[180px]"
                        className="rounded-lg"
                    />
                </div>
            )}

            {/* ── Full-width banner (Banner 2) ─────────────────────────────── */}
            {banner2?.length > 0 && (
                <div className="w-full max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 mb-6">
                    <div className="w-full h-[120px] sm:h-[160px] rounded-lg overflow-hidden shadow-sm">
                        <StaticBanner banners={banner2} />
                    </div>
                </div>
            )}

            {/* ... rest of your page ... */}
        </div>
    );
}