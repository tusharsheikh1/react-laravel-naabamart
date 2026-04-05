import React, { useState, useCallback } from 'react';
import { useNode } from '@craftjs/core';

/**
 * @typedef {Object} Variant
 * @property {string} id
 * @property {string} name
 * @property {string} price
 * @property {string} [originalPrice]
 * @property {number} stock
 * @property {boolean} [isPopular]
 * @property {boolean} [isSoldOut]
 */

export const ProductVariantWidget = ({
    title = 'Choose Your Package',
    subtitle = '',
    variants = [],
    layout = 'list',
    alignment = 'center',
    themeColor = '#4f46e5',
    accentColor = '#10b981',
    paddingTop = 48,
    paddingBottom = 48,
    showSavings = true,
    maxQuantity = 10,
}) => {
    const { connectors: { connect, drag } } = useNode();

    const [selectedId, setSelectedId] = useState(variants[0]?.id || null);
    const [quantities, setQuantities] = useState({});

    const selectedVariant = variants.find(v => v.id === selectedId);

    const handleSelect = useCallback((id) => {
        setSelectedId(id);
    }, []);

    const updateQuantity = (id, newQty) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(1, Math.min(maxQuantity, newQty))
        }));
    };

    const calculateSavings = (variant) => {
        if (!variant.originalPrice) return 0;
        const current = parseFloat(variant.price.replace(/[^0-9.]/g, '')) || 0;
        const original = parseFloat(variant.originalPrice.replace(/[^0-9.]/g, '')) || 0;
        return original > current ? Math.round(((original - current) / original) * 100) : 0;
    };

    return (
        <div
            ref={(ref) => connect(drag(ref))}
            className="w-full"
            style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
        >
            {/* Header */}
            <div style={{ textAlign: alignment }} className="mb-8">
                {title && (
                    <h3 
                        className="text-3xl font-semibold tracking-tight mb-2"
                        style={{ color: themeColor }}
                    >
                        {title}
                    </h3>
                )}
                {subtitle && <p className="text-gray-600 text-lg">{subtitle}</p>}
            </div>

            {/* Variants */}
            <div
                className={
                    layout === 'grid'
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'flex flex-col gap-5 max-w-2xl mx-auto'
                }
            >
                {variants.map((variant) => {
                    const isSelected = selectedId === variant.id;
                    const qty = quantities[variant.id] || 1;
                    const savings = calculateSavings(variant);
                    const isOutOfStock = variant.stock <= 0 || variant.isSoldOut === true;

                    return (
                        <div
                            key={variant.id}
                            onClick={() => !isOutOfStock && handleSelect(variant.id)}
                            className={`
                                group relative bg-white border-2 rounded-3xl p-6 cursor-pointer
                                transition-all duration-300 hover:shadow-2xl hover:-translate-y-1
                                ${isSelected 
                                    ? 'border-indigo-600 shadow-xl scale-[1.02]' 
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                                ${isOutOfStock ? 'opacity-60 pointer-events-none' : ''}
                            `}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && !isOutOfStock && handleSelect(variant.id)}
                        >
                            {/* Badges */}
                            <div className="absolute top-5 right-5 flex flex-col gap-2 items-end">
                                {variant.isPopular && (
                                    <span className="px-4 py-1 text-xs font-bold bg-amber-400 text-amber-900 rounded-2xl shadow">
                                        MOST POPULAR
                                    </span>
                                )}
                                {savings > 0 && showSavings && (
                                    <span className="px-3 py-0.5 text-xs font-semibold bg-emerald-500 text-white rounded-xl">
                                        SAVE {savings}%
                                    </span>
                                )}
                                {isOutOfStock && (
                                    <span className="px-4 py-1 text-xs font-bold bg-red-500 text-white rounded-2xl">
                                        SOLD OUT
                                    </span>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-xl text-gray-900">{variant.name}</h4>
                                    {variant.stock > 0 && variant.stock <= 5 && (
                                        <p className="text-rose-600 text-sm font-medium mt-1">
                                            Only {variant.stock} left
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold tracking-tighter" style={{ color: themeColor }}>
                                        {variant.price}
                                    </span>
                                    {variant.originalPrice && (
                                        <span className="text-xl line-through text-gray-400">
                                            {variant.originalPrice}
                                        </span>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                {!isOutOfStock && (
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateQuantity(variant.id, qty - 1); }}
                                                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-50"
                                                disabled={qty <= 1}
                                            >
                                                −
                                            </button>
                                            <span className="font-mono text-lg w-8 text-center">{qty}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); updateQuantity(variant.id, qty + 1); }}
                                                className="w-9 h-9 flex items-center justify-center border border-gray-300 rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition disabled:opacity-50"
                                                disabled={qty >= maxQuantity}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-sm text-gray-500">Total</div>
                                            <div className="font-semibold" style={{ color: accentColor }}>
                                                ৳ {(parseFloat(variant.price.replace(/[^0-9.]/g, '')) * qty).toLocaleString('en-US')}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedVariant && (
                <div className="mt-10 text-center text-sm text-gray-500">
                    Selected: <span className="font-medium text-gray-800">{selectedVariant.name}</span> — 
                    Quantity: {quantities[selectedVariant.id] || 1}
                </div>
            )}
        </div>
    );
};

export const ProductVariantSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));

    const updateProp = (key, value) => {
        setProp((pr) => { pr[key] = value; });
    };

    const addVariant = () => {
        const newVariant = {
            id: `var_${Date.now()}`,
            name: 'New Package',
            price: '৳ 500',
            originalPrice: '৳ 600',
            stock: 50,
            isPopular: false,
            isSoldOut: false,
        };
        setProp((pr) => pr.variants.push(newVariant));
    };

    const updateVariant = (index, field, value) => {
        setProp((pr) => {
            pr.variants[index][field] = value;
        });
    };

    const removeVariant = (index) => {
        setProp((pr) => pr.variants.splice(index, 1));
    };

    return (
        <div className="space-y-8 pb-8 text-sm">
            {/* Title & Subtitle */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:border-indigo-500 focus:ring-1"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Subtitle (optional)</label>
                    <input
                        type="text"
                        value={props.subtitle || ''}
                        onChange={(e) => updateProp('subtitle', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-2xl focus:border-indigo-500"
                        placeholder="Best value for money"
                    />
                </div>
            </div>

            {/* Layout & Colors */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Layout Style</label>
                    <div className="flex rounded-2xl border border-gray-200 overflow-hidden">
                        {['list', 'grid'].map((l) => (
                            <button
                                key={l}
                                onClick={() => updateProp('layout', l)}
                                className={`flex-1 py-3 text-sm font-medium capitalize transition 
                                    ${props.layout === l ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600">Theme Color</label>
                        <input 
                            type="color" 
                            value={props.themeColor} 
                            onChange={(e) => updateProp('themeColor', e.target.value)} 
                            className="w-10 h-9 rounded-xl cursor-pointer border border-gray-200" 
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-600">Accent Color</label>
                        <input 
                            type="color" 
                            value={props.accentColor || '#10b981'} 
                            onChange={(e) => updateProp('accentColor', e.target.value)} 
                            className="w-10 h-9 rounded-xl cursor-pointer border border-gray-200" 
                        />
                    </div>
                </div>
            </div>

            {/* Variants Manager */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <label className="uppercase text-xs font-bold tracking-widest text-gray-700">Variants</label>
                    <button 
                        onClick={addVariant}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-2xl transition"
                    >
                        + Add Variant
                    </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-auto pr-2">
                    {(props.variants || []).map((variant, i) => (
                        <div key={variant.id || i} className="bg-gray-50 border border-gray-200 rounded-3xl p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    value={variant.name || ''}
                                    onChange={(e) => updateVariant(i, 'name', e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-2xl text-sm"
                                    placeholder="Variant name"
                                />
                                <input
                                    value={variant.price || ''}
                                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                                    className="px-4 py-2.5 border border-gray-300 rounded-2xl text-sm font-medium"
                                    placeholder="৳ 500"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    value={variant.originalPrice || ''}
                                    onChange={(e) => updateVariant(i, 'originalPrice', e.target.value)}
                                    placeholder="Original price"
                                    className="px-4 py-2 border border-gray-300 rounded-2xl text-sm"
                                />
                                <input
                                    type="number"
                                    value={variant.stock || 0}
                                    onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)}
                                    className="px-4 py-2 border border-gray-300 rounded-2xl text-sm"
                                    placeholder="Stock"
                                />
                                <div className="flex flex-col gap-2 text-xs pt-1">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!variant.isPopular}
                                            onChange={(e) => updateVariant(i, 'isPopular', e.target.checked)}
                                        />
                                        Most Popular
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={!!variant.isSoldOut}
                                            onChange={(e) => updateVariant(i, 'isSoldOut', e.target.checked)}
                                        />
                                        Sold Out
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={() => removeVariant(i)}
                                className="text-red-600 hover:text-red-700 text-xs font-medium"
                            >
                                Remove Variant
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Advanced Options */}
            <div className="pt-6 border-t space-y-6">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Show Savings Percentage</label>
                    <input
                        type="checkbox"
                        checked={!!props.showSavings}
                        onChange={(e) => updateProp('showSavings', e.target.checked)}
                        className="w-5 h-5 accent-indigo-600"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                        Max Quantity per Variant ({props.maxQuantity || 10})
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={50}
                        value={props.maxQuantity || 10}
                        onChange={(e) => updateProp('maxQuantity', parseInt(e.target.value))}
                        className="w-full accent-indigo-600"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Top Padding ({props.paddingTop}px)</label>
                        <input
                            type="range"
                            min={0}
                            max={160}
                            value={props.paddingTop || 48}
                            onChange={(e) => updateProp('paddingTop', parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Bottom Padding ({props.paddingBottom}px)</label>
                        <input
                            type="range"
                            min={0}
                            max={160}
                            value={props.paddingBottom || 48}
                            onChange={(e) => updateProp('paddingBottom', parseInt(e.target.value))}
                            className="w-full accent-indigo-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Craft Configuration
ProductVariantWidget.craft = {
    displayName: 'Advanced Variant Selector',
    props: {
        title: 'Choose Your Package',
        subtitle: 'Best deals for bulk purchase',
        layout: 'grid',
        alignment: 'center',
        themeColor: '#4f46e5',
        accentColor: '#10b981',
        paddingTop: 48,
        paddingBottom: 48,
        showSavings: true,
        maxQuantity: 10,
        variants: [
            { id: 'v1', name: '1 Piece', price: '৳ 500', originalPrice: '৳ 550', stock: 120 },
            { id: 'v2', name: '2 Pieces (Save 10%)', price: '৳ 900', originalPrice: '৳ 1100', stock: 85, isPopular: true },
            { id: 'v3', name: '3 Pieces (Save 15%)', price: '৳ 1275', originalPrice: '৳ 1650', stock: 0, isSoldOut: true },
        ],
    },
    related: { settings: ProductVariantSettings },
};