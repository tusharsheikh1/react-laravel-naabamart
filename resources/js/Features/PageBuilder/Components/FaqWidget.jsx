import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { motion, AnimatePresence } from 'framer-motion';

export const FaqWidget = ({ title, subtitle, questions, bgColor, padding, accentColor, iconStyle, layout }) => {
    const { connectors: { connect, drag } } = useNode();
    const [openIndex, setOpenIndex] = useState(null);

    const maxWidth =
        layout === 'narrow' ? 'max-w-2xl' :
        layout === 'wide'   ? 'max-w-5xl' :
                              'max-w-3xl';

    return (
        <div ref={ref => connect(drag(ref))} style={{ backgroundColor: bgColor, padding: `${padding}px 24px` }}>
            <div className={`${maxWidth} mx-auto`}>
                {title && <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">{title}</h2>}
                {subtitle && <p className="text-center text-gray-500 mb-8 text-base">{subtitle}</p>}

                <div className="space-y-3">
                    {questions.map((item, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-xl"
                            style={{ border: `1px solid ${accentColor}30`, background: '#fff' }}
                        >
                            <button
                                className="w-full text-left px-6 py-4 font-semibold text-gray-800 flex justify-between items-center gap-4 focus:outline-none hover:bg-gray-50 transition"
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            >
                                <span className="text-base">{item.q}</span>
                                <span
                                    className="text-2xl font-light shrink-0 leading-none"
                                    style={{
                                        transform: openIndex === index ? 'rotate(45deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                        color: accentColor,
                                        display: 'inline-block',
                                    }}
                                >
                                    {iconStyle === 'arrow' ? (openIndex === index ? '↑' : '↓') : '+'}
                                </span>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-3">
                                            {item.a}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FaqSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;

    const updateQ = (i, field, val) => setProp(pr => { pr.questions[i][field] = val; });
    const addQ    = () => setProp(pr => { pr.questions.push({ q: 'New Question?', a: 'Your answer here.' }); });
    const removeQ = (i) => setProp(pr => { pr.questions.splice(i, 1); });

    return (
        <div className="space-y-5 divide-y divide-gray-100">
            {/* Content */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content</h4>
                <div>
                    <label className="text-sm font-medium">Section Title</label>
                    <input type="text" value={p.title} onChange={e => setProp(pr => pr.title = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md" />
                </div>
                <div>
                    <label className="text-sm font-medium">Subtitle</label>
                    <input type="text" value={p.subtitle || ''} onChange={e => setProp(pr => pr.subtitle = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md" />
                </div>
            </div>

            {/* Design */}
            <div className="pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Design</h4>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Accent Color</label>
                        <input type="color" value={p.accentColor} onChange={e => setProp(pr => pr.accentColor = e.target.value)} className="block w-full h-8 rounded mt-1" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-500">Background</label>
                        <input type="color" value={p.bgColor} onChange={e => setProp(pr => pr.bgColor = e.target.value)} className="block w-full h-8 rounded mt-1" />
                    </div>
                </div>
                <div>
                    <label className="text-sm font-medium">Layout Width</label>
                    <select value={p.layout} onChange={e => setProp(pr => pr.layout = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                        <option value="narrow">Narrow (640px)</option>
                        <option value="default">Default (768px)</option>
                        <option value="wide">Wide (1024px)</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium">Toggle Icon</label>
                    <select value={p.iconStyle} onChange={e => setProp(pr => pr.iconStyle = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                        <option value="plus">Plus / Minus</option>
                        <option value="arrow">Arrow</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs text-gray-500">Padding ({p.padding}px)</label>
                    <input type="range" min="0" max="100" value={p.padding} onChange={e => setProp(pr => pr.padding = parseInt(e.target.value))} className="w-full" />
                </div>
            </div>

            {/* Questions */}
            <div className="pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Questions</h4>
                <div className="space-y-3">
                    {p.questions.map((item, i) => (
                        <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                            <div className="flex gap-1">
                                <input
                                    type="text"
                                    value={item.q}
                                    onChange={e => updateQ(i, 'q', e.target.value)}
                                    className="flex-1 text-xs border-gray-300 rounded"
                                    placeholder="Question"
                                />
                                <button
                                    onClick={() => removeQ(i)}
                                    className="text-red-400 hover:text-red-600 font-bold text-lg leading-none px-1"
                                >
                                    ×
                                </button>
                            </div>
                            <textarea
                                rows={2}
                                value={item.a}
                                onChange={e => updateQ(i, 'a', e.target.value)}
                                className="w-full text-xs border-gray-300 rounded"
                                placeholder="Answer"
                            />
                        </div>
                    ))}
                </div>
                <button onClick={addQ} className="w-full py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                    + Add Question
                </button>
            </div>
        </div>
    );
};

FaqWidget.craft = {
    displayName: 'FAQ Accordion',
    props: {
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know before ordering.',
        bgColor: '#f9fafb',
        padding: 60,
        accentColor: '#6366f1',
        iconStyle: 'plus',
        layout: 'default',
        questions: [
            { q: 'How long does shipping take?',         a: 'We process orders within 24 hours. Delivery takes 2-3 days anywhere in Bangladesh via Steadfast Courier.' },
            { q: 'What is your return policy?',          a: 'We offer a 7-day money-back guarantee if the product is defective or not as described.' },
            { q: 'Can I pay with Cash on Delivery?',     a: 'Yes! We offer 100% Cash on Delivery so you can inspect the package before paying.' },
            { q: 'Is the product authentic?',            a: '100% authentic. We source directly from authorized distributors with full quality assurance.' },
        ],
    },
    related: { settings: FaqSettings },
};