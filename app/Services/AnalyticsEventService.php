<?php

namespace App\Services;

use App\Models\ProductInteractionEvent;
use App\Models\ProductDailyAnalytic;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AnalyticsEventService
{
    /**
     * Log a product or site interaction event and update real-time daily metrics.
     *
     * @param int|null $productId
     * @param string $eventType
     * @param mixed $eventValue
     * @param array|null $metadata
     * @param string|null $eventDate Used to adjust stats for a specific past date (e.g., cancellations)
     */
    public function logEvent($productId, $eventType, $eventValue = null, $metadata = [], $eventDate = null)
    {
        $sessionId = Session::getId() ?: request()->ip() ?: 'guest_' . uniqid();

        // 1. Log the raw event for granular history (e.g., scroll, heatmap, checkout_start)
        // Note: We skip logging 'cancel_purchase' to the raw events table to avoid ENUM conflicts,
        // but we still use it to update the Daily Analytics totals below.
        if ($eventType !== 'cancel_purchase') {
            ProductInteractionEvent::create([
                'session_id' => $sessionId,
                'user_id' => Auth::check() ? Auth::id() : null,
                'product_id' => $productId, // Required for 'checkout_start' to track conversion per product
                'event_type' => $eventType,
                'event_value' => $eventValue,
                'metadata' => $metadata,
            ]);
        }

        // If there is no product_id (e.g., generic site-wide events), we stop here 
        // because daily product analytics require a specific product to update.
        // NOTE: Make sure your Checkout Controller passes the $productId when logging 'checkout_start'!
        if (!$productId) {
            return true;
        }

        // Determine which day we are updating (useful for deducting from the original order date)
        $targetDate = $eventDate ? Carbon::parse($eventDate)->toDateString() : now()->toDateString();

        // 2. TRUE REAL-TIME UPDATE: Instantly update the daily summary for the dashboard
        $dailyAnalytic = ProductDailyAnalytic::firstOrCreate(
            ['product_id' => $productId, 'date' => $targetDate],
            [
                'views' => 0, 
                'add_to_carts' => 0, 
                'cart_abandonments' => 0,
                'purchases' => 0, 
                'units_sold' => 0, 
                'revenue' => 0, 
                'gross_margin' => 0, 
                'conversion_rate' => 0,
                'add_to_cart_rate' => 0,
                'abandonment_rate' => 0
            ]
        );

        // We use memory math (+= and -=) followed by a single save() to ensure 
        // that rates are calculated based on the newest values before the record is stored.
        if ($eventType === 'view') {
            $dailyAnalytic->views += 1;
        } elseif ($eventType === 'add_to_cart') {
            $dailyAnalytic->add_to_carts += 1;
        } elseif ($eventType === 'remove_from_cart') {
            $dailyAnalytic->cart_abandonments += 1;
        } elseif ($eventType === 'purchase') {
            $dailyAnalytic->purchases += 1;
            $dailyAnalytic->units_sold += (int) ($metadata['quantity'] ?? 1);
            $dailyAnalytic->revenue += (float) ($metadata['revenue'] ?? 0);
            $dailyAnalytic->gross_margin += (float) ($metadata['gross_margin'] ?? 0);
        } elseif ($eventType === 'cancel_purchase') {
            // Deduct stats (using max(0, ...) to ensure numbers never turn negative)
            $dailyAnalytic->purchases = max(0, $dailyAnalytic->purchases - 1);
            $dailyAnalytic->units_sold = max(0, $dailyAnalytic->units_sold - (int) ($metadata['quantity'] ?? 1));
            $dailyAnalytic->revenue = max(0, $dailyAnalytic->revenue - (float) ($metadata['revenue'] ?? 0));
            $dailyAnalytic->gross_margin = max(0, $dailyAnalytic->gross_margin - (float) ($metadata['gross_margin'] ?? 0));
        }

        // 3. Recalculate Performance Rates Instantly
        if ($dailyAnalytic->views > 0) {
            // Conversion Rate: (Purchases / Views)
            $dailyAnalytic->conversion_rate = round(($dailyAnalytic->purchases / $dailyAnalytic->views) * 100, 2);
            
            // Add-to-Cart Rate: (Add to Carts / Views)
            $dailyAnalytic->add_to_cart_rate = round(($dailyAnalytic->add_to_carts / $dailyAnalytic->views) * 100, 2);
        } else {
            $dailyAnalytic->conversion_rate = 0;
            $dailyAnalytic->add_to_cart_rate = 0;
        }

        if ($dailyAnalytic->add_to_carts > 0) {
            // Abandonment Rate: (Abandonments / Add to Carts)
            $dailyAnalytic->abandonment_rate = round(($dailyAnalytic->cart_abandonments / $dailyAnalytic->add_to_carts) * 100, 2);
        } else {
            $dailyAnalytic->abandonment_rate = 0;
        }

        $dailyAnalytic->save();

        return true;
    }
}