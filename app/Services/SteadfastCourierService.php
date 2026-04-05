<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Models\Setting;

class SteadfastCourierService
{
    protected $baseUrl;
    protected $apiKey;
    protected $secretKey;

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
        $this->baseUrl = $settings['courier_steadfast_base_url'] ?? env('STEADFAST_BASE_URL', 'https://portal.packzy.com/api/v1');
        $this->apiKey = $settings['courier_steadfast_api_key'] ?? env('STEADFAST_API_KEY');
        $this->secretKey = $settings['courier_steadfast_secret_key'] ?? env('STEADFAST_SECRET_KEY');
    }

    /**
     * Get the pre-configured HTTP client.
     */
    protected function client()
    {
        return Http::withHeaders([
            'Api-Key'      => $this->apiKey,
            'Secret-Key'   => $this->secretKey,
            'Content-Type' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }

    /**
     * 1. Placing a single order
     */
    public function createOrder(array $data)
    {
        $response = $this->client()->post('/create_order', $data);
        return $response->json();
    }

    /**
     * 2. Bulk Order Create
     *
     * @param array $orders Array of orders (max 500)
     */
    public function bulkCreateOrder(array $orders)
    {
        $response = $this->client()->post('/create_order/bulk-order', [
            'data' => $orders
        ]);
        
        if (!$response->successful()) {
            Log::error('Steadfast Bulk Order Failed API Response:', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
        }

        return $response->json();
    }

    /**
     * 3. Checking Delivery Status (By Consignment ID)
     */
    public function checkStatusByConsignmentId($id)
    {
        $response = $this->client()->get("/status_by_cid/{$id}");
        return $response->json();
    }

    public function checkStatusByInvoice($invoice)
    {
        $response = $this->client()->get("/status_by_invoice/{$invoice}");
        return $response->json();
    }

    public function checkStatusByTrackingCode($trackingCode)
    {
        $response = $this->client()->get("/status_by_trackingcode/{$trackingCode}");
        return $response->json();
    }

    /**
     * 4. Checking Current Balance
     */
    public function getCurrentBalance()
    {
        $response = $this->client()->get('/get_balance');
        return $response->json();
    }
}