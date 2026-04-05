import AdminLayout from '@/Layouts/Admin/Layout';
import { Link, router } from '@inertiajs/react';

export default function Index({ sliders, flash }) {
    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this slider?')) {
            router.delete(route('admin.sliders.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <div className="p-6">
                {flash?.success && (
                    <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Sliders</h2>
                    <Link
                        href={route('admin.sliders.create')}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                    >
                        + Add New Slider
                    </Link>
                </div>

                {/* Documentation & Guidelines Alert based on layout analysis */}
                <div className="mb-6 rounded-md bg-blue-50 p-4 border border-blue-200 shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            {/* Info Icon */}
                            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">Slider & Banner Guidelines</h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><strong>Banner Logic:</strong> The <strong>second slider (No. 2)</strong> in this list is automatically separated and used as the static side banner on the frontend.</li>
                                    <li><strong>Main Slider Recommended Size:</strong> 1200 x 480 pixels (Landscape, ~2.5:1 ratio).</li>
                                    <li><strong>Side Banner Recommended Size:</strong> 500 x 600 pixels (Portrait, ~5:6 ratio).</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subtitle</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sliders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400 text-sm">No sliders found.</td>
                                </tr>
                            ) : (
                                sliders.map((slider, index) => (
                                    <tr key={slider.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3">
                                            <div className="relative inline-block">
                                                <img
                                                    src={`/storage/${slider.image}`}
                                                    alt={slider.title || 'Slider'}
                                                    className="h-16 w-28 rounded-md object-cover border border-gray-200"
                                                />
                                                {/* Highlights the 2nd item visually for the admin */}
                                                {index === 1 && (
                                                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-white bg-blue-600 rounded-full">
                                                        Banner
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{slider.title || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-500">{slider.subtitle || '—'}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{slider.order ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                slider.status
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {slider.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.sliders.edit', slider.id)}
                                                    className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(slider.id)}
                                                    className="rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}