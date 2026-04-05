import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, router } from '@inertiajs/react';

export default function Index({ blacklists, filters }) {
    
    const handleUnblock = (id) => {
        if (confirm('Are you sure you want to unblock this identifier? They will be able to place orders again.')) {
            router.delete(route('admin.blacklists.destroy', id));
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            router.get(route('admin.blacklists.index'), { search: e.target.value }, { preserveState: true });
        }
    };

    return (
        <AdminLayout>
            <Head title="Blocked Users" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Security & Blocked Users</h1>
                
                <div className="w-full max-w-sm">
                    <input 
                        type="text" 
                        placeholder="Search IP, Device, or Reason... (Press Enter)" 
                        defaultValue={filters.search}
                        onKeyDown={handleSearch}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Identifier Value</th>
                                <th className="px-6 py-4">Reason</th>
                                <th className="px-6 py-4">Date Blocked</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {blacklists.data.length > 0 ? (
                                blacklists.data.map((block) => (
                                    <tr key={block.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                block.type === 'ip' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {block.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-900">{block.value}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{block.reason || 'Manual Block'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(block.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => handleUnblock(block.id)}
                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-sm transition-colors"
                                            >
                                                Unblock
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No blocked users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                {blacklists.links && blacklists.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="flex gap-1">
                            {blacklists.links.map((link, k) => (
                                <button
                                    key={k}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-3 py-1 rounded-md text-sm ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white font-bold' 
                                            : 'text-gray-700 hover:bg-gray-100 disabled:opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}