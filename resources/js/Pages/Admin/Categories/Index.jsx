import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = {
    Plus:       () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
    Search:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>,
    ChevronDown:() => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    ChevronRight:()=> <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>,
    Edit:       () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    Trash:      () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
    Image:      () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Tag:        () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V5a2 2 0 012-2z" /></svg>,
    Home:       () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
    CollapseAll:() => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>,
    ExpandAll:  () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>,
    Filter:     () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>,
    Clear:      () => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
};

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, color = 'indigo', disabled = false }) {
    const colors = {
        indigo: checked ? 'bg-indigo-500' : 'bg-gray-200',
        emerald: checked ? 'bg-emerald-500' : 'bg-gray-200',
    };
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-${color}-400 ${colors[color]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </button>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ category, onConfirm, onCancel }) {
    if (!category) return null;
    const childCount = category.children_recursive?.length || 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                    <Icon.Trash />
                </div>
                <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Category?</h3>
                <p className="text-sm text-gray-500 text-center mb-1">
                    You're about to delete <span className="font-semibold text-gray-800">"{category.name}"</span>.
                </p>
                {childCount > 0 && (
                    <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-center mt-2 mb-3">
                        ⚠️ This will also delete {childCount} sub-categor{childCount === 1 ? 'y' : 'ies'}.
                    </p>
                )}
                <p className="text-xs text-gray-400 text-center mb-5">This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ categories }) {
    const stats = useMemo(() => {
        let total = 0, featured = 0, homeSection = 0, withImage = 0, subcategories = 0;
        const walk = (cats) => {
            cats.forEach(c => {
                total++;
                if (c.is_featured == 1 || c.is_featured === true) featured++;
                if (c.show_products_on_home == 1 || c.show_products_on_home === true) homeSection++;
                if (c.image) withImage++;
                if (c.children_recursive?.length) {
                    subcategories += c.children_recursive.length;
                    walk(c.children_recursive);
                }
            });
        };
        walk(categories);
        return { total, featured, homeSection, withImage, subcategories };
    }, [categories]);

    const items = [
        { label: 'Total',       value: stats.total,        color: 'text-slate-700',   bg: 'bg-slate-100' },
        { label: 'Featured',    value: stats.featured,     color: 'text-indigo-700',  bg: 'bg-indigo-100' },
        { label: 'On Homepage', value: stats.homeSection,  color: 'text-emerald-700', bg: 'bg-emerald-100' },
        { label: 'With Image',  value: stats.withImage,    color: 'text-violet-700',  bg: 'bg-violet-100' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {items.map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                    <span className={`text-xl font-black ${color}`}>{value}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ category, level = 0, isExpanded, onToggleExpand, searchQuery, onDelete, updatingId }) {
    const isFeatured = category.is_featured == 1 || category.is_featured === true;
    const isHome     = category.show_products_on_home == 1 || category.show_products_on_home === true;
    const hasChildren = category.children_recursive?.length > 0;
    const isUpdating  = updatingId === category.id;

    const handleToggle = (field, value) => {
        router.put(route('admin.categories.update', category.id), {
            name: category.name,
            parent_id: category.parent_id || null,
            description: category.description || '',
            is_featured:            field === 'is_featured'            ? value : isFeatured,
            featured_order:         category.featured_order            || null,
            show_products_on_home:  field === 'show_products_on_home'  ? value : isHome,
            home_order:             category.home_order                || null,
        }, {
            preserveScroll: true,
            onError: (errors) => alert('Update failed: ' + Object.values(errors).join('\n')),
        });
    };

    // Highlight matching text
    const highlightName = (name) => {
        if (!searchQuery) return name;
        const idx = name.toLowerCase().indexOf(searchQuery.toLowerCase());
        if (idx === -1) return name;
        return (
            <>
                {name.slice(0, idx)}
                <mark className="bg-yellow-200 text-yellow-900 rounded px-0.5">{name.slice(idx, idx + searchQuery.length)}</mark>
                {name.slice(idx + searchQuery.length)}
            </>
        );
    };

    return (
        <div>
            <div
                className={`
                    group flex items-center gap-3 py-2.5 pr-3 transition-all duration-150
                    ${isUpdating ? 'opacity-60 pointer-events-none' : ''}
                    ${level === 0 ? 'hover:bg-slate-50' : 'hover:bg-indigo-50/40'}
                `}
                style={{ paddingLeft: `${level * 28 + 12}px` }}
            >
                {/* Expand / leaf indicator */}
                <div className="flex-shrink-0 w-5 flex items-center justify-center">
                    {hasChildren ? (
                        <button
                            onClick={() => onToggleExpand(category.id)}
                            className="text-gray-400 hover:text-indigo-600 transition-colors rounded p-0.5 hover:bg-indigo-100"
                        >
                            {isExpanded ? <Icon.ChevronDown /> : <Icon.ChevronRight />}
                        </button>
                    ) : (
                        level > 0 && <span className="block w-3 h-px bg-gray-300 ml-1" />
                    )}
                </div>

                {/* Image thumbnail */}
                <div className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {category.image ? (
                        <img src={`/storage/${category.image}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                        <span className="text-gray-300"><Icon.Image /></span>
                    )}
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className={`font-semibold truncate ${level === 0 ? 'text-sm text-gray-900' : 'text-xs text-gray-700'}`}>
                        {highlightName(category.name)}
                    </span>
                    {hasChildren && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                            {category.children_recursive.length} sub
                        </span>
                    )}
                    {isFeatured && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Icon.Tag /> #{category.featured_order ?? '—'}
                        </span>
                    )}
                    {isHome && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex-shrink-0">
                            <Icon.Home /> #{category.home_order ?? '—'}
                        </span>
                    )}
                </div>

                {/* Toggle: Featured */}
                <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium w-12 text-right">Featured</span>
                    <Toggle checked={isFeatured} onChange={(val) => handleToggle('is_featured', val)} color="indigo" />
                </div>

                {/* Toggle: Home */}
                <div className="flex-shrink-0 hidden sm:flex items-center gap-1.5 ml-2">
                    <span className="text-[10px] text-gray-400 font-medium w-12 text-right">Homepage</span>
                    <Toggle checked={isHome} onChange={(val) => handleToggle('show_products_on_home', val)} color="emerald" />
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-1 ml-3 pl-3 border-l border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                        href={route('admin.categories.edit', category.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors"
                    >
                        <Icon.Edit /> Edit
                    </Link>
                    <button
                        onClick={() => onDelete(category)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <Icon.Trash /> Delete
                    </button>
                </div>

                {/* Mobile actions (always visible) */}
                <div className="flex-shrink-0 flex items-center gap-1 sm:hidden">
                    <Link href={route('admin.categories.edit', category.id)} className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors">
                        <Icon.Edit />
                    </Link>
                    <button onClick={() => onDelete(category)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Icon.Trash />
                    </button>
                </div>
            </div>

            {/* Children */}
            {hasChildren && isExpanded && (
                <div className="border-l-2 border-dashed border-gray-200 ml-[28px]">
                    {category.children_recursive.map(child => (
                        <CategoryRow
                            key={child.id}
                            category={child}
                            level={level + 1}
                            isExpanded={isExpanded}
                            onToggleExpand={onToggleExpand}
                            searchQuery={searchQuery}
                            onDelete={onDelete}
                            updatingId={updatingId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index({ categories }) {
    const [search, setSearch]             = useState('');
    const [filter, setFilter]             = useState('all');   // all | featured | home | no-image
    const [expandedIds, setExpandedIds]   = useState(() => new Set(categories.map(c => c.id)));
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [updatingId]                    = useState(null);

    // Flatten all for search
    const flatAll = useMemo(() => {
        const list = [];
        const walk = (cats) => cats.forEach(c => { list.push(c); if (c.children_recursive) walk(c.children_recursive); });
        walk(categories);
        return list;
    }, [categories]);

    // Filter root categories (or search flattened)
    const visibleCategories = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (q) {
            return flatAll.filter(c => c.name.toLowerCase().includes(q));
        }
        let roots = categories;
        if (filter === 'featured')  roots = flatAll.filter(c => c.is_featured == 1 || c.is_featured === true);
        if (filter === 'home')      roots = flatAll.filter(c => c.show_products_on_home == 1 || c.show_products_on_home === true);
        if (filter === 'no-image')  roots = flatAll.filter(c => !c.image);
        return filter === 'all' ? categories : roots;
    }, [search, filter, categories, flatAll]);

    const allExpanded = categories.every(c => expandedIds.has(c.id));

    const toggleExpand = (id) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const expandAll  = () => setExpandedIds(new Set(categories.map(c => c.id)));
    const collapseAll = () => setExpandedIds(new Set());

    const confirmDelete = () => {
        if (!deleteTarget) return;
        router.delete(route('admin.categories.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => setDeleteTarget(null),
        });
    };

    const FILTERS = [
        { id: 'all',      label: 'All' },
        { id: 'featured', label: 'Featured' },
        { id: 'home',     label: 'On Homepage' },
        { id: 'no-image', label: 'No Image' },
    ];

    return (
        <AdminLayout>
            <Head title="Categories" />

            {/* Delete modal */}
            <DeleteModal
                category={deleteTarget}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage your store's category hierarchy</p>
                </div>
                <Link
                    href={route('admin.categories.create')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                    <Icon.Plus /> Add Category
                </Link>
            </div>

            {/* Stats */}
            <StatsBar categories={categories} />

            {/* Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-4 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Icon.Search /></span>
                        <input
                            type="text"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setFilter('all'); }}
                            placeholder="Search categories…"
                            className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <Icon.Clear />
                            </button>
                        )}
                    </div>

                    {/* Filter pills */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-400 hidden sm:block"><Icon.Filter /></span>
                        {FILTERS.map(f => (
                            <button
                                key={f.id}
                                onClick={() => { setFilter(f.id); setSearch(''); }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                    filter === f.id && !search
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Expand/Collapse (only when showing tree) */}
                    {!search && filter === 'all' && (
                        <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
                            <button onClick={allExpanded ? collapseAll : expandAll} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                                {allExpanded ? <><Icon.CollapseAll /> Collapse</> : <><Icon.ExpandAll /> Expand</>}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Category list */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden sm:flex items-center gap-3 px-3 py-2.5 border-b border-gray-100 bg-gray-50">
                    <div className="w-5 flex-shrink-0" />
                    <div className="w-9 flex-shrink-0" />
                    <div className="flex-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category</div>
                    <div className="flex-shrink-0 flex items-center gap-1.5 w-28">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Featured</span>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1.5 w-32 ml-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Homepage</span>
                    </div>
                    <div className="w-28 flex-shrink-0 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider pr-3">Actions</div>
                </div>

                {/* Rows */}
                {visibleCategories.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="text-4xl mb-3">🗂️</div>
                        <p className="text-gray-500 font-medium">
                            {search ? `No categories match "${search}"` : 'No categories yet'}
                        </p>
                        {!search && (
                            <Link href={route('admin.categories.create')} className="mt-3 inline-flex items-center gap-1 text-indigo-600 text-sm font-semibold hover:underline">
                                <Icon.Plus /> Create your first category
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {visibleCategories.map(category => (
                            <CategoryRow
                                key={category.id}
                                category={category}
                                level={0}
                                isExpanded={expandedIds.has(category.id)}
                                onToggleExpand={toggleExpand}
                                searchQuery={search}
                                onDelete={setDeleteTarget}
                                updatingId={updatingId}
                            />
                        ))}
                    </div>
                )}

                {/* Footer count */}
                {visibleCategories.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 font-medium">
                        Showing {visibleCategories.length} {visibleCategories.length === 1 ? 'category' : 'categories'}
                        {search && ` matching "${search}"`}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}