import React from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ProfitLoss({ filters, summary, chartData, recentTransactions }) {
    
    const handleFilterChange = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        router.get(route('admin.accounting.profit-loss'), Object.fromEntries(formData.entries()), { preserveState: true });
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);
    };

    return (
        <AdminLayout>
            <Head title="Profit & Loss Statement" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Profit & Loss Statement</h1>
                
                {/* Date Filter */}
                <form onSubmit={handleFilterChange} className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <input 
                        type="date" name="start_date" defaultValue={filters.start_date}
                        className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-gray-400">to</span>
                    <input 
                        type="date" name="end_date" defaultValue={filters.end_date}
                        className="text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700">
                        Apply
                    </button>
                </form>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Income</span>
                    <span className="text-3xl font-black text-green-600">{formatCurrency(summary.total_income)}</span>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
                    <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Expenses</span>
                    <span className="text-3xl font-black text-red-600">{formatCurrency(summary.total_expense)}</span>
                </div>
                <div className={`p-6 rounded-xl shadow-sm border flex flex-col justify-center ${summary.net_profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-semibold uppercase tracking-wider mb-1 ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            Net Profit
                        </span>
                        <span className={`px-2 py-1 text-xs font-bold rounded-md ${summary.net_profit >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                            {summary.profit_margin}% Margin
                        </span>
                    </div>
                    <span className={`text-3xl font-black ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {formatCurrency(summary.net_profit)}
                    </span>
                </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cash Flow Overview</h3>
                <div className="h-72">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value, name) => [formatCurrency(value), name === 'daily_income' ? 'Income' : 'Expense']}
                                />
                                <Legend verticalAlign="top" height={36} iconType="circle" />
                                <Area type="monotone" dataKey="daily_income" name="Income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                <Area type="monotone" dataKey="daily_expense" name="Expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No transaction data for this period.</div>
                    )}
                </div>
            </div>

            {/* Recent Transactions in Period */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Recent Transactions in Period</h3>
                </div>
                <table className="w-full text-left whitespace-nowrap">
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {recentTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-gray-500 font-medium">{tx.date}</td>
                                <td className="px-6 py-4 font-semibold text-gray-800">{tx.description || 'No description'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${tx.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </td>
                            </tr>
                        ))}
                        {recentTransactions.length === 0 && (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No records found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

        </AdminLayout>
    );
}