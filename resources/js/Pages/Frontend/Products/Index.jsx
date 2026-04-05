import { useState, useEffect } from 'react';
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';
import ProductCard from '@/Components/ProductCard';
import { Link, router } from '@inertiajs/react';
import SEO from '@/Components/SEO';

export default function Index({ products, categories, brands, authors, publications, colors, sizes, filters }) {
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    
    // State for mobile filter sidebar
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // Accordion state
    const [expanded, setExpanded] = useState({
        category: !!filters.category,
        brand: !!filters.brand,
        author: !!filters.author,
        publication: !!filters.publication,
        color: !!filters.color,
        size: !!filters.size,
        price: !!filters.min_price || !!filters.max_price || true,
    });

    // Prevent body scroll when mobile filter is open
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isMobileFilterOpen]);

    const toggleSection = (section) => {
        setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleFilterChange = (key, value) => {
        const query = { ...filters };
        
        if (value !== null && value !== undefined && value !== '') {
            query[key] = value;
        } else {
            delete query[key];
        }

        delete query.page; // Reset to page 1
        
        router.get(route('shop'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const applyPriceFilter = () => {
        const query = { ...filters };
        if (minPrice) query.min_price = minPrice; else delete query.min_price;
        if (maxPrice) query.max_price = maxPrice; else delete query.max_price;
        delete query.page;

        router.get(route('shop'), query, { preserveState: true, preserveScroll: true });
        setIsMobileFilterOpen(false);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        router.get(route('shop'));
        setIsMobileFilterOpen(false);
    };

    // Helper to get labels for the active filter chips
    const getActiveFilterLabel = (key, value) => {
        if (!value) return null;
        switch(key) {
            case 'category': return categories?.find(c => c.id.toString() === value)?.name;
            case 'brand': return brands?.find(b => b.id.toString() === value)?.name;
            case 'author': return authors?.find(a => a.id.toString() === value)?.name;
            case 'publication': return publications?.find(p => p.id.toString() === value)?.name;
            case 'color': return colors?.find(c => c.id.toString() === value)?.name;
            case 'size': return sizes?.find(s => s.id.toString() === value)?.name;
            default: return null;
        }
    };

    // Reusable Checkbox UI Component for filters
    const FilterItem = ({ label, count, isActive, onClick, colorCode }) => (
        <button 
            onClick={onClick}
            className={`w-full group flex items-center justify-between p-2 rounded-lg transition-colors ${isActive ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-black border-black text-white' : 'border-gray-300 group-hover:border-black'}`}>
                    {isActive && (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                {colorCode && (
                    <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: colorCode }}></span>
                )}
                <span className={`text-sm ${isActive ? 'font-semibold text-black' : 'text-gray-600'}`}>
                    {label}
                </span>
            </div>
            {count > 0 && (
                <span className="text-xs text-gray-400 bg-white border border-gray-100 px-2 py-0.5 rounded-full shadow-sm">
                    {count}
                </span>
            )}
        </button>
    );

    const ChevronIcon = ({ isOpen }) => (
        <svg className={`w-5 h-5 text-gray-400 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
    );

    return (
        <ThemeLayout>
            {/* Using the Dynamic SEO Component */}
            <SEO title="Shop Products" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-8 gap-2">
                    <Link href={route('home')} className="hover:text-black transition">Home</Link>
                    <span>/</span>
                    <span className="text-black font-medium">Shop</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mb-20">
                    
                    {/* Sidebar Filters */}
                    {isMobileFilterOpen && (
                        <div 
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                            onClick={() => setIsMobileFilterOpen(false)}
                        />
                    )}

                    <div className={`
                        fixed inset-y-0 left-0 z-50 w-[85%] max-w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
                        lg:relative lg:transform-none lg:w-1/4 lg:flex-shrink-0 lg:bg-transparent lg:shadow-none lg:z-0
                        ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="flex flex-col h-full lg:h-auto lg:sticky lg:top-24 bg-white lg:border lg:border-gray-200 lg:rounded-2xl overflow-hidden">
                            
                            {/* Filter Header */}
                            <div className="flex items-center justify-between p-5 lg:p-6 border-b border-gray-100 lg:border-none">
                                <h3 className="font-bold text-xl text-black flex items-center gap-2">
                                    <svg className="w-5 h-5 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                                    Filters
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-black hover:underline font-medium transition">
                                        Clear All
                                    </button>
                                    <button className="lg:hidden p-2 -mr-2 text-gray-400 hover:text-black bg-gray-50 rounded-full" onClick={() => setIsMobileFilterOpen(false)}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-5 lg:p-6 lg:pt-0 custom-scrollbar pb-24 lg:pb-6 space-y-6">
                                
                                {/* Categories */}
                                <div className="border-t border-gray-100 pt-6 lg:border-t-0 lg:pt-0">
                                    <button onClick={() => toggleSection('category')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none group">
                                        <span>Categories</span>
                                        <ChevronIcon isOpen={expanded.category} />
                                    </button>
                                    {expanded.category && (
                                        <div className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                            {categories?.map((category) => {
                                                const identifier = category.id.toString();
                                                return (
                                                    <FilterItem 
                                                        key={category.id}
                                                        label={category.name}
                                                        count={category.products_count}
                                                        isActive={filters.category === identifier}
                                                        onClick={() => handleFilterChange('category', filters.category === identifier ? null : identifier)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Brands */}
                                {brands?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <button onClick={() => toggleSection('brand')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                            <span>Brands</span>
                                            <ChevronIcon isOpen={expanded.brand} />
                                        </button>
                                        {expanded.brand && (
                                            <div className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {brands.map((brand) => (
                                                    <FilterItem 
                                                        key={brand.id}
                                                        label={brand.name}
                                                        count={brand.products_count}
                                                        isActive={filters.brand === brand.id.toString()}
                                                        onClick={() => handleFilterChange('brand', filters.brand === brand.id.toString() ? null : brand.id.toString())}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Authors */}
                                {authors?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <button onClick={() => toggleSection('author')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                            <span>Authors</span>
                                            <ChevronIcon isOpen={expanded.author} />
                                        </button>
                                        {expanded.author && (
                                            <div className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {authors.map((author) => (
                                                    <FilterItem 
                                                        key={author.id}
                                                        label={author.name}
                                                        count={author.products_count}
                                                        isActive={filters.author === author.id.toString()}
                                                        onClick={() => handleFilterChange('author', filters.author === author.id.toString() ? null : author.id.toString())}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Publications */}
                                {publications?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <button onClick={() => toggleSection('publication')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                            <span>Publications</span>
                                            <ChevronIcon isOpen={expanded.publication} />
                                        </button>
                                        {expanded.publication && (
                                            <div className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {publications.map((publication) => (
                                                    <FilterItem 
                                                        key={publication.id}
                                                        label={publication.name}
                                                        count={publication.products_count}
                                                        isActive={filters.publication === publication.id.toString()}
                                                        onClick={() => handleFilterChange('publication', filters.publication === publication.id.toString() ? null : publication.id.toString())}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Colors */}
                                {colors?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <button onClick={() => toggleSection('color')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                            <span>Colors</span>
                                            <ChevronIcon isOpen={expanded.color} />
                                        </button>
                                        {expanded.color && (
                                            <div className="mt-4 space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                                                {colors.map((color) => (
                                                    <FilterItem 
                                                        key={color.id}
                                                        label={color.name}
                                                        colorCode={color.code}
                                                        isActive={filters.color === color.id.toString()}
                                                        onClick={() => handleFilterChange('color', filters.color === color.id.toString() ? null : color.id.toString())}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Sizes */}
                                {sizes?.length > 0 && (
                                    <div className="border-t border-gray-100 pt-6">
                                        <button onClick={() => toggleSection('size')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                            <span>Sizes</span>
                                            <ChevronIcon isOpen={expanded.size} />
                                        </button>
                                        {expanded.size && (
                                            <div className="mt-4 space-y-1 flex flex-wrap gap-2">
                                                {sizes.map((size) => {
                                                    const isActive = filters.size === size.id.toString();
                                                    return (
                                                        <button 
                                                            key={size.id}
                                                            onClick={() => handleFilterChange('size', isActive ? null : size.id.toString())}
                                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-black'}`}
                                                        >
                                                            {size.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Price Range */}
                                <div className="border-t border-gray-100 pt-6">
                                    <button onClick={() => toggleSection('price')} className="w-full flex items-center justify-between font-semibold text-lg text-black focus:outline-none">
                                        <span>Price Range</span>
                                        <ChevronIcon isOpen={expanded.price} />
                                    </button>
                                    {expanded.price && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
                                                    <input type="number" placeholder="Min" className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-black focus:ring-black transition-all" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                                </div>
                                                <span className="text-gray-300 font-medium">-</span>
                                                <div className="relative flex-1">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">৳</span>
                                                    <input type="number" placeholder="Max" className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-black focus:ring-black transition-all" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                                </div>
                                            </div>
                                            <button onClick={applyPriceFilter} className="w-full bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition shadow-md hover:shadow-lg active:scale-[0.98]">
                                                Apply Price
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Product Section */}
                    <div className="lg:w-3/4">
                        
                        {/* Top Bar: Title & Sorter */}
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4 border-b border-gray-100 pb-4">
                            <div>
                                <h1 className="text-3xl font-extrabold text-black tracking-tight">
                                    {filters.category ? categories?.find(c => c.id.toString() === filters.category)?.name || 'Products' : 'All Products'}
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Showing {products.from || 0} to {products.to || 0} of {products.total} products</p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                                {/* Mobile Filter Trigger */}
                                <button 
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="lg:hidden flex-1 flex items-center justify-center gap-2 border border-gray-200 rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition bg-white shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                                    Filters
                                </button>

                                {/* Sort Dropdown */}
                                <div className="relative flex-1 md:flex-none">
                                    <select 
                                        value={filters.sort || 'latest'} 
                                        onChange={(e) => handleFilterChange('sort', e.target.value)} 
                                        className="w-full md:w-auto appearance-none border border-gray-200 text-sm rounded-full focus:ring-black focus:border-black pl-5 pr-10 py-2.5 bg-white font-medium cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                                    >
                                        <option value="latest">Sort by: Newest</option>
                                        <option value="oldest">Sort by: Oldest</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {Object.keys(filters).some(key => !['page', 'sort', 'search'].includes(key)) && (
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <span className="text-sm text-gray-500 font-medium mr-1">Active Filters:</span>
                                
                                {Object.entries(filters).map(([key, value]) => {
                                    if (['page', 'sort', 'search', 'min_price', 'max_price'].includes(key) || !value) return null;
                                    const label = getActiveFilterLabel(key, value);
                                    if (!label) return null;
                                    
                                    return (
                                        <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium shadow-sm">
                                            <span className="capitalize opacity-70">{key}:</span> {label}
                                            <button onClick={() => handleFilterChange(key, null)} className="ml-1 hover:text-red-400 focus:outline-none transition-colors">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </span>
                                    );
                                })}

                                {(filters.min_price || filters.max_price) && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black text-white text-xs font-medium shadow-sm">
                                        <span className="opacity-70">Price:</span> 
                                        {filters.min_price ? `৳${filters.min_price}` : 'Min'} - {filters.max_price ? `৳${filters.max_price}` : 'Max'}
                                        <button onClick={() => { handleFilterChange('min_price', null); handleFilterChange('max_price', null); setMinPrice(''); setMaxPrice(''); }} className="ml-1 hover:text-red-400 focus:outline-none transition-colors">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Product Grid */}
                        {products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                                    {products.data.map(product => <ProductCard key={product.id} product={product} />)}
                                </div>
                                
                                {/* Pagination */}
                                {products.links.length > 3 && (
                                    <div className="mt-16 flex justify-center border-t border-gray-100 pt-8">
                                        <div className="flex gap-2 flex-wrap justify-center bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm">
                                            {products.links.map((link, index) => {
                                                let label = link.label.includes('Previous') ? '←' : link.label.includes('Next') ? '→' : link.label;
                                                return link.url ? (
                                                    <Link key={index} href={link.url} preserveScroll className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-black text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'}`} dangerouslySetInnerHTML={{ __html: label }} />
                                                ) : (
                                                    <span key={index} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 cursor-not-allowed" dangerouslySetInnerHTML={{ __html: label }} />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-dashed border-gray-300">
                                <div className="w-20 h-20 mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                                <p className="text-gray-500 mb-8 max-w-sm text-center">We couldn't find any items that match your applied filters. Try adjusting them or clear everything.</p>
                                <button onClick={clearFilters} className="bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-gray-800 transition shadow-lg hover:shadow-xl active:scale-95">
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ThemeLayout>
    );
}