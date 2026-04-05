import AdminLayout from '@/Layouts/Admin/Layout';
import { useForm, Link } from '@inertiajs/react';

export default function Edit({ slider }) {
    const { data, setData, post, processing, errors } = useForm({
        title: slider.title || '',
        subtitle: slider.subtitle || '',
        image: null,
        link: slider.link || '',
        order: slider.order || '',
        status: slider.status ?? true,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.sliders.update', slider.id), {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Slider</h2>
                    <Link
                        href={route('admin.sliders.index')}
                        className="text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                        ← Back to Sliders
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={e => setData('title', e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            placeholder="Slider title (optional)"
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
                            placeholder="Slider subtitle (optional)"
                        />
                        {errors.subtitle && <p className="mt-1 text-xs text-red-500">{errors.subtitle}</p>}
                    </div>

                    {/* Current Image Preview */}
                    {slider.image && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
                            <img
                                src={`/storage/${slider.image}`}
                                alt="Current slider"
                                className="h-24 w-40 rounded-md object-cover border border-gray-200"
                            />
                        </div>
                    )}

                    {/* New Image */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {slider.image ? 'Replace Image' : 'Image'}
                        </label>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/jpg,image/webp"
                            onChange={e => setData('image', e.target.files[0])}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-3 file:rounded file:border-0 file:bg-indigo-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
                        />
                        {errors.image && <p className="mt-1 text-xs text-red-500">{errors.image}</p>}
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
                        <Link
                            href={route('admin.sliders.index')}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition disabled:opacity-60"
                        >
                            {processing ? 'Saving...' : 'Update Slider'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}