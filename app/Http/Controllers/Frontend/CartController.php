<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Color;
use App\Models\Size;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the cart page.
     */
    public function index()
    {
        // Fetch 5 random products for the "Suggested Products" section in the cart
        $suggestedProducts = Product::inRandomOrder()->take(5)->get();

        return Inertia::render('Frontend/Cart', [
            'cart' => session()->get('cart', []),
            // Fetch active shipping methods to provide threshold data for the progress bar
            'shippingMethods' => ShippingMethod::where('status', true)->get(),
            'suggestedProducts' => $suggestedProducts,
        ]);
    }

    /**
     * Add an item to the cart or process a direct "Buy Now".
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|integer|min:1',
            'color_id'   => 'nullable|exists:colors,id',
            'size_id'    => 'nullable|exists:sizes,id',
            'action'     => 'nullable|string', // Detect 'buy_now' action
        ]);

        $product = Product::findOrFail($request->product_id);
        
        // Fetch variation names securely from database
        $color = $request->color_id ? Color::find($request->color_id) : null;
        $size = $request->size_id ? Size::find($request->size_id) : null;

        // Strictly match variant (ensuring nulls match nulls) to avoid inaccurate variant selection
        $variant = ProductVariant::where('product_id', $product->id)
            ->where('color_id', $request->color_id ?: null)
            ->where('size_id', $request->size_id ?: null)
            ->first();

        // Generate a unique key prefixed with 'p_' to force PHP/JSON to treat it as a String key.
        // This eliminates the bug where the cart mysteriously becomes an empty Array in JavaScript.
        $cartKey = 'p_' . $product->id;
        if ($color) $cartKey .= '-c' . $color->id;
        if ($size)  $cartKey .= '-s' . $size->id;

        // Calculate total base price FIRST (Base Product Price + Variant Price Adjustment)
        $basePrice = (float) $product->price;
        $priceAdjustment = $variant ? (float) $variant->price_adjustment : 0;
        $finalBasePrice = $basePrice + $priceAdjustment;
        
        // THEN apply the discount to the combined price
        $finalPrice = $finalBasePrice;
        if ($product->discount_value > 0) {
            $finalPrice = $product->discount_type === 'percent' 
                ? $finalBasePrice - ($finalBasePrice * ((float)$product->discount_value / 100))
                : $finalBasePrice - (float)$product->discount_value;
        }

        // Build the isolated item array
        $cartItem = [
            'id'         => $product->id,
            'name'       => $product->name,
            'base_price' => $finalBasePrice,       
            'price'      => $finalPrice, 
            'quantity'   => (int) $request->quantity,
            'thumbnail'  => $product->thumbnail,
            'slug'       => $product->slug,
            'options'    => [
                'color_id' => $color ? $color->id : null,
                'color'    => $color ? $color->name : null,
                'size_id'  => $size ? $size->id : null,
                'size'     => $size ? $size->name : null,
            ]
        ];

        // ==========================================
        // 1. ISOLATE "BUY NOW" LOGIC
        // ==========================================
        if ($request->action === 'buy_now') {
            // Put ONLY this item into a special 'buy_now_cart' session
            session()->put('buy_now_cart', [$cartKey => $cartItem]);
            session()->save();

            // Redirect directly to checkout with a query parameter telling it to use the buy_now_cart
            return redirect()->route('checkout.index', ['checkout_type' => 'buy_now']);
        }

        // ==========================================
        // 2. STANDARD "ADD TO CART" LOGIC
        // ==========================================
        
        // Safely fetch cart and force it into an array to prevent stdClass 500 errors in production
        $cart = session()->get('cart', []);
        if (!is_array($cart)) {
            $cart = json_decode(json_encode($cart), true) ?? [];
        }

        if (isset($cart[$cartKey])) {
            // Update quantity if item already exists
            $cart[$cartKey]['quantity'] += $request->quantity;
        } else {
            // Add new item to cart array
            $cart[$cartKey] = $cartItem;
        }

        session()->put('cart', $cart);
        session()->save(); // Explicitly force save session so the client-side fetches the latest state immediately

        // Standard Add to Cart behavior (flashes the success Toast without redirecting)
        return back()->with('success', 'Product added to cart!');
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function update(Request $request)
    {
        $request->validate([
            'cart_key' => 'required|string',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = session()->get('cart', []);
        
        // Safety check to ensure $cart is always an associative array
        if (!is_array($cart)) {
            $cart = json_decode(json_encode($cart), true) ?? [];
        }

        if (isset($cart[$request->cart_key])) {
            $cart[$request->cart_key]['quantity'] = (int) $request->quantity;
            session()->put('cart', $cart);
            session()->save(); // Explicitly save session
        }

        return back();
    }

    /**
     * Remove an item from the cart.
     */
    public function remove(Request $request)
    {
        $request->validate([
            'cart_key' => 'required|string',
        ]);

        $cart = session()->get('cart', []);
        
        // Safety check to ensure $cart is always an associative array
        if (!is_array($cart)) {
            $cart = json_decode(json_encode($cart), true) ?? [];
        }

        if (isset($cart[$request->cart_key])) {
            unset($cart[$request->cart_key]);
            session()->put('cart', $cart);
            session()->save(); // Explicitly save session
        }

        return back();
    }

    /**
     * Clear the entire standard cart.
     */
    public function clear()
    {
        session()->forget('cart');
        return back()->with('success', 'Cart cleared.');
    }
}