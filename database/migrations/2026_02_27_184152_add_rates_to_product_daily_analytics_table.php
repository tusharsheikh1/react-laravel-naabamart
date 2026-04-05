<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_daily_analytics', function (Blueprint $table) {
            $table->decimal('add_to_cart_rate', 5, 2)->default(0)->after('conversion_rate');
            $table->decimal('abandonment_rate', 5, 2)->default(0)->after('add_to_cart_rate');
            $table->decimal('return_rate', 5, 2)->default(0)->after('abandonment_rate');
        });
    }

    public function down(): void
    {
        Schema::table('product_daily_analytics', function (Blueprint $table) {
            $table->dropColumn(['add_to_cart_rate', 'abandonment_rate', 'return_rate']);
        });
    }
};