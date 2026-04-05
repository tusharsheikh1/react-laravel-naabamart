<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User; 
use App\Models\IncompleteOrder; // Required for lead conversion logic
use App\Services\OrderService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManualOrderController extends Controller
{
    protected $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
    }

    /**
     * Show the manual order creation form.
     * Optionally accepts a lead_id to pre-populate customer and cart data.
     */
    public function create($lead_id = null)
    {
        // UPDATED: Added cost_price to the select statement just in case it's needed by the frontend 
        // and mapped the price explicitly to the final discounted price.
        $products = Product::select('id', 'name', 'price', 'cost_price', 'discount_type', 'discount_value')->get()
            ->map(fn($p) => [
                'id'         => $p->id,
                'name'       => $p->name,
                'price'      => $p->final_price, // Sends the true discounted price to the frontend form
                'cost_price' => $p->cost_price,
            ]);

        $shippingMethods = ShippingMethod::all();

        // Fetch active staff and admins for the assignment dropdown
        $staffMembers = User::whereIn('role', ['admin', 'staff'])
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();

        // Retrieve lead data if converting from an incomplete order
        $lead = $lead_id ? IncompleteOrder::find($lead_id) : null;

        return Inertia::render('Admin/Orders/Create', [
            'products'        => $products,
            'shippingMethods' => $shippingMethods,
            'staffMembers'    => $staffMembers,
            'lead'            => $lead, // Passed to pre-fill the React form
        ]);
    }

    /**
     * Store a new manual order and update lead status if applicable.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name'      => 'required|string|max:255',
            'customer_phone'     => 'required|string|max:20',
            'shipping_area'      => 'required|string',
            'shipping_address'   => 'required|string',
            'order_source'       => 'required|in:Phone,Message,Website',
            'payment_method'     => 'required|string',
            'payment_status'     => 'required|string',
            'notes'              => 'nullable|string',
            'shipping_charge'    => 'nullable|numeric|min:0', 
            'assigned_to'        => 'nullable|exists:users,id', 
            'lead_id'            => 'nullable|exists:incomplete_orders,id', // Track the originating lead
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.price'      => 'required|numeric', // Validates the price submitted by the form
        ]);

        // Automatically calculate shipping charge if not explicitly provided
        if (!isset($validated['shipping_charge'])) {
            $shippingMethod = ShippingMethod::where('name', $validated['shipping_area'])->first();
            $validated['shipping_charge'] = $shippingMethod ? (float) $shippingMethod->base_charge : 0;
        }

        // Process the order via the updated OrderService (which now securely recalculates totals using final_price)
        $this->orderService->createOrder($validated);

        // If this order originated from a lead, mark it as converted to protect analytics accuracy
        if ($request->filled('lead_id')) {
            IncompleteOrder::where('id', $request->lead_id)->update([
                'status' => 'converted',
                'is_converted' => true
            ]);
        }

        return redirect()->route('admin.orders.index')->with('success', 'Order created successfully and lead updated.');
    }
}