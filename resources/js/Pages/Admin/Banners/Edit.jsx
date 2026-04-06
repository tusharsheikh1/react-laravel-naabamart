import AdminLayout from '@/Layouts/Admin/Layout';
import { useForm, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ banner, groupCatalogue }) {
    const { data, setData, post, processing, errors } = useForm({
        _method:              'put', // Required for file uploads on update in Laravel/Inertia
        group:                banner.group,
        title:                banner.title || '',
        subtitle:             banner.subtitle || '',
        image:                null, // Only send if updating
        mobile_image:         null, // Only send if updating
        remove_mobile_image:  false, // Flag to delete existing mobile image
        link:                 banner.link || '',
        desktop_size:         banner.desktop_size || 'medium',
        mobile_size:          banner.mobile_size || 'medium',
        order:                banner.order ?? '',
        status:               !!banner.status,
    });

    const [desktopPreview, setDesktopPreview] = useState(`/storage/${banner.image}`);
    const [mobilePreview, setMobilePreview]   = useState(banner.mobile_image ? `/storage/${banner.mobile_image}` : null);

    const handleFile = (field, file, setPreview) => {
        setData(field, file);
        if (field === 'mobile_image' && file) {
            setData('remove_mobile_image', false); // Clear removal flag if new file selected
        }
        if (file) setPreview(URL.createObjectURL(file));
    };

    const handleRemoveMobile = () => {
        setMobilePreview(null);
        setData(data => ({ ...data, mobile_image: null, remove_mobile_image: true }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Use post with _method: 'put' due to multipart/form-data requirements in Laravel
        post(route('admin.banners.update', banner.id), { forceFormData: true });
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Banner</h2>
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
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                        />
                        {errors.subtitle && <p className="mt-1 text-xs text-red-500">{errors.subtitle}</p>}
                    </div>

                    {/* Desktop Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Desktop Image
                            <span className="ml-2 text-xs text-gray-400 font-normal">Leave blank to keep current</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => handleFile('image', e.target.files[0], setDesktopPreview)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        {desktopPreview && (
                            <div className="mt-2 relative inline-block">
                                <img src={desktopPreview} alt="Preview" className="h-32 w-28 rounded-md object-cover border border-gray-200" />
                            </div>
                        )}
                        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                    </div>

                    {/* Mobile Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile Image
                            <span className="ml-2 text-xs text-gray-400 font-normal">Leave blank to keep current</span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => handleFile('mobile_image', e.target.files[0], setMobilePreview)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-purple-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-purple-600 hover:file:bg-purple-100"
                        />
                        {mobilePreview && (
                            <div className="mt-2 relative inline-block">
                                <img src={mobilePreview} alt="Mobile Preview" className="h-24 w-40 rounded-md object-cover border border-gray-200" />
                                <button
                                    type="button"
                                    onClick={handleRemoveMobile}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow"
                                    title="Remove mobile image"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {errors.mobile_image && <p className="mt-1 text-xs text-red-500">{errors.mobile_image}</p>}
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
                            {processing ? 'Saving...' : 'Update Banner'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}