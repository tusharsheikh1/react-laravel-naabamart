import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * Create.jsx — handles both "Create" and "Edit" modes.
 *
 * Props:
 *   products  — list of active products (always passed)
 *   page      — existing LandingPage object (only passed in Edit mode)
 */
export default function Create({ products, page }) {
    const isEditing = !!page;

    const { data, setData, post, put, processing, errors } = useForm({
        title:       page?.title       ?? '',
        slug:        page?.slug        ?? '',
        product_ids: page?.product_ids ?? (page?.product_id ? [page.product_id] : []),
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.landing-pages.update', page.id));
        } else {
            post(route('admin.landing-pages.store'));
        }
    };

    return (
        <AdminLayout>
            <Head title={isEditing ? `Edit — ${page.title}` : 'Create Landing Page'} />

            <div className="max-w-2xl mx-auto mt-10">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href={route('admin.landing-pages.index')} className="hover:text-indigo-600 transition">
                        Marketing Campaigns
                    </Link>
                    <span>/</span>
                    <span className="text-gray-800 font-medium">
                        {isEditing ? `Edit: ${page.title}` : 'New Page'}
                    </span>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        {isEditing ? 'Edit Campaign Page' : 'Setup New Campaign Page'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-8">
                        {isEditing
                            ? 'Update the page settings below. These changes will take effect immediately.'
                            : "Fill in the details below — you'll be taken straight to the visual builder after."}
                    </p>

                    <form onSubmit={submit} className="space-y-6">

                        {/* Title */}
                        <div>
                            <InputLabel htmlFor="title" value="Campaign Title (Internal)" />
                            <TextInput
                                id="title"
                                type="text"
                                value={data.title}
                                className="mt-1 block w-full"
                                onChange={e => setData('title', e.target.value)}
                                placeholder="e.g. Eid Special Offer 2026"
                                autoFocus
                            />
                            <p className="text-xs text-gray-400 mt-1">Only visible to you in the admin panel.</p>
                            <InputError message={errors.title} className="mt-2" />
                        </div>

                        {/* Slug */}
                        <div>
                            <InputLabel htmlFor="slug" value="URL Slug" />
                            <div className="flex items-center mt-1">
                                <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-md px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
                                    /lp/
                                </span>
                                <TextInput
                                    id="slug"
                                    type="text"
                                    value={data.slug}
                                    className="block w-full rounded-l-none"
                                    onChange={e => setData('slug', e.target.value)}
                                    placeholder="auto-generated-if-blank"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {isEditing
                                    ? '⚠️ Changing the slug will break any existing links to this page.'
                                    : 'Leave blank to auto-generate from the title.'}
                            </p>
                            <InputError message={errors.slug} className="mt-2" />
                        </div>

                        {/* Products - Multi Select */}
                        <div>
                            <InputLabel htmlFor="product_ids" value="Target Product(s)" />
                            <select
                                id="product_ids"
                                multiple
                                value={data.product_ids}
                                onChange={e => {
                                    const selectedOptions = Array.from(
                                        e.target.selectedOptions,
                                        option => parseInt(option.value)
                                    );
                                    setData('product_ids', selectedOptions);
                                }}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                style={{ minHeight: '120px' }}
                            >
                                {products.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} — ৳{product.price}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-400 mt-1">
                                Hold down the <strong>Ctrl</strong> (Windows) or <strong>Command</strong> (Mac) button to select multiple packages/products. 
                                The first product selected acts as the primary.
                            </p>
                            <InputError message={errors.product_ids} className="mt-2" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                                <Link
                                    href={route('admin.landing-pages.index')}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition"
                                >
                                    ← Cancel
                                </Link>
                                {isEditing && (
                                    <Link
                                        href={route('admin.landing-pages.builder', page.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                                    >
                                        Open Builder →
                                    </Link>
                                )}
                            </div>
                            <PrimaryButton disabled={processing}>
                                {processing
                                    ? (isEditing ? 'Saving…' : 'Creating…')
                                    : (isEditing ? 'Save Changes' : 'Create & Launch Builder →')}
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}