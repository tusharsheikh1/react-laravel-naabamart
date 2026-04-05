import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';

export default function Show({ transaction }) {
    return (
        <AdminLayout>
            <Head title={`Transaction #${transaction.id} History`} />
            
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Transaction #{transaction.id} Details & History</h1>
                    <Link href={route('admin.transactions.index')} className="text-indigo-600 hover:underline">Back to List</Link>
                </div>

                {transaction.deleted_at && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        <strong>Note:</strong> This transaction was deleted on {new Date(transaction.deleted_at).toLocaleDateString()}.
                    </div>
                )}

                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 mb-8">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Current/Latest Record</h3>
                    </div>
                    <div className="p-6 grid grid-cols-2 gap-4">
                        <div><span className="text-gray-500 text-sm">Type:</span> <br/><strong className="uppercase">{transaction.type}</strong></div>
                        <div><span className="text-gray-500 text-sm">Amount:</span> <br/><strong>${transaction.amount}</strong></div>
                        <div><span className="text-gray-500 text-sm">Date:</span> <br/><strong>{transaction.date}</strong></div>
                        <div><span className="text-gray-500 text-sm">Description:</span> <br/><strong>{transaction.description || 'N/A'}</strong></div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-4">Audit Trail (History)</h2>
                
                <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="px-6 py-3">Date/Time</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Changed By</th>
                                <th className="px-6 py-3">Changes (Old &rarr; New)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {transaction.histories.map((history) => (
                                <tr key={history.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {new Date(history.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${history.action === 'created' ? 'bg-green-100 text-green-800' : 
                                              history.action === 'updated' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                            {history.action.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                                        {history.user?.name || 'System'}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {history.action === 'updated' && history.old_values && history.new_values && (
                                            <ul className="list-disc pl-4">
                                                {Object.keys(history.old_values).map(key => {
                                                    // Only show fields that actually changed
                                                    if (key !== 'updated_at' && history.old_values[key] !== history.new_values[key]) {
                                                        return (
                                                            <li key={key}>
                                                                <strong>{key}:</strong> {history.old_values[key] || 'null'} &rarr; <span className="text-blue-600">{history.new_values[key] || 'null'}</span>
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}
                                            </ul>
                                        )}
                                        {history.action === 'created' && <span className="text-green-600">Initial record created.</span>}
                                        {history.action === 'deleted' && <span className="text-red-600">Record deleted.</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}