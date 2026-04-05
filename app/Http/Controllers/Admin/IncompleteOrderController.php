<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IncompleteOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IncompleteOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = IncompleteOrder::query();

        // Filtering Logic
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Default to pending so successful orders don't clutter the main "To-Do" list
        $currentStatus = $request->input('status', 'pending');
        if ($currentStatus !== 'all') {
            $query->where('status', $currentStatus);
        }

        // --- Stats Calculation ---
        $statsQuery = IncompleteOrder::query();
        if ($request->filled('start_date')) {
            $statsQuery->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $statsQuery->whereDate('created_at', '<=', $request->end_date);
        }

        $totalCaptured  = (clone $statsQuery)->count();
        $convertedCount = (clone $statsQuery)->where('status', 'converted')->count();
        $lostCount      = (clone $statsQuery)->where('status', 'lost')->count();
        $pendingCount   = (clone $statsQuery)->where('status', 'pending')->count();
        
        $conversionRatio = $totalCaptured > 0 
            ? round(($convertedCount / $totalCaptured) * 100, 2) 
            : 0;

        $incompleteOrders = $query->orderBy('updated_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/IncompleteOrders/Index', [
            'incompleteOrders' => $incompleteOrders,
            'filters'          => $request->only(['start_date', 'end_date', 'status']),
            'stats'            => [
                'totalCaptured'   => $totalCaptured,
                'convertedCount'  => $convertedCount,
                'lostCount'       => $lostCount,
                'pendingCount'    => $pendingCount,
                'conversionRatio' => $conversionRatio,
            ]
        ]);
    }

    /**
     * Allow manual conversion of a lead from the Admin panel.
     * FIX: This method now has a proper route registered in web.php.
     */
    public function markAsConverted($id)
    {
        $lead = IncompleteOrder::findOrFail($id);
        $lead->update([
            'status'       => 'converted',
            'is_converted' => true,
        ]);

        return redirect()->back()->with('success', 'Lead successfully marked as converted.');
    }

    public function markAsLost($id)
    {
        $lead = IncompleteOrder::findOrFail($id);
        $lead->update(['status' => 'lost']);

        return redirect()->back()->with('success', 'Lead marked as Lost.');
    }

    /**
     * Permanently delete a lead record.
     */
    public function destroy($id)
    {
        $lead = IncompleteOrder::findOrFail($id);
        $lead->delete();

        return redirect()->back()->with('success', 'Lead permanently deleted.');
    }
}