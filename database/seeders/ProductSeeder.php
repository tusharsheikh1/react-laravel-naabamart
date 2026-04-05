<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $electronicsCategory = Category::where('name', 'Smartphones')->first();
        $booksCategory = Category::where('name', 'Programming Books')->first();

        // General Product with Percentage Discount
        $phone = Product::create([
            'name' => 'Smartphone X Pro',
            'slug' => 'smartphone-x-pro',
            'type' => 'general',
            'sku' => 'PHN-001',
            'price' => 50000.00,
            'weight' => 0.5,
            'discount_type' => 'percent',
            'discount_value' => 10.00, // 10% off
            'is_free_shipping' => true,
            'short_description' => 'A high-end smartphone.',
            'description' => 'Full details about Smartphone X Pro...',
            'stock_quantity' => 50,
            'has_variants' => false,
            'status' => 1, // Changed from 'active' to 1
        ]);
        if ($electronicsCategory) {
            $phone->categories()->attach($electronicsCategory->id);
        }

        // Book Product with Fixed Discount
        $book = Product::create([
            'name' => 'Mastering Laravel',
            'slug' => 'mastering-laravel',
            'type' => 'book',
            'sku' => 'BOK-001',
            'price' => 1200.00,
            'weight' => 1.2,
            'discount_type' => 'fixed',
            'discount_value' => 200.00, // 200 BDT off
            'is_free_shipping' => false,
            'short_description' => 'Advanced Laravel techniques.',
            'pages' => 450,
            'edition' => '2nd Edition',
            'language' => 'English',
            'stock_quantity' => 100,
            'status' => 1, // Changed from 'active' to 1
        ]);
        if ($booksCategory) {
            $book->categories()->attach($booksCategory->id);
        }

        // Digital Product (No shipping weight needed)
        Product::create([
            'name' => 'UI/UX Design Template',
            'slug' => 'ui-ux-design-template',
            'type' => 'digital',
            'sku' => 'DIG-001',
            'price' => 1500.00,
            'discount_type' => 'fixed',
            'discount_value' => 0,
            'is_free_shipping' => true,
            'short_description' => 'Figma dashboard template.',
            'download_link' => 'https://example.com/download/template.zip',
            'stock_quantity' => 9999, // Unlimited for digital
            'status' => 1, // Changed from 'active' to 1
        ]);
    }
}