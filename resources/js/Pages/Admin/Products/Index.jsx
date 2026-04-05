import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    ExclamationTriangleIcon,
    ArchiveBoxIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArrowsUpDownIcon,
    TruckIcon,
    TagIcon,
    LinkIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

export default function Index({ products, filters, stats, queryParams = null }) {
    const { delete: destroy } = useForm();
    const [search, setSearch] = useState(filters.search || '');
    
    // Default query params if none exist
    queryParams = queryParams || {};

    // Handle Search with debounce-like behavior
    useEffect(() => {
        const timer = setTimeout(() => {
            router.get(
                route('admin.products.index'), 
                { ...queryParams, search, page: 1 }, // Reset to page 1 on new search
                { preserveState: true, replace: true }
            );
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const sortChanged = (name) => {
        if (name === queryParams.sort_field) {
            queryParams.sort_direction = queryParams.sort_direction === 'asc' ? 'desc' : 'asc';
        } else {
            queryParams.sort_field = name;
            queryParams.sort_direction = 'asc';
        }
        router.get(route('admin.products.index'), { ...queryParams, search });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            destroy(route('admin.products.destroy', id));
        }
    };

    const copyToClipboard = (slug) => {
        const url = `${window.location.origin}/product/${slug}`;
        navigator.clipboard.writeText(url);
        alert('Product link copied to clipboard!');
    };

    // Helper to render Sort Icons
    const SortIcon = ({ field }) => {
        if (field !== queryParams.sort_field) return (
            <ArrowsUpDownIcon className="w-3 h-3 ml-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
        );
        return queryParams.sort_direction === 'asc' ? (
            <svg className="w-3 h-3 ml-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 15l5-5 5 5H5z" /></svg>
        ) : (
            <svg className="w-3 h-3 ml-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M15 5l-5 5-5-5h10z" /></svg>
        );
    };

    const getStockBadge = (product) => {
        if (product.has_variants) return <span className="text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Variants</span>;
        
        const qty = product.stock_quantity;
        if (qty <= 0) return <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Out of Stock</span>;
        if (qty < 10) return <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">Low Stock: {qty}</span>;
        return <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] uppercase font-bold tracking-wider whitespace-nowrap">{qty} In Stock</span>;
    };

    const getTypeBadge = (type) => {
        const types = {
            general: { classes: 'bg-blue-50 text-blue-700 border-blue-200', label: 'GENERAL' },
            book: { classes: 'bg-purple-50 text-purple-700 border-purple-200', label: 'BOOK' },
            digital: { classes: 'bg-teal-50 text-teal-700 border-teal-200', label: 'DIGITAL' }
        };
        const config = types[type] || types.general;
        return <span className={`px-2 py-0.5 inline-flex text-[10px] leading-tight font-bold rounded border ${config.classes}`}>{config.label}</span>;
    };

    // Calculate Final Price with Discount
    const calculatePrice = (product) => {
        const price = parseFloat(product.price) || 0;
        const discount = parseFloat(product.discount_value) || 0;
        let finalPrice = price;

        if (product.discount_type === 'percent' && discount > 0) {
            finalPrice = price - (price * (discount / 100));
            return { finalPrice: finalPrice.toFixed(2), hasDiscount: true, badge: `${discount}% OFF` };
        } else if (product.discount_type === 'fixed' && discount > 0) {
            finalPrice = price - discount;
            return { finalPrice: finalPrice.toFixed(2), hasDiscount: true, badge: `เงณ${discount} OFF` };
        }
        return { finalPrice: price.toFixed(2), hasDiscount: false, badge: null };
    };

    return (
        <AdminLayout>
            <Head title="Products Management" />

            <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Products Catalog</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage your entire inventory, variants, categories, and active discounts.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a 
                            href={route('admin.products.export', { search: search })} 
                            className="hidden md:inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                        >
                            Export CSV
                        </a>
                        <Link 
                            href={route('admin.products.create')} 
                            className="inline-flex w-full justify-center md:w-auto items-center px-4 py-2.5 bg-indigo-600 border border-transparent rounded-lg font-semibold text-white hover:bg-indigo-700 transition duration-150 shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Product
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 transition-all hover:shadow-md hover:border-indigo-200">
                        <div className="p-5 flex items-center">
                            <div className="bg-indigo-50 p-3 rounded-xl"><ArchiveBoxIcon className="h-6 w-6 text-indigo-600" /></div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500 truncate">Total Active Products</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 transition-all hover:shadow-md hover:border-amber-200">
                        <div className="p-5 flex items-center">
                            <div className="bg-amber-50 p-3 rounded-xl"><ExclamationTriangleIcon className="h-6 w-6 text-amber-600" /></div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500 truncate">Low Stock Alert</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.low_stock}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 transition-all hover:shadow-md hover:border-red-200">
                        <div className="p-5 flex items-center">
                            <div className="bg-red-50 p-3 rounded-xl"><TrashIcon className="h-6 w-6 text-red-600" /></div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-gray-500 truncate">Out of Stock</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.out_of_stock}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Table Filters & Toolbar */}
                <div className="bg-white rounded-t-xl border border-gray-200 p-4 border-b-0 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Search Bar */}
                    <div className="relative w-full sm:max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white sm:text-sm transition-all"
                            placeholder="Search by product name, SKU, or keyword..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filter Dropdowns (UI Only Representation) */}
                    <div className="w-full sm:w-auto flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                        <button className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
                            <FunnelIcon className="w-4 h-4 mr-2 text-gray-400" />
                            All Types
                        </button>
                        <button className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
                            Status: Any
                        </button>
                        <button className="inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm whitespace-nowrap">
                            Stock: Any
                        </button>
                    </div>
                </div>

                {/* --- MOBILE CARD VIEW (Visible only on mobile) --- */}
                <div className="md:hidden flex flex-col gap-4 mt-4">
                    {products.data && products.data.length > 0 ? products.data.map((product) => {
                        const pricing = calculatePrice(product);
                        return (
                        <div key={product.id} className="bg-white shadow-sm border border-gray-200 rounded-xl p-4 flex flex-col gap-4">
                            
                            {/* Top: Image & Basic Info */}
                            <div className="flex gap-4 items-start">
                                <div className="h-20 w-20 flex-shrink-0 relative">
                                    {product.thumbnail ? (
                                        <img className="h-20 w-20 rounded-lg object-cover border border-gray-200" src={`/storage/${product.thumbnail}`} alt="" />
                                    ) : (
                                        <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs text-center border border-gray-200">NO<br/>IMG</div>
                                    )}
                                    {/* Status Dot */}
                                    <div className={`absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${product.status ? 'bg-green-500' : 'bg-gray-400'}`} title={product.status ? 'Active' : 'Draft'}></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        {getTypeBadge(product.type)}
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{product.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">SKU: {product.sku || 'N/A'}</p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-bold text-indigo-600">เงณ{pricing.finalPrice}</span>
                                        {pricing.hasDiscount && <span className="text-xs text-gray-400 line-through">เงณ{parseFloat(product.price).toFixed(2)}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Category, Brand & Status */}
                            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                                <div>
                                    <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Category</span>
                                    <span className="text-xs text-gray-700">{product.categories?.[0]?.name || 'Uncategorized'}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-gray-400 font-semibold mb-0.5">Brand</span>
                                    <span className="text-xs text-gray-700">{product.brand?.name || 'N/A'}</span>
                                </div>
                                <div className="col-span-2 flex justify-between items-center mt-2">
                                    {getStockBadge(product)}
                                </div>
                            </div>

                            {/* Bottom: Actions */}
                            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                <Link href={`/product/${product.slug}`} className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors" title="View Frontend">
                                    <EyeIcon className="w-5 h-5" />
                                </Link>
                                <Link href={route('admin.products.edit', product.id)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Product">
                                    <PencilSquareIcon className="w-5 h-5" />
                                </Link>
                                <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Delete Product">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>

                        </div>
                    )}) : (
                        <div className="bg-white p-8 text-center rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex flex-col items-center">
                                <ArchiveBoxIcon className="h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-base font-medium text-gray-900">No products found</p>
                                <p className="text-sm text-gray-500">Try adjusting your search filters.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- DESKTOP TABLE VIEW --- */}
                <div className="hidden md:block bg-white overflow-x-auto shadow-sm border border-gray-200 rounded-b-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th onClick={() => sortChanged('name')} className="group px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">Product Info <SortIcon field="name" /></div>
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Organization
                                </th>
                                <th onClick={() => sortChanged('price')} className="group px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">Pricing & Offers <SortIcon field="price" /></div>
                                </th>
                                <th onClick={() => sortChanged('stock_quantity')} className="group px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center">Stock & Status <SortIcon field="stock_quantity" /></div>
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {products.data && products.data.length > 0 ? products.data.map((product) => {
                                const pricing = calculatePrice(product);

                                return (
                                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors duration-150">
                                    
                                    {/* Product Info Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-16 w-16 flex-shrink-0 relative">
                                                {product.thumbnail ? (
                                                    <img className="h-16 w-16 rounded-xl object-cover border border-gray-200 shadow-sm" src={`/storage/${product.thumbnail}`} alt="" />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 font-bold text-[10px] text-center">NO<br/>IMG</div>
                                                )}
                                                {/* Status dot */}
                                                <div className={`absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${product.status ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-400'}`} title={product.status ? 'Active' : 'Draft'}></div>
                                            </div>
                                            <div className="ml-4 max-w-xs">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    {getTypeBadge(product.type)}
                                                    {product.is_free_shipping && (
                                                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Free Shipping Available">
                                                            <TruckIcon className="w-3 h-3 mr-1" /> Free Ship
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm font-bold text-gray-900 leading-tight truncate" title={product.name}>{product.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                    SKU: <span className="font-mono text-gray-700 ml-1 bg-gray-100 px-1 rounded">{product.sku || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Organization Column (Category + Brand) */}
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="text-sm text-gray-800 flex items-start">
                                                <span className="text-xs text-gray-400 w-10 shrink-0">Cat:</span> 
                                                <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-xs truncate max-w-[150px]" title={product.categories?.[0]?.name || 'Uncategorized'}>
                                                    {product.categories?.[0]?.name || 'Uncategorized'}
                                                </span>
                                            </div>
                                            {product.type === 'general' && (
                                                <div className="text-sm text-gray-800 flex items-start">
                                                    <span className="text-xs text-gray-400 w-10 shrink-0">Brand:</span> 
                                                    <span className="font-medium text-xs truncate max-w-[150px] text-gray-600">{product.brand?.name || '-'}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>

                                    {/* Pricing Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[15px] font-bold text-indigo-700">เงณ{pricing.finalPrice}</span>
                                                {pricing.hasDiscount && (
                                                    <span className="text-xs font-semibold text-gray-400 line-through">เงณ{parseFloat(product.price).toFixed(2)}</span>
                                                )}
                                            </div>
                                            
                                            {/* Sub-pricing info */}
                                            <div className="flex items-center gap-2 mt-1.5">
                                                {pricing.hasDiscount && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded border border-rose-200">
                                                        <TagIcon className="w-3 h-3 mr-1" /> {pricing.badge}
                                                    </span>
                                                )}
                                                {product.cost_price && (
                                                    <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded" title="Cost Price">
                                                        Cost: เงณ{parseFloat(product.cost_price).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Stock & Status Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col items-start gap-2.5">
                                            {getStockBadge(product)}
                                            {product.status ? (
                                                <span className="inline-flex items-center text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-xs text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                                                    <XCircleIcon className="w-3.5 h-3.5 mr-1" /> Draft
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-1">
                                            <button 
                                                onClick={() => copyToClipboard(product.slug)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 bg-transparent hover:bg-indigo-50 rounded-lg transition-all"
                                                title="Copy Link"
                                            >
                                                <LinkIcon className="w-5 h-5" />
                                            </button>
                                            <Link 
                                                href={`/product/${product.slug}`} 
                                                className="p-2 text-gray-400 hover:text-emerald-600 bg-transparent hover:bg-emerald-50 rounded-lg transition-all"
                                                title="View Frontend"
                                            >
                                                <EyeIcon className="w-5 h-5" />
                                            </Link>
                                            <Link 
                                                href={route('admin.products.edit', product.id)} 
                                                className="p-2 text-gray-400 hover:text-blue-600 bg-transparent hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit Product"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </Link>
                                            <button 
                                                onClick={() => handleDelete(product.id)} 
                                                className="p-2 text-gray-400 hover:text-red-600 bg-transparent hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete Product"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-4">
                                                <ArchiveBoxIcon className="h-10 w-10 text-gray-300" />
                                            </div>
                                            <p className="text-lg font-semibold text-gray-900">No products found</p>
                                            <p className="text-sm text-gray-500 mt-1 max-w-sm">We couldn't find any products matching your criteria. Try adjusting your search or add a new product to get started.</p>
                                            <Link 
                                                href={route('admin.products.create')} 
                                                className="mt-6 inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <PlusIcon className="w-4 h-4 mr-2" />
                                                Add Product
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Component */}
                    {products.links && products.data.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-4 bg-gray-50 border-t border-gray-200 sm:px-6">
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-semibold">{products.from}</span> to <span className="font-semibold">{products.to}</span> of{' '}
                                        <span className="font-semibold">{products.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        {products.links.map((link, index) => {
                                            const isPreviousOrNext = link.label.includes('Previous') || link.label.includes('Next');
                                            
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    preserveState
                                                    preserveScroll
                                                    onClick={(e) => !link.url && e.preventDefault()}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    className={`
                                                        relative inline-flex items-center px-4 py-2 text-sm font-semibold border
                                                        ${index === 0 ? 'rounded-l-md' : ''}
                                                        ${index === products.links.length - 1 ? 'rounded-r-md' : ''}
                                                        ${link.active 
                                                            ? 'z-10 bg-indigo-600 text-white border-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                                                            : link.url 
                                                                ? 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 bg-white'
                                                                : 'text-gray-300 ring-1 ring-inset ring-gray-300 cursor-not-allowed bg-gray-50'}
                                                        ${isPreviousOrNext && !link.url ? 'hidden sm:inline-flex' : ''}
                                                    `}
                                                />
                                            );
                                        })}
                                    </nav>
                                </div>
                            </div>
                            
                            {/* Mobile Pagination View */}
                            <div className="flex flex-1 justify-between sm:hidden">
                                <Link
                                    href={products.prev_page_url || '#'}
                                    preserveState
                                    preserveScroll
                                    onClick={(e) => !products.prev_page_url && e.preventDefault()}
                                    className={`relative inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${products.prev_page_url ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Previous
                                </Link>
                                <Link
                                    href={products.next_page_url || '#'}
                                    preserveState
                                    preserveScroll
                                    onClick={(e) => !products.next_page_url && e.preventDefault()}
                                    className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium ${products.next_page_url ? 'bg-white text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                >
                                    Next
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}