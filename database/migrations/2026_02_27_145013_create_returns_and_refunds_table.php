<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('returns_and_refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reason');
            $table->decimal('refund_amount', 10, 2);
            $table->enum('condition', ['restockable', 'damaged', 'defective', 'disposed']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('returns_and_refunds');
    }
};