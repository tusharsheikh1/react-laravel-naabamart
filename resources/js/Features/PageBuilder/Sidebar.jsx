import React, { useState } from 'react';
import { useEditor, Element } from '@craftjs/core';
import { Container } from './Components/Container';
import { HeadlineWidget } from './Components/HeadlineWidget';
import { TextWidget } from './Components/TextWidget';
import { ImageWidget } from './Components/ImageWidget';
import { ImageSliderWidget } from './Components/ImageSliderWidget';
import { BookWidget } from './Components/Book/BookWidget';
import { HeroWidget } from './Components/Hero/HeroWidget';
import { CheckoutWidget } from './Components/Checkout/CheckoutWidget';
import { ProductWidget } from './Components/Product/ProductWidget';
import { ProductVariantWidget } from './Components/ProductVariantWidget';
import { FeaturesWidget } from './Components/Features/FeaturesWidget';
import { CountdownWidget } from './Components/Countdown/CountdownWidget';
import { FaqWidget } from './Components/FaqWidget';
import { TestimonialWidget } from './Components/TestimonialWidget';
import { ButtonWidget } from './Components/ButtonWidget';
import { VideoWidget } from './Components/VideoWidget';
import { DividerWidget } from './Components/DividerWidget';
import { CustomCodeWidget } from './Components/CustomCodeWidget';

const ALL_WIDGETS = [
    { label: 'Container',       icon: '🔲', category: 'Layout',    element: <Element is={Container} canvas />, description: 'Wrapper for other elements' },
    { label: 'Headline',        icon: 'H1', category: 'Layout',    element: <HeadlineWidget text="This is a Catchy Headline" level="h2" fontSize={36} fontWeight="800" />, description: 'Large section title' },
    { label: 'Sub-headline',    icon: 'H3', category: 'Layout',    element: <HeadlineWidget text="Supporting Sub-headline Text" level="h3" fontSize={20} fontWeight="500" color="#6b7280" paddingTop={5} paddingBottom={20} />, description: 'Smaller supporting text' },
    { label: 'Text',            icon: '✍️', category: 'Layout',    element: <TextWidget />,            description: 'Text with sketch effects'    },
    { label: 'Image',           icon: '🖼️', category: 'Layout',    element: <ImageWidget />,           description: 'Image with settings'         },
    { label: 'Image Slider',    icon: '🎠', category: 'Layout',    element: <ImageSliderWidget />,     description: 'Auto-playing carousel'       },
    { label: 'Button',          icon: '🔘', category: 'Layout',    element: <ButtonWidget />,          description: 'CTA button'                  },
    { label: 'Divider',         icon: '➖', category: 'Layout',    element: <DividerWidget />,         description: 'Section separator'           },
    { label: 'Custom Code',     icon: '💻', category: 'Layout',    element: <CustomCodeWidget />,      description: 'Raw HTML/CSS/JS block'       },
    { label: 'Video',           icon: '▶️', category: 'Media',     element: <VideoWidget />,           description: 'YouTube/Vimeo embed'         },
    { label: 'Hero Section',    icon: '⭐', category: 'Marketing', element: <HeroWidget />,            description: 'Full-width hero with CTA'    },
    { label: 'Features Grid',   icon: '✨', category: 'Marketing', element: <FeaturesWidget />,        description: 'Feature highlights'          },
    { label: 'Countdown Timer', icon: '⏳', category: 'Marketing', element: <CountdownWidget />,       description: 'Urgency timer'               },
    { label: 'Product Display', icon: '📦', category: 'Marketing', element: <ProductWidget />,         description: 'Dynamic product info'        },
    { label: 'Book Info',       icon: '📖', category: 'Marketing', element: <BookWidget />,            description: 'Book details + gallery'      },
    { label: 'Checkout Form',   icon: '🛒', category: 'Sales',     element: <CheckoutWidget />,        description: 'Order capture form'          },
    { label: 'Variant Pricing', icon: '🏷️', category: 'Sales',     element: <ProductVariantWidget />,  description: 'List variants and prices'    },
    { label: 'Testimonials',    icon: '💬', category: 'Trust',     element: <TestimonialWidget />,     description: 'Customer reviews'            },
    { label: 'FAQ Accordion',   icon: '❓', category: 'Trust',     element: <FaqWidget />,             description: 'Collapsible Q&A'             },
];

const CATEGORIES = ['All', 'Layout', 'Media', 'Marketing', 'Sales', 'Trust'];

export const Sidebar = () => {
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [tab, setTab] = useState('elements'); // 'elements' | 'layers'

    const { active, connectors: { create }, actions, nodes } = useEditor((state, query) => {
        const selectedSet             = state.events.selected;
        const currentlySelectedNodeId = selectedSet.size > 0 ? Array.from(selectedSet)[0] : null;
        let selected = null;
        if (currentlySelectedNodeId) {
            const node = state.nodes[currentlySelectedNodeId];
            if (node) {
                selected = {
                    id         : currentlySelectedNodeId,
                    name       : node.data.name,
                    settings   : node.related && node.related.settings,
                    isDeletable: query.node(currentlySelectedNodeId).isDeletable(),
                };
            }
        }
        return { active: selected, nodes: state.nodes };
    });

    const filtered = ALL_WIDGETS.filter(w => {
        const matchSearch = w.label.toLowerCase().includes(search.toLowerCase()) || w.description.toLowerCase().includes(search.toLowerCase());
        const matchCat    = activeCategory === 'All' || w.category === activeCategory;
        return matchSearch && matchCat;
    });

    const grouped = CATEGORIES.filter(c => c !== 'All').reduce((acc, cat) => {
        const items = filtered.filter(w => w.category === cat);
        if (items.length) acc[cat] = items;
        return acc;
    }, {});

    const renderNodes = (nodeIds, depth = 0) => {
        if (!nodeIds || nodeIds.length === 0) return null;
        return nodeIds.map(id => {
            const node = nodes[id];
            if (!node) return null;
            const isSelected     = active?.id === id;
            const directChildren = node.data.nodes       || [];
            const linkedChildren = node.data.linkedNodes ? Object.values(node.data.linkedNodes) : [];
            const allChildren    = [...directChildren, ...linkedChildren];
            return (
                <div key={id}>
                    <div
                        onClick={() => actions.selectNode(id)}
                        className={`flex items-center gap-2 px-3 py-1.5 cursor-pointer text-sm rounded transition ${isSelected ? 'bg-indigo-100 text-indigo-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                        style={{ paddingLeft: `${12 + depth * 16}px` }}
                    >
                        <span className="text-xs opacity-50">{allChildren.length > 0 ? '▾' : '•'}</span>
                        <span className="truncate">{node.data.displayName || node.data.name || 'Element'}</span>
                    </div>
                    {allChildren.length > 0 && renderNodes(allChildren, depth + 1)}
                </div>
            );
        });
    };

    return (
        <div className="w-72 bg-white border-l border-gray-200 h-full flex flex-col" style={{ minWidth: '280px' }}>

            {/* Header */}
            <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
                {active ? (
                    <div className="p-3 flex justify-between items-center">
                        <div>
                            <div className="text-xs text-gray-400 uppercase tracking-wide">Editing</div>
                            <div className="font-bold text-gray-800 text-sm truncate max-w-[160px]">{active.name}</div>
                        </div>
                        <button onClick={() => actions.selectNode(null)} className="text-xs text-indigo-600 hover:underline font-medium">← Back</button>
                    </div>
                ) : (
                    <div>
                        <div className="flex border-b border-gray-100">
                            <button onClick={() => setTab('elements')} className={`flex-1 py-3 text-sm font-medium transition ${tab === 'elements' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Elements</button>
                            <button onClick={() => setTab('layers')}   className={`flex-1 py-3 text-sm font-medium transition ${tab === 'layers'   ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Layers</button>
                        </div>
                        {tab === 'elements' && (
                            <div className="p-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search elements..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-300"
                                    />
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
                                    {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">✕</button>}
                                </div>
                                {!search && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {CATEGORIES.map(cat => (
                                            <button key={cat} onClick={() => setActiveCategory(cat)}
                                                className={`px-2 py-0.5 text-xs rounded-full border transition ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main scroll area */}
            <div className="flex-1 overflow-y-auto">
                {active && active.settings ? (
                    <div className="p-4">
                        {React.createElement(active.settings)}
                    </div>
                ) : tab === 'layers' ? (
                    <div className="py-2">
                        <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wider font-bold">Page Structure</div>
                        {renderNodes(['ROOT'])}
                    </div>
                ) : (
                    <div className="p-3 pb-10">
                        {search ? (
                            filtered.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">No elements found for "{search}"</div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    {filtered.map(widget => <WidgetCard key={widget.label} widget={widget} create={create} />)}
                                </div>
                            )
                        ) : (
                            Object.entries(grouped).map(([cat, items]) => (
                                <div key={cat} className="mb-5">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{cat}</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {items.map(widget => <WidgetCard key={widget.label} widget={widget} create={create} />)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Delete footer */}
            {active && active.isDeletable && (
                <div className="p-3 border-t border-gray-200 bg-white sticky bottom-0 z-10">
                    <button
                        className="w-full py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition text-sm font-medium flex items-center justify-center gap-2"
                        onClick={() => { if (window.confirm('Delete this block?')) actions.delete(active.id); }}
                    >
                        🗑️ Delete Block
                    </button>
                </div>
            )}
        </div>
    );
};

const WidgetCard = ({ widget, create }) => {
    const isHighlighted = widget.category === 'Sales';
    return (
        <div
            ref={ref => create(ref, widget.element)}
            className={`p-3 rounded-lg text-sm cursor-grab active:cursor-grabbing transition select-none ${
                isHighlighted
                    ? 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                    : 'bg-gray-50 border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200'
            }`}
        >
            <div className="text-xl mb-1">{widget.icon}</div>
            <div className={`font-semibold text-xs ${isHighlighted ? 'text-blue-800' : 'text-gray-700'}`}>{widget.label}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{widget.description}</div>
        </div>
    );
};