<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\ProductInteractionEvent;
use App\Models\ProductIntelligencePrediction;
use App\Models\ProductInventory;
use Carbon\Carbon;

class GenerateProductIntelligence extends Command
{
    protected $signature = 'analytics:generate-intelligence';
    protected $description = 'Calculates basic predictive analytics like demand forecasting and stockout dates';

    public function handle()
    {
        $this->info("Generating Product Intelligence...");
        
        // Chunking is better for memory if you have a lot of products
        Product::chunk(100, function ($products) {
            $thirtyDaysAgo = Carbon::now()->subDays(30);
            $sevenDaysAgo = Carbon::now()->subDays(7);

            foreach ($products as $product) {
                // 1. Calculate 30-Day Velocity using real-time OrderItems
                $past30DaysSales = OrderItem::where('product_id', $product->id)
                    ->whereHas('order', function ($query) use ($thirtyDaysAgo) {
                        $query->where('created_at', '>=', $thirtyDaysAgo)
                              ->where('order_status', '!=', 'cancelled');
                    })
                    ->sum('quantity');

                $dailyVelocity = $past30DaysSales / 30;

                // 2. Predict Demand for next 30 days (last 30 days + 5% growth)
                $predictedDemand = round($past30DaysSales * 1.05);

                // 3. Predict Stockout Date
                $inventory = ProductInventory::where('product_id', $product->id)->sum('current_stock');
                $stockoutDate = null;
                
                if ($dailyVelocity > 0 && $inventory > 0) {
                    // How many days until we run out based on current velocity?
                    $daysUntilStockout = floor($inventory / $dailyVelocity);
                    $stockoutDate = Carbon::now()->addDays($daysUntilStockout)->toDateString();
                } elseif ($inventory <= 0) {
                    $stockoutDate = Carbon::now()->toDateString(); // Already stocked out
                }

                // 4. Calculate Velocity Score using live ProductInteractionEvents
                $recentViews = ProductInteractionEvent::where('product_id', $product->id)
                    ->where('event_type', 'view')
                    ->where('created_at', '>=', $sevenDaysAgo)
                    ->count();
                
                // Formula: 1 point for every 10 sales, 1 point for every 100 views, capped at 10
                $velocityScore = min(10, (($past30DaysSales / 10) + ($recentViews / 100)));

                // 5. Save the Prediction
                ProductIntelligencePrediction::updateOrCreate(
                    ['product_id' => $product->id],
                    [
                        'predicted_demand_30d' => $predictedDemand,
                        'predicted_stockout_date' => $stockoutDate,
                        'velocity_score' => $velocityScore,
                    ]
                );
            }
        });

        $this->info("Intelligence generated successfully!");
    }
}