<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    // Define the available system permissions for staff
    protected $availablePermissions = [
        'manage_orders', 
        'manage_analytics', 
        'manage_catalog', 
        'manage_attributes', 
        'manage_marketing', 
        'manage_settings'
    ];

    public function index()
    {
        $users = User::latest()->paginate(10);
        
        return Inertia::render('Admin/Users/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            'availablePermissions' => $this->availablePermissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => ['required', Rule::in(['admin', 'staff', 'user'])],
            'is_active' => 'boolean', // Validate active status
            'permissions' => 'nullable|array', // Validate permissions
            'permissions.*' => ['string', Rule::in($this->availablePermissions)],
        ]);

        $validated['password'] = Hash::make($validated['password']);
        
        // Ensure the boolean cast is handled properly from the frontend
        $validated['is_active'] = $request->boolean('is_active', true);

        // Ensure standard users don't get staff permissions accidentally
        if ($validated['role'] === 'user') {
            $validated['permissions'] = null;
        }

        User::create($validated);

        return redirect()->route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function edit(User $user)
    {
        return Inertia::render('Admin/Users/Edit', [
            'user' => $user,
            'availablePermissions' => $this->availablePermissions
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', Rule::in(['admin', 'staff', 'user'])],
            'is_active' => 'boolean', // Validate active status
            'permissions' => 'nullable|array', // Validate permissions
            'permissions.*' => ['string', Rule::in($this->availablePermissions)],
        ]);

        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8|confirmed']);
            $validated['password'] = Hash::make($request->password);
        }

        // Ensure the boolean cast is handled properly
        $validated['is_active'] = $request->boolean('is_active', true);

        // Ensure standard users don't get staff permissions accidentally
        if ($validated['role'] === 'user') {
            $validated['permissions'] = null;
        }

        // Prevent an admin from accidentally deactivating themselves
        if (auth()->id() === $user->id && !$validated['is_active']) {
            return redirect()->back()->with('error', 'You cannot deactivate your own account.');
        }

        $user->update($validated);

        return redirect()->route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return redirect()->route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}