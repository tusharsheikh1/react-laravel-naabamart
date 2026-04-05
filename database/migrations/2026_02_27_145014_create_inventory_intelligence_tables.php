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
    Schema::create('warehouses', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('location')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
    });

    Schema::create('product_inventory', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
        $table->integer('current_stock')->default(0);
        $table->integer('low_stock_threshold')->default(10);
        $table->timestamp('last_restocked_at')->nullable();
        $table->timestamps();
        
        $table->unique(['product_id', 'warehouse_id']);
    });

    Schema::create('inventory_movements', function (Blueprint $table) {
        $table->id();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
        $table->enum('movement_type', ['sale', 'restock', 'return', 'shrinkage', 'adjustment']);
        $table->integer('quantity_changed');
        $table->integer('balance_after');
        $table->string('reference_type')->nullable()->comment('E.g., App\Models\Order');
        $table->unsignedBigInteger('reference_id')->nullable();
        $table->timestamp('created_at')->useCurrent();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_intelligence_tables');
    }
};
