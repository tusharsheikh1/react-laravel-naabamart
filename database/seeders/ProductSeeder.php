<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Product;
use App\Models\Category;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Retrieve categories to attach products to (if they exist in your DB)
        $gadgetsCategory = Category::where('name', 'Gadgets')
            ->orWhere('name', 'Electronics')->first();
            
        $fashionCategory = Category::where('name', 'Fashion')
            ->orWhere('name', 'Clothing')->first();
            
        $foodCategory = Category::where('name', 'Food')
            ->orWhere('name', 'Groceries')->first();

        // Define 30 diverse products (10 Gadgets, 10 Fashion, 10 Food)
        $products = [
            // --- 10 GADGETS ---
            [
                'name' => 'Smartphone X Pro',
                'type' => 'general', // Accepted DB Type
                'category_group' => 'gadget', // Used for SKU/Image Generation
                'price' => 50000.00,
                'weight' => 0.5,
                'discount_type' => 'percent',
                'discount_value' => 10.00,
                'is_free_shipping' => true,
                'short_description' => 'A high-end smartphone with a stunning display.',
                'stock_quantity' => 50,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Wireless Noise-Cancelling Headphones',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 15000.00,
                'weight' => 0.3,
                'discount_type' => 'fixed',
                'discount_value' => 1500.00,
                'is_free_shipping' => true,
                'short_description' => 'Premium over-ear wireless headphones with ANC.',
                'stock_quantity' => 120,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Mechanical Gaming Keyboard',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 8500.00,
                'weight' => 1.1,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'RGB mechanical keyboard with tactile blue switches.',
                'stock_quantity' => 85,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => '4K Ultra HD Smart TV',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 75000.00,
                'weight' => 15.0,
                'discount_type' => 'percent',
                'discount_value' => 15.00,
                'is_free_shipping' => true,
                'short_description' => '55-inch 4K Smart TV with HDR and voice remote.',
                'stock_quantity' => 30,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Bluetooth Fitness Smartwatch',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 12000.00,
                'weight' => 0.1,
                'discount_type' => 'percent',
                'discount_value' => 5.00,
                'is_free_shipping' => true,
                'short_description' => 'Waterproof fitness tracker with heart rate monitor.',
                'stock_quantity' => 200,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Portable NVMe SSD 1TB',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 10500.00,
                'weight' => 0.2,
                'discount_type' => 'fixed',
                'discount_value' => 500.00,
                'is_free_shipping' => true,
                'short_description' => 'High-speed external solid-state drive for creators.',
                'stock_quantity' => 150,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Tablet Pro 11-inch',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 60000.00,
                'weight' => 0.8,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => true,
                'short_description' => 'Powerful tablet for work and entertainment.',
                'stock_quantity' => 45,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => '4K Camera Drone',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 45000.00,
                'weight' => 1.2,
                'discount_type' => 'percent',
                'discount_value' => 10.00,
                'is_free_shipping' => true,
                'short_description' => 'Foldable quadcopter with stabilized 4K video.',
                'stock_quantity' => 25,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Virtual Reality Headset',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 35000.00,
                'weight' => 0.6,
                'discount_type' => 'fixed',
                'discount_value' => 2000.00,
                'is_free_shipping' => true,
                'short_description' => 'Standalone VR headset with immersive graphics.',
                'stock_quantity' => 60,
                'category_id' => $gadgetsCategory?->id,
            ],
            [
                'name' => 'Wireless Earbuds Pro',
                'type' => 'general',
                'category_group' => 'gadget',
                'price' => 8000.00,
                'weight' => 0.1,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => true,
                'short_description' => 'Compact earbuds with spatial audio.',
                'stock_quantity' => 300,
                'category_id' => $gadgetsCategory?->id,
            ],

            // --- 10 FASHION ITEMS ---
            [
                'name' => 'Classic White Cotton T-Shirt',
                'type' => 'general', // DB accepts 'general'
                'category_group' => 'fashion', // Image uses 'FAS'
                'price' => 500.00,
                'weight' => 0.2,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => '100% organic cotton crewneck tee.',
                'stock_quantity' => 500,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Slim Fit Denim Jeans',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 2500.00,
                'weight' => 0.7,
                'discount_type' => 'percent',
                'discount_value' => 15.00,
                'is_free_shipping' => true,
                'short_description' => 'Stretch denim jeans for everyday wear.',
                'stock_quantity' => 150,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Men\'s Leather Wallet',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 1200.00,
                'weight' => 0.1,
                'discount_type' => 'fixed',
                'discount_value' => 100.00,
                'is_free_shipping' => false,
                'short_description' => 'Genuine leather bifold wallet with RFID blocking.',
                'stock_quantity' => 80,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Polarized Aviator Sunglasses',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 1800.00,
                'weight' => 0.1,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => true,
                'short_description' => 'UV400 protection with a classic metal frame.',
                'stock_quantity' => 100,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Lightweight Running Sneakers',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 3500.00,
                'weight' => 0.8,
                'discount_type' => 'percent',
                'discount_value' => 20.00,
                'is_free_shipping' => true,
                'short_description' => 'Breathable mesh sneakers with cushioned soles.',
                'stock_quantity' => 120,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Women\'s Floral Summer Dress',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 2200.00,
                'weight' => 0.3,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Flowy midi dress with floral print.',
                'stock_quantity' => 60,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Cozy Knit Winter Sweater',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 2800.00,
                'weight' => 0.6,
                'discount_type' => 'fixed',
                'discount_value' => 300.00,
                'is_free_shipping' => true,
                'short_description' => 'Warm oversized sweater for cold days.',
                'stock_quantity' => 90,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Water-Resistant Trench Coat',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 5500.00,
                'weight' => 1.2,
                'discount_type' => 'percent',
                'discount_value' => 10.00,
                'is_free_shipping' => true,
                'short_description' => 'Classic double-breasted coat for rainy weather.',
                'stock_quantity' => 40,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Vintage Canvas Backpack',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 3000.00,
                'weight' => 0.9,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => true,
                'short_description' => 'Durable rucksack with leather accents.',
                'stock_quantity' => 75,
                'category_id' => $fashionCategory?->id,
            ],
            [
                'name' => 'Minimalist Leather Watch',
                'type' => 'general',
                'category_group' => 'fashion',
                'price' => 4500.00,
                'weight' => 0.2,
                'discount_type' => 'fixed',
                'discount_value' => 500.00,
                'is_free_shipping' => true,
                'short_description' => 'Elegant quartz watch with genuine leather strap.',
                'stock_quantity' => 110,
                'category_id' => $fashionCategory?->id,
            ],

            // --- 10 FOOD ITEMS ---
            [
                'name' => 'Organic Arabica Coffee Beans',
                'type' => 'general', // DB accepts 'general'
                'category_group' => 'food', // Image uses 'FOO'
                'price' => 850.00,
                'weight' => 0.5,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Freshly roasted whole coffee beans (500g).',
                'stock_quantity' => 200,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Artisanal Dark Chocolate Bar',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 350.00,
                'weight' => 0.1,
                'discount_type' => 'percent',
                'discount_value' => 5.00,
                'is_free_shipping' => false,
                'short_description' => '70% cocoa with sea salt.',
                'stock_quantity' => 300,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Raw Forest Honey 500g',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 600.00,
                'weight' => 0.6,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Unfiltered, pure natural honey.',
                'stock_quantity' => 150,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Himalayan Pink Salt',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 250.00,
                'weight' => 1.0,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Fine grain natural mineral salt.',
                'stock_quantity' => 400,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Matcha Green Tea Powder',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 1200.00,
                'weight' => 0.1,
                'discount_type' => 'fixed',
                'discount_value' => 100.00,
                'is_free_shipping' => true,
                'short_description' => 'Ceremonial grade Japanese matcha.',
                'stock_quantity' => 80,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Gluten-Free Oat Granola',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 450.00,
                'weight' => 0.5,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Crunchy granola with almonds and dried fruit.',
                'stock_quantity' => 250,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Extra Virgin Olive Oil',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 1500.00,
                'weight' => 1.0,
                'discount_type' => 'percent',
                'discount_value' => 10.00,
                'is_free_shipping' => true,
                'short_description' => 'Cold-pressed olive oil (1 Liter).',
                'stock_quantity' => 120,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Spicy Sriracha Chili Sauce',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 300.00,
                'weight' => 0.4,
                'discount_type' => null,
                'discount_value' => 0,
                'is_free_shipping' => false,
                'short_description' => 'Hot sauce made from sun-ripened chilies.',
                'stock_quantity' => 350,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Roasted Almonds Snack Pack',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 700.00,
                'weight' => 0.5,
                'discount_type' => 'fixed',
                'discount_value' => 50.00,
                'is_free_shipping' => false,
                'short_description' => 'Lightly salted premium almonds.',
                'stock_quantity' => 180,
                'category_id' => $foodCategory?->id,
            ],
            [
                'name' => 'Vegan Protein Powder',
                'type' => 'general',
                'category_group' => 'food',
                'price' => 2800.00,
                'weight' => 1.0,
                'discount_type' => 'percent',
                'discount_value' => 15.00,
                'is_free_shipping' => true,
                'short_description' => 'Plant-based chocolate protein powder.',
                'stock_quantity' => 90,
                'category_id' => $foodCategory?->id,
            ],
        ];

        // Loop through the array to create products
        foreach ($products as $index => $data) {
            // Extract temporary keys so they don't break Product::create()
            $categoryId = $data['category_id'] ?? null;
            $categoryGroup = $data['category_group'];
            
            unset($data['category_id']); 
            unset($data['category_group']); // Prevent SQL errors!

            // Generate SKU based on the hidden 'category_group' (e.g., GAD-001)
            $prefix = strtoupper(substr($categoryGroup, 0, 3));
            $sku = $prefix . '-' . str_pad($index + 1, 3, '0', STR_PAD_LEFT);

            // Generate the image
            $thumbnailUrl = "https://picsum.photos/seed/{$sku}/600/600";

            // Merge default required parameters
            $productData = array_merge([
                'slug' => Str::slug($data['name']),
                'sku' => $sku,
                'thumbnail' => $thumbnailUrl, 
                'cost_price' => $data['price'] * 0.7, 
                'description' => 'Full details, specifications, and nutritional info (if applicable) about ' . $data['name'] . '...',
                'status' => 1,
                'has_variants' => false,
            ], $data);

            // Create the Product
            $product = Product::create($productData);

            // Attach to Category
            if ($categoryId) {
                $product->categories()->attach($categoryId);
            }
        }
    }
}