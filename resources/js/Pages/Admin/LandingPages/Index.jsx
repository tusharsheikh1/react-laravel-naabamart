import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Layout from '@/Layouts/Admin/Layout';

export default function Index({ auth, pages }) {
    const [copiedId, setCopiedId] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this landing page? This action cannot be undone.')) {
            router.delete(route('admin.landing-pages.destroy', id));
        }
    };

    const handleTogglePublish = (page) => {
        router.patch(
            route('admin.landing-pages.toggle-publish', page.id),
            {},
            { preserveScroll: true }
        );
    };

    const handleDuplicate = (page) => {
        if (confirm(`Duplicate "${page.title}"? A copy will be created as a Draft.`)) {
            router.post(
                route('admin.landing-pages.duplicate', page.id),
                {},
                { preserveScroll: true }
            );
        }
    };

    const handleCopyLink = (page) => {
        const url = `${window.location.origin}/lp/${page.slug}`;
        navigator.clipboard.writeText(url).then(() => {
            setCopiedId(page.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    return (
        <Layout user={auth?.user}>
            <Head title="Marketing Campaigns" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
                            <p className="text-sm text-gray-500 mt-1">Build and manage high-converting standalone landing pages.</p>
                        </div>
                        <Link
                            href={route('admin.landing-pages.create')}
                            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-sm font-medium text-sm flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            Create New Page
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="p-4 font-semibold">Page Details</th>
                                        <th className="p-4 font-semibold">Target Products / Packages</th>
                                        <th className="p-4 text-center font-semibold">Status</th>
                                        <th className="p-4 text-center font-semibold">Views</th>
                                        <th className="p-4 text-center font-semibold">Sales</th>
                                        <th className="p-4 text-center font-semibold">Conv. Rate</th>
                                        <th className="p-4 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {!pages?.data || pages.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-gray-500">
                                                No landing pages created yet. Click "Create New Page" to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        pages.data.map(page => (
                                            <tr key={page.id} className="hover:bg-gray-50 transition">
                                                <td className="p-4">
                                                    <div className="font-semibold text-gray-900 text-sm">{page.title}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <a
                                                            href={route('landing_page.show', page.slug)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                                        >
                                                            /lp/{page.slug}
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                        </a>
                                                        <button
                                                            onClick={() => handleCopyLink(page)}
                                                            title="Copy link to clipboard"
                                                            className={`text-[10px] px-1.5 py-0.5 rounded border transition font-medium ${
                                                                copiedId === page.id
                                                                    ? 'bg-green-50 border-green-200 text-green-700'
                                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                                                            }`}
                                                        >
                                                            {copiedId === page.id ? '✓ Copied!' : '📋 Copy'}
                                                        </button>
                                                    </div>
                                                </td>

                                                {/* Multi-Product Display */}
                                                <td className="p-4 text-sm text-gray-600 max-w-[250px] whitespace-normal">
                                                    {page.products && page.products.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {page.products.map(p => (
                                                                <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                    {p.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : page.product ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                            {page.product.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 italic text-xs">Unlinked</span>
                                                    )}
                                                </td>

                                                <td className="p-4 text-center">
                                                    <button
                                                        onClick={() => handleTogglePublish(page)}
                                                        title={page.is_published ? 'Click to unpublish' : 'Click to publish'}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all shadow-sm border ${
                                                            page.is_published
                                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${page.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                        {page.is_published ? 'Live' : 'Draft'}
                                                    </button>
                                                </td>

                                                <td className="p-4 text-center text-sm font-medium text-gray-700">
                                                    {page.views?.toLocaleString() || 0}
                                                </td>
                                                <td className="p-4 text-center text-sm font-bold text-green-600">
                                                    {page.conversions?.toLocaleString() || 0}
                                                </td>

                                                <td className="p-4 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                                                        page.views > 0 && (page.conversions / page.views) >= 0.02
                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                            : page.views > 0 && (page.conversions / page.views) > 0
                                                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                                                : 'bg-gray-50 text-gray-500 border-gray-200'
                                                    }`}>
                                                        {page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : '0.0'}%
                                                    </span>
                                                </td>

                                                <td className="p-4">
                                                    <div className="flex justify-end gap-2 flex-wrap">
                                                        <Link
                                                            href={route('admin.landing-pages.builder', page.id)}
                                                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition"
                                                        >
                                                            🎨 Builder
                                                        </Link>
                                                        <Link
                                                            href={route('admin.landing-pages.edit', page.id)}
                                                            className="px-3 py-1.5 bg-white text-gray-700 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-50 transition shadow-sm"
                                                        >
                                                            ✏️ Settings
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDuplicate(page)}
                                                            title="Duplicate this page"
                                                            className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded border border-amber-200 hover:bg-amber-100 transition shadow-sm"
                                                        >
                                                            📋 Duplicate
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(page.id)}
                                                            className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-200 hover:bg-red-100 transition shadow-sm"
                                                        >
                                                            🗑️ Delete
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
                </div>
            </div>
        </Layout>
    );
}