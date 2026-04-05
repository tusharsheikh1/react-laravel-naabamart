<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\ShippingMethod;
use App\Services\AnalyticsEventService;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    public function show($slug, AnalyticsEventService $analyticsService)
    {
        $page = LandingPage::with([
            'product.images', 'product.authors', 'product.publications',
            'products.images', 'products.authors', 'products.publications'
        ])
        ->where('slug', $slug)
        ->where('is_published', true)
        ->firstOrFail();

        LandingPage::where('id', $page->id)->increment('views');

        // --- NEW: Log Analytics Views for the Products (Duplicate-Proof) ---
        $productIdsToLog = collect();

        // 1. Add primary product ID
        if ($page->product_id) {
            $productIdsToLog->push($page->product_id);
        }

        // 2. Add additional/multiple product IDs
        if ($page->products) {
            $productIdsToLog = $productIdsToLog->merge($page->products->pluck('id'));
        }

        // 3. Extract unique IDs and log the view exactly once per product
        foreach ($productIdsToLog->unique() as $productId) {
            $analyticsService->logEvent($productId, 'view');
        }
        // -------------------------------------------------------------------

        $pageData = $page->toArray();

        $pageData['content_json'] = is_array($pageData['content_json'])
            ? json_encode($pageData['content_json'])
            : (string) ($pageData['content_json'] ?? '');

        $normalizeProduct = function ($product) {
            if (!$product) return null;

            $productArr = $product->toArray();

            $finalPrice = (float) ($product->final_price ?? $product->price ?? 0);

            $originalPrice = (float) ($product->original_price ?? 0);

            if ($originalPrice <= 0) {
                $originalPrice = (float) (
                    $product->compare_price ??
                    $product->compare_at_price ??
                    $product->regular_price ??
                    $product->old_price ??
                    0
                );
            }

            $imageUrl = null;

            if (!empty($productArr['image_url'])) {
                $imageUrl = $productArr['image_url'];
            } elseif (!empty($productArr['thumbnail'])) {
                $raw = $productArr['thumbnail'];

                $imageUrl = (str_starts_with($raw, 'http') || str_starts_with($raw, '/'))
                    ? $raw
                    : '/storage/' . $raw;
            }

            $images = [];

            if (!empty($productArr['images'])) {
                foreach ($productArr['images'] as $img) {

                    $path = $img['image_path'] ?? $img['url'] ?? $img['image_url'] ?? '';

                    if (!$path) continue;

                    if (!str_starts_with($path, 'http') && !str_starts_with($path, '/')) {
                        $path = '/storage/' . $path;
                    }

                    $img['image_path'] = $path;
                    $img['image_url']  = $path;
                    $img['url']        = $path;

                    $images[] = $img;
                }
            }

            return array_merge($productArr, [
                'price'          => $finalPrice,
                'final_price'    => $finalPrice,
                'original_price' => $originalPrice > 0 && $originalPrice > $finalPrice
                    ? $originalPrice
                    : null,
                'image_url'      => $imageUrl,
                'thumbnail'      => $imageUrl,
                'images'         => $images,
            ]);
        };

        $productData = $normalizeProduct($page->product);

        if ($page->products) {
            $pageData['products'] = $page->products->map(function ($prod) use ($normalizeProduct) {
                return $normalizeProduct($prod);
            })->toArray();
        }

        $shippingMethods = ShippingMethod::where('status', true)
            ->orderBy('base_charge', 'asc')
            ->get();

        return Inertia::render('Frontend/LandingPage/Show', [
            'page' => $pageData,
            'product' => $productData,
            'shippingMethods' => $shippingMethods,
        ]);
    }
}