<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductDailyAnalytic;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ProductBehaviorController extends Controller
{
    public function index(Request $request)
    {
        $filter = $request->input('filter', 'today'); // Default to today
        $now = Carbon::now();

        // 1. Set Time Boundaries
        switch ($filter) {
            case 'last_30_days':
                $startDate = $now->copy()->subDays(30)->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
            case 'yesterday':
                $startDate = $now->copy()->subDay()->startOfDay();
                $endDate = $now->copy()->subDay()->endOfDay();
                break;
            case 'this_week':
                $startDate = $now->copy()->startOfWeek();
                $endDate = $now->copy()->endOfWeek();
                break;
            case 'last_week':
                $startDate = $now->copy()->subWeek()->startOfWeek();
                $endDate = $now->copy()->subWeek()->endOfWeek();
                break;
            case 'this_month':
                $startDate = $now->copy()->startOfMonth();
                $endDate = $now->copy()->endOfMonth();
                break;
            case 'last_month':
                $startDate = $now->copy()->subMonth()->startOfMonth();
                $endDate = $now->copy()->subMonth()->endOfMonth();
                break;
            case 'this_year':
                $startDate = $now->copy()->startOfYear();
                $endDate = $now->copy()->endOfYear();
                break;
            case 'last_year':
                $startDate = $now->copy()->subYear()->startOfYear();
                $endDate = $now->copy()->subYear()->endOfYear();
                break;
            case 'custom':
                $startDate = $request->filled('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $now->copy()->startOfDay();
                $endDate = $request->filled('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $now->copy()->endOfDay();
                break;
            case 'today':
            default:
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
        }

        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        // Helper function to build the base query for Daily Analytics
        $getBaseAnalyticsQuery = function () use ($startDateStr, $endDateStr) {
            return ProductDailyAnalytic::with('product:id,name,thumbnail')
                ->whereHas('product') // Ensure the product actually exists
                ->whereBetween('date', [$startDateStr, $endDateStr]);
        };

        // 2. Most Viewed Products
        $topViewed = $getBaseAnalyticsQuery()
            ->select('product_id', DB::raw('SUM(views) as total_views'))
            ->groupBy('product_id')
            ->orderByDesc('total_views')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'total_views' => (int) $item->total_views,
                    'product' => $item->product, 
                ];
            });

        // 3. Most Added-to-Cart
        $topATC = $getBaseAnalyticsQuery()
            ->select('product_id', DB::raw('SUM(add_to_carts) as total_atc'))
            ->groupBy('product_id')
            ->orderByDesc('total_atc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'product_id' => $item->product_id,
                    'total_atc' => (int) $item->total_atc,
                    'product' => $item->product,
                ];
            });

        // 4. Scroll Depth Calculation (Uses timestamps, not string dates)
        $scrollQuery = DB::table('product_interaction_events')
            ->select('event_value', DB::raw('COUNT(*) as total_events'))
            ->where('event_type', 'scroll')
            ->whereNotNull('event_value')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $rawScrollData = $scrollQuery
            ->groupBy('event_value')
            ->get()
            ->keyBy(function($item) {
                return (string) round((float) $item->event_value); 
            });

        // Map over exactly the 4 markers we expect
        $scrollDepth = collect([25, 50, 75, 100])->map(function ($marker) use ($rawScrollData) {
            $stringMarker = (string) $marker;
            return [
                'event_value' => $marker . '%',
                'count' => $rawScrollData->has($stringMarker) ? (int) $rawScrollData[$stringMarker]->total_events : 0
            ];
        })->values();

        // 5. Checkout to Order Conversion by Product
        $checkoutStartsQuery = DB::table('product_interaction_events')
            ->select('product_id', DB::raw('COUNT(*) as checkouts'))
            ->where('event_type', 'checkout_start')
            ->whereNotNull('product_id')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $checkoutStarts = $checkoutStartsQuery->groupBy('product_id')->get()->keyBy('product_id');

        $purchasesQuery = DB::table('product_interaction_events')
            ->select('product_id', DB::raw('COUNT(*) as purchases'))
            ->where('event_type', 'purchase')
            ->whereNotNull('product_id')
            ->whereBetween('created_at', [$startDate, $endDate]);

        $purchases = $purchasesQuery->groupBy('product_id')->get()->keyBy('product_id');

        $checkoutConversionIds = $checkoutStarts->keys()->merge($purchases->keys())->unique();
        $checkoutProducts = \App\Models\Product::whereIn('id', $checkoutConversionIds)
            ->select('id', 'name', 'thumbnail')
            ->get()
            ->keyBy('id');

        $checkoutConversion = collect();
        foreach ($checkoutConversionIds as $pId) {
            if (!$checkoutProducts->has($pId)) continue;
            
            $cCount = $checkoutStarts->has($pId) ? (int) $checkoutStarts[$pId]->checkouts : 0;
            $pCount = $purchases->has($pId) ? (int) $purchases[$pId]->purchases : 0;
            
            // Calculate rate safely
            $rate = $cCount > 0 ? round(($pCount / $cCount) * 100, 2) : ($pCount > 0 ? 100 : 0);

            $checkoutConversion->push([
                'product_id' => $pId,
                'product' => $checkoutProducts[$pId],
                'checkouts' => $cCount,
                'purchases' => $pCount,
                'rate' => $rate,
            ]);
        }

        // Sort by most checkouts initiated, take top 10
        $checkoutConversion = $checkoutConversion->sortByDesc('checkouts')->take(10)->values();

        return Inertia::render('Admin/Analytics/ProductBehavior', [
            'topViewed' => $topViewed,
            'topATC' => $topATC,
            'scrollDepth' => $scrollDepth,
            'checkoutConversion' => $checkoutConversion,
            'currentFilter' => $filter,
            'dateRange' => ['start' => $startDateStr, 'end' => $endDateStr],
        ]);
    }
}