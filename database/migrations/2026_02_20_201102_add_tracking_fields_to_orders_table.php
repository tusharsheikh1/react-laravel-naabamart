<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('ip_address', 45)->nullable()->after('notes');
            $table->text('user_agent')->nullable()->after('ip_address');
            $table->string('device_fingerprint')->nullable()->after('user_agent');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent', 'device_fingerprint']);
        });
    }
};