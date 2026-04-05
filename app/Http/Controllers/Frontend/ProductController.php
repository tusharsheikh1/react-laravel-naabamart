<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Author;
use App\Models\Publication;
use App\Models\Color;
use App\Models\Size;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['categories', 'brand', 'authors', 'publications']);

        // 1. Category Filter (By ID)
        if ($request->filled('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('categories.id', $request->category);
            });
        }

        // 2. Brand Filter (By ID)
        if ($request->filled('brand')) {
            $query->whereHas('brand', function ($q) use ($request) {
                $q->where('brands.id', $request->brand);
            });
        }

        // 3. Author Filter (By ID)
        if ($request->filled('author')) {
            $query->whereHas('authors', function ($q) use ($request) {
                $q->where('authors.id', $request->author);
            });
        }

        // 4. Publication Filter (By ID)
        if ($request->filled('publication')) {
            $query->whereHas('publications', function ($q) use ($request) {
                $q->where('publications.id', $request->publication);
            });
        }

        // 5. Color Filter (By ID through ProductVariant)
        if ($request->filled('color')) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('color_id', $request->color);
            });
        }

        // 6. Size Filter (By ID through ProductVariant)
        if ($request->filled('size')) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('size_id', $request->size);
            });
        }

        // 7. Search Filter
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'LIKE', "%{$searchTerm}%");
        }

        // 8. Price Range Filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // 9. Sorting
        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'oldest' => $query->oldest(),
            default => $query->latest(), // 'latest' is the default
        };

        $products = $query->paginate(12)->withQueryString();
        
        // Fetch data for sidebar
        $categories = Category::whereNull('parent_id')->withCount('products')->get();
        $brands = Brand::withCount('products')->get();
        $authors = Author::withCount('products')->get();
        $publications = Publication::withCount('products')->get();
        
        // Colors and Sizes (Standard fetch to avoid complex pivot counting crashes)
        $colors = Color::all();
        $sizes = Size::all();

        return Inertia::render('Frontend/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'brands' => $brands,
            'authors' => $authors,
            'publications' => $publications,
            'colors' => $colors,
            'sizes' => $sizes,
            'filters' => $request->only(['category', 'brand', 'author', 'publication', 'color', 'size', 'search', 'min_price', 'max_price', 'sort']),
        ]);
    }

    public function show($slug)
    {
        $product = Product::where('slug', $slug)
            ->with(['categories', 'brand', 'images', 'variants.color', 'variants.size', 'authors', 'publications'])
            ->firstOrFail();

        $categoryIds = $product->categories->pluck('id');
        
        // Increased the take() limit from 4 to 6 so it populates the new sidebar perfectly
        $relatedProducts = Product::whereHas('categories', function ($q) use ($categoryIds) {
            $q->whereIn('categories.id', $categoryIds);
        })->where('id', '!=', $product->id)->take(6)->get();

        // Fetch the admin setting for the general layout (fallback to 'ShowGeneral' if null)
        $generalLayout = Setting::where('key', 'general_product_layout')->value('value') ?: 'ShowGeneral';

        // Dynamically select the Inertia view based on product type
        $view = match ($product->type) {
            'book' => 'Frontend/Products/ShowBook',
            'digital' => 'Frontend/Products/ShowDigital',
            default => 'Frontend/Products/' . $generalLayout, // Dynamic fallback based on admin settings
        };

        return Inertia::render($view, [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}