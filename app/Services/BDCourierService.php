<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;

class BDCourierService
{
    protected string $apiKey;
    protected string $baseUrl = 'https://bdcourier.com/api';

    public function __construct()
    {
        // Fetch cached settings or default to empty array
        $settings = Cache::rememberForever('app_settings', function () {
            try {
                return Setting::pluck('value', 'key')->toArray();
            } catch (\Exception $e) {
                return [];
            }
        });

        // Use database setting if exists, otherwise fallback to .env configuration
        $this->apiKey = $settings['courier_bdcourier_api_key'] ?? config('services.bdcourier.api_key', env('BDCOURIER_API_KEY', ''));
    }

    /**
     * Check courier history by phone number.
     */
    public function checkByPhone(string $phone): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Accept'        => 'application/json',
            ])->post("{$this->baseUrl}/courier-check?phone={$phone}");

            if ($response->failed()) {
                Log::error('BDCourier API failed', [
                    'status' => $response->status(),
                    'body'   => $response->body(),
                ]);
                return ['error' => 'API request failed with status ' . $response->status()];
            }

            return $response->json() ?? [];
        } catch (\Exception $e) {
            Log::error('BDCourier API exception: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }
}