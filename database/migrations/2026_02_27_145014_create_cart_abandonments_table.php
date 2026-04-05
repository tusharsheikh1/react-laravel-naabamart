<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  // Cart Abandonments Migration
public function up(): void {
    Schema::create('cart_abandonments', function (Blueprint $table) {
        $table->id();
        $table->string('session_id')->index();
        $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
        $table->foreignId('product_id')->constrained()->cascadeOnDelete();
        $table->timestamp('added_at');
        $table->timestamp('abandoned_at')->nullable();
        $table->boolean('recovered')->default(false)->comment('True if they eventually bought it');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_abandonments');
    }
};
