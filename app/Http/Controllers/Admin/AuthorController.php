<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AuthorController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Authors/Index', [
            'authors' => Author::latest()->get()
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Authors/Create');
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
            $data['image'] = $request->file('image')->store('authors', 'public');
        }

        Author::create($data);

        return redirect()->route('admin.authors.index');
    }

    public function edit(Author $author)
    {
        return Inertia::render('Admin/Authors/Edit', [
            'author' => $author
        ]);
    }

    public function update(Request $request, Author $author)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only('name', 'description');

        if ($request->hasFile('image')) {
            if ($author->image) {
                Storage::disk('public')->delete($author->image);
            }
            $data['image'] = $request->file('image')->store('authors', 'public');
        }

        $author->update($data);

        return redirect()->route('admin.authors.index');
    }

    public function destroy(Author $author)
    {
        if ($author->image) {
            Storage::disk('public')->delete($author->image);
        }
        $author->delete();
        return redirect()->route('admin.authors.index');
    }
}