<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Admin Controllers
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ColorController;
use App\Http\Controllers\Admin\SizeController;
use App\Http\Controllers\Admin\AuthorController;
use App\Http\Controllers\Admin\PublicationController;
use App\Http\Controllers\Admin\BrandController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\OrderTimelineController;
use App\Http\Controllers\Admin\ManualOrderController;
use App\Http\Controllers\Admin\ShippingMethodController;
use App\Http\Controllers\Admin\SliderController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\ProductBehaviorController;
use App\Http\Controllers\Admin\IncompleteOrderController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\ProfitLossController;
use App\Http\Controllers\Admin\BlacklistController;
use App\Http\Controllers\Admin\LandingPageController as AdminLandingPageController;

// Frontend Controllers
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\ProductController as FrontendProductController;
use App\Http\Controllers\Frontend\CategoryController as FrontendCategoryController;
use App\Http\Controllers\Frontend\CartController;
use App\Http\Controllers\Frontend\CheckoutController;
use App\Http\Controllers\Frontend\OrderController as FrontendOrderController;
use App\Http\Controllers\Frontend\AnalyticsController as FrontendAnalyticsController;
use App\Http\Controllers\Frontend\LandingPageController as FrontendLandingPageController;

// Tracking Controllers
use App\Http\Controllers\Tracking\MetaConversionController;

// ==========================================
// Frontend Routes
// ==========================================
Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/shop', [FrontendProductController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [FrontendProductController::class, 'show'])->name('product.show');

Route::get('/categories', [FrontendCategoryController::class, 'index'])->name('categories.index');

// Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
Route::patch('/cart/update', [CartController::class, 'update'])->name('cart.update');
Route::delete('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');

// Standard (cart-based) checkout
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::post('/checkout/save-draft', [CheckoutController::class, 'saveDraft'])->name('checkout.draft');
Route::get('/checkout/success/{order_id}', [CheckoutController::class, 'success'])->name('checkout.success');
Route::get('/checkout/invoice/{order_id}', [CheckoutController::class, 'invoice'])->name('checkout.invoice');

// Dedicated landing-page checkout — bypasses cart session entirely.
Route::post('/lp/checkout', [CheckoutController::class, 'landingPageStore'])->name('landing_page.checkout');

// Analytics Tracking Route
Route::post('/analytics/track', [FrontendAnalyticsController::class, 'trackEvent'])->name('analytics.track');

// Meta Server-Side Tracking Route
Route::post('/tracking/meta-event', [MetaConversionController::class, 'store'])->name('tracking.meta');

// Landing Page Frontend Route — must be is_published=true to show
Route::get('/lp/{slug}', [FrontendLandingPageController::class, 'show'])->name('landing_page.show');

// ==========================================
// Widget API Routes (For Landing Page Builder)
// ==========================================
Route::get('/api/widget-products', function() {
    return response()->json(\App\Models\Product::select('id', 'name')->where('status', true)->get());
});
Route::get('/api/widget-products/{id}', function($id) {
    $product = \App\Models\Product::with(['images', 'authors', 'publications'])->find($id);
    if (!$product) return response()->json(null, 404);

    $data = $product->toArray();

    // Normalise thumbnail → absolute URL so the widget can use it directly
    if (!empty($data['thumbnail'])) {
        $thumb = $data['thumbnail'];
        if (!str_starts_with($thumb, 'http') && !str_starts_with($thumb, '/storage/')) {
            $thumb = '/storage/' . $thumb;
        }
        $data['thumbnail'] = $thumb;
    }

    // Normalise gallery image paths the same way
    if (!empty($data['images'])) {
        $data['images'] = array_map(function ($img) {
            $path = $img['image_path'] ?? '';
            if ($path && !str_starts_with($path, 'http') && !str_starts_with($path, '/storage/')) {
                $img['image_path'] = '/storage/' . $path;
            }
            return $img;
        }, $data['images']);
    }

    return response()->json($data);
});

// ==========================================
// User Dashboard & Order Routes
// ==========================================
Route::middleware(['auth', 'verified', 'role:user'])->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    Route::get('/my-orders', [FrontendOrderController::class, 'index'])->name('user.orders');
});

// ==========================================
// Admin & Staff Shared Routes
// ==========================================
Route::middleware(['auth', 'verified', 'admin_or_staff'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {

        Route::get('/dashboard', function () {
            // Dashboard logic unchanged
            $filter    = request()->query('filter', 'today');
            $startDate = \Carbon\Carbon::today();
            $endDate   = \Carbon\Carbon::now();

            switch ($filter) {
                case 'yesterday':
                    $startDate = \Carbon\Carbon::yesterday();
                    $endDate   = \Carbon\Carbon::yesterday()->endOfDay();
                    break;
                case 'this_week':
                    $startDate = \Carbon\Carbon::now()->startOfWeek();
                    break;
                case 'this_month':
                    $startDate = \Carbon\Carbon::now()->startOfMonth();
                    break;
                case 'last_30_days':
                    $startDate = \Carbon\Carbon::now()->subDays(30);
                    break;
            }

            $stats = [
                'totalOrders'     => \App\Models\Order::count(),
                'pendingOrders'   => \App\Models\Order::where('order_status', 'pending')->count(),
                'shippedOrders'   => \App\Models\Order::where('order_status', 'shipped')->count(),
                'deliveredOrders' => \App\Models\Order::where('order_status', 'delivered')->count(),
                'returnedOrders'  => \App\Models\Order::where('order_status', 'returned')->count(),
                'cancelledOrders' => \App\Models\Order::where('order_status', 'cancelled')->count(),
                'totalProducts'   => \App\Models\Product::count(),
                'totalCustomers'  => \App\Models\User::where('role', 'user')->count(),
            ];

            $ordersQuery = \App\Models\Order::whereBetween('created_at', [$startDate, $endDate])
                ->where('order_status', '!=', 'cancelled');

            $orderIds   = $ordersQuery->pluck('id');
            $orderItems = \App\Models\OrderItem::whereIn('order_id', $orderIds)->get();

            $revenue = (float) $orderItems->sum(fn ($item) => $item->price * $item->quantity);
            $margin  = (float) $orderItems->sum(fn ($item) => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity);

            $views = \App\Models\ProductDailyAnalytic::whereBetween('date', [
                $startDate->format('Y-m-d'), $endDate->format('Y-m-d'),
            ])->sum('views') ?? ($orderIds->count() > 0 ? $orderIds->count() * 12 : 0);

            $conversionRate = $views > 0 ? round(($orderIds->count() / $views) * 100, 2) : 0;

            $overview = [
                'revenue'        => $revenue,
                'margin'         => $margin,
                'conversionRate' => $conversionRate,
                'views'          => $views,
            ];

            $chartData = \App\Models\OrderItem::selectRaw('DATE(orders.created_at) as date, SUM(order_items.price * order_items.quantity) as daily_revenue')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereBetween('orders.created_at', [$startDate, $endDate])
                ->where('orders.order_status', '!=', 'cancelled')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $topProducts = \App\Models\OrderItem::selectRaw('product_id, SUM(quantity) as total_sold, SUM(price * quantity) as total_revenue')
                ->whereIn('order_id', $orderIds)
                ->with('product:id,name,thumbnail')
                ->groupBy('product_id')
                ->orderByDesc('total_sold')
                ->take(5)
                ->get();

            $lowStockProducts = \App\Models\Product::where('stock_quantity', '<=', 10)
                ->where('stock_quantity', '>', 0)
                ->select('id', 'name', 'thumbnail', 'stock_quantity')
                ->take(5)
                ->get()
                ->map(fn ($p) => ['product' => $p]);

            $stockouts = \App\Models\ProductIntelligencePrediction::whereNotNull('predicted_stockout_date')
                ->where('predicted_stockout_date', '<=', \Carbon\Carbon::today()->addDays(7))
                ->with('product:id,name,thumbnail')
                ->take(5)
                ->get()
                ->map(function ($prediction) {
                    $days = \Carbon\Carbon::today()->diffInDays($prediction->predicted_stockout_date, false);
                    $prediction->days_until_stockout = $days > 0 ? (int) $days : 0;
                    return $prediction;
                });

            if ($stockouts->isEmpty()) {
                $stockouts = \App\Models\Product::where('stock_quantity', 0)
                    ->select('id', 'name', 'thumbnail')
                    ->take(5)
                    ->get()
                    ->map(fn ($p) => ['product' => $p, 'days_until_stockout' => 0]);
            }

            $recentOrders = \App\Models\Order::with('user:id,name')->latest()->take(5)->get();

            return Inertia::render('Admin/AdminDashboard', [
                'stats'         => $stats,
                'overview'      => $overview,
                'chartData'     => $chartData,
                'topProducts'   => $topProducts,
                'alerts'        => ['lowStock' => $lowStockProducts, 'stockouts' => $stockouts],
                'recentOrders'  => $recentOrders,
                'currentFilter' => $filter,
            ]);
        })->name('dashboard');

        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
        Route::get('/analytics/behavior', [ProductBehaviorController::class, 'index'])->name('analytics.behavior');

        Route::resource('categories', CategoryController::class);
        Route::resource('colors', ColorController::class);
        Route::resource('sizes', SizeController::class);
        Route::resource('authors', AuthorController::class);
        Route::resource('publications', PublicationController::class);
        Route::resource('brands', BrandController::class);
        
        // EXPORT ROUTE ADDED HERE BEFORE RESOURCE
        Route::get('products/export', [AdminProductController::class, 'export'])->name('products.export');
        Route::resource('products', AdminProductController::class);

        Route::resource('shipping-methods', ShippingMethodController::class);
        Route::resource('sliders', SliderController::class);

        Route::get('accounting/profit-loss', [ProfitLossController::class, 'index'])->name('accounting.profit-loss');
        Route::get('transactions/export', [TransactionController::class, 'export'])->name('transactions.export');
        Route::post('transactions/bulk-delete', [TransactionController::class, 'bulkDelete'])->name('transactions.bulk-delete');
        Route::resource('transactions', TransactionController::class);

        Route::get('/incomplete-orders', [IncompleteOrderController::class, 'index'])->name('incomplete-orders.index');
        Route::patch('/incomplete-orders/{id}/convert', [IncompleteOrderController::class, 'markAsConverted'])->name('incomplete-orders.mark-converted');
        Route::patch('/incomplete-orders/{id}/lost', [IncompleteOrderController::class, 'markAsLost'])->name('incomplete-orders.mark-lost');
        Route::delete('/incomplete-orders/{id}', [IncompleteOrderController::class, 'destroy'])->name('incomplete-orders.destroy');

        Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
        Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');
        Route::resource('blacklists', BlacklistController::class)->only(['index', 'destroy']);

        Route::get('orders/create/{lead_id?}', [ManualOrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [ManualOrderController::class, 'store'])->name('orders.store');
        Route::get('orders/export', [AdminOrderController::class, 'export'])->name('orders.export');
        Route::get('orders/timeline', [OrderTimelineController::class, 'index'])->name('orders.timeline');

        Route::post('orders/bulk-delete', [AdminOrderController::class, 'bulkDelete'])->name('orders.bulk-delete');
        Route::post('orders/bulk-status', [AdminOrderController::class, 'bulkUpdateStatus'])->name('orders.bulk-status');
        Route::post('orders/bulk-assign', [AdminOrderController::class, 'bulkAssignStaff'])->name('orders.bulk-assign');
        Route::put('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.update-status');
        Route::post('orders/{order}/assign', [AdminOrderController::class, 'assignStaff'])->name('orders.assign');
        Route::post('orders/{order}/block', [AdminOrderController::class, 'blockClient'])->name('orders.block');

        Route::post('orders/steadfast/bulk', [AdminOrderController::class, 'bulkSendToSteadfast'])->name('orders.steadfast.bulk');
        Route::post('orders/{order}/steadfast', [AdminOrderController::class, 'sendToSteadfast'])->name('orders.steadfast.send');
        Route::get('orders/{order}/steadfast-status', [AdminOrderController::class, 'checkSteadfastStatus'])->name('orders.steadfast.status');
        Route::get('orders/bdcourier-check', [AdminOrderController::class, 'bdCourierCheck'])->name('orders.bdcourier.check');

        Route::get('orders/{order}/label', [AdminOrderController::class, 'label'])->name('orders.label');
        Route::get('orders/{order}/invoice', [AdminOrderController::class, 'invoice'])->name('orders.invoice');

        Route::resource('orders', AdminOrderController::class)->only(['index', 'show', 'update', 'destroy']);

        // ==========================================
        // Landing Pages
        // ==========================================
        Route::prefix('landing-pages')->name('landing-pages.')->group(function () {
            Route::get('/',                          [AdminLandingPageController::class, 'index'])        ->name('index');
            Route::get('/create',                    [AdminLandingPageController::class, 'create'])       ->name('create');
            Route::post('/',                         [AdminLandingPageController::class, 'store'])        ->name('store');
            Route::get('/{page}/edit',               [AdminLandingPageController::class, 'edit'])         ->name('edit');
            Route::put('/{page}',                    [AdminLandingPageController::class, 'update'])       ->name('update');
            Route::get('/{page}/builder',            [AdminLandingPageController::class, 'builder'])      ->name('builder');
            Route::put('/{page}/save',               [AdminLandingPageController::class, 'saveData'])     ->name('save');
            Route::put('/{page}/save-tracking',      [AdminLandingPageController::class, 'saveTracking'])->name('save-tracking');
            Route::patch('/{page}/toggle-publish',   [AdminLandingPageController::class, 'togglePublish'])->name('toggle-publish');
            Route::post('/{page}/duplicate',         [AdminLandingPageController::class, 'duplicate'])    ->name('duplicate');
            Route::delete('/{page}',                 [AdminLandingPageController::class, 'destroy'])      ->name('destroy');
            
            Route::post('/upload-image',             [AdminLandingPageController::class, 'uploadImage'])  ->name('upload-image');
        });
    });

// ==========================================
// STRICTLY Admin Only Routes
// ==========================================
Route::middleware(['auth', 'verified', \App\Http\Middleware\AdminMiddleware::class])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('users', UserController::class);
    });

// ==========================================
// Profile & Auth Routes
// ==========================================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';