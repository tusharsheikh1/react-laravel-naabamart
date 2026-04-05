<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Author;
use App\Models\Publication;
use App\Models\Color;
use App\Models\Size;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['categories', 'brand']);

        // 1. Search Functionality
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        // 2. Sorting Logic
        $sortField = $request->input('sort_field', 'created_at'); // Default sort field
        $sortDirection = $request->input('sort_direction', 'desc'); // Default direction

        // Apply sorting to the query and paginate
        $products = $query->orderBy($sortField, $sortDirection)
                          ->paginate(15)
                          ->withQueryString();

        // 3. Stock Statistics
        $stats = [
            'total' => Product::count(),
            'low_stock' => Product::where('has_variants', false)->where('stock_quantity', '<', 10)->count(),
            'out_of_stock' => Product::where('has_variants', false)->where('stock_quantity', '<=', 0)->count(),
        ];

        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'filters' => $request->only(['search']),
            'queryParams' => $request->query() ?: null, // Pass current params to frontend for the icons
            'stats' => $stats
        ]);
    }

    public function export(Request $request)
    {
        $query = Product::with(['categories', 'brand']);

        // Keep the same search functionality so users can export filtered lists
        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }

        // Use chunking if you have a massive database to prevent memory exhaustion
        $products = $query->get();

        $fileName = 'products_export_' . date('Y_m_d_H_i_s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['ID', 'Name', 'SKU', 'Type', 'Price', 'Cost Price', 'Stock Quantity', 'Categories', 'Brand', 'Status'];

        $callback = function() use($products, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($products as $product) {
                $row = [
                    $product->id,
                    $product->name,
                    $product->sku,
                    ucfirst($product->type),
                    $product->price,
                    $product->cost_price ?? 0,
                    $product->stock_quantity,
                    $product->categories->pluck('name')->implode(', '),
                    $product->brand ? $product->brand->name : 'N/A',
                    $product->status ? 'Active' : 'Inactive'
                ];

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function create()
    {
        // Fetch only root categories with their children nested
        $categories = Category::whereNull('parent_id')
            ->with(['children.children']) // Load 3 levels: Root > Sub > Extra
            ->get();

        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories, 
            'brands' => Brand::all(),
            'authors' => Author::all(),
            'publications' => Publication::all(),
            'colors' => Color::all(),
            'sizes' => Size::all(),
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validation
        $rules = [
            'name' => 'required|string|max:255',
            'type' => 'required|in:general,digital,book',
            'price' => 'required|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0', // Added cost_price validation
            'weight' => 'required|numeric|min:0',
            'category_ids' => 'required|array',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Bumped max for pre-optimized uploads
            'sku' => 'nullable|string|unique:products,sku',
        ];

        if ($request->type === 'book') {
             $rules['author_ids'] = 'required|array';
             $rules['publication_ids'] = 'required|array';
        }

        $request->validate($rules);

        // 2. Prepare Data
        $data = $request->except(['thumbnail', 'gallery', 'variants', 'digital_file', 'category_ids', 'author_ids', 'publication_ids']);
        $data['slug'] = Str::slug($request->name) . '-' . Str::random(4);
        
        // 3. File Uploads & Performance Optimization (Image Compression)
        if ($request->hasFile('thumbnail')) {
            $file = $request->file('thumbnail');
            
            if (class_exists('\Intervention\Image\Facades\Image')) {
                $filename = Str::random(40) . '.webp';
                $path = 'products/thumbnails/' . $filename;
                
                $img = \Intervention\Image\Facades\Image::make($file->getRealPath());
                $img->resize(600, 600, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })->encode('webp', 80);
                
                Storage::disk('public')->put($path, $img);
                $data['thumbnail'] = $path;
            } else {
                $data['thumbnail'] = $file->store('products/thumbnails', 'public');
            }
        }
        
        if ($request->type === 'digital' && $request->hasFile('digital_file')) {
            $data['digital_file'] = $request->file('digital_file')->store('products/digital', 'public');
        }

        // 4. Create Product
        $product = Product::create($data);

        // 5. Attach Relationships
        $product->categories()->attach($request->category_ids);
        
        if ($request->type === 'book') {
            $product->authors()->attach($request->author_ids);
            $product->publications()->attach($request->publication_ids);
        }

        // 6. Handle Gallery & Variants
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                
                if (class_exists('\Intervention\Image\Facades\Image')) {
                    $filename = Str::random(40) . '.webp';
                    $path = 'products/gallery/' . $filename;
                    
                    $img = \Intervention\Image\Facades\Image::make($image->getRealPath());
                    $img->resize(1000, 1000, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })->encode('webp', 80);
                    
                    Storage::disk('public')->put($path, $img);
                } else {
                    $path = $image->store('products/gallery', 'public');
                }

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        if ($request->type === 'general' && $request->has_variants && !empty($request->variants)) {
            foreach ($request->variants as $variant) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'color_id' => $variant['color_id'],
                    'size_id' => $variant['size_id'],
                    'stock_quantity' => $variant['stock_quantity'] ?? 0,
                    'price_adjustment' => $variant['price_adjustment'] ?? 0,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['variants', 'images', 'categories', 'authors', 'publications']);
        
        $categories = Category::whereNull('parent_id')
            ->with(['children.children'])
            ->get();

        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'brands' => Brand::all(),
            'authors' => Author::all(),
            'publications' => Publication::all(),
            'colors' => Color::all(),
            'sizes' => Size::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric',
            'cost_price' => 'nullable|numeric|min:0', // Added cost_price validation
            'weight' => 'required|numeric',
            'category_ids' => 'required|array',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'gallery.*' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'deleted_image_ids' => 'nullable|array', // Validate deleted images array
        ]);

        // Exclude file inputs and custom fields so it doesn't break mass assignment
        $data = $request->except(['thumbnail', 'gallery', 'variants', 'digital_file', '_method', 'category_ids', 'author_ids', 'publication_ids', 'deleted_image_ids']);
        
        // 1. Update Thumbnail & Performance Optimization (Image Compression)
        if ($request->hasFile('thumbnail')) {
            if ($product->thumbnail && Storage::disk('public')->exists($product->thumbnail)) {
                Storage::disk('public')->delete($product->thumbnail);
            }
            
            $file = $request->file('thumbnail');
            
            if (class_exists('\Intervention\Image\Facades\Image')) {
                $filename = Str::random(40) . '.webp';
                $path = 'products/thumbnails/' . $filename;
                
                $img = \Intervention\Image\Facades\Image::make($file->getRealPath());
                $img->resize(600, 600, function ($constraint) {
                    $constraint->aspectRatio();
                    $constraint->upsize();
                })->encode('webp', 80);
                
                Storage::disk('public')->put($path, $img);
                $data['thumbnail'] = $path;
            } else {
                $data['thumbnail'] = $file->store('products/thumbnails', 'public');
            }
        }

        // 2. Update Digital File
        if ($request->type === 'digital' && $request->hasFile('digital_file')) {
             if ($product->digital_file && Storage::disk('public')->exists($product->digital_file)) {
                 Storage::disk('public')->delete($product->digital_file);
             }
             $data['digital_file'] = $request->file('digital_file')->store('products/digital', 'public');
        }

        // 3. Update Product details
        $product->update($data);

        // 4. Sync Relationships
        $product->categories()->sync($request->category_ids);
        if ($request->type === 'book') {
            $product->authors()->sync($request->author_ids ?? []);
            $product->publications()->sync($request->publication_ids ?? []);
        }

        // 5a. DELETE Requested Gallery Images
        if ($request->filled('deleted_image_ids')) {
            $imagesToDelete = ProductImage::whereIn('id', $request->deleted_image_ids)
                ->where('product_id', $product->id) // Security: ensure it belongs to this product
                ->get();
                
            foreach ($imagesToDelete as $image) {
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                $image->delete();
            }
        }

        // 5b. Add New Gallery Images
        if ($request->hasFile('gallery')) {
            foreach ($request->file('gallery') as $image) {
                
                if (class_exists('\Intervention\Image\Facades\Image')) {
                    $filename = Str::random(40) . '.webp';
                    $path = 'products/gallery/' . $filename;
                    
                    $img = \Intervention\Image\Facades\Image::make($image->getRealPath());
                    $img->resize(1000, 1000, function ($constraint) {
                        $constraint->aspectRatio();
                        $constraint->upsize();
                    })->encode('webp', 80);
                    
                    Storage::disk('public')->put($path, $img);
                } else {
                    $path = $image->store('products/gallery', 'public');
                }

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
            }
        }

        // 6. Update Variants
        if ($request->type === 'general' && $request->has_variants) {
            $product->variants()->delete(); 
            foreach ($request->variants as $variant) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'color_id' => $variant['color_id'],
                    'size_id' => $variant['size_id'],
                    'stock_quantity' => $variant['stock_quantity'] ?? 0,
                    'price_adjustment' => $variant['price_adjustment'] ?? 0,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        if ($product->thumbnail && Storage::disk('public')->exists($product->thumbnail)) {
            Storage::disk('public')->delete($product->thumbnail);
        }
        
        // Clean up digital files and gallery images from storage when deleting product
        if ($product->digital_file && Storage::disk('public')->exists($product->digital_file)) {
            Storage::disk('public')->delete($product->digital_file);
        }

        foreach ($product->images as $image) {
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }
        }

        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product deleted successfully.');
    }
}