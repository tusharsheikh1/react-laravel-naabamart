import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';

export default function Create({ availablePermissions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        is_active: true, // Added for active status
        permissions: [], // Added for staff permissions
    });

    const handlePermissionChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setData('permissions', [...data.permissions, value]);
        } else {
            setData('permissions', data.permissions.filter((p) => p !== value));
        }
    };

    const formatPermissionName = (name) => {
        return name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create User" />
            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Create New User</h2>
                        
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                />
                                {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                />
                                {errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <select 
                                        value={data.role} 
                                        onChange={e => setData('role', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {errors.role && <div className="text-red-600 text-sm mt-1">{errors.role}</div>}
                                </div>

                                {/* Active Status Toggle */}
                                <div className="flex items-center pt-6">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                                        Account is Active
                                    </label>
                                </div>
                                {errors.is_active && <div className="text-red-600 text-sm mt-1">{errors.is_active}</div>}
                            </div>

                            {/* Conditional Permissions Block for Staff */}
                            {data.role === 'staff' && (
                                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Staff Permissions</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availablePermissions.map((permission) => (
                                            <label key={permission} className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    value={permission}
                                                    checked={data.permissions.includes(permission)}
                                                    onChange={handlePermissionChange}
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                />
                                                <span className="text-sm text-gray-600 select-none">
                                                    {formatPermissionName(permission)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    {errors.permissions && <div className="text-red-600 text-sm mt-2">{errors.permissions}</div>}
                                </div>
                            )}

                            <div className="border-t pt-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Password</label>
                                    <input 
                                        type="password" 
                                        value={data.password} 
                                        onChange={e => setData('password', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    />
                                    {errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        value={data.password_confirmation} 
                                        onChange={e => setData('password_confirmation', e.target.value)} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" 
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 mt-6">
                                <Link href={route('admin.users.index')} className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-100">Cancel</Link>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                    Save User
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}