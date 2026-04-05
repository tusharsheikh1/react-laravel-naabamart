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
    // Add this line to drop the broken table first
    Schema::dropIfExists('product_interaction_events');

    Schema::create('product_interaction_events', function (Blueprint $table) {
        $table->id();
        $table->string('session_id')->index(); // For guest tracking
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->enum('event_type', ['view', 'add_to_cart', 'remove_from_cart', 'wishlist', 'compare', 'scroll', 'heatmap_click']);
        $table->decimal('event_value', 10, 2)->nullable()->comment('E.g., scroll percentage or time spent');
        $table->json('metadata')->nullable()->comment('Extra context like clicked element ID');
        $table->timestamp('created_at')->useCurrent();
        
        // Composite index for ultra-fast analytical filtering
        $table->index(['product_id', 'event_type', 'created_at'], 'prod_interaction_idx');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_interaction_events');
    }
};
