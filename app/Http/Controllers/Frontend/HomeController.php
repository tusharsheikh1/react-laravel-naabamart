<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Slider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        // Top Selling items based on actual sales data (sum of quantities sold)
        $topSelling = Product::with(['categories', 'brand'])
            ->withSum('orderItems', 'quantity')
            ->orderByDesc('order_items_sum_quantity')
            ->take(6)
            ->get();
            
        $allProducts = Product::with(['categories', 'brand'])->latest()->get();
        $categories = Category::whereNull('parent_id')->with('children')->get();
        $brands = Brand::take(5)->get();
        $sliders = Slider::where('status', true)->orderBy('order')->get();

        // Categories to display as product sections
        $homeProductCategories = Category::where('show_products_on_home', true)
            ->with(['products' => function($query) {
                $query->with(['categories', 'brand'])->latest()->take(10);
            }])
            ->orderBy('home_order', 'asc')
            ->get();

        return Inertia::render('Frontend/Home', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'topSelling' => $topSelling,
            'allProducts' => $allProducts,
            'categories' => $categories,
            'brands' => $brands,
            'sliders' => $sliders,
            'homeProductCategories' => $homeProductCategories,
            // featuredCategories is now handled globally by HandleInertiaRequests
        ]);
    }
}