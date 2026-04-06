<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            // Group key: slider_1..5 or banner_1..5
            // Placed after `id`, default slider_1 so existing rows are unaffected
            $table->string('group')->default('slider_1')->after('id')->index();

            // Mobile-specific image (optional — falls back to `image` if null)
            $table->string('mobile_image')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('sliders', function (Blueprint $table) {
            $table->dropIndex(['group']);
            $table->dropColumn(['group', 'mobile_image']);
        });
    }
};