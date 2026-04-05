<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\ProductDailyAnalytic;
use App\Models\ProductInteractionEvent;
use App\Models\OrderItem;
use App\Models\ReturnAndRefund;
use Carbon\Carbon;

class CalculateDailyProductAnalytics extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'analytics:calculate-daily {--date= : The date to calculate for (Y-m-d)}';

    /**
     * The console command description.
     * @var string
     */
    protected $description = 'Aggregates comprehensive daily product interactions, sales, and rates';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. Determine the target date
        $dateString = $this->option('date') ?: Carbon::today()->toDateString();
        $targetDate = Carbon::parse($dateString);

        $this->info("Calculating comprehensive analytics for: {$targetDate->toDateString()}");

        $totalProducts = Product::count();
        $bar = $this->output->createProgressBar($totalProducts);

        // 2. Process products in chunks for performance
        Product::chunk(100, function ($products) use ($targetDate, $bar) {
            foreach ($products as $product) {
                // 3. Fetch all interaction events for this product and date
                $events = ProductInteractionEvent::where('product_id', $product->id)
                    ->whereDate('created_at', $targetDate)
                    ->get();

                $views = $events->where('event_type', 'view')->count();
                $addToCarts = $events->where('event_type', 'add_to_cart')->count();
                
                // Pull abandonments from the 'remove_from_cart' event to match the Analytics Service
                $abandonments = $events->where('event_type', 'remove_from_cart')->count();

                // 4. Fetch sales and return data
                $orderItems = OrderItem::where('product_id', $product->id)
                    ->whereHas('order', function($query) use ($targetDate) {
                        $query->whereDate('created_at', $targetDate)
                              ->whereNotIn('order_status', ['cancelled', 'failed', 'returned']);
                    })->get();

                $returns = ReturnAndRefund::whereHas('orderItem', function($query) use ($product) {
                        $query->where('product_id', $product->id);
                    })
                    ->whereDate('created_at', $targetDate)
                    ->count();

                $purchases = $orderItems->count();
                $unitsSold = $orderItems->sum('quantity');
                
                // UPDATED: Calculate revenue using the product's final discounted price 
                // rather than the raw item price (which may just be the regular price)
                $revenue = $orderItems->sum(fn($item) => $product->final_price * $item->quantity);
                
                // Calculate margin properly. 
                // Uses order item unit_cost if available, otherwise falls back to the product's cost_price
                $grossMargin = $orderItems->sum(function($item) use ($product) {
                    $costPrice = $item->unit_cost > 0 ? $item->unit_cost : ($product->cost_price ?? 0);
                    // We also ensure margin uses the final_price to reflect the actual profit accurately
                    return ($product->final_price - $costPrice) * $item->quantity;
                });

                // 5. Rate Calculations with safe division
                $conversionRate = $views > 0 ? round(($purchases / $views) * 100, 2) : 0;
                $atcRate = $views > 0 ? round(($addToCarts / $views) * 100, 2) : 0;
                
                // Calculate Abandonment Rate consistently with ATC and Conversion rates
                $abandonRate = $addToCarts > 0 ? round(($abandonments / $addToCarts) * 100, 2) : 0;
                $returnRate = $unitsSold > 0 ? round(($returns / $unitsSold) * 100, 2) : 0;

                // 6. Update or create the daily analytic record
                ProductDailyAnalytic::updateOrCreate(
                    [
                        'product_id' => $product->id,
                        'date' => $targetDate->toDateString(),
                    ],
                    [
                        'views' => $views,
                        'add_to_carts' => $addToCarts,
                        'cart_abandonments' => $abandonments,
                        'purchases' => $purchases,
                        'units_sold' => $unitsSold,
                        'revenue' => $revenue,
                        'gross_margin' => $grossMargin,
                        'returns' => $returns,
                        'conversion_rate' => $conversionRate,
                        'add_to_cart_rate' => $atcRate,
                        'abandonment_rate' => $abandonRate,
                        'return_rate' => $returnRate,
                    ]
                );

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();
        $this->info('Daily analytics calculation complete!');
    }
}