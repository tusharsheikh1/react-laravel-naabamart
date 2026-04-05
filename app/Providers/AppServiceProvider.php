<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\App;
use App\Models\Setting;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Default string length for older MySQL versions
        Schema::defaultStringLength(191);

        // Dynamically set the application language based on admin settings
        try {
            // Check if the settings table exists to prevent errors during initial migrations
            if (Schema::hasTable('settings')) {
                // Fetch settings from cache, or query the database and cache it forever
                $settings = Cache::rememberForever('app_settings', function () {
                    return Setting::pluck('value', 'key')->toArray();
                });

                // Check if site_language is set, otherwise default to config('app.locale')
                $locale = $settings['site_language'] ?? config('app.locale');
                
                // Set the application locale globally
                App::setLocale($locale);
            }
        } catch (\Exception $e) {
            // Fails silently if the database connection is not yet established 
            // (e.g., during the very first deployment or 'php artisan migrate')
        }
    }
}