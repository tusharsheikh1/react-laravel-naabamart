<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AnalyticsEventService;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    protected $analyticsService;

    public function __construct(AnalyticsEventService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Store a tracking event sent from the frontend.
     * Updated to include 'checkout_start' in allowed event types.
     */
    public function trackEvent(Request $request)
    {
        // 1. Use manual Validator so it doesn't trigger a 302 Redirect on failure
        $validator = Validator::make($request->all(), [
            'product_id' => 'nullable|exists:products,id', // product_id is optional for checkout_start
            'event_type' => 'required|in:view,add_to_cart,remove_from_cart,wishlist,compare,scroll,heatmap_click,checkout_start',
            'event_value' => 'nullable|numeric',
            'metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            // Log the validation error for debugging
            Log::warning('Analytics Validation Failed', $validator->errors()->toArray());
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            $this->analyticsService->logEvent(
                $request->product_id,
                $request->event_type,
                $request->event_value,
                $request->metadata ?? []
            );

            return response()->json(['status' => 'success']);
        } catch (\Exception $e) {
            // Log server-side errors
            Log::error('Analytics DB Insert failed: ' . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => 'Server error'], 500);
        }
    }
}