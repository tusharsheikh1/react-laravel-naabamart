<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Stores the full BDCourier JSON response
            $table->json('courier_history')->nullable()->after('courier_status');
            // Timestamp of when the data was last fetched
            $table->timestamp('courier_history_fetched_at')->nullable()->after('courier_history');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['courier_history', 'courier_history_fetched_at']);
        });
    }
};