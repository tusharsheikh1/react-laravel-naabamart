import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, router } from '@inertiajs/react';

const CategoryItem = ({ category, level = 0 }) => {
    
    // FIX: Safely parse database values. This handles integers (1/0), strings ("1"/"0"), and pure booleans
    const isFeatured = category.is_featured == 1 || category.is_featured === true;
    const isHome = category.show_products_on_home == 1 || category.show_products_on_home === true;
    
    const handleToggle = (field, value) => {
        router.put(route('admin.categories.update', category.id), {
            name: category.name,
            parent_id: category.parent_id || null,
            description: category.description || '',
            is_featured: field === 'is_featured' ? value : isFeatured,
            featured_order: category.featured_order || null, 
            show_products_on_home: field === 'show_products_on_home' ? value : isHome,
            home_order: category.home_order || null,
        }, { 
            preserveScroll: true,
            onError: (errors) => {
                // Helpful alert if Laravel rejects the update for any validation reason
                alert("Failed to update: " + Object.values(errors).join("\n"));
            }
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this category?')) {
            router.delete(route('admin.categories.destroy', category.id), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between py-3 hover:bg-gray-50 pr-4" style={{ paddingLeft: `${level * 2 + 1}rem` }}>
                <div className="flex items-center">
                    {level > 0 && <span className="mr-2 text-gray-400">↳</span>}
                    <span className="text-gray-800 font-medium">{category.name}</span>
                    
                    {isFeatured && (
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                            F: {category.featured_order ?? 'N/A'}
                        </span>
                    )}
                    {isHome && (
                        <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            H: {category.home_order ?? 'N/A'}
                        </span>
                    )}
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isFeatured} 
                                onChange={(e) => handleToggle('is_featured', e.target.checked)} 
                                className="rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500" 
                            />
                            <span className="text-xs text-gray-500">Featured</span>
                        </label>
                        <label className="flex items-center space-x-1 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={isHome} 
                                onChange={(e) => handleToggle('show_products_on_home', e.target.checked)} 
                                className="rounded border-gray-300 text-indigo-600 cursor-pointer focus:ring-indigo-500" 
                            />
                            <span className="text-xs text-gray-500">Home Section</span>
                        </label>
                    </div>
                    <div className="flex space-x-3 pl-4 border-l border-gray-200">
                        <Link href={route('admin.categories.edit', category.id)} className="text-indigo-600 text-sm hover:text-indigo-900 transition">
                            Edit
                        </Link>
                        <button onClick={handleDelete} className="text-red-600 text-sm hover:text-red-900 transition">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
            {/* Render nested children recursively */}
            {category.children_recursive && category.children_recursive.length > 0 && category.children_recursive.map((child) => (
                <CategoryItem key={child.id} category={child} level={level + 1} />
            ))}
        </div>
    );
};

export default function Index({ categories }) {
    return (
        <AdminLayout>
            <Head title="Categories" />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Categories</h2>
                <Link href={route('admin.categories.create')} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700 transition">
                    Add New Category
                </Link>
            </div>
            <div className="bg-white shadow sm:rounded-lg p-6">
                <div className="border border-gray-200 rounded-md">
                    <div className="hidden md:flex justify-between bg-gray-50 py-2 pr-4 border-b border-gray-200 pl-4">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category Name</span>
                        <div className="flex space-x-20 pr-16">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Display Settings</span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</span>
                        </div>
                    </div>
                    {categories.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No categories found.</p>
                    ) : (
                        categories.map((category) => <CategoryItem key={category.id} category={category} />)
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}