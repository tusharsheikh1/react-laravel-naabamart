<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Route;

class FrontendController extends Controller
{
    public function index()
    {
        $newArrivals = Product::with(['categories', 'brand'])
            ->latest()
            ->take(4)
            ->get();
            
        $topSelling = Product::with(['categories', 'brand'])
            ->inRandomOrder()
            ->take(4)
            ->get();

        $categories = Category::whereNull('parent_id')->with('children')->get();
        $brands = Brand::take(5)->get();

        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'newArrivals' => $newArrivals,
            'topSelling' => $topSelling,
            'categories' => $categories,
            'brands' => $brands,
        ]);
    }

    // NEW SHOP METHOD
    public function shop(Request $request)
    {
        $query = Product::with(['categories', 'brand']);

        // Filter by Category
        if ($request->has('category')) {
            $query->whereHas('categories', function ($q) use ($request) {
                $q->where('slug', $request->category); // Assuming you use slug for frontend filtering
            });
        }

        // Filter by Search Term
        if ($request->has('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'LIKE', "%{$searchTerm}%");
        }

        // Pagination (12 items per page)
        $products = $query->latest()->paginate(12)->withQueryString();

        // Get sidebar data
        $categories = Category::whereNull('parent_id')->withCount('products')->get();

        return Inertia::render('Frontend/Shop', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'search']),
        ]);
    }

    public function showProduct($slug)
    {
        $product = Product::where('slug', $slug)
            ->with(['categories', 'brand', 'images', 'variants.color', 'variants.size', 'authors', 'publications'])
            ->firstOrFail();

        $categoryIds = $product->categories->pluck('id');
        $relatedProducts = Product::whereHas('categories', function ($q) use ($categoryIds) {
            $q->whereIn('categories.id', $categoryIds);
        })->where('id', '!=', $product->id)->take(4)->get();

        return Inertia::render('Frontend/ProductDetails', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}