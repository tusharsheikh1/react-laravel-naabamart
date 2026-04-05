<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('incomplete_orders', function (Blueprint $table) {
        $table->id();
        $table->string('session_id')->unique();
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        $table->string('full_name')->nullable();
        $table->string('phone')->nullable();
        $table->text('address')->nullable();
        $table->json('cart_data')->nullable();
        $table->boolean('is_converted')->default(false); // Changes to true if they actually order
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('incomplete_orders');
    }
};
