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
use Illuminate\Support\Facades\Http; // NEW: Added for SSLCommerz API calls

class CheckoutController extends Controller
{
    protected $analyticsService;
    protected $orderService;
    protected $smsService;

    public function __construct(
        AnalyticsEventService $analyticsService, 
        OrderService $orderService, 
        SmsService $smsService
    ) {
        $this->analyticsService = $analyticsService;
        $this->orderService = $orderService;
        $this->smsService = $smsService;
    }

    public function index(Request $request)
    {
        // Always use the regular cart — buy_now merges into it before redirecting here
        session()->put('checkout_context', 'cart');
        $cart = session()->get('cart', []);

        if (empty($cart)) {
            session()->put('checkout_context', 'cart');
            return redirect()->route('cart.index')->with('error', 'Your checkout is empty. Please add items to proceed.');
        }

        $shippingMethods = ShippingMethod::where('status', true)->get();

        if ($shippingMethods->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Checkout is currently unavailable as no shipping methods are configured.');
        }

        $cartDetails = $this->calculateCartDetails($cart);

        foreach ($cart as $item) {
            $this->analyticsService->logEvent($item['id'], 'checkout_start', null, [
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

    public function saveDraft(Request $request)
    {
        $context = session()->get('checkout_context', 'cart');
        $cartSessionKey = $context === 'buy_now' ? 'buy_now_cart' : 'cart';

        // Stricter draft validation
        $request->validate([
            'items'              => 'nullable|array',
            'items.*.id'         => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
        ]);

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

        // Ensure proper strict retrieval of drafts avoiding loose matching
        $draft = IncompleteOrder::where('session_id', $sessionId)
            ->where('status', 'pending')
            ->orderBy('id', 'desc')
            ->first();

        $data = [
            'session_id'   => $sessionId,
            'user_id'      => $userId ?? ($draft->user_id ?? null),
            'full_name'    => $request->full_name ?? $request->name,
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

    public function store(Request $request)
    {
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

            $productIds = collect($cart)->pluck('id')->unique()->sort()->values()->toArray();
            Product::whereIn('id', $productIds)->lockForUpdate()->get();

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

            // Safer Draft Deletion
            IncompleteOrder::where('status', 'pending')
                ->where('session_id', $sessionId)
                ->delete();

            DB::commit();

            // Check if payment method is online
            if ($validated['payment_method'] === 'online') {
                return $this->initiateSSLCommerz($order, $validated);
            }

            try {
                $this->smsService->sendTemplatedSms(
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

            // Always clear the buy_now_cart
            session()->forget('buy_now_cart');
            session()->put('checkout_context', 'cart');

            // If this was a buy_now checkout, remove only the purchased items from
            // the regular cart so all other items the user had added are preserved.
            // If this was a normal cart checkout, clear the entire regular cart.
            if ($context === 'buy_now') {
                $regularCart = session()->get('cart', []);
                if (is_array($regularCart)) {
                    foreach ($cart as $key => $item) {
                        unset($regularCart[$key]);
                    }
                    session()->put('cart', $regularCart);
                }
            } else {
                session()->forget('cart');
            }

            session()->save();

            return redirect()->route('checkout.success', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage() ?: 'Something went wrong while placing your order. Please try again.');
        }
    }

    public function landingPageStore(Request $request)
    {
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
            'items'              => 'sometimes|array|min:1',
            'items.*.product_id' => 'required_with:items|exists:products,id',
            'items.*.quantity'   => 'required_with:items|integer|min:1',
            'items.*.color_id'   => 'nullable|exists:colors,id',
            'items.*.size_id'    => 'nullable|exists:sizes,id',
            'product_id'         => 'required_without:items|exists:products,id',
            'quantity'           => 'required_without:items|integer|min:1|max:100',
            'color_id'           => 'nullable|exists:colors,id',
            'size_id'            => 'nullable|exists:sizes,id',
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
        $totalWeight = 0; 
        
        if (!empty($validated['items'])) {
            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $quantity = (int) $item['quantity'];
                $unitPrice = (float) ($product->final_price ?? $product->price);

                $cart[] = [
                    'id'       => $product->id,
                    'quantity' => $quantity,
                    'price'    => $unitPrice,
                    'options'  => [
                        'color_id' => $item['color_id'] ?? null,
                        'size_id'  => $item['size_id'] ?? null,
                    ],
                ];

                $subtotal += ($unitPrice * $quantity);
                if ($product->is_free_shipping) {
                    $hasFreeShipping = true;
                } else {
                    $totalWeight += (float) ($product->weight ?? 0) * $quantity;
                }
            }
        } else {
            $product  = Product::findOrFail($validated['product_id']);
            $quantity = (int) $validated['quantity'];
            $unitPrice = (float) ($product->final_price ?? $product->price);

            $cart[] = [
                'id'       => $product->id,
                'quantity' => $quantity,
                'price'    => $unitPrice,
                'options'  => [
                    'color_id' => $validated['color_id'] ?? null,
                    'size_id'  => $validated['size_id'] ?? null,
                ],
            ];
            
            $subtotal += ($unitPrice * $quantity);
            if ($product->is_free_shipping) {
                $hasFreeShipping = true;
            } else {
                $totalWeight += (float) ($product->weight ?? 0) * $quantity;
            }
        }

        $shippingMethod = ShippingMethod::findOrFail($validated['shipping_method_id']);
        $shippingCharge = 0;
        $shippingName   = $shippingMethod->name;

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

            $productIds = collect($cart)->pluck('id')->unique()->sort()->values()->toArray();
            Product::whereIn('id', $productIds)->lockForUpdate()->get();

            $orderValidated = [
                'full_name'      => $validated['name'],
                'phone'          => $validated['phone'],
                'address'        => $validated['address'] ?? 'N/A',
                'payment_method' => 'cod', 
            ];

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

            if (!empty($validated['landing_page_id'])) {
                $landingPage = LandingPage::find($validated['landing_page_id']);
                if ($landingPage) {
                    $landingPage->increment('conversions');
                    if ($landingPage->parent_id) {
                        LandingPage::where('id', $landingPage->parent_id)->increment('conversions');
                    }
                }
            }

            IncompleteOrder::where('status', 'pending')
                ->where('session_id', session()->getId())
                ->delete();

            DB::commit();

            try {
                $this->smsService->sendTemplatedSms(
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

            return redirect()->route('checkout.success', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage() ?: 'Something went wrong.');
        }
    }

    public function success($order_id)
    {
        $order = Order::findOrFail($order_id);

        $layout = Setting::where('key', 'checkout_success_layout')->value('value') ?? 'default';

        $component = $layout === 'professional' 
            ? 'Frontend/CheckoutSuccessProfessional' 
            : 'Frontend/CheckoutSuccess';

        return Inertia::render($component, [
            'order' => $order,
        ]);
    }

    public function invoice($order_id)
    {
        $order      = Order::findOrFail($order_id);
        $orderItems = OrderItem::where('order_id', $order->id)->get();

        return Inertia::render('Frontend/Invoice', [
            'order'      => $order,
            'orderItems' => $orderItems,
        ]);
    }

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

        $assignedStaffId = $this->orderService->getNextAvailableStaffId();

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

        $orderItems = [];

        foreach ($cart as $item) {
            $quantity  = (int) $item['quantity'];
            $options   = $item['options'] ?? [];
            $colorId   = $options['color_id'] ?? null;
            $sizeId    = $options['size_id']   ?? null;
            $colorName = $options['color']     ?? null;
            $sizeName  = $options['size']      ?? null;

            if ($colorId && !$colorName) {
                $colorModel = Color::find($colorId);
                if ($colorModel) $colorName = $colorModel->name;
            }
            if ($sizeId && !$sizeName) {
                $sizeModel = Size::find($sizeId);
                if ($sizeModel) $sizeName = $sizeModel->name;
            }

            $hasVariation = $colorId || $sizeId || $colorName || $sizeName;

            $product = Product::find($item['id']);
            if (!$product) {
                throw new \Exception("A product in your cart is no longer available.");
            }

            // Proper Unified Lock For Variants Prior To Condition Checks
            if ($hasVariation) {
                $variantQuery = ProductVariant::where('product_id', $item['id'])->lockForUpdate();

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
            } else {
                if ($product->stock_quantity < $quantity) {
                    throw new \Exception("Sorry, '{$product->name}' does not have enough stock. Available: {$product->stock_quantity}");
                }
                $product->decrement('stock_quantity', $quantity);
            }

            $unitCost = (float) ($product->cost_price ?? 0);
            $price = (float) ($product->final_price ?? $product->price);

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

            $this->analyticsService->logEvent($product->id, 'purchase', null, [
                'quantity'     => $quantity,
                'revenue'      => $price * $quantity,
                'gross_margin' => ($price - $unitCost) * $quantity,
            ]);
        }

        OrderItem::insert($orderItems);

        return $order;
    }

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
                $realPrice = (float) ($product->final_price ?? $product->price);
                $subtotal += $realPrice * $qty;

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

    private function initiateSSLCommerz(Order $order, array $validated)
    {
        $post_data = array();
        $post_data['store_id'] = env('STORE_ID');
        $post_data['store_passwd'] = env('STORE_PASSWORD');
        $post_data['total_amount'] = $order->total_amount;
        $post_data['currency'] = "BDT";
        
        // Generate and save a unique transaction ID
        $tran_id = uniqid('txn_');
        $order->update(['transaction_id' => $tran_id]);
        $post_data['tran_id'] = $tran_id;

        // Callback URLs
        $post_data['success_url'] = route('payment.success');
        $post_data['fail_url'] = route('payment.fail');
        $post_data['cancel_url'] = route('payment.cancel');
        $post_data['ipn_url'] = route('payment.ipn');

        // Dynamic Customer Information
        $post_data['cus_name'] = $validated['full_name'];
        // Use authenticated user's email if available, otherwise generate a placeholder based on domain
        $post_data['cus_email'] = Auth::user() ? Auth::user()->email : "customer@" . request()->getHost(); 
        $post_data['cus_add1'] = $validated['address'];
        $post_data['cus_city'] = "Dhaka"; // Can be updated if you add a City field to checkout
        $post_data['cus_postcode'] = "1000";
        $post_data['cus_country'] = "Bangladesh";
        $post_data['cus_phone'] = $validated['phone'];
        
        // Mandatory parameters for SSLCommerz
        $post_data['shipping_method'] = "NO";
        $post_data['product_name'] = "Order " . $order->order_number;
        $post_data['product_category'] = "E-commerce";
        $post_data['product_profile'] = "general";

        $apiUrl = env('SSLCZ_TESTMODE', true) ? 
            "https://sandbox.sslcommerz.com/gwprocess/v3/api.php" : 
            "https://securepay.sslcommerz.com/gwprocess/v3/api.php";

        $response = Http::asForm()->post($apiUrl, $post_data);
        $sslcz = json_decode($response->body(), true);

        if (isset($sslcz['GatewayPageURL']) && $sslcz['GatewayPageURL'] != "") {
            // Clear the cart session before redirecting to the gateway
            $context = session()->get('checkout_context', 'cart');

            // Always clear buy_now_cart
            session()->forget('buy_now_cart');
            session()->put('checkout_context', 'cart');

            // For buy_now: only remove purchased items from regular cart, keep the rest.
            // For normal cart checkout: clear the entire cart.
            if ($context === 'buy_now') {
                $buyNowCart = session()->get('buy_now_cart', []);
                $regularCart = session()->get('cart', []);
                if (is_array($regularCart) && is_array($buyNowCart)) {
                    foreach ($buyNowCart as $key => $item) {
                        unset($regularCart[$key]);
                    }
                    session()->put('cart', $regularCart);
                }
            } else {
                session()->forget('cart');
            }

            session()->save();

            // IMPORTANT: Use Inertia::location for external redirects in React
            return Inertia::location($sslcz['GatewayPageURL']);
        } else {
            return back()->with('error', 'Payment Gateway Initialization Failed. Check your credentials.');
        }
    }
}