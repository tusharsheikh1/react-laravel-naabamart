import React, { useState, useEffect, useRef } from 'react';
import { useNode } from '@craftjs/core';
import ContentEditable from 'react-contenteditable';

export const HeadlineWidget = ({ text, level, textAlign, color, fontSize, fontWeight, paddingTop, paddingBottom }) => {
    const { connectors: { connect, drag }, hasSelectedNode, actions: { setProp } } = useNode((state) => ({
        hasSelectedNode: state.events.selected,
    }));

    const [editable, setEditable] = useState(false);

    useEffect(() => {
        if (!hasSelectedNode) setEditable(false);
    }, [hasSelectedNode]);

    return (
        <div
            ref={ref => connect(drag(ref))}
            onClick={() => setEditable(true)}
            className="w-full"
            style={{ paddingTop: `${paddingTop}px`, paddingBottom: `${paddingBottom}px` }}
        >
            <ContentEditable
                html={text}
                disabled={!editable}
                onChange={e => setProp(props => props.text = e.target.value)}
                tagName={level}
                style={{
                    fontSize: `${fontSize}px`,
                    textAlign,
                    color,
                    fontWeight,
                    lineHeight: 1.2,
                }}
                className={`outline-none transition-all ${editable ? 'ring-2 ring-indigo-400 ring-offset-4 ring-offset-transparent bg-indigo-50/5 rounded-md' : ''}`}
            />
        </div>
    );
};

export const HeadlineSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({ props: node.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    return (
        <div className="space-y-4 pb-6">
            <div className="p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg border border-indigo-100">
                💡 Click the headline in the canvas to edit the text directly.
            </div>

            <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Heading Level</label>
                <select value={p.level} onChange={e => set('level', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                    <option value="h1">H1 (Main Page Title)</option>
                    <option value="h2">H2 (Section Heading)</option>
                    <option value="h3">H3 (Sub-section)</option>
                    <option value="h4">H4 (Small Heading)</option>
                    <option value="h5">H5</option>
                    <option value="h6">H6</option>
                </select>
            </div>

            <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Alignment</label>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                    {['left', 'center', 'right'].map(a => (
                        <button key={a} type="button" onClick={() => set('textAlign', a)}
                            className={`flex-1 py-1.5 text-xs font-medium transition capitalize ${p.textAlign === a ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            {a}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-gray-500 font-medium">Font Size</label>
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{p.fontSize}px</span>
                </div>
                <input type="range" min="16" max="96" value={p.fontSize} onChange={e => set('fontSize', parseInt(e.target.value))} className="w-full accent-indigo-500" />
            </div>

            <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Font Weight</label>
                <select value={p.fontWeight} onChange={e => set('fontWeight', e.target.value)} className="w-full text-sm rounded-lg border-gray-300">
                    <option value="400">Normal (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                    <option value="800">Extra Bold (800)</option>
                    <option value="900">Black (900)</option>
                </select>
            </div>

            <div className="flex items-center justify-between">
                <label className="text-xs text-gray-600 font-medium">Text Color</label>
                <input type="color" value={p.color} onChange={e => set('color', e.target.value)} className="block w-10 h-8 rounded border border-gray-200 cursor-pointer p-0" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Top Padding ({p.paddingTop}px)</label>
                    <input type="range" min={0} max={100} value={p.paddingTop} onChange={e => set('paddingTop', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Bottom Padding ({p.paddingBottom}px)</label>
                    <input type="range" min={0} max={100} value={p.paddingBottom} onChange={e => set('paddingBottom', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                </div>
            </div>
        </div>
    );
};

HeadlineWidget.craft = {
    displayName: 'Headline',
    props: {
        text: 'This is a Catchy Headline',
        level: 'h2',
        textAlign: 'center',
        color: '#0f172a',
        fontSize: 36,
        fontWeight: '800',
        paddingTop: 20,
        paddingBottom: 10,
    },
    related: { settings: HeadlineSettings },
};