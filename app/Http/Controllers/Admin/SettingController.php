<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Display the settings index page.
     * @return \Inertia\Response
     */
    public function index()
    {
        // Pluck all settings into a key-value pair for easy access in React
        $settings = Setting::pluck('value', 'key')->toArray();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    /**
     * Update the system settings.
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request)
    {
        $data = $request->except(['_token', '_method']);

        // Define sensitive keys that shouldn't be overwritten if submitted empty
        $sensitiveKeys = [
            'courier_steadfast_secret_key', 
            'courier_bdcourier_api_key', 
            'mail_password'
        ];

        foreach ($data as $key => $value) {
            
            // FIX: JavaScript FormData converts `null` values into a literal string "null".
            // We must convert it back to actual null so the file-override logic works.
            if ($value === 'null') {
                $value = null;
            }

            // Handle file uploads (e.g., logo, favicon, meta image)
            if ($request->hasFile($key)) {
                $file = $request->file($key);
                $path = $file->store('settings', 'public');
                
                // Delete old file if it exists
                $oldSetting = Setting::where('key', $key)->first();
                if ($oldSetting && $oldSetting->value) {
                    Storage::disk('public')->delete($oldSetting->value);
                }

                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $path, 'group' => $this->getGroup($key)]
                );
            } else {
                // Ignore nulls/empty strings for sensitive fields to prevent accidental overwrites
                if (in_array($key, $sensitiveKeys) && empty($value)) {
                    continue; 
                }

                // Protect existing files from being overwritten by empty nulls 
                if ($value !== null || !in_array($key, ['site_logo', 'site_favicon', 'seo_meta_image'])) {
                    Setting::updateOrCreate(
                        ['key' => $key],
                        ['value' => $value, 'group' => $this->getGroup($key)]
                    );
                }
            }
        }

        // Clear the cached settings so the app reloads the fresh data
        Cache::forget('app_settings');

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Determine the group for a given setting key.
     * @param string $key
     * @return string
     */
    private function getGroup($key)
    {
        if (str_starts_with($key, 'mail_')) return 'mail';
        if (str_starts_with($key, 'seo_')) return 'seo';
        if (str_starts_with($key, 'social_')) return 'social';
        if (str_starts_with($key, 'floating_')) return 'contact';
        
        // FIX: Account for non-prefixed tracking toggles
        if (str_starts_with($key, 'script_') || in_array($key, ['enable_google_analytics', 'enable_meta_tracking'])) return 'scripts';
        
        if (str_starts_with($key, 'courier_')) return 'courier';
        if (str_starts_with($key, 'sms_')) return 'sms'; 
        
        // Groupings for Navbar & Footer
        if (in_array($key, ['top_banner_text', 'top_banner_link_text', 'search_placeholder'])) return 'navbar';
        if (in_array($key, ['newsletter_title', 'newsletter_subtitle', 'site_description', 'copyright_text'])) return 'footer';
        
        return 'general';
    }
}