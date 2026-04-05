import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';
import { useMemo, useState, useRef, useEffect } from 'react';
import axios from 'axios';

// --- Reusable Searchable Dropdown Component ---
const SearchableDropdown = ({ items, onSelect, onAdd, placeholder, type, selectedId = null, onClear = null }) => {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sort items by ID descending (Latest Added First)
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => b.id - a.id);
    }, [items]);

    const filtered = sortedItems.filter(i => i.name?.toLowerCase().includes(query.toLowerCase()));

    const handleSelect = (id) => {
        onSelect(id);
        setQuery('');
        setIsOpen(false);
    };

    const handleAddNew = () => {
        setIsOpen(false);
        const newName = window.prompt(`Enter new ${type} name:`);
        if (newName && newName.trim()) {
            onAdd(type, newName.trim());
        }
        setQuery('');
    };

    // If an item is selected (for single-select fields like Brand, Color, Size)
    if (selectedId !== null && selectedId !== '' && onClear !== null) {
        const selectedItem = items.find(i => i.id == selectedId);
        return (
            <div className="flex items-center justify-between w-full mt-1 border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-50 text-sm">
                <span className="text-gray-800 font-medium">{selectedItem?.name || 'Selected'}</span>
                <button type="button" onClick={onClear} className="text-red-500 font-bold hover:text-red-700 ml-2">×</button>
            </div>
        );
    }

    // Default Dropdown View
    return (
        <div className="relative" ref={wrapperRef}>
            <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
            />
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-xl max-h-60 overflow-y-auto flex flex-col">
                    <div className="flex-1 overflow-y-auto">
                        {filtered.length > 0 ? (
                            filtered.map(item => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => handleSelect(item.id)}
                                    className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm text-gray-700 border-b border-gray-50 last:border-none"
                                >
                                    {item.name}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center italic">No matches found.</div>
                        )}
                    </div>
                    
                    {/* Add New Option at the bottom (Sticky) */}
                    <button
                        type="button"
                        onClick={handleAddNew}
                        className="w-full text-left px-4 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm sticky bottom-0 border-t border-indigo-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
                    >
                        + Add New {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                </div>
            )}
        </div>
    );
};


export default function Edit({ product, categories, brands, authors, publications, colors, sizes }) {
    
    const getInitialIds = (items) => items ? items.map(item => item.id) : [];

    // State to manage visually removing images before saving
    const [visibleImages, setVisibleImages] = useState(product.images || []);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: product.name || '',
        type: product.type || 'general',
        sku: product.sku || '',
        price: product.price || '',
        cost_price: product.cost_price || '', 
        weight: product.weight || '0.001',
        is_free_shipping: Boolean(product.is_free_shipping),
        discount_type: product.discount_type || '',
        discount_value: product.discount_value || '',
        status: product.status !== undefined ? Boolean(product.status) : true,
        
        category_ids: getInitialIds(product.categories), 
        brand_id: product.brand_id || '',
        author_ids: getInitialIds(product.authors),
        publication_ids: getInitialIds(product.publications),
        
        pages: product.pages || '',
        edition: product.edition || '',
        language: product.language || '',
        country: product.country || '',
        
        digital_file: null, 
        download_link: product.download_link || '',
        license_key: product.license_key || '',
        
        meta_title: product.meta_title || '',
        meta_description: product.meta_description || '',
        short_description: product.short_description || '',
        description: product.description || '',
        
        thumbnail: null,
        gallery: [],
        deleted_image_ids: [], 
        
        stock_quantity: product.stock_quantity || 0,
        has_variants: Boolean(product.has_variants),
        variants: product.variants ? product.variants.map(v => ({
            id: v.id, 
            color_id: v.color_id || '',
            size_id: v.size_id || '',
            stock_quantity: v.stock_quantity,
            price_adjustment: v.price_adjustment
        })) : []
    });

    // --- Sidebar Quick Add State ---
    const [quickAddType, setQuickAddType] = useState('category');
    const [quickAddName, setQuickAddName] = useState('');
    const [isQuickAdding, setIsQuickAdding] = useState(false);

    const flatCategories = useMemo(() => {
        const result = [];
        categories.forEach(root => {
            result.push({ id: root.id, name: root.name });
            if (root.children) {
                root.children.forEach(sub => {
                    result.push({ id: sub.id, name: `${root.name} > ${sub.name}` });
                    if (sub.children) {
                        sub.children.forEach(extra => {
                            result.push({ id: extra.id, name: `${root.name} > ${sub.name} > ${extra.name}` });
                        });
                    }
                });
            }
        });
        return result;
    }, [categories]);

    const finalPrice = useMemo(() => {
        const price = parseFloat(data.price) || 0;
        const discount = parseFloat(data.discount_value) || 0;
        if (data.discount_type === 'percent') {
            return (price - (price * (discount / 100))).toFixed(2);
        } else if (data.discount_type === 'fixed') {
            return (price - discount).toFixed(2);
        }
        return price.toFixed(2);
    }, [data.price, data.discount_type, data.discount_value]);


    // --- Background Entity Addition Logic (No Redirects) ---
    const handleBackgroundAdd = async (type, name) => {
        const routeMap = {
            category: 'admin.categories.store',
            brand: 'admin.brands.store',
            author: 'admin.authors.store',
            publication: 'admin.publications.store',
            color: 'admin.colors.store',
            size: 'admin.sizes.store',
        };

        const propMap = {
            category: 'categories',
            brand: 'brands',
            author: 'authors',
            publication: 'publications',
            color: 'colors',
            size: 'sizes',
        };

        try {
            await axios.post(route(routeMap[type]), { name });
            // Instruct Inertia to silently fetch the updated list from the server keeping state safe
            router.reload({ only: [propMap[type]], preserveState: true, preserveScroll: true });
            alert(`${name} added successfully! You can now select it.`);
        } catch (error) {
            console.error(error);
            alert(`Failed to add. Ensure the name is unique and valid.`);
        }
    };

    // --- Sidebar Quick Add Handler ---
    const handleSidebarAdd = async () => {
        if (!quickAddName.trim()) return;
        setIsQuickAdding(true);
        await handleBackgroundAdd(quickAddType, quickAddName.trim());
        setQuickAddName('');
        setIsQuickAdding(false);
    };

    const handleAddId = (field, id) => {
        const numericId = parseInt(id);
        if (numericId && !data[field].includes(numericId)) {
            setData(field, [...data[field], numericId]);
        }
    };

    const handleRemoveId = (field, idToRemove) => {
        setData(field, data[field].filter(id => id !== idToRemove));
    };

    const getCategoryName = (id) => flatCategories.find(c => c.id == id)?.name;
    const getAuthorName = (id) => authors.find(a => a.id == id)?.name;
    const getPubName = (id) => publications.find(p => p.id == id)?.name;

    // --- Variant Logic ---
    const addVariant = () => {
        setData('variants', [...data.variants, { id: null, color_id: '', size_id: '', stock_quantity: 0, price_adjustment: 0 }]);
    };
    const removeVariant = (index) => {
        const newVariants = [...data.variants];
        newVariants.splice(index, 1);
        setData('variants', newVariants);
    };
    const updateVariant = (index, field, value) => {
        const newVariants = [...data.variants];
        newVariants[index][field] = value;
        setData('variants', newVariants);
    };

    // Handle existing image removal
    const handleRemoveExistingImage = (imageId) => {
        setData('deleted_image_ids', [...data.deleted_image_ids, imageId]);
        setVisibleImages(visibleImages.filter(img => img.id !== imageId));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.update', product.id), {
            forceFormData: true,
        });
    };

    // --- Reusable Tag Component ---
    const SelectedTag = ({ name, onRemove, colorClass = "bg-indigo-100 text-indigo-800" }) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
            {name}
            <button 
                type="button" 
                onClick={onRemove}
                className={`ml-2 flex-shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full focus:outline-none opacity-60 hover:opacity-100`}
            >
                <span className="sr-only">Remove</span>
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </span>
    );

    return (
        <AdminLayout>
            <Head title="Edit Product" />
            <form onSubmit={submit} encType="multipart/form-data" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 1. Basic Info */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Product Details</h3>
                            <div className="flex items-center gap-2">
                                <Link href={route('admin.products.index')} className="text-sm text-gray-500 hover:text-gray-700">Back to List</Link>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Product Name" />
                                <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full mt-1" required />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <InputLabel value="Product Type" />
                                    <select value={data.type} onChange={e => setData('type', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm bg-gray-50">
                                        <option value="general">General Product</option>
                                        <option value="book">Book</option>
                                        <option value="digital">Digital Product</option>
                                    </select>
                                    <p className="text-xs text-orange-500 mt-1">Warning: Changing type may lose existing specific data.</p>
                                </div>
                                <div>
                                    <InputLabel value="SKU" />
                                    <TextInput value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full mt-1" />
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Short Description" />
                                <textarea value={data.short_description} onChange={e => setData('short_description', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" rows="3" />
                            </div>
                            <div>
                                <InputLabel value="Full Description" />
                                <textarea value={data.description} onChange={e => setData('description', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm" rows="6" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Type Specific Data */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {data.type === 'general' ? 'General Specification' : data.type === 'book' ? 'Book Details' : 'Digital Assets'}
                            </h3>
                        </div>

                        {data.type === 'general' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Brand" />
                                    <SearchableDropdown 
                                        items={brands} 
                                        type="brand" 
                                        onSelect={id => setData('brand_id', id)} 
                                        onAdd={handleBackgroundAdd} 
                                        placeholder="Search brand..." 
                                        selectedId={data.brand_id} 
                                        onClear={() => setData('brand_id', '')} 
                                    />
                                </div>
                                <div className="flex items-center pt-6">
                                    <Checkbox checked={data.has_variants} onChange={e => setData('has_variants', e.target.checked)} />
                                    <span className="ml-2 font-medium text-gray-700">Has Variations (Color/Size)</span>
                                </div>
                            </div>
                        )}

                        {data.type === 'book' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel value="Authors" />
                                        <SearchableDropdown 
                                            items={authors.filter(a => !data.author_ids.includes(a.id))} 
                                            type="author" 
                                            onSelect={id => handleAddId('author_ids', id)} 
                                            onAdd={handleBackgroundAdd} 
                                            placeholder="Search author..." 
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                                            {data.author_ids.map(id => (
                                                <SelectedTag key={id} name={getAuthorName(id)} onRemove={() => handleRemoveId('author_ids', id)} />
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabel value="Publications" />
                                        <SearchableDropdown 
                                            items={publications.filter(p => !data.publication_ids.includes(p.id))} 
                                            type="publication" 
                                            onSelect={id => handleAddId('publication_ids', id)} 
                                            onAdd={handleBackgroundAdd} 
                                            placeholder="Search publication..." 
                                        />
                                        <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                                            {data.publication_ids.map(id => (
                                                <SelectedTag key={id} name={getPubName(id)} onRemove={() => handleRemoveId('publication_ids', id)} colorClass="bg-green-100 text-green-800" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <TextInput placeholder="Pages" value={data.pages} onChange={e => setData('pages', e.target.value)} className="w-full" />
                                    <TextInput placeholder="Edition" value={data.edition} onChange={e => setData('edition', e.target.value)} className="w-full" />
                                    <TextInput placeholder="Language" value={data.language} onChange={e => setData('language', e.target.value)} className="w-full" />
                                    <TextInput placeholder="Country" value={data.country} onChange={e => setData('country', e.target.value)} className="w-full" />
                                </div>
                            </div>
                        )}

                        {data.type === 'digital' && (
                            <div className="space-y-4">
                                <div className="p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                                    <InputLabel value="Update Digital File" />
                                    {product.digital_file && <p className="text-xs text-green-600 mb-2">Current file exists. Upload new to replace.</p>}
                                    <input type="file" onChange={e => setData('digital_file', e.target.files[0])} className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                </div>
                                <TextInput placeholder="External Download Link" value={data.download_link} onChange={e => setData('download_link', e.target.value)} className="w-full" />
                                <textarea placeholder="License Key or Instructions" value={data.license_key} onChange={e => setData('license_key', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm" rows="3" />
                            </div>
                        )}
                    </div>

                    {/* 3. Modern Inventory Management */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Inventory Management</h3>
                        
                        {data.type === 'general' && data.has_variants ? (
                            <div className="space-y-4">
                                <div className="overflow-x-auto overflow-y-visible">
                                    <table className="min-w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 w-1/4">Color</th>
                                                <th className="px-3 py-2 w-1/4">Size</th>
                                                <th className="px-3 py-2">Stock</th>
                                                <th className="px-3 py-2">Price (+/-)</th>
                                                <th className="px-3 py-2">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.variants.map((variant, index) => (
                                                <tr key={index} className="border-b">
                                                    <td className="px-2 py-2">
                                                        <SearchableDropdown 
                                                            items={colors} 
                                                            type="color" 
                                                            onSelect={id => updateVariant(index, 'color_id', id)} 
                                                            onAdd={handleBackgroundAdd} 
                                                            placeholder="Search color..." 
                                                            selectedId={variant.color_id} 
                                                            onClear={() => updateVariant(index, 'color_id', '')} 
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2">
                                                        <SearchableDropdown 
                                                            items={sizes} 
                                                            type="size" 
                                                            onSelect={id => updateVariant(index, 'size_id', id)} 
                                                            onAdd={handleBackgroundAdd} 
                                                            placeholder="Search size..." 
                                                            selectedId={variant.size_id} 
                                                            onClear={() => updateVariant(index, 'size_id', '')} 
                                                        />
                                                    </td>
                                                    <td className="px-2 py-2 align-top">
                                                        <TextInput type="number" value={variant.stock_quantity} onChange={e => updateVariant(index, 'stock_quantity', e.target.value)} className="w-full text-sm mt-1" />
                                                    </td>
                                                    <td className="px-2 py-2 align-top">
                                                        <TextInput type="number" value={variant.price_adjustment} onChange={e => updateVariant(index, 'price_adjustment', e.target.value)} className="w-full text-sm mt-1" />
                                                    </td>
                                                    <td className="px-2 py-2 align-top text-center">
                                                        <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 mt-3">
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <button type="button" onClick={addVariant} className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Add New Variant
                                </button>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-md">
                                <InputLabel value="Total Stock Quantity" />
                                <TextInput type="number" value={data.stock_quantity} onChange={e => setData('stock_quantity', e.target.value)} className="w-full mt-1 border-blue-200 focus:ring-blue-500" />
                            </div>
                        )}
                    </div>

                    {/* 4. Media */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Media</h3>
                        
                        <div className="mb-6">
                            <InputLabel value="Main Thumbnail" />
                            <div className="flex items-center gap-4 mt-2">
                                {product.thumbnail && (
                                    <div className="relative">
                                        <img src={`/storage/${product.thumbnail}`} alt="Current Thumbnail" className="h-20 w-20 object-cover rounded border" />
                                        <span className="absolute top-0 right-0 bg-white text-xs border rounded px-1">Current</span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input type="file" onChange={e => setData('thumbnail', e.target.files[0])} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                                    <InputError message={errors.thumbnail} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Gallery Images" />
                            
                            {/* Visual existing image display with remove button */}
                            {visibleImages && visibleImages.length > 0 && (
                                 <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 rounded border border-gray-200">
                                    {visibleImages.map(img => (
                                        <div key={img.id} className="relative group">
                                            <img src={`/storage/${img.image_path}`} className="h-20 w-20 object-cover rounded border bg-white" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExistingImage(img.id)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600 focus:outline-none"
                                                title="Remove Image"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            </button>
                                        </div>
                                    ))}
                                 </div>
                            )}

                            <InputLabel value="Add New Gallery Images" className="mt-2 text-sm text-gray-500"/>
                            <input type="file" multiple onChange={e => setData('gallery', Array.from(e.target.files))} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" accept="image/*" />
                            <InputError message={errors.gallery} className="mt-1" />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (1/3 width) */}
                <div className="space-y-6">
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Categories</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Assign Categories" />
                                <SearchableDropdown 
                                    items={flatCategories.filter(c => !data.category_ids.includes(c.id))} 
                                    type="category" 
                                    onSelect={id => handleAddId('category_ids', id)} 
                                    onAdd={handleBackgroundAdd} 
                                    placeholder="Search category..." 
                                />
                                
                                <div className="flex flex-wrap gap-2 mt-3 min-h-[30px]">
                                    {data.category_ids.map(id => (
                                        <SelectedTag key={id} name={getCategoryName(id)} onRemove={() => handleRemoveId('category_ids', id)} colorClass="bg-blue-100 text-blue-800" />
                                    ))}
                                </div>
                                <InputError message={errors.category_ids} />
                            </div>
                        </div>
                    </div>

                    {/* NEW: Quick Add Attribute Sidebar Block */}
                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Quick Add Attribute</h3>
                        <p className="text-xs text-gray-500 mb-4">Add new attributes globally without leaving the page.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <InputLabel value="Attribute Type" />
                                <select 
                                    value={quickAddType} 
                                    onChange={e => setQuickAddType(e.target.value)} 
                                    className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="category">Category</option>
                                    <option value="brand">Brand</option>
                                    <option value="author">Writer / Author</option>
                                    <option value="publication">Publisher</option>
                                    <option value="color">Color</option>
                                    <option value="size">Size</option>
                                </select>
                            </div>
                            <div>
                                <InputLabel value="Name" />
                                <TextInput 
                                    type="text" 
                                    value={quickAddName} 
                                    onChange={e => setQuickAddName(e.target.value)} 
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSidebarAdd();
                                        }
                                    }}
                                    className="w-full mt-1" 
                                    placeholder="Enter new attribute name..." 
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={handleSidebarAdd} 
                                disabled={isQuickAdding || !quickAddName.trim()} 
                                className="w-full justify-center inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                {isQuickAdding ? 'Adding...' : 'Add Now'}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Pricing & Shipping</h3>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-3 rounded text-center mb-2">
                                <span className="text-sm text-gray-500">Final Price</span>
                                <div className="text-2xl font-bold text-indigo-600">{finalPrice} Tk</div>
                            </div>
                            
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <InputLabel value="Cost Price (Tk)" />
                                    <TextInput type="number" value={data.cost_price} onChange={e => setData('cost_price', e.target.value)} className="w-full mt-1" />
                                    <InputError message={errors.cost_price} className="mt-1" />
                                </div>
                                <div className="flex-1">
                                    <InputLabel value="Reg. Price (Tk)" />
                                    <TextInput type="number" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full mt-1" />
                                    <InputError message={errors.price} className="mt-1" />
                                </div>
                                <div className="flex-1">
                                    <InputLabel value="Weight (gm)" />
                                    <TextInput type="number" step="0.001" value={data.weight} onChange={e => setData('weight', e.target.value)} className="w-full mt-1" />
                                    <InputError message={errors.weight} className="mt-1" />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <InputLabel value="Disc. Type" />
                                    <select value={data.discount_type} onChange={e => setData('discount_type', e.target.value)} className="w-full mt-1 border-gray-300 rounded-md shadow-sm">
                                        <option value="">None</option>
                                        <option value="percent">%</option>
                                        <option value="fixed">Flat</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <InputLabel value="Disc. Value" />
                                    <TextInput type="number" value={data.discount_value} onChange={e => setData('discount_value', e.target.value)} className="w-full mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <Checkbox checked={data.is_free_shipping} onChange={e => setData('is_free_shipping', e.target.checked)} />
                                <span className="ml-2">Free Shipping</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow-sm rounded-lg border border-gray-100">
                         <div className="space-y-4">
                            <div>
                                <InputLabel value="Status" />
                                <div className="flex items-center mt-2">
                                    <Checkbox checked={data.status} onChange={e => setData('status', e.target.checked)} />
                                    <span className="ml-2">Active on Store</span>
                                </div>
                            </div>
                            <PrimaryButton disabled={processing} className="w-full justify-center py-3 text-lg">
                                Update Product
                            </PrimaryButton>
                            <Link href={route('admin.products.index')} className="block text-center text-gray-500 hover:text-gray-700 text-sm">Cancel</Link>
                         </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}