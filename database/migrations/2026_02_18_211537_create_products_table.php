<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Products Table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('type', ['general', 'digital', 'book'])->default('general');
            $table->string('sku')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('weight', 8, 2)->default(0.00); // Required for all
            
            // Discount & Shipping
            $table->enum('discount_type', ['percent', 'fixed'])->nullable();
            $table->decimal('discount_value', 10, 2)->nullable();
            $table->boolean('is_free_shipping')->default(false);
            
            // Descriptions
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            
            // Media
            $table->string('thumbnail')->nullable();
            
            // Relations
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained()->nullOnDelete(); // General
            $table->foreignId('author_id')->nullable()->constrained()->nullOnDelete(); // Book
            $table->foreignId('publication_id')->nullable()->constrained()->nullOnDelete(); // Book
            
            // Book Specific
            $table->integer('pages')->nullable();
            $table->string('edition')->nullable();
            $table->string('language')->nullable();
            $table->string('country')->nullable();
            
            // Digital Specific
            $table->string('digital_file')->nullable();
            $table->string('download_link')->nullable();
            $table->text('license_key')->nullable();
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            
            // Inventory (Simple)
            $table->integer('stock_quantity')->default(0);
            $table->boolean('has_variants')->default(false);
            
            $table->boolean('status')->default(true);
            $table->timestamps();
        });

        // 2. Product Variants (Color/Size)
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('color_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('size_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('stock_quantity')->default(0);
            $table->decimal('price_adjustment', 10, 2)->default(0.00); // + or - price
            $table->timestamps();
        });

        // 3. Product Gallery Images
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('image_path');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_variants');
        Schema::dropIfExists('products');
    }
};