<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('landing_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            
            // A/B Testing Support
            $table->foreignId('parent_id')->nullable()->constrained('landing_pages')->cascadeOnDelete();
            $table->string('variant_name')->nullable(); // e.g., 'Variant A', 'Variant B'
            
            // Core Builder Payload
            $table->longText('content_json')->nullable(); // Craft.js serialized JSON
            
            // SEO & Marketing
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_image')->nullable();
            $table->json('tracking_scripts')->nullable(); // { "fb_pixel": "...", "gtag": "..." }
            
            // Analytics
            $table->unsignedBigInteger('views')->default(0);
            $table->unsignedBigInteger('conversions')->default(0); // Updated via Checkout hook
            
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('landing_pages');
    }
};