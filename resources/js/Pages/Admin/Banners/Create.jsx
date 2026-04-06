import AdminLayout from '@/Layouts/Admin/Layout';
import { useForm, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ groupCatalogue }) {
    const { url } = usePage();
    const params = new URLSearchParams(url.split('?')[1] ?? '');
    const defaultGroup = params.get('group') && groupCatalogue[params.get('group')]
        ? params.get('group')
        : 'banner_1';

    const { data, setData, post, processing, errors } = useForm({
        group:        defaultGroup,
        title:        '',
        subtitle:     '',
        image:        null,
        mobile_image: null,
        link:         '',
        desktop_size: 'medium',
        mobile_size:  'medium',
        order:        '',
        status:       true,
    });

    const [desktopPreview, setDesktopPreview] = useState(null);
    const [mobilePreview, setMobilePreview]   = useState(null);

    const handleFile = (field, file, setPreview) => {
        setData(field, file);
        if (file) setPreview(URL.createObjectURL(file));
        else setPreview(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.banners.store'), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Add New Banner</h2>
                    <Link href={route('admin.banners.index')} className="text-sm text-gray-500 hover:text-gray-700 transition">
                        ← Back
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

                    {/* Group */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Group <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.group}
                            onChange={e => setData('group', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                        >
                            {Object.entries(groupCatalogue).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {errors.group && <p className="mt-1 text-xs text-red-500">{errors.group}</p>}
                        <p className="mt-1 text-xs text-gray-400">
                            Banners are static — only the first active item in a group is shown.
                        </p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Optional"
                        />
                        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                    </div>

                    {/* Subtitle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                        <input
                            type="text"
                            value={data.subtitle}
                            onChange={e => setData('subtitle', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Optional"
                        />
                        {errors.subtitle && <p className="mt-1 text-xs text-red-500">{errors.subtitle}</p>}
                    </div>

                    {/* Desktop Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desktop Image <span className="text-red-500">*</span>
                            <span className="ml-2 text-xs text-gray-400 font-normal">Recommended: 500×600px</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => handleFile('image', e.target.files[0], setDesktopPreview)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        {desktopPreview && (
                            <img src={desktopPreview} alt="Preview" className="mt-2 h-32 w-28 rounded-md object-cover border border-gray-200" />
                        )}
                        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                    </div>

                    {/* Mobile Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Image
                            <span className="ml-2 text-xs text-gray-400 font-normal">Optional — Recommended: 600×400px</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => handleFile('mobile_image', e.target.files[0], setMobilePreview)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-purple-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-purple-600 hover:file:bg-purple-100"
                        />
                        {mobilePreview && (
                            <img src={mobilePreview} alt="Mobile Preview" className="mt-2 h-24 w-40 rounded-md object-cover border border-gray-200" />
                        )}
                        {errors.mobile_image && <p className="mt-1 text-xs text-red-500">{errors.mobile_image}</p>}
                        <p className="mt-1 text-xs text-gray-400">If not provided, the desktop image will be used on mobile.</p>
                    </div>

                    {/* Size Selectors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Desktop Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desktop Size</label>
                            <select
                                value={data.desktop_size}
                                onChange={e => setData('desktop_size', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="small">Small (300px)</option>
                                <option value="medium">Medium (360px)</option>
                                <option value="large">Large (500px)</option>
                                <option value="full">Full Screen</option>
                                <option value="auto">Auto (Original Image Ratio)</option>
                            </select>
                            {errors.desktop_size && <p className="mt-1 text-xs text-red-500">{errors.desktop_size}</p>}
                        </div>

                        {/* Mobile Size */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Size</label>
                            <select
                                value={data.mobile_size}
                                onChange={e => setData('mobile_size', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                            >
                                <option value="small">Small (160px)</option>
                                <option value="medium">Medium (240px)</option>
                                <option value="large">Large (320px)</option>
                                <option value="full">Full Screen</option>
                                <option value="auto">Auto (Original Image Ratio)</option>
                            </select>
                            {errors.mobile_size && <p className="mt-1 text-xs text-red-500">{errors.mobile_size}</p>}
                        </div>
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
                        <input
                            type="url"
                            value={data.link}
                            onChange={e => setData('link', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="https://example.com (optional)"
                        />
                        {errors.link && <p className="mt-1 text-xs text-red-500">{errors.link}</p>}
                    </div>

                    {/* Order */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                        <input
                            type="number"
                            value={data.order}
                            onChange={e => setData('order', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. 1 (Lowest number shows first)"
                        />
                        {errors.order && <p className="mt-1 text-xs text-red-500">{errors.order}</p>}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <input
                            id="status"
                            type="checkbox"
                            checked={data.status}
                            onChange={e => setData('status', e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">Active</label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={route('admin.banners.index')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                            {processing ? 'Creating...' : 'Create Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}