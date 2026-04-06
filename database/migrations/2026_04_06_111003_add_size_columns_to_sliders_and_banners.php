<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('sliders', function (Blueprint $table) {
            $table->string('desktop_size')->default('medium')->after('link');
            $table->string('mobile_size')->default('medium')->after('desktop_size');
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->string('desktop_size')->default('medium')->after('link');
            $table->string('mobile_size')->default('medium')->after('desktop_size');
        });
    }

    public function down()
    {
        Schema::table('sliders', function (Blueprint $table) {
            $table->dropColumn(['desktop_size', 'mobile_size']);
        });

        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn(['desktop_size', 'mobile_size']);
        });
    }
};