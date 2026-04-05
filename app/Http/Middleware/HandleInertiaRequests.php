<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;
use App\Models\Category;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }
    
    /**
     * Handle the incoming request and append Lighthouse recommended security headers.
     */
    public function handle(Request $request, \Closure $next)
    {
        $response = parent::handle($request, $next);

        if ($response instanceof \Illuminate\Http\Response || $response instanceof \Illuminate\Http\RedirectResponse || $response instanceof \Illuminate\Http\JsonResponse) {
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
            $response->headers->set('X-Content-Type-Options', 'nosniff');
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        }

        return $response;
    }

    public function share(Request $request): array
    {
        // 1. Fetch dynamic settings safely. Initialize as an empty array 
        // so we can use array keys safely below.
        $globalSettings = [];
        
        try {
            $settings = Cache::rememberForever('app_settings', function () {
                return Setting::pluck('value', 'key')->toArray();
            });
            
            if (!empty($settings)) {
                $globalSettings = $settings;
            }
        } catch (\Exception $e) {
            // Ignore during setup or if DB is offline
        }

        // 2. Fetch featured categories globally for the Navbar
        $featuredCategories = [];
        try {
            $featuredCategories = Category::where('is_featured', true)
                ->orderBy('featured_order', 'asc')
                ->get();
        } catch (\Exception $e) {
            // Ignore during setup or if DB is offline
        }

        // 3. Return the merged array
        return array_merge(parent::share($request), [

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */
            'auth' => [
                'user' => fn () => $request->user(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Global SEO Settings
            |--------------------------------------------------------------------------
            */
            'seo' => [
                // Pull from DB settings, fallback to config if DB setting is null/missing
                'default_title'       => $globalSettings['seo_meta_title'] ?? config('seo.default_title', 'Naabamart'),
                'title_separator'     => config('seo.title_separator', ' - '),
                'default_description' => $globalSettings['seo_meta_description'] ?? config('seo.default_description', ''),
                'default_keywords'    => $globalSettings['seo_meta_keywords'] ?? config('seo.default_keywords', ''),
                'author'              => config('seo.author', 'Naabamart'),
                
                // Dynamically resolve the meta image path from DB, fallback to config if missing
                'default_image'       => isset($globalSettings['seo_meta_image']) 
                                         ? asset('storage/' . $globalSettings['seo_meta_image']) 
                                         : asset(config('seo.default_image', 'images/default-meta.jpg')),
                                         
                'current_url'         => url()->current(),
            ],

            /*
            |--------------------------------------------------------------------------
            | Cart Count & Cart Data (Global)
            |--------------------------------------------------------------------------
            */
            'cartCount' => fn () =>
                session()->has('cart')
                    ? array_sum(array_column(session('cart'), 'quantity'))
                    : 0,
                    
            'cart' => fn () => session()->get('cart', []),

            /*
            |--------------------------------------------------------------------------
            | Flash Messages
            |--------------------------------------------------------------------------
            */
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],

            /*
            |--------------------------------------------------------------------------
            | Dynamic Database Settings
            |--------------------------------------------------------------------------
            */
            // Cast back to object so it is serialized nicely as a JSON object in React props
            'global_settings' => (object) $globalSettings,

            /*
            |--------------------------------------------------------------------------
            | Global Categories for Navbar
            |--------------------------------------------------------------------------
            */
            'featuredCategories' => $featuredCategories,

            /*
            |--------------------------------------------------------------------------
            | Language & Translations
            |--------------------------------------------------------------------------
            */
            'locale' => app()->getLocale(),
            'language' => function () {
                $locale = app()->getLocale();
                $path = base_path("lang/{$locale}.json");
                
                if (file_exists($path)) {
                    return json_decode(file_get_contents($path), true);
                }
                
                // Fallback to empty array if the translation file doesn't exist
                return [];
            },

        ]);
    }
}