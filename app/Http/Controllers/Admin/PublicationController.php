<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Publication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PublicationController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Publications/Index', [
            'publications' => Publication::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Publications/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only('name', 'description');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('publications', 'public');
        }

        Publication::create($data);

        return redirect()->route('admin.publications.index');
    }

    public function edit(Publication $publication)
    {
        return Inertia::render('Admin/Publications/Edit', [
            'publication' => $publication
        ]);
    }

    public function update(Request $request, Publication $publication)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only('name', 'description');

        if ($request->hasFile('image')) {
            if ($publication->image) {
                Storage::disk('public')->delete($publication->image);
            }
            $data['image'] = $request->file('image')->store('publications', 'public');
        }

        $publication->update($data);

        return redirect()->route('admin.publications.index');
    }

    public function destroy(Publication $publication)
    {
        if ($publication->image) {
            Storage::disk('public')->delete($publication->image);
        }
        $publication->delete();
        return redirect()->route('admin.publications.index');
    }
}