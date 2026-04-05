import React from 'react';
import Layout from '@/Layouts/Admin/Layout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Index({ shippingMethods, freeShippingProducts = [] }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this shipping method?')) {
            destroy(route('admin.shipping-methods.destroy', id));
        }
    };

    return (
        <Layout>
            <Head title="Shipping Management" />
            
            {/* Shipping Methods Section */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Shipping Methods</h1>
                <Link
                    href={route('admin.shipping-methods.create')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    Add Shipping Method
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden mb-12">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Charge</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Wt.</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">+Charge/Kg</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Free Over</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {shippingMethods.map((method) => (
                            <tr key={method.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{method.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">৳{method.base_charge}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{method.base_weight} kg</td>
                                <td className="px-6 py-4 whitespace-nowrap">৳{method.additional_charge_per_kg}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{method.free_delivery_threshold ? `৳${method.free_delivery_threshold}` : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${method.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {method.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={route('admin.shipping-methods.edit', method.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(method.id)} className="text-red-600 hover:text-red-900">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {shippingMethods.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                    No shipping methods found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Free Shipping Products Section */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Products with Free Shipping</h2>
                <Link
                    href={route('admin.products.index')}
                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                    Manage Products &rarr;
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {freeShippingProducts.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">৳{product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.stock_quantity > 0 ? `${product.stock_quantity} In Stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={route('admin.products.edit', product.id)} className="text-indigo-600 hover:text-indigo-900">
                                        Edit Product
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {freeShippingProducts.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p className="mt-2 text-sm text-gray-500">No products currently have free shipping enabled.</p>
                                    <p className="mt-1 text-sm text-gray-500">You can enable this by editing a product and checking the "Is Free Shipping" box.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}