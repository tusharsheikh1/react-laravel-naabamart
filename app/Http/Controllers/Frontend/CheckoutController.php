<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Color;
use App\Models\Size;
use App\Models\ShippingMethod;
use App\Models\IncompleteOrder;
use App\Models\Blacklist;
use App\Models\LandingPage;
use App\Models\Setting;
use App\Services\AnalyticsEventService;
use App\Services\OrderService;
use App\Services\SmsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CheckoutController extends Controller
{
    /**
     * Display the checkout page with cart details and shipping methods.
     */
    public function index(Request $request)
    {
        // 1. Determine Checkout Context (Buy Now vs Regular Cart)
        // If the URL explicitly specifies a checkout type, set it in the session.
        if ($request->has('checkout_type')) {
            session()->put('checkout_context', $request->query('checkout_type'));
        } else {
            // Default to regular cart if accessed normally
            session()->put('checkout_context', 'cart');
        }

        $context = session()->get('checkout_context', 'cart');
        $cartSessionKey = $context === 'buy_now' ? 'buy_now_cart' : 'cart';

        // 2. Retrieve the appropriate cart
        $cart = session()->get($cartSessionKey, []);

        if (empty($cart)) {
            // Reset context if empty to prevent them getting stuck
            session()->put('checkout_context', 'cart');
            return redirect()->route('cart.index')->with('error', 'Your checkout is empty. Please add items to proceed.');
        }

        $shippingMethods = ShippingMethod::where('status', true)->get();

        if ($shippingMethods->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Checkout is currently unavailable as no shipping methods are configured.');
        }

        $cartDetails = $this->calculateCartDetails($cart);

        $analyticsService = app(AnalyticsEventService::class);
        foreach ($cart as $item) {
            $analyticsService->logEvent($item['id'], 'checkout_start', null, [
                'quantity' => $item['quantity'],
            ]);
        }

        return Inertia::render('Frontend/Checkout', [
            'cart'            => $cart,
            'auth'            => ['user' => Auth::user()],
            'shippingMethods' => $shippingMethods,
            'cartDetails'     => $cartDetails,
        ]);
    }

    /**
     * Silently save the user's checkout progress (draft / incomplete order).
     * Works for both standard website cart and landing page single-page checkouts.
     */
    public function saveDraft(Request $request)
    {
        // Determine which cart session we are drafting based on context
        $context = session()->get('checkout_context', 'cart');
        $cartSessionKey = $context === 'buy_now' ? 'buy_now_cart' : 'cart';

        // Try to get items from the request first (Landing Page Widget format), 
        // fallback to session cart (Standard Website format)
        $cart = $request->input('items') ?? session()->get($cartSessionKey, []);

        if (empty($cart)) {
            return response()->json(['status' => 'ignored', 'message' => 'Cart is empty']);
        }

        $isBlocked = Blacklist::where(function ($query) use ($request) {
            $query->where('type', 'ip')->where('value', $request->ip());
            if (!empty($request->device_fingerprint)) {
                $query->orWhere(function ($q) use ($request) {
                    $q->where('type', 'device_fingerprint')->where('value', $request->device_fingerprint);
                });
            }
        })->exists();

        if ($isBlocked) {
            return response()->json(['status' => 'ignored', 'message' => 'Security block']);
        }

        $userId    = Auth::id();
        $sessionId = session()->getId();
        $phone     = $request->phone;

        // Deduplication: Find existing pending draft for this session or phone
        $draft = IncompleteOrder::where(function ($query) use ($userId, $sessionId, $phone) {
            $query->where('session_id', $sessionId);
            if ($userId) {
                $query->orWhere('user_id', $userId);
            }
            if (!empty($phone)) {
                $query->orWhere('phone', $phone);
            }
        })->where('status', 'pending')->orderBy('id', 'desc')->first();

        $data = [
            'session_id'   => $sessionId,
            'user_id'      => $userId ?? ($draft->user_id ?? null),
            'full_name'    => $request->full_name ?? $request->name, // Accommodate standard and LP fields
            'phone'        => $phone,
            'address'      => $request->address,
            'cart_data'    => $cart,
            'is_converted' => false,
            'status'       => 'pending',
        ];

        if ($draft) {
            $draft->update($data);
        } else {
            IncompleteOrder::create($data);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Process a standard website checkout (reads from cart session).
     */
    public function store(Request $request)
    {
        // 1. Determine which cart session we are fulfilling based on context
        $context = session()->get('checkout_context', 'cart');
        $cartSessionKey = $context === 'buy_now' ? 'buy_now_cart' : 'cart';

        $cart = session()->get($cartSessionKey, []);

        if (empty($cart)) {
            return redirect()->route('cart.index')->with('error', 'Checkout failed: Your cart is empty.');
        }

        $isBlocked = Blacklist::where(function ($query) use ($request) {
            $query->where('type', 'ip')->where('value', $request->ip());
            if (!empty($request->device_fingerprint)) {
                $query->orWhere(function ($q) use ($request) {
                    $q->where('type', 'device_fingerprint')->where('value', $request->device_fingerprint);
                });
            }
        })->exists();

        if ($isBlocked) {
            return back()->with('error', 'Your order cannot be processed at this time due to security reasons.');
        }

        $validated = $request->validate([
            'full_name'          => 'required|string|max:255',
            'phone'              => 'required|string|max:20|regex:/^([0-9\s\-\+\(\)]*)$/',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'address'            => 'required|string|max:500',
            'payment_method'     => 'required|in:cod,online',
            'device_fingerprint' => 'nullable|string|max:255',
        ]);

        $shippingMethod = ShippingMethod::findOrFail($validated['shipping_method_id']);
        $sessionId      = session()->getId();
        $cartDetails    = $this->calculateCartDetails($cart);

        $subtotal        = $cartDetails['subtotal'];
        $totalWeight     = $cartDetails['totalWeight'];
        $hasFreeShipping = $cartDetails['hasFreeShipping'];

        $shippingCharge = 0;
        if (!$hasFreeShipping) {
            if ($shippingMethod->free_delivery_threshold && $subtotal >= $shippingMethod->free_delivery_threshold) {
                $shippingCharge = 0;
            } else {
                $shippingCharge = (float) $shippingMethod->base_charge;
                if ($totalWeight > $shippingMethod->base_weight) {
                    $extraWeight     = ceil($totalWeight - $shippingMethod->base_weight);
                    $shippingCharge += $extraWeight * $shippingMethod->additional_charge_per_kg;
                }
            }
        }

        $totalAmount = $subtotal + $shippingCharge;

        try {
            DB::beginTransaction();

            $order = $this->createOrderRecord(
                $validated,
                $cart,
                $totalAmount,
                $shippingCharge,
                $shippingMethod->name,
                'Website',
                $request->ip(),
                $request->userAgent(),
                $request->device_fingerprint
            );

            // Simple remove incomplete order lead since the user successfully placed the order themselves
            IncompleteOrder::where('status', 'pending')
                ->where(function ($q) use ($sessionId, $validated) {
                    $q->where('session_id', $sessionId)
                      ->orWhere('phone', $validated['phone']);
                })
                ->delete();

            DB::commit();

            try {
                $smsService = app(SmsService::class);
                $smsService->sendTemplatedSms(
                    $validated['phone'],
                    'sms_template_order_placed',
                    "Dear {name}, your order ({order_number}) has been placed successfully. Total amount: ৳{amount}. Thank you for shopping with us!",
                    [
                        '{name}'         => $order->customer_name,
                        '{order_number}' => $order->order_number,
                        '{amount}'       => $totalAmount,
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Order Confirmation SMS failed: ' . $e->getMessage());
            }

            // Success! Clear the specific cart that was checked out
            session()->forget($cartSessionKey);
            
            // Reset the checkout context back to normal 'cart' mode for the future
            session()->put('checkout_context', 'cart');

            return redirect()->route('checkout.success', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage() ?: 'Something went wrong while placing your order. Please try again.');
        }
    }

    /**
     * Process an order placed via a landing-page CheckoutWidget.
     * Supports both single product and multi-product arrays.
     *
     * Route: POST /lp/checkout
     * Named: landing_page.checkout
     */
    public function landingPageStore(Request $request)
    {
        // --- Security block check ---
        $isBlocked = Blacklist::where(function ($query) use ($request) {
            $query->where('type', 'ip')->where('value', $request->ip());
            if (!empty($request->device_fingerprint)) {
                $query->orWhere(function ($q) use ($request) {
                    $q->where('type', 'device_fingerprint')->where('value', $request->device_fingerprint);
                });
            }
        })->exists();

        if ($isBlocked) {
            return response()->json(['message' => 'Your order cannot be processed at this time.'], 403);
        }

        $validated = $request->validate([
            // Support multiple products array
            'items'              => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
            
            // Fallback for older widgets sending single product
            'product_id'         => 'required_without:items|exists:products,id',
            'quantity'           => 'required_without:items|integer|min:1|max:100',
            
            // Customer Info
            'name'               => 'required|string|max:255',
            'phone'              => 'required|string|max:20|regex:/^([0-9\s\-\+\(\)]*)$/',
            'address'            => 'nullable|string|max:500',
            'shipping_method_id' => 'required|exists:shipping_methods,id',
            'note'               => 'nullable|string|max:1000',
            'landing_page_id'    => 'nullable|integer|exists:landing_pages,id',
            'device_fingerprint' => 'nullable|string|max:255',
        ]);

        $cart = [];
        $hasFreeShipping = false;
        $subtotal = 0;
        
        // --- 1. Construct the Cart Array ---
        if (!empty($validated['items'])) {
            // New multi-product flow
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) ($product->final_price ?? $product->price);

                $cart[] = [
                    'id'       => $product->id,
                    'quantity' => $quantity,
                    'price'    => $unitPrice,
                    'options'  => [],
                ];

                $subtotal += ($unitPrice * $quantity);
                if ($product->is_free_shipping) {
                    $hasFreeShipping = true;
                }
            }
        } else {
            // Legacy single-product flow
            $product  = Product::findOrFail($validated['product_id']);
            $quantity = (int) $validated['quantity'];
            $unitPrice = (float) ($product->final_price ?? $product->price);

            $cart[] = [
                'id'       => $product->id,
                'quantity' => $quantity,
                'price'    => $unitPrice,
                'options'  => [],
            ];
            
            $subtotal += ($unitPrice * $quantity);
            if ($product->is_free_shipping) {
                $hasFreeShipping = true;
            }
        }

        // --- 2. Calculate Shipping ---
        $shippingMethod = ShippingMethod::findOrFail($validated['shipping_method_id']);
        $shippingCharge = 0;
        $shippingName   = $shippingMethod->name;

        if (!$hasFreeShipping) {
            if ($shippingMethod->free_delivery_threshold && $subtotal >= $shippingMethod->free_delivery_threshold) {
                $shippingCharge = 0;
            } else {
                $shippingCharge = (float) $shippingMethod->base_charge;
            }
        }

        $totalAmount = $subtotal + $shippingCharge;

        try {
            DB::beginTransaction();

            // Lock the products for inventory checking to prevent overselling
            $productIds = collect($cart)->pluck('id')->toArray();
            Product::whereIn('id', $productIds)->lockForUpdate()->get();

            $orderValidated = [
                'full_name'      => $validated['name'],
                'phone'          => $validated['phone'],
                'address'        => $validated['address'] ?? 'N/A',
                'payment_method' => 'cod', // Landing page default is COD
            ];

            // Reuse the createOrderRecord helper
            $order = $this->createOrderRecord(
                $orderValidated,
                $cart,
                $totalAmount,
                $shippingCharge,
                $shippingName,
                'Landing Page',
                $request->ip(),
                $request->userAgent(),
                $validated['device_fingerprint'] ?? null,
                $validated['note'] ?? null
            );

            // Increment landing page conversions
            if (!empty($validated['landing_page_id'])) {
                $landingPage = LandingPage::find($validated['landing_page_id']);
                if ($landingPage) {
                    $landingPage->increment('conversions');
                    // Increment parent if this is a variant (A/B testing)
                    if ($landingPage->parent_id) {
                        LandingPage::where('id', $landingPage->parent_id)->increment('conversions');
                    }
                }
            }

            // Simple remove incomplete order lead since the user successfully placed the order themselves
            IncompleteOrder::where('status', 'pending')
                ->where(function ($q) use ($validated) {
                    $q->where('session_id', session()->getId())
                      ->orWhere('phone', $validated['phone']);
                })
                ->delete();

            DB::commit();

            // Send Order Confirmation SMS
            try {
                $smsService = app(SmsService::class);
                $smsService->sendTemplatedSms(
                    $validated['phone'],
                    'sms_template_order_placed',
                    "Dear {name}, your order ({order_number}) has been placed successfully. Total: ৳{amount}. Thank you!",
                    [
                        '{name}'         => $order->customer_name,
                        '{order_number}' => $order->order_number,
                        '{amount}'       => $totalAmount,
                    ]
                );
            } catch (\Exception $e) {
                Log::error('LP Order SMS failed: ' . $e->getMessage());
            }

            // Redirect to success
            return redirect()->route('checkout.success', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage() ?: 'Something went wrong.');
        }
    }

    /**
     * Display the successful order page.
     */
    public function success($order_id)
    {
        $order = Order::findOrFail($order_id);

        // Retrieve the configured layout from settings, fallback to 'default'
        $layout = Setting::where('key', 'checkout_success_layout')->value('value') ?? 'default';

        // Determine which Inertia component to render
        $component = $layout === 'professional' 
            ? 'Frontend/CheckoutSuccessProfessional' 
            : 'Frontend/CheckoutSuccess';

        return Inertia::render($component, [
            'order' => $order,
        ]);
    }

    /**
     * Display the order invoice.
     */
    public function invoice($order_id)
    {
        $order      = Order::findOrFail($order_id);
        $orderItems = OrderItem::where('order_id', $order->id)->get();

        return Inertia::render('Frontend/Invoice', [
            'order'      => $order,
            'orderItems' => $orderItems,
        ]);
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    /**
     * Shared order-creation logic used by both store() and landingPageStore().
     */
    private function createOrderRecord(
        array  $validated,
        array  $cart,
        float  $totalAmount,
        float  $shippingCharge,
        string $shippingName,
        string $orderSource,
        string $ipAddress,
        ?string $userAgent,
        ?string $deviceFingerprint,
        ?string $notes = null
    ): Order {
        $year      = date('Y');
        $lastOrder = Order::whereYear('created_at', $year)
            ->where('order_number', 'LIKE', 'ORD-' . $year . '-%')
            ->lockForUpdate()
            ->orderBy('id', 'desc')
            ->first();

        $sequence    = ($lastOrder && preg_match('/-(\d+)$/', $lastOrder->order_number, $m)) ? (int) $m[1] + 1 : 1;
        $orderNumber = 'ORD-' . $year . '-' . str_pad($sequence, 6, '0', STR_PAD_LEFT);

        $orderService    = app(OrderService::class);
        $assignedStaffId = $orderService->getNextAvailableStaffId();

        $order = Order::create([
            'user_id'            => Auth::id(),
            'order_number'       => $orderNumber,
            'total_amount'       => $totalAmount,
            'payment_method'     => $validated['payment_method'],
            'payment_status'     => 'pending',
            'order_status'       => 'pending',
            'customer_name'      => $validated['full_name'],
            'customer_phone'     => $validated['phone'],
            'shipping_area'      => $shippingName,
            'shipping_address'   => $validated['address'],
            'notes'              => $notes ?? ('Shipping Charge: ৳' . $shippingCharge),
            'ip_address'         => $ipAddress,
            'user_agent'         => $userAgent,
            'device_fingerprint' => $deviceFingerprint,
            'order_source'       => $orderSource,
            'assigned_to'        => $assignedStaffId,
            'edit_history'       => [[
                'action' => "Order created via {$orderSource}" . ($assignedStaffId ? " and assigned to staff ID: {$assignedStaffId}" : ""),
                'user'   => Auth::user() ? Auth::user()->name : 'Guest',
                'time'   => now()->toISOString(),
            ]],
        ]);

        $orderItems       = [];
        $analyticsService = app(AnalyticsEventService::class);

        foreach ($cart as $item) {
            $quantity  = (int) $item['quantity'];
            $options   = $item['options'] ?? [];
            $colorId   = $options['color_id'] ?? null;
            $sizeId    = $options['size_id']   ?? null;
            $colorName = $options['color']     ?? null;
            $sizeName  = $options['size']      ?? null;

            $hasVariation = $colorId || $sizeId || $colorName || $sizeName;

            $product = Product::lockForUpdate()->find($item['id']);
            if (!$product) {
                throw new \Exception("A product in your cart is no longer available.");
            }

            if ($hasVariation) {
                $variantQuery = ProductVariant::lockForUpdate()->where('product_id', $item['id']);

                if ($colorId) {
                    $variantQuery->where('color_id', $colorId);
                } elseif ($colorName) {
                    $colorModel = Color::where('name', $colorName)->first();
                    if ($colorModel) $variantQuery->where('color_id', $colorModel->id);
                } else {
                    $variantQuery->whereNull('color_id');
                }

                if ($sizeId) {
                    $variantQuery->where('size_id', $sizeId);
                } elseif ($sizeName) {
                    $sizeModel = Size::where('name', $sizeName)->first();
                    if ($sizeModel) $variantQuery->where('size_id', $sizeModel->id);
                } else {
                    $variantQuery->whereNull('size_id');
                }

                $variant = $variantQuery->first();
                if (!$variant) {
                    throw new \Exception("The selected variation for '{$product->name}' is invalid or no longer exists.");
                }
                if ($variant->stock_quantity < $quantity) {
                    throw new \Exception("The selected variation for '{$product->name}' is out of stock. Available: {$variant->stock_quantity}");
                }

                $variant->decrement('stock_quantity', $quantity);
                if ($product->stock_quantity >= $quantity) {
                    $product->decrement('stock_quantity', $quantity);
                }
            } else {
                if ($product->stock_quantity < $quantity) {
                    throw new \Exception("Sorry, '{$product->name}' does not have enough stock. Available: {$product->stock_quantity}");
                }
                $product->decrement('stock_quantity', $quantity);
            }

            $unitCost = (float) ($product->cost_price ?? 0);
            $price    = (float) $item['price'];

            $orderItems[] = [
                'order_id'   => $order->id,
                'product_id' => $product->id,
                'quantity'   => $quantity,
                'price'      => $price,
                'unit_cost'  => $unitCost,
                'color'      => $colorName,
                'size'       => $sizeName,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            $analyticsService->logEvent($product->id, 'purchase', null, [
                'quantity'     => $quantity,
                'revenue'      => $price * $quantity,
                'gross_margin' => ($price - $unitCost) * $quantity,
            ]);
        }

        OrderItem::insert($orderItems);

        return $order;
    }

    /**
     * Helper to calculate totals and shipping eligibility from the cart.
     */
    private function calculateCartDetails(array $cart): array
    {
        if (empty($cart)) {
            return ['subtotal' => 0, 'totalWeight' => 0, 'hasFreeShipping' => false];
        }

        $subtotal        = 0;
        $totalWeight     = 0;
        $hasFreeShipping = false;

        $productIds = collect($cart)->pluck('id')->unique();
        $products   = Product::whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($cart as $item) {
            $product = $products->get($item['id']);
            $qty     = $item['quantity'];

            if ($product) {
                $subtotal += (float) $item['price'] * $qty;

                if ($product->is_free_shipping) {
                    $hasFreeShipping = true;
                } else {
                    $totalWeight += (float) ($product->weight ?? 0) * $qty;
                }
            }
        }

        return [
            'subtotal'        => (float) $subtotal,
            'totalWeight'     => (float) $totalWeight,
            'hasFreeShipping' => $hasFreeShipping,
        ];
    }
}