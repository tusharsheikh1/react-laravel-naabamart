<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\ProductInventory;
use Illuminate\Support\Facades\Log;
// use Illuminate\Support\Facades\Mail; // Uncomment when you have a mailable ready

class CheckLowStockLevels implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        $lowStockItems = ProductInventory::with('product', 'warehouse')
            ->whereColumn('current_stock', '<=', 'low_stock_threshold')
            ->get();

        if ($lowStockItems->count() > 0) {
            // For now, we will log it. You can easily swap this with a Mail::to('admin@store.com')->send(...)
            Log::warning('Low Stock Alert: ' . $lowStockItems->count() . ' items are below their threshold.');
            
            foreach ($lowStockItems as $item) {
                Log::warning("Product: {$item->product->name} in Warehouse: {$item->warehouse->name} has only {$item->current_stock} left.");
            }
        }
    }
}