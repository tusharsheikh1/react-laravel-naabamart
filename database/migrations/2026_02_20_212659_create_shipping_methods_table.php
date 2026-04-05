<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., Inside Dhaka, Outside Dhaka
            $table->decimal('base_charge', 8, 2)->default(0); // e.g., 60
            $table->decimal('base_weight', 8, 2)->default(1.00); // e.g., 1 kg
            $table->decimal('additional_charge_per_kg', 8, 2)->default(0); // e.g., 15 tk per extra kg
            $table->decimal('free_delivery_threshold', 10, 2)->nullable(); // e.g., Free above 2000 tk
            $table->boolean('status')->default(true); // Active / Inactive
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};