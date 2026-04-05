<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // Submit the checkout form
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:1000',
            'payment_method'   => 'required|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.color'    => 'nullable|string',
            'items.*.size'     => 'nullable|string',
        ]);

        // Calculate total amount from frontend items (You should ideally verify prices against the DB in production)
        $totalAmount = collect($request->items)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        // Create Order
        $order = Order::create([
            'user_id'          => auth()->id(), // null if guest checkout is allowed
            'order_number'     => 'ORD-' . strtoupper(Str::random(8)),
            'total_amount'     => $totalAmount,
            'payment_method'   => $request->payment_method,
            'payment_status'   => 'pending',
            'order_status'     => 'pending',
            'shipping_address' => $request->shipping_address,
            'notes'            => $request->notes ?? null,
        ]);

        // Create Order Items mapping colors and sizes
        foreach ($request->items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'price'      => $item['price'],
                'color'      => $item['color'] ?? null,
                'size'       => $item['size'] ?? null,
            ]);
        }

        // Return a response or redirect to success page
        return redirect()->route('checkout.success')->with('success', 'Order placed successfully!');
    }

    // View user's own order history
    public function index()
    {
        $orders = Order::where('user_id', auth()->id())
                    ->with('items.product')
                    ->latest()
                    ->get();

        return Inertia::render('Frontend/Orders/Index', [
            'orders' => $orders
        ]);
    }
}