<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShippingMethodController extends Controller
{
    public function index()
    {
        $shippingMethods = ShippingMethod::latest()->get();

        $freeShippingProducts = Product::where('is_free_shipping', true)
            ->select('id', 'name', 'price', 'stock_quantity')
            ->latest()
            ->get();

        return Inertia::render('Admin/ShippingMethods/Index', [
            'shippingMethods' => $shippingMethods,
            'freeShippingProducts' => $freeShippingProducts,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/ShippingMethods/Create');
    }

    public function store(Request $request)
    {
        // Updated to match the database and React forms
        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'base_charge'              => 'required|numeric|min:0',
            'base_weight'              => 'required|numeric|min:0',
            'additional_charge_per_kg' => 'required|numeric|min:0',
            'free_delivery_threshold'  => 'nullable|numeric|min:0',
            'status'                   => 'boolean',
        ]);

        ShippingMethod::create($validated);

        return redirect()->route('admin.shipping-methods.index')
            ->with('success', 'Shipping method created successfully.');
    }

    public function edit(ShippingMethod $shippingMethod)
    {
        return Inertia::render('Admin/ShippingMethods/Edit', [
            'shippingMethod' => $shippingMethod,
        ]);
    }

    public function update(Request $request, ShippingMethod $shippingMethod)
    {
        // Updated to match the database and React forms
        $validated = $request->validate([
            'name'                     => 'required|string|max:255',
            'base_charge'              => 'required|numeric|min:0',
            'base_weight'              => 'required|numeric|min:0',
            'additional_charge_per_kg' => 'required|numeric|min:0',
            'free_delivery_threshold'  => 'nullable|numeric|min:0',
            'status'                   => 'boolean',
        ]);

        $shippingMethod->update($validated);

        return redirect()->route('admin.shipping-methods.index')
            ->with('success', 'Shipping method updated successfully.');
    }

    public function destroy(ShippingMethod $shippingMethod)
    {
        $shippingMethod->delete();

        return redirect()->route('admin.shipping-methods.index')
            ->with('success', 'Shipping method deleted successfully.');
    }
}