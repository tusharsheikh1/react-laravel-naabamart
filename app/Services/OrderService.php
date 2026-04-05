<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User; 
use App\Services\AnalyticsEventService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Finds the active staff member with the lowest number of currently assigned active orders.
     */
    public function getNextAvailableStaffId()
    {
        $staff = User::where('role', 'staff')
            ->where('is_active', true)
            ->withCount(['assignedOrders as active_orders_count' => function ($query) {
                // Count only orders that require action (pending or processing)
                $query->whereIn('order_status', ['pending', 'processing']);
            }])
            // Order by lowest count, then randomize if there is a tie
            ->orderBy('active_orders_count', 'asc')
            ->inRandomOrder()
            ->first();

        return $staff ? $staff->id : null;
    }

    /**
     * Core logic to create a manual order.
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            
            // 1. Calculate subtotal securely using the final discounted price for each product
            $subtotal = 0;
            $processedItems = [];
            
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                
                // Enforce the discounted price
                $price = $product ? (float) $product->final_price : (float) $item['price'];
                
                $subtotal += $price * $item['quantity'];
                
                $item['calculated_price'] = $price;
                $item['product_model'] = $product;
                $processedItems[] = $item;
            }

            $shippingCharge = isset($data['shipping_charge']) ? (float) $data['shipping_charge'] : 0;
            $totalAmount = $subtotal + $shippingCharge;

            // --- STRICT SEQUENTIAL ORDER NUMBER GENERATION ---
            $year = date('Y');
            
            $lastOrder = Order::whereYear('created_at', $year)
                ->where('order_number', 'LIKE', 'ORD-' . $year . '-%')
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            if ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->order_number, $matches)) {
                $sequence = (int) $matches[1] + 1;
            } else {
                $sequence = 1;
            }

            $orderNumber = 'ORD-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);
            // --------------------------------------------------

            // Format notes to include the shipping charge
            $notes = $data['notes'] ?? '';
            if ($shippingCharge > 0 && !str_contains($notes, 'Shipping Charge')) {
                $prefix = "Shipping Charge: ৳{$shippingCharge}";
                $notes = $notes ? $prefix . "\n" . $notes : $prefix;
            }

            $assignedStaffId = $data['assigned_to'] ?? $this->getNextAvailableStaffId();
            $assignmentAction = $assignedStaffId ? " and assigned to staff ID: {$assignedStaffId}" : "";

            $order = Order::create([
                'order_number'     => $orderNumber,
                'customer_name'    => $data['customer_name'],
                'customer_phone'   => $data['customer_phone'],
                'shipping_area'    => $data['shipping_area'],
                'shipping_address' => $data['shipping_address'],
                'order_source'     => $data['order_source'], 
                'payment_method'   => $data['payment_method'],
                'payment_status'   => $data['payment_status'],
                'total_amount'     => $totalAmount,
                'order_status'     => 'pending',
                'notes'            => $notes ?: null,
                'assigned_to'      => $assignedStaffId, 
                'edit_history'     => [[
                    'action' => "Order created via {$data['order_source']}{$assignmentAction}",
                    'user'   => Auth::user() ? Auth::user()->name : 'System',
                    'time'   => now()->toISOString(),
                ]],
            ]);

            $analyticsService = app(AnalyticsEventService::class);

            foreach ($processedItems as $item) {
                // Use the pre-fetched product model and discounted price
                $product = $item['product_model'];
                $unitCost = $product ? (float) $product->cost_price : 0; 
                $price = $item['calculated_price'];
                $quantity = (int) $item['quantity'];

                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity'   => $quantity,
                    'price'      => $price,
                    'unit_cost'  => $unitCost, 
                    'color'      => $item['color'] ?? null,
                    'size'       => $item['size'] ?? null,
                ]);

                // Instant analytics update with Gross Margin support using the correct discounted price
                $analyticsService->logEvent($item['product_id'], 'purchase', null, [
                    'quantity'     => $quantity,
                    'revenue'      => $price * $quantity,
                    'gross_margin' => ($price - $unitCost) * $quantity 
                ]);
            }

            return $order;
        });
    }

    /**
     * Core logic to update an existing order.
     */
    public function updateOrder(Order $order, array $data)
    {
        return DB::transaction(function () use ($order, $data) {
            
            $newSubtotal = 0;
            $processedItems = [];

            // 1. Calculate new subtotal using the final discounted price
            foreach ($data['items'] as $itemData) {
                // Ensure we get the product ID even if modifying an existing order item
                $productId = $itemData['product_id'] ?? null;
                if (!$productId && isset($itemData['id'])) {
                    $existingItem = OrderItem::find($itemData['id']);
                    $productId = $existingItem ? $existingItem->product_id : null;
                }
                
                $product = Product::find($productId);
                $price = $product ? (float) $product->final_price : (float) ($itemData['price'] ?? 0);
                
                $newSubtotal += $price * $itemData['quantity'];
                
                $itemData['calculated_price'] = $price;
                $itemData['product_model'] = $product;
                $processedItems[] = $itemData;
            }

            $currentSubtotal = collect($order->items)->sum(fn($i) => $i->price * $i->quantity);
            $existingShippingCharge = max(0, $order->total_amount - $currentSubtotal);
            
            $shippingCharge = isset($data['shipping_charge']) ? (float) $data['shipping_charge'] : $existingShippingCharge;
            $totalAmount = $newSubtotal + $shippingCharge;

            $history = $order->edit_history ?? [];
            $history[] = [
                'action' => 'Updated order details & items',
                'user'   => Auth::user() ? Auth::user()->name : 'System',
                'time'   => now()->toISOString(),
            ];

            $adminNotes = $order->admin_notes ?? [];
            if (!empty($data['new_admin_note'])) {
                $adminNotes[] = [
                    'note' => $data['new_admin_note'],
                    'user' => Auth::user() ? Auth::user()->name : 'System',
                    'time' => now()->toISOString(),
                ];
            }

            $order->update([
                'customer_name'    => $data['customer_name'],
                'customer_phone'   => $data['customer_phone'],
                'shipping_area'    => $data['shipping_area'],
                'shipping_address' => $data['shipping_address'],
                'notes'            => $data['notes'] ?? $order->notes,
                'admin_notes'      => $adminNotes,
                'total_amount'     => $totalAmount,
                'edit_history'     => $history,
            ]);

            $existingItemIds = $order->items()->pluck('id')->toArray();
            $updatedItemIds = [];
            $analyticsService = app(AnalyticsEventService::class);

            foreach ($processedItems as $itemData) {
                $price = $itemData['calculated_price'];
                $product = $itemData['product_model'];
                $quantity = (int) $itemData['quantity'];

                if (isset($itemData['id']) && in_array($itemData['id'], $existingItemIds)) {
                    $item = OrderItem::find($itemData['id']);
                    
                    // Update item ensuring the correct discounted price is used
                    $item->update([
                        'quantity' => $quantity,
                        'price'    => $price,
                        'color'    => $itemData['color'] ?? null,
                        'size'     => $itemData['size'] ?? null,
                    ]);
                    $updatedItemIds[] = $item->id;
                } else {
                    // New item added during order update
                    $unitCost = $product ? (float) $product->cost_price : 0;

                    $newItem = $order->items()->create([
                        'product_id' => $itemData['product_id'],
                        'quantity'   => $quantity,
                        'price'      => $price,
                        'unit_cost'  => $unitCost, // Snapshotting cost
                        'color'      => $itemData['color'] ?? null,
                        'size'       => $itemData['size'] ?? null,
                    ]);
                    $updatedItemIds[] = $newItem->id;

                    // Log purchase analytics for the added item
                    $analyticsService->logEvent($itemData['product_id'], 'purchase', null, [
                        'quantity'     => $quantity,
                        'revenue'      => $price * $quantity,
                        'gross_margin' => ($price - $unitCost) * $quantity
                    ]);
                }
            }

            // Handle items removed from the order during update
            $removedItemIds = array_diff($existingItemIds, $updatedItemIds);
            if (!empty($removedItemIds)) {
                $removedItems = OrderItem::whereIn('id', $removedItemIds)->get();
                foreach ($removedItems as $rItem) {
                    // Deduct from analytics using the snapshot data stored in unit_cost
                    $analyticsService->logEvent($rItem->product_id, 'cancel_purchase', null, [
                        'quantity'     => $rItem->quantity,
                        'revenue'      => $rItem->price * $rItem->quantity,
                        'gross_margin' => ($rItem->price - $rItem->unit_cost) * $rItem->quantity
                    ], $order->created_at);
                }
                OrderItem::whereIn('id', $removedItemIds)->delete();
            }

            return $order;
        });
    }
}