import React from 'react';
import Layout from '@/Layouts/Admin/Layout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        base_charge: 0,
        base_weight: 1,
        additional_charge_per_kg: 0,
        free_delivery_threshold: '',
        status: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.shipping-methods.store'));
    };

    return (
        <Layout>
            <Head title="Create Shipping Method" />
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Add Shipping Method</h2>
                    <Link href={route('admin.shipping-methods.index')} className="text-gray-600 hover:text-gray-900">Back</Link>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="name" value="Zone/Method Name (e.g. Inside Dhaka)" />
                        <TextInput id="name" type="text" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="base_charge" value="Base Charge (৳)" />
                            <TextInput id="base_charge" type="number" step="0.01" className="mt-1 block w-full" value={data.base_charge} onChange={(e) => setData('base_charge', e.target.value)} required />
                            <InputError message={errors.base_charge} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="base_weight" value="Base Weight (kg)" />
                            <TextInput id="base_weight" type="number" step="0.01" className="mt-1 block w-full" value={data.base_weight} onChange={(e) => setData('base_weight', e.target.value)} required />
                            <InputError message={errors.base_weight} className="mt-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel htmlFor="additional_charge_per_kg" value="Additional Charge Per Extra Kg (৳)" />
                            <TextInput id="additional_charge_per_kg" type="number" step="0.01" className="mt-1 block w-full" value={data.additional_charge_per_kg} onChange={(e) => setData('additional_charge_per_kg', e.target.value)} />
                            <InputError message={errors.additional_charge_per_kg} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="free_delivery_threshold" value="Free Delivery Over Amount (৳) - Optional" />
                            <TextInput id="free_delivery_threshold" type="number" step="0.01" className="mt-1 block w-full" value={data.free_delivery_threshold} onChange={(e) => setData('free_delivery_threshold', e.target.value)} />
                            <InputError message={errors.free_delivery_threshold} className="mt-2" />
                        </div>
                    </div>

                    <div className="block mt-4">
                        <label className="flex items-center">
                            <Checkbox name="status" checked={data.status} onChange={(e) => setData('status', e.target.checked)} />
                            <span className="ml-2 text-sm text-gray-600">Active</span>
                        </label>
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <PrimaryButton className="ml-4" disabled={processing}>Create</PrimaryButton>
                    </div>
                </form>
            </div>
        </Layout>
    );
}