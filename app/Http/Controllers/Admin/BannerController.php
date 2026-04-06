<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    // ─── Index ────────────────────────────────────────────────────────────────

    public function index()
    {
        // Group banners in PHP so the frontend can render tabs/sections
        $banners = Banner::orderBy('group')->orderBy('order')->orderBy('id')->get();
        $grouped = $banners->groupBy('group');

        return Inertia::render('Admin/Banners/Index', [
            'grouped'        => $grouped,
            'groupCatalogue' => Banner::groupCatalogue(),
        ]);
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public function create()
    {
        return Inertia::render('Admin/Banners/Create', [
            'groupCatalogue' => Banner::groupCatalogue(),
        ]);
    }

    // ─── Store ────────────────────────────────────────────────────────────────

    public function store(Request $request)
    {
        $validated = $request->validate([
            'group'        => 'required|string|in:' . implode(',', array_keys(Banner::groupCatalogue())),
            'title'        => 'nullable|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'image'        => 'required|image|mimes:jpeg,png,jpg,webp|max:4096',
            'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'link'         => 'nullable|url',
            'desktop_size' => 'nullable|string',
            'mobile_size'  => 'nullable|string',
            'order'        => 'nullable|integer',
            'status'       => 'nullable|boolean',
        ]);

        $validated['image'] = $request->file('image')->store('banners', 'public');

        if ($request->hasFile('mobile_image')) {
            $validated['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        }

        $validated['status'] = $request->boolean('status', true);

        Banner::create($validated);

        return redirect()->route('admin.banners.index')->with('success', 'Banner created successfully.');
    }

    // ─── Edit ─────────────────────────────────────────────────────────────────

    public function edit(Banner $banner)
    {
        return Inertia::render('Admin/Banners/Edit', [
            'banner'         => $banner,
            'groupCatalogue' => Banner::groupCatalogue(),
        ]);
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    public function update(Request $request, Banner $banner)
    {
        $validated = $request->validate([
            'group'        => 'required|string|in:' . implode(',', array_keys(Banner::groupCatalogue())),
            'title'        => 'nullable|string|max:255',
            'subtitle'     => 'nullable|string|max:255',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'mobile_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            'link'         => 'nullable|url',
            'desktop_size' => 'nullable|string',
            'mobile_size'  => 'nullable|string',
            'order'        => 'nullable|integer',
            'status'       => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            if ($banner->image) {
                Storage::disk('public')->delete($banner->image);
            }
            $validated['image'] = $request->file('image')->store('banners', 'public');
        }

        if ($request->hasFile('mobile_image')) {
            if ($banner->mobile_image) {
                Storage::disk('public')->delete($banner->mobile_image);
            }
            $validated['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        }

        // Allow removing the mobile image
        if ($request->input('remove_mobile_image') === '1') {
            if ($banner->mobile_image) {
                Storage::disk('public')->delete($banner->mobile_image);
            }
            $validated['mobile_image'] = null;
        }

        $validated['status'] = $request->boolean('status', true);

        $banner->update($validated);

        return redirect()->route('admin.banners.index')->with('success', 'Banner updated successfully.');
    }

    // ─── Destroy ──────────────────────────────────────────────────────────────

    public function destroy(Banner $banner)
    {
        if ($banner->image) {
            Storage::disk('public')->delete($banner->image);
        }
        if ($banner->mobile_image) {
            Storage::disk('public')->delete($banner->mobile_image);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner deleted successfully.');
    }
}