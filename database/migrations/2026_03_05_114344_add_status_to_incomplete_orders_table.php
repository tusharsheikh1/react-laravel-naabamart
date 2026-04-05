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
    Schema::table('incomplete_orders', function (Blueprint $table) {
        // Default is 'pending'. Logic will flip it to 'converted' or 'lost'.
        $table->string('status')->default('pending')->after('is_converted');
        $table->index('status');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incomplete_orders', function (Blueprint $table) {
            //
        });
    }
};
