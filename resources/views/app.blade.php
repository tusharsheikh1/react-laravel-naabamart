<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php
            // 1. Fetch settings from cache as defined in HandleInertiaRequests
            $settings = \Illuminate\Support\Facades\Cache::rememberForever('app_settings', function () {
                return \App\Models\Setting::pluck('value', 'key')->toArray();
            });

            // 2. Access the data being passed to the current page via Inertia
            $pageProps = $page['props'] ?? [];
            $product = $pageProps['product'] ?? null;

            // 3. Set default values from database settings or fallback to config
            $defaultTitle = $settings['seo_meta_title'] ?? config('app.name', 'Naabamart');
            $defaultDescription = $settings['seo_meta_description'] ?? $settings['site_description'] ?? '';
            $defaultImage = isset($settings['seo_meta_image']) 
                ? asset('storage/' . $settings['seo_meta_image']) 
                : asset('images/default-meta.jpg');
            $separator = $settings['seo_title_separator'] ?? ' - ';

            // 4. Determine Content (Prioritize Product data for crawlers if it exists)
            if ($product) {
                // Construct title matching SEO.jsx logic
                $siteName = $product['name'] . $separator . $defaultTitle;
                
                // Clean and truncate description
                $rawDesc = $product['short_description'] ?: ($product['description'] ?: $defaultDescription);
                $description = mb_substr(strip_tags($rawDesc), 0, 160);
                
                // Ensure absolute image URL for social media
                $imageUrl = !empty($product['thumbnail']) 
                    ? asset('storage/' . $product['thumbnail']) 
                    : $defaultImage;
            } else {
                $siteName = $defaultTitle;
                $description = $defaultDescription;
                $imageUrl = $defaultImage;
            }
            
            $currentUrl = url()->current();

            // 5. Check if the current request is for an admin route
            $isAdmin = request()->is('admin*');
        @endphp

        <title inertia>{{ $siteName }}</title>
        <meta name="description" content="{{ $description }}" inertia>

        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ $currentUrl }}" inertia>
        <meta property="og:title" content="{{ $siteName }}" inertia>
        <meta property="og:description" content="{{ $description }}" inertia>
        <meta property="og:image" content="{{ $imageUrl }}" inertia>

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:url" content="{{ $currentUrl }}" inertia>
        <meta name="twitter:title" content="{{ $siteName }}" inertia>
        <meta name="twitter:description" content="{{ $description }}" inertia>
        <meta name="twitter:image" content="{{ $imageUrl }}" inertia>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        {{-- Only inject tracking scripts if NOT an admin route --}}
        @if(!$isAdmin)
            {!! $settings['script_gtm_head'] ?? '' !!}
            {!! $settings['script_google_analytics'] ?? '' !!}
            {!! $settings['script_meta_pixel'] ?? '' !!}
            {!! $settings['script_tiktok_pixel'] ?? '' !!}
            {!! $settings['script_custom_head'] ?? '' !!}
        @endif

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        {{-- Only inject body scripts if NOT an admin route --}}
        @if(!$isAdmin)
            {!! $settings['script_gtm_body'] ?? '' !!}
            {!! $settings['script_custom_body'] ?? '' !!}
        @endif

        @inertia
    </body>
</html>