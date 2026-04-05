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
    Schema::create('product_intelligence_predictions', function (Blueprint $table) {
        $table->foreignId('product_id')->primary()->constrained()->cascadeOnDelete();
        $table->integer('predicted_demand_30d')->default(0);
        $table->date('predicted_stockout_date')->nullable();
        $table->decimal('suggested_dynamic_price', 10, 2)->nullable();
        $table->decimal('velocity_score', 5, 2)->default(0)->comment('0.0 to 10.0');
        $table->timestamps();
    });

    Schema::create('customer_product_affinities', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->decimal('affinity_score', 5, 4)->comment('0.0000 to 1.0000');
        $table->timestamp('last_calculated_at')->useCurrent();
        
        $table->unique(['user_id', 'product_id']);
    });

    Schema::create('product_recommendations', function (Blueprint $table) {
        $table->id();
        $table->foreignId('primary_product_id')->constrained('products')->cascadeOnDelete();
        $table->foreignId('recommended_product_id')->constrained('products')->cascadeOnDelete();
        $table->enum('relationship_type', ['frequently_bought_together', 'upsell', 'similar_item']);
        $table->decimal('confidence_score', 5, 4)->comment('0.0000 to 1.0000');
        $table->timestamps();
        
        $table->unique(['primary_product_id', 'recommended_product_id', 'relationship_type'], 'prod_rec_unique');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_predictive_tables');
    }
};
