<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up(): void {
    Schema::create('product_daily_analytics', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->date('date');
        
        // Behavior
        $table->integer('views')->default(0);
        $table->integer('add_to_carts')->default(0);
        $table->integer('cart_abandonments')->default(0);
        
        // Sales
        $table->integer('purchases')->default(0);
        $table->integer('units_sold')->default(0);
        $table->decimal('revenue', 12, 2)->default(0);
        $table->decimal('gross_margin', 12, 2)->default(0);
        $table->integer('returns')->default(0);
        
        // Calculated ratios (optional, but good for skipping math on the frontend)
        $table->decimal('conversion_rate', 5, 2)->default(0);
        
        $table->timestamps();

        // One record per product per day
        $table->unique(['product_id', 'date']);
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_daily_analytics');
    }
};
