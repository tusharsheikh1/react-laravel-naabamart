import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';

export default function Index({ transactions, filters }) {
    // Selection state for Bulk Actions
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Filters state
    const [params, setParams] = useState({
        search: filters?.search || '',
        type: filters?.type || 'all',
        date_from: filters?.date_from || '',
        date_to: filters?.date_to || '',
    });

    // Handle single delete
    const deleteTransaction = (id) => {
        if (confirm('Are you sure you want to delete this transaction? It will be soft-deleted but kept in history.')) {
            router.delete(route('admin.transactions.destroy', id));
        }
    };

    // Apply filters
    const applyFilters = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.transactions.index'), params, { preserveState: true, preserveScroll: true });
    };

    // Handle export
    const handleExport = () => {
        const queryParams = new URLSearchParams(params).toString();
        window.location.href = `${route('admin.transactions.export')}?${queryParams}`;
    };

    // Handle bulk selection
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(transactions.data.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return alert('Please select at least one transaction.');
        if (confirm(`Are you sure you want to delete ${selectedIds.length} transactions?`)) {
            router.post(route('admin.transactions.bulk-delete'), { ids: selectedIds }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    // Helper to format date cleanly
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <AdminLayout>
            <Head title="Accounting / Transactions" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Accounting / Transactions</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="inline-flex justify-center items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        Export to Excel
                    </button>
                    <Link
                        href={route('admin.transactions.create')}
                        className="inline-flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-semibold transition-colors shadow-sm"
                    >
                        + Record Transaction
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                <form onSubmit={applyFilters} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500 mb-1">Search (ID, Desc)</label>
                        <input
                            type="text"
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Search description..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Type</label>
                        <select
                            value={params.type}
                            onChange={(e) => setParams({ ...params, type: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date From</label>
                        <input
                            type="date"
                            value={params.date_from}
                            onChange={(e) => setParams({ ...params, date_from: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Date To</label>
                        <input
                            type="date"
                            value={params.date_to}
                            onChange={(e) => setParams({ ...params, date_to: e.target.value })}
                            className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 text-sm font-medium shadow-sm">
                            Filter
                        </button>
                        {(params.search || params.type !== 'all' || params.date_from || params.date_to) && (
                            <button 
                                type="button" 
                                onClick={() => {
                                    setParams({ search: '', type: 'all', date_from: '', date_to: '' });
                                    setTimeout(() => router.get(route('admin.transactions.index')), 100);
                                }}
                                className="ml-3 text-red-600 hover:underline text-sm font-medium"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-lg mb-4 flex justify-between items-center">
                    <span className="text-indigo-800 font-medium text-sm">{selectedIds.length} items selected</span>
                    <button 
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-red-700 font-medium shadow-sm"
                    >
                        Delete Selected
                    </button>
                </div>
            )}

            {/* Transactions Table */}
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-6 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                                        onChange={handleSelectAll}
                                        checked={transactions.data.length > 0 && selectedIds.length === transactions.data.length}
                                    />
                                </th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Creator</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transactions.data.map((transaction) => (
                                <tr key={transaction.id} className={`hover:bg-gray-50 transition-colors ${transaction.deleted_at ? 'bg-red-50 opacity-75' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 cursor-pointer"
                                            checked={selectedIds.includes(transaction.id)}
                                            onChange={() => handleSelect(transaction.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">#{transaction.id}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{formatDate(transaction.date)}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-wider font-bold rounded-full border ${transaction.type === 'income' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                            {transaction.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-sm font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{transaction.creator?.name || 'System'}</td>
                                    <td className="px-6 py-4 text-sm text-right space-x-3 font-medium">
                                        <Link href={route('admin.transactions.show', transaction.id)} className="text-indigo-600 hover:text-indigo-900">History</Link>
                                        {!transaction.deleted_at && (
                                            <>
                                                <Link href={route('admin.transactions.edit', transaction.id)} className="text-blue-600 hover:text-blue-900">Edit</Link>
                                                <button onClick={() => deleteTransaction(transaction.id)} className="text-red-600 hover:text-red-900">Delete</button>
                                            </>
                                        )}
                                        {transaction.deleted_at && (
                                            <span className="text-xs text-red-500 font-bold uppercase tracking-wider bg-white px-2 py-1 rounded border border-red-200">Deleted</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {transactions.links && transactions.links.length > 3 && (
                <div className="mt-4 flex justify-center pb-8">
                    <div className="flex space-x-1 bg-white p-1 rounded-md shadow-sm border border-gray-200">
                        {transactions.links.map((link, i) => {
                            let label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                            return (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${link.active ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}