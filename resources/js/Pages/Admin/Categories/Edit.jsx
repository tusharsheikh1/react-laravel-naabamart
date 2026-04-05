import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function Edit({ category, parents, usedFeaturedOrders = [], usedHomeOrders = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: category.name,
        parent_id: category.parent_id || '',
        description: category.description || '',
        image: null,
        is_featured: category.is_featured || false,
        featured_order: category.featured_order || 0,
        show_products_on_home: category.show_products_on_home || false,
        home_order: category.home_order || 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.categories.update', category.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Category" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-6">Edit Category</h2>

                        <form onSubmit={submit} encType="multipart/form-data">
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Category Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="description" value="SEO Description" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="parent_id" value="Parent Category" />
                                <select
                                    id="parent_id"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.parent_id}
                                    onChange={(e) => setData('parent_id', e.target.value)}
                                >
                                    <option value="">None (Root Category)</option>
                                    {parents.map((parent) => (
                                        <option key={parent.id} value={parent.id}>
                                            {parent.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.parent_id} className="mt-2" />
                            </div>

                            <div className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                                <h3 className="text-md font-medium text-gray-900 mb-4">Display Settings</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <Checkbox
                                            name="is_featured"
                                            checked={data.is_featured}
                                            onChange={(e) => setData('is_featured', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Feature this category below the slider</span>
                                    </div>

                                    {data.is_featured && (
                                        <div className="ml-6">
                                            <InputLabel htmlFor="featured_order" value="Featured Display Order" />
                                            <TextInput
                                                id="featured_order"
                                                type="number"
                                                className="mt-1 block w-full md:w-1/3"
                                                value={data.featured_order}
                                                onChange={(e) => setData('featured_order', e.target.value)}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                Used by other categories: <span className="font-semibold">{usedFeaturedOrders.sort((a,b)=>a-b).join(', ') || 'None'}</span>
                                            </div>
                                            <InputError message={errors.featured_order} className="mt-2" />
                                        </div>
                                    )}

                                    <div className="flex items-center pt-2 border-t border-gray-200">
                                        <Checkbox
                                            name="show_products_on_home"
                                            checked={data.show_products_on_home}
                                            onChange={(e) => setData('show_products_on_home', e.target.checked)}
                                        />
                                        <span className="ml-2 text-sm text-gray-600">Display products on home page section</span>
                                    </div>

                                    {data.show_products_on_home && (
                                        <div className="ml-6">
                                            <InputLabel htmlFor="home_order" value="Home Section Display Order" />
                                            <TextInput
                                                id="home_order"
                                                type="number"
                                                className="mt-1 block w-full md:w-1/3"
                                                value={data.home_order}
                                                onChange={(e) => setData('home_order', e.target.value)}
                                            />
                                            <div className="text-xs text-gray-500 mt-1">
                                                Used by other categories: <span className="font-semibold">{usedHomeOrders.sort((a,b)=>a-b).join(', ') || 'None'}</span>
                                            </div>
                                            <InputError message={errors.home_order} className="mt-2" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="image" value="Category Image" />
                                {category.image && (
                                    <img src={`/storage/${category.image}`} alt="" className="h-20 w-20 mb-2 object-cover rounded" />
                                )}
                                <input
                                    id="image"
                                    type="file"
                                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                />
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <Link
                                    href={route('admin.categories.index')}
                                    className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md mr-4"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>Update Category</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}