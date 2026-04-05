<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class LandingPageController extends Controller
{
    public function index()
    {
        // Eager load both the primary product and all attached products
        $pages = LandingPage::with(['product:id,name', 'products:id,name'])
            ->latest()
            ->paginate(15)
            ->through(function ($page) {
                $page->views       = $page->views       ?? 0;
                $page->conversions = $page->conversions ?? 0;
                return $page;
            });

        return Inertia::render('Admin/LandingPages/Index', [
            'pages' => $pages,
        ]);
    }

    public function create()
    {
        $products = Product::select('id', 'name', 'price')
            ->where('status', true)
            ->get();

        return Inertia::render('Admin/LandingPages/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'product_ids'   => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
            'slug'          => 'nullable|string|unique:landing_pages,slug',
        ]);

        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);
            
        // Set the primary product ID for backward compatibility
        $validated['product_id'] = $validated['product_ids'][0];

        $validated['content_json'] = json_encode([
            'ROOT' => [
                'type'        => ['resolvedName' => 'Container'],
                'isCanvas'    => true,
                'props'       => [
                    'bgType'          => 'color',
                    'bgColor'         => '#ffffff',
                    'bgGradientFrom'  => '#6366f1',
                    'bgGradientTo'    => '#8b5cf6',
                    'bgGradientDirection' => 135,
                    'bgImage'         => '',
                    'bgImageSize'     => 'cover',
                    'bgImagePosition' => 'center',
                    'bgImageRepeat'   => 'no-repeat',
                    'overlayColor'    => '#000000',
                    'overlayOpacity'  => 0,
                    'paddingTop'      => 20, 'paddingRight' => 20,
                    'paddingBottom'   => 20, 'paddingLeft'  => 20,
                    'marginTop'       => 0,  'marginRight'  => 0,
                    'marginBottom'    => 0,  'marginLeft'   => 0,
                    'display'         => 'flex',
                    'flexDirection'   => 'column',
                    'flexWrap'        => 'nowrap',
                    'alignItems'      => 'center',
                    'justifyContent'  => 'flex-start',
                    'gap'             => 0,
                    'width'           => '100%',
                    'maxWidth'        => null,
                    'minHeight'       => 40,
                    'overflow'        => 'visible',
                    'borderStyle'     => 'none',
                    'borderWidth'     => 0,
                    'borderColor'     => '#e5e7eb',
                    'borderRadius'    => 0,
                    'useIndividualRadius'     => false,
                    'borderTopLeftRadius'     => 0,
                    'borderTopRightRadius'    => 0,
                    'borderBottomRightRadius' => 0,
                    'borderBottomLeftRadius'  => 0,
                    'shadow'          => 'none',
                    'shadowColor'     => '#000000',
                    'opacity'         => 100,
                    'cursor'          => 'default',
                    'position'        => 'static',
                ],
                'displayName' => 'Container',
                'custom'      => [],
                'hidden'      => false,
                'nodes'       => [],
                'linkedNodes' => [],
            ],
        ]);

        // Extract product_ids before creating the model
        $productIds = $validated['product_ids'];
        unset($validated['product_ids']);

        $page = LandingPage::create($validated);
        
        // Sync the multiple products to the pivot table
        $page->products()->sync($productIds);

        return redirect()->route('admin.landing-pages.builder', $page->id);
    }

    public function edit(LandingPage $page)
    {
        $products = Product::select('id', 'name', 'price')
            ->where('status', true)
            ->get();
            
        // Load the attached products
        $page->load('products:id');

        return Inertia::render('Admin/LandingPages/Create', [
            'products' => $products,
            // Pass the array of IDs down to the frontend form
            'page'     => array_merge($page->only('id', 'title', 'slug', 'product_id'), [
                'product_ids' => $page->products->pluck('id')->toArray()
            ]),
        ]);
    }

    public function update(Request $request, LandingPage $page)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'product_ids'   => 'required|array|min:1',
            'product_ids.*' => 'exists:products,id',
            'slug'          => 'nullable|string|unique:landing_pages,slug,' . $page->id,
        ]);

        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);
            
        $validated['product_id'] = $validated['product_ids'][0];

        $productIds = $validated['product_ids'];
        unset($validated['product_ids']);

        $page->update($validated);
        
        // Sync updated products to the pivot table
        $page->products()->sync($productIds);

        return redirect()
            ->route('admin.landing-pages.index')
            ->with('success', 'Landing page updated successfully.');
    }

    public function builder(LandingPage $page)
    {
        // Eager load the new products relationship so the React builder has them immediately
        $pageData = $page->load(['product', 'products'])->toArray();

        $pageData['content_json'] = is_array($pageData['content_json'])
            ? json_encode($pageData['content_json'])
            : (string) $pageData['content_json'];

        return Inertia::render('Admin/LandingPages/Builder', [
            'page' => $pageData,
        ]);
    }

    public function saveData(Request $request, LandingPage $page)
    {
        $request->validate(['content_json' => 'required|string']);
        $page->forceFill(['content_json' => $request->content_json])->save();
        return back()->with('success', 'Page saved successfully.');
    }

    /**
     * Save tracking scripts (FB Pixel, GA, custom CSS/JS).
     */
    public function saveTracking(Request $request, LandingPage $page)
    {
        $request->validate([
            'tracking_scripts'            => 'nullable|array',
            'tracking_scripts.fb_pixels'  => 'nullable|string|max:500',
            'tracking_scripts.ga_tags'    => 'nullable|string|max:500',
            'tracking_scripts.custom_css' => 'nullable|string|max:50000',
            'tracking_scripts.custom_js'  => 'nullable|string|max:50000',
        ]);

        $page->forceFill(['tracking_scripts' => $request->tracking_scripts])->save();

        return back()->with('success', 'Tracking settings saved.');
    }

    public function togglePublish(LandingPage $page)
    {
        $page->forceFill(['is_published' => !$page->is_published])->save();
        $message = $page->is_published ? 'Page is now live.' : 'Page set to draft.';
        return back()->with('success', $message);
    }

    /**
     * Duplicate a landing page — copies all content_json and tracking_scripts.
     * The duplicate is saved as a Draft with a new unique slug.
     */
    public function duplicate(LandingPage $page)
    {
        $newSlug = Str::slug($page->title) . '-copy-' . Str::random(4);

        // Ensure slug uniqueness
        while (LandingPage::where('slug', $newSlug)->exists()) {
            $newSlug = Str::slug($page->title) . '-copy-' . Str::random(6);
        }

        $duplicate = $page->replicate();
        $duplicate->title        = $page->title . ' (Copy)';
        $duplicate->slug         = $newSlug;
        $duplicate->is_published = false;
        $duplicate->views        = 0;
        $duplicate->conversions  = 0;
        $duplicate->save();
        
        // Sync the multi-product relationships to the duplicated page
        if ($page->products()->exists()) {
            $duplicate->products()->sync($page->products()->pluck('products.id')->toArray());
        }

        return redirect()
            ->route('admin.landing-pages.index')
            ->with('success', '"' . $duplicate->title . '" created as a Draft.');
    }

    public function destroy(LandingPage $page)
    {
        $page->delete();
        return redirect()
            ->route('admin.landing-pages.index')
            ->with('success', 'Landing page deleted successfully.');
    }

    /**
     * Handle image uploads from the page builder.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg,webp|max:5120', // Max 5MB
        ]);

        if ($request->hasFile('image')) {
            // Store the image in the 'public/landing-pages/images' directory
            $path = $request->file('image')->store('landing-pages/images', 'public');
            
            // Return the full URL to the uploaded image
            return response()->json([
                'url' => asset('storage/' . $path)
            ]);
        }

        return response()->json(['error' => 'No image uploaded'], 400);
    }
}