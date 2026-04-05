<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::withTrashed()->with('creator');

        // 1. Filtration System
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('id', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => $request->only(['search', 'type', 'date_from', 'date_to']),
        ]);
    }

    // 2. Export to Excel (CSV)
    public function export(Request $request)
    {
        $query = Transaction::withTrashed()->with('creator');

        // Apply the same filters for the export
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('description', 'like', '%' . $request->search . '%')
                  ->orWhere('id', 'like', '%' . $request->search . '%');
            });
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('date', 'desc')->get();

        return response()->streamDownload(function () use ($transactions) {
            $handle = fopen('php://output', 'w');
            
            // Add CSV headers
            fputcsv($handle, ['ID', 'Date', 'Type', 'Amount', 'Description', 'Created By', 'Status']);

            foreach ($transactions as $t) {
                // Safely handle the date formatting so it doesn't crash if it's a string
                $dateStr = $t->date instanceof \Carbon\Carbon 
                    ? $t->date->format('Y-m-d') 
                    : (string) $t->date;

                fputcsv($handle, [
                    $t->id,
                    $dateStr,
                    ucfirst($t->type),
                    $t->amount,
                    $t->description,
                    $t->creator ? $t->creator->name : 'System',
                    $t->deleted_at ? 'Deleted' : 'Active'
                ]);
            }

            fclose($handle);
        }, 'transactions_export_' . date('Y-m-d') . '.csv');
    }

    // 3. Bulk Action (Delete)
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:transactions,id',
        ]);

        Transaction::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', 'Selected transactions deleted successfully.');
    }

    public function create()
    {
        return Inertia::render('Admin/Transactions/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        Transaction::create($validated);

        return redirect()->route('admin.transactions.index')->with('success', 'Transaction recorded successfully.');
    }

    public function show($id)
    {
        $transaction = Transaction::withTrashed()
            ->with(['creator', 'histories.user'])
            ->findOrFail($id);

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    public function edit(Transaction $transaction)
    {
        return Inertia::render('Admin/Transactions/Edit', [
            'transaction' => $transaction,
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $transaction->update($validated);

        return redirect()->route('admin.transactions.index')->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return redirect()->back()->with('success', 'Transaction deleted successfully.');
    }
}