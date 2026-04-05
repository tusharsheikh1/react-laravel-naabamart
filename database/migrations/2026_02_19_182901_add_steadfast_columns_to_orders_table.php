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
        Schema::table('orders', function (Blueprint $table) {
            // Add columns for Steadfast Courier integration
            $table->string('consignment_id')->nullable()->after('order_status');
            $table->string('tracking_code')->nullable()->after('consignment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Drop the columns if we rollback
            $table->dropColumn(['consignment_id', 'tracking_code']);
        });
    }
};