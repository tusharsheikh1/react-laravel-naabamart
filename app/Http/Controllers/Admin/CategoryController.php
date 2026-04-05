<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache; // Added Cache facade
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::whereNull('parent_id')
            ->with('childrenRecursive')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    public function create()
    {
        $parents = Category::all();
        
        // Fetch currently used order numbers to prevent duplication
        $usedFeaturedOrders = Category::where('is_featured', true)->whereNotNull('featured_order')->pluck('featured_order')->toArray();
        $usedHomeOrders = Category::where('show_products_on_home', true)->whereNotNull('home_order')->pluck('home_order')->toArray();

        return Inertia::render('Admin/Categories/Create', [
            'parents' => $parents,
            'usedFeaturedOrders' => $usedFeaturedOrders,
            'usedHomeOrders' => $usedHomeOrders,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'is_featured' => 'boolean',
            'featured_order' => 'nullable|integer',
            'show_products_on_home' => 'boolean',
            'home_order' => 'nullable|integer',
        ]);

        // Safely extract text/numeric fields
        $data = $request->only('name', 'parent_id', 'description', 'featured_order', 'home_order');
        
        // Force booleans (fixes issue where unchecked HTML forms send nothing)
        $data['is_featured'] = $request->boolean('is_featured');
        $data['show_products_on_home'] = $request->boolean('show_products_on_home');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        Category::create($data);

        // Clear the navbar featured categories cache
        Cache::forget('global_featured_categories');

        return redirect()->route('admin.categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        $parents = Category::where('id', '!=', $category->id)->get();
        
        // Fetch used orders, excluding the current category's order so it doesn't confuse the admin
        $usedFeaturedOrders = Category::where('is_featured', true)->where('id', '!=', $category->id)->whereNotNull('featured_order')->pluck('featured_order')->toArray();
        $usedHomeOrders = Category::where('show_products_on_home', true)->where('id', '!=', $category->id)->whereNotNull('home_order')->pluck('home_order')->toArray();

        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parents' => $parents,
            'usedFeaturedOrders' => $usedFeaturedOrders,
            'usedHomeOrders' => $usedHomeOrders,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'description' => 'nullable|string',
            'is_featured' => 'boolean',
            'featured_order' => 'nullable|integer',
            'show_products_on_home' => 'boolean',
            'home_order' => 'nullable|integer',
        ]);

        if ($request->parent_id == $category->id) {
             return back()->withErrors(['parent_id' => 'Category cannot be its own parent.']);
        }

        // Safely extract text/numeric fields
        $data = $request->only('name', 'parent_id', 'description', 'featured_order', 'home_order');
        
        // Force booleans (fixes issue where unchecked HTML forms send nothing)
        $data['is_featured'] = $request->boolean('is_featured');
        $data['show_products_on_home'] = $request->boolean('show_products_on_home');

        if ($request->hasFile('image')) {
            if ($category->image) {
                Storage::disk('public')->delete($category->image);
            }
            $data['image'] = $request->file('image')->store('categories', 'public');
        }

        $category->update($data);

        // Clear the navbar featured categories cache
        Cache::forget('global_featured_categories');

        return redirect()->route('admin.categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        if ($category->image) {
            Storage::disk('public')->delete($category->image);
        }
        $category->delete();

        // Clear the navbar featured categories cache
        Cache::forget('global_featured_categories');

        return redirect()->route('admin.categories.index')->with('success', 'Category deleted successfully.');
    }
}