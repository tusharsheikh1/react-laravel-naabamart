import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ author }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: author.name,
        description: author.description || '',
        image: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.authors.update', author.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Author" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-6">Edit Author</h2>

                        <form onSubmit={submit} encType="multipart/form-data">
                            {/* Name */}
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Author Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    isFocused
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <InputLabel htmlFor="description" value="Description (SEO)" />
                                <textarea
                                    id="description"
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="3"
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Image Upload */}
                            <div className="mb-4">
                                <InputLabel htmlFor="image" value="Author Photo" />
                                {author.image && (
                                    <div className="mb-2">
                                        <img src={`/storage/${author.image}`} alt="Current" className="h-20 w-20 object-cover rounded" />
                                    </div>
                                )}
                                <input
                                    id="image"
                                    type="file"
                                    className="mt-1 block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-indigo-50 file:text-indigo-700
                                        hover:file:bg-indigo-100"
                                    onChange={(e) => setData('image', e.target.files[0])}
                                />
                                <InputError message={errors.image} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <Link
                                    href={route('admin.authors.index')}
                                    className="underline text-sm text-gray-600 hover:text-gray-900 mr-4"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Author
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}