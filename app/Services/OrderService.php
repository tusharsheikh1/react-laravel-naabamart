<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User; 
use App\Models\ProductVariant;
use App\Models\Color;
use App\Models\Size;
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
                $query->whereIn('order_status', ['pending', 'processing']);
            }])
            ->orderBy('active_orders_count', 'asc')
            ->inRandomOrder()
            ->first();

        return $staff ? $staff->id : null;
    }

    /**
     * Public helper to restore or deduct inventory cleanly.
     * Moved to public scope to enforce DRY principle across controllers.
     */
    public function adjustInventory($productId, $colorName, $sizeName, $quantity, $action)
    {
        $product = Product::find($productId);
        if (!$product) return;

        $hasVariation = $colorName || $sizeName;
        $variant = null;

        if ($hasVariation) {
            $variantQuery = ProductVariant::where('product_id', $product->id);
            
            if ($colorName) {
                $color = Color::where('name', $colorName)->first();
                if ($color) $variantQuery->where('color_id', $color->id);
                else $variantQuery->whereNull('color_id');
            } else {
                $variantQuery->whereNull('color_id');
            }

            if ($sizeName) {
                $size = Size::where('name', $sizeName)->first();
                if ($size) $variantQuery->where('size_id', $size->id);
                else $variantQuery->whereNull('size_id');
            } else {
                $variantQuery->whereNull('size_id');
            }

            $variant = $variantQuery->first();
        }

        if ($action === 'restore') {
            if ($variant) {
                $variant->increment('stock_quantity', $quantity);
            } else {
                $product->increment('stock_quantity', $quantity);
            }
        } elseif ($action === 'deduct') {
            if ($variant) {
                $variant->decrement('stock_quantity', $quantity);
            } else {
                $product->decrement('stock_quantity', $quantity);
            }
        }
    }

    /**
     * Core logic to create a manual order.
     */
    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            $subtotal = 0;
            $processedItems = [];
            
            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $price = $product ? (float) $product->final_price : (float) $item['price'];
                
                $subtotal += $price * $item['quantity'];
                
                $item['calculated_price'] = $price;
                $item['product_model'] = $product;
                $processedItems[] = $item;
            }

            $shippingCharge = isset($data['shipping_charge']) ? (float) $data['shipping_charge'] : 0;
            $totalAmount = $subtotal + $shippingCharge;

            $year = date('Y');
            
            $lastOrder = Order::whereYear('created_at', $year)
                ->where('order_number', 'LIKE', 'ORD-' . $year . '-%')
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            $sequence = ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->order_number, $matches)) ? (int) $matches[1] + 1 : 1;
            $orderNumber = 'ORD-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);

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

                $this->adjustInventory($item['product_id'], $item['color'] ?? null, $item['size'] ?? null, $quantity, 'deduct');

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

            foreach ($data['items'] as $itemData) {
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
                    
                    $this->adjustInventory($item->product_id, $item->color, $item->size, $item->quantity, 'restore');

                    $item->update([
                        'quantity' => $quantity,
                        'price'    => $price,
                        'color'    => $itemData['color'] ?? null,
                        'size'     => $itemData['size'] ?? null,
                    ]);
                    $updatedItemIds[] = $item->id;

                    $this->adjustInventory($item->product_id, $item->color, $item->size, $quantity, 'deduct');

                } else {
                    $unitCost = $product ? (float) $product->cost_price : 0;

                    $newItem = $order->items()->create([
                        'product_id' => $itemData['product_id'],
                        'quantity'   => $quantity,
                        'price'      => $price,
                        'unit_cost'  => $unitCost,
                        'color'      => $itemData['color'] ?? null,
                        'size'       => $itemData['size'] ?? null,
                    ]);
                    $updatedItemIds[] = $newItem->id;

                    $this->adjustInventory($newItem->product_id, $newItem->color, $newItem->size, $quantity, 'deduct');

                    $analyticsService->logEvent($itemData['product_id'], 'purchase', null, [
                        'quantity'     => $quantity,
                        'revenue'      => $price * $quantity,
                        'gross_margin' => ($price - $unitCost) * $quantity
                    ]);
                }
            }

            $removedItemIds = array_diff($existingItemIds, $updatedItemIds);
            if (!empty($removedItemIds)) {
                $removedItems = OrderItem::whereIn('id', $removedItemIds)->get();
                foreach ($removedItems as $rItem) {
                    $this->adjustInventory($rItem->product_id, $rItem->color, $rItem->size, $rItem->quantity, 'restore');

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