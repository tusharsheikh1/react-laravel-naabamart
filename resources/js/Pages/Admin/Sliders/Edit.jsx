import AdminLayout from '@/Layouts/Admin/Layout';
import { useForm, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Edit({ slider, groupCatalogue }) {
    const { data, setData, post, processing, errors } = useForm({
        group:               slider.group || 'slider_1',
        title:               slider.title || '',
        subtitle:            slider.subtitle || '',
        image:               null,
        mobile_image:        null,
        remove_mobile_image: '0',
        link:                slider.link || '',
        desktop_size:        slider.desktop_size || 'medium',
        mobile_size:         slider.mobile_size || 'medium',
        order:               slider.order || '',
        status:              slider.status ?? true,
        _method:             'PUT',
    });

    const [desktopPreview, setDesktopPreview] = useState(null);
    const [mobilePreview, setMobilePreview]   = useState(null);

    const handleFile = (field, file, setPreview) => {
        setData(field, file);
        if (file) setPreview(URL.createObjectURL(file));
        else setPreview(null);
    };

    const handleRemoveMobile = (checked) => {
        setData('remove_mobile_image', checked ? '1' : '0');
        if (checked) {
            setData('mobile_image', null);
            setMobilePreview(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.sliders.update', slider.id), { forceFormData: true });
    };

    const isBanner = data.group.startsWith('banner_');

    return (
        <AdminLayout>
            <div className="p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit {isBanner ? 'Banner' : 'Slider'}</h2>
                    <Link href={route('admin.sliders.index')} className="text-sm text-gray-500 hover:text-gray-700 transition">
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
                            <optgroup label="── Sliders (Carousels)">
                                {Object.entries(groupCatalogue)
                                    .filter(([k]) => !k.startsWith('banner_'))
                                    .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </optgroup>
                            <optgroup label="── Banners (Static)">
                                {Object.entries(groupCatalogue)
                                    .filter(([k]) => k.startsWith('banner_'))
                                    .map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </optgroup>
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

                    {/* Current Desktop Image */}
                    {slider.image && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Desktop Image</label>
                            <img
                                src={desktopPreview ?? `/storage/${slider.image}`}
                                alt="Desktop"
                                className="h-20 w-36 rounded-md object-cover border border-gray-200"
                            />
                        </div>
                    )}

                    {/* Replace Desktop Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {slider.image ? 'Replace Desktop Image' : 'Desktop Image *'}
                            <span className="ml-2 text-xs text-gray-400 font-normal">
                                {isBanner ? 'Recommended: 500×600px' : 'Recommended: 1200×480px'}
                            </span>
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => handleFile('image', e.target.files[0], setDesktopPreview)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
                    </div>

                    {/* Current Mobile Image */}
                    {slider.mobile_image && data.remove_mobile_image !== '1' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Mobile Image</label>
                            <img
                                src={mobilePreview ?? `/storage/${slider.mobile_image}`}
                                alt="Mobile"
                                className="h-20 w-36 rounded-md object-cover border border-gray-200"
                            />
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remove_mobile_image === '1'}
                                    onChange={e => handleRemoveMobile(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
                                />
                                <span className="text-xs text-red-500">Remove mobile image (will use desktop instead)</span>
                            </label>
                        </div>
                    )}

                    {/* Replace / Add Mobile Image */}
                    {data.remove_mobile_image !== '1' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {slider.mobile_image ? 'Replace Mobile Image' : 'Mobile Image'}
                                <span className="ml-2 text-xs text-gray-400 font-normal">Optional — Recommended: 600×400px</span>
                            </label>
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                onChange={e => handleFile('mobile_image', e.target.files[0], setMobilePreview)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-purple-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-purple-600 hover:file:bg-purple-100"
                            />
                            {mobilePreview && (
                                <img src={mobilePreview} alt="Preview" className="mt-2 h-20 w-36 rounded-md object-cover border border-gray-200" />
                            )}
                            {errors.mobile_image && <p className="mt-1 text-xs text-red-500">{errors.mobile_image}</p>}
                            {!slider.mobile_image && (
                                <p className="mt-1 text-xs text-gray-400">If not provided, the desktop image is used on mobile.</p>
                            )}
                        </div>
                    )}

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
                            placeholder="e.g. 1"
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
                        <Link href={route('admin.sliders.index')} className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                            {processing ? 'Saving...' : `Update ${isBanner ? 'Banner' : 'Slider'}`}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}