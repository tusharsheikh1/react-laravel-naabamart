import AdminLayout from '@/Layouts/Admin/Layout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const BannerIcon = () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" />
    </svg>
);

export default function Index({ grouped, groupCatalogue, flash }) {
    const catalogueKeys = Object.keys(groupCatalogue);
    const [activeTab, setActiveTab] = useState(catalogueKeys[0]);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            router.delete(route('admin.banners.destroy', id));
        }
    };

    const currentBanners = grouped[activeTab] ?? [];

    return (
        <AdminLayout>
            <div className="p-6">

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Static Banners</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Manage static promotional banners by group</p>
                    </div>
                    <Link
                        href={route('admin.banners.create')}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                    >
                        + Add New
                    </Link>
                </div>

                {/* Info box */}
                <div className="mb-5 rounded-md bg-purple-50 p-4 border border-purple-200">
                    <div className="flex gap-3">
                        <svg className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-purple-700 space-y-1">
                            <p><strong>Banners</strong> are static images. Use <code className="bg-purple-100 px-1 rounded text-xs">&lt;StaticBanner group="banner_1" /&gt;</code> anywhere in your frontend.</p>
                            <p>Only the <strong>first active item</strong> with the lowest order number in a group is displayed on the frontend.</p>
                            <p>Each item supports a <strong>desktop image</strong> and an optional <strong>mobile image</strong> (shown on small screens).</p>
                            <p>Recommended — Banner: <strong>500×600px</strong> &nbsp;|&nbsp; Mobile: <strong>600×400px</strong></p>
                        </div>
                    </div>
                </div>

                {/* Group Tabs */}
                <div className="mb-6">
                    <div className="flex flex-wrap gap-1">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-center mr-2">Groups</span>
                        {catalogueKeys.map(key => (
                            <TabButton
                                key={key}
                                label={groupCatalogue[key]}
                                count={(grouped[key] ?? []).length}
                                active={activeTab === key}
                                onClick={() => setActiveTab(key)}
                                icon={<BannerIcon />}
                            />
                        ))}
                    </div>
                </div>

                {/* Active group hint */}
                <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-700">{groupCatalogue[activeTab]}</h3>
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Static Banner</span>
                    <span className="text-xs text-gray-400 font-mono ml-auto">group="{activeTab}"</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 bg-white">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Desktop Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mobile Image</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentBanners.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-sm">No items in <strong>{groupCatalogue[activeTab]}</strong> yet.</p>
                                            <Link
                                                href={route('admin.banners.create') + `?group=${activeTab}`}
                                                className="mt-1 text-xs text-indigo-600 hover:underline"
                                            >
                                                + Add first item
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                currentBanners.map((banner, idx) => (
                                    <tr key={banner.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 relative">
                                            {/* Highlight the first active item as the one currently showing */}
                                            {idx === 0 && banner.status && (
                                                <span className="absolute top-1 left-2 bg-green-500 text-white text-[9px] font-bold px-1.5 rounded uppercase shadow-sm">Showing</span>
                                            )}
                                            <img
                                                src={`/storage/${banner.image}`}
                                                alt={banner.title || 'Banner'}
                                                className="h-16 w-14 rounded-md object-cover border border-gray-200"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {banner.mobile_image ? (
                                                <img
                                                    src={`/storage/${banner.mobile_image}`}
                                                    alt="Mobile"
                                                    className="h-14 w-24 rounded-md object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Using desktop</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-700">{banner.title || '—'}</p>
                                            {banner.subtitle && <p className="text-xs text-gray-400">{banner.subtitle}</p>}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{banner.order ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                banner.status ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {banner.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route('admin.banners.edit', banner.id)}
                                                    className="rounded-md bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 transition"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(banner.id)}
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

function TabButton({ label, count, active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition border ${
                active
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
        >
            {icon}
            {label}
            {count > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${
                    active ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                    {count}
                </span>
            )}
        </button>
    );
}