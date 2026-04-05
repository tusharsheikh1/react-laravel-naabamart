import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ color }) {
    const { data, setData, put, processing, errors } = useForm({
        name: color.name,
        code: color.code || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.colors.update', color.id));
    };

    return (
        <AdminLayout>
            <Head title="Edit Color" />

            <div className="max-w-2xl mx-auto">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <h2 className="text-xl font-semibold mb-6">Edit Color</h2>

                        <form onSubmit={submit}>
                            <div className="mb-4">
                                <InputLabel htmlFor="name" value="Color Name" />
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

                            <div className="mb-4">
                                <InputLabel htmlFor="code" value="Color Code (Hex)" />
                                <div className="flex gap-2 items-center">
                                    <TextInput
                                        id="code"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                    />
                                    <input 
                                        type="color" 
                                        value={data.code || '#ffffff'}
                                        onChange={(e) => setData('code', e.target.value)}
                                        className="h-10 w-10 p-1 rounded border border-gray-300 cursor-pointer mt-1"
                                    />
                                </div>
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end mt-4">
                                <Link
                                    href={route('admin.colors.index')}
                                    className="underline text-sm text-gray-600 hover:text-gray-900 mr-4"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Color
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}