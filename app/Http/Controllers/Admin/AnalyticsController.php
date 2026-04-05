<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductInteractionEvent;
use App\Models\ProductInventory;
use App\Models\ProductDailyAnalytic;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        // Changed default to 'today'
        $filter = $request->input('filter', 'today');
        $now = Carbon::now();

        // 1. Set Time Boundaries based on the selected filter
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
            default: // Default is now 'today'
                $startDate = $now->copy()->startOfDay();
                $endDate = $now->copy()->endOfDay();
                break;
        }

        $startDateStr = $startDate->toDateString();
        $endDateStr = $endDate->toDateString();

        // 2. High-Level Store Overview (Updated to include ATC and Purchase counts)
        $summary = ProductDailyAnalytic::whereBetween('date', [$startDateStr, $endDateStr])
            ->selectRaw('
                SUM(views) as total_views,
                SUM(add_to_carts) as total_atc,
                SUM(revenue) as total_revenue,
                SUM(gross_margin) as total_margin,
                SUM(purchases) as total_purchases
            ')->first();

        $totalViews = (int) ($summary->total_views ?? 0);
        $totalATC = (int) ($summary->total_atc ?? 0);
        $totalPurchases = (int) ($summary->total_purchases ?? 0);
        $totalRevenue = (float) ($summary->total_revenue ?? 0);
        $totalMargin = (float) ($summary->total_margin ?? 0);
        
        $conversionRate = $totalViews > 0 
            ? round(($totalPurchases / $totalViews) * 100, 2) 
            : 0;

        // 3. Chart Data
        $dailyMetrics = ProductDailyAnalytic::whereBetween('date', [$startDateStr, $endDateStr])
            ->selectRaw('date, SUM(revenue) as daily_revenue, SUM(views) as daily_views')
            ->groupBy('date')
            ->get()
            ->keyBy(fn($item) => Carbon::parse($item->date)->toDateString());

        $chartData = collect();
        $period = CarbonPeriod::create($startDateStr, $endDateStr);
        
        foreach ($period as $date) {
            $dateString = $date->toDateString();
            $metrics = $dailyMetrics->get($dateString);

            $chartData->push([
                'date' => $dateString,
                'daily_revenue' => $metrics ? (float) $metrics->daily_revenue : 0,
                'daily_views' => $metrics ? (int) $metrics->daily_views : 0,
            ]);
        }

        // 4. Top Performing Products
        $topProducts = ProductDailyAnalytic::with('product:id,name,thumbnail')
            ->whereBetween('date', [$startDateStr, $endDateStr])
            ->selectRaw('
                product_id, 
                SUM(revenue) as total_revenue, 
                SUM(units_sold) as total_sold,
                AVG(conversion_rate) as avg_conversion_rate,
                AVG(add_to_cart_rate) as avg_atc_rate,
                AVG(abandonment_rate) as avg_abandonment_rate,
                SUM(returns) as total_returns
            ')
            ->groupBy('product_id')
            ->orderByDesc('total_revenue')
            ->take(10)
            ->get();

        // 5. REAL-TIME AI Stockout Predictions
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $salesSubquery = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', $thirtyDaysAgo)
            ->where('orders.order_status', '!=', 'cancelled')
            ->select('product_id', DB::raw('SUM(quantity) as past_30_days_sales'))
            ->groupBy('product_id');

        $stockoutWarnings = Product::select('products.*', 'sales.past_30_days_sales')
            ->joinSub($salesSubquery, 'sales', 'products.id', '=', 'sales.product_id')
            ->withSum('inventory', 'current_stock')
            ->get()
            ->map(function ($product) {
                $invStock = $product->inventory_sum_current_stock;
                $totalStock = ($invStock !== null && $invStock > 0) ? $invStock : (int) $product->stock_quantity;
                
                $dailyVelocity = $product->past_30_days_sales / 30;
                
                $daysUntilStockout = ($dailyVelocity > 0 && $totalStock > 0) 
                    ? (int) floor($totalStock / $dailyVelocity) 
                    : ($totalStock <= 0 ? 0 : 999);

                return [
                    'product_id' => $product->id,
                    'product' => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'thumbnail' => $product->thumbnail,
                    ],
                    'total_stock' => $totalStock,
                    'past_30_days_sales' => $product->past_30_days_sales,
                    'days_until_stockout' => $daysUntilStockout,
                    'predicted_stockout_date' => Carbon::now()->addDays($daysUntilStockout)->toDateString(),
                ];
            })
            ->filter(fn($item) => $item['days_until_stockout'] <= 14)
            ->sortBy('days_until_stockout')
            ->values();

        // 6. Real-time Low Stock Alerts
        $inventoryAlerts = ProductInventory::with('product:id,name,thumbnail', 'warehouse:id,name')
            ->where(function($query) {
                $query->whereColumn('current_stock', '<=', 'low_stock_threshold')
                      ->orWhere('current_stock', '<=', 0);
            })
            ->get()
            ->map(function ($inv) {
                return [
                    'id' => 'inv_' . $inv->id,
                    'product_id' => $inv->product_id,
                    'product' => $inv->product,
                    'current_stock' => $inv->current_stock,
                ];
            });

        $productAlerts = Product::where('stock_quantity', '<=', 10) 
            ->select('id', 'name', 'thumbnail', 'stock_quantity')
            ->get()
            ->map(function ($prod) {
                return [
                    'id' => 'prod_' . $prod->id,
                    'product_id' => $prod->id,
                    'product' => [
                        'id' => $prod->id,
                        'name' => $prod->name,
                        'thumbnail' => $prod->thumbnail,
                    ],
                    'current_stock' => $prod->stock_quantity,
                ];
            });

        $lowStockAlerts = $inventoryAlerts->concat($productAlerts)
            ->unique('product_id')
            ->values();

        // 7. Render with Inertia
        return Inertia::render('Admin/Analytics/Index', [
            'currentFilter' => $filter,
            'dateRange' => ['start' => $startDateStr, 'end' => $endDateStr],
            'overview' => [
                'revenue' => $totalRevenue,
                'margin' => $totalMargin,
                'views' => $totalViews,
                'atc' => $totalATC,
                'purchases' => $totalPurchases,
                'conversionRate' => $conversionRate,
            ],
            'chartData' => $chartData,
            'topProducts' => $topProducts,
            'alerts' => [
                'stockouts' => $stockoutWarnings,
                'lowStock' => $lowStockAlerts,
            ]
        ]);
    }
}