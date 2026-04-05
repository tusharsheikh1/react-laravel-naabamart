<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Blacklist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlacklistController extends Controller
{
    /**
     * Display a listing of the blocked identifiers.
     */
    public function index(Request $request)
    {
        $query = Blacklist::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('value', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%");
        }

        $blacklists = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Blacklists/Index', [
            'blacklists' => $blacklists,
            'filters'    => $request->only(['search']),
        ]);
    }

    /**
     * Remove the specified block from storage (Unblock).
     */
    public function destroy(Blacklist $blacklist)
    {
        $blacklist->delete();
        return redirect()->back()->with('success', 'Identifier successfully unblocked.');
    }
}