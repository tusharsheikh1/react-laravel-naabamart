import React, { useState } from 'react';
import { useNode } from '@craftjs/core';

export const CustomCodeWidget = ({ code, paddingTop, paddingBottom, paddingLeft, paddingRight }) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
            }}
            className="w-full overflow-hidden"
        >
            {/* Renders the raw HTML/CSS/JS provided in the settings */}
            <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
    );
};

export const CustomCodeSettings = () => {
    const { actions: { setProp }, props } = useNode((node) => ({
        props: node.data.props
    }));

    return (
        <div className="pb-6">
            <div className="p-3 mb-4 bg-amber-50 text-amber-700 text-xs rounded-lg border border-amber-100 flex items-start gap-2">
                <span className="text-lg leading-none">⚠️</span>
                <span>Be careful! Custom code is not sanitized and can break the builder layout if tags are not closed properly.</span>
            </div>

            <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">HTML / CSS / Scripts</label>
                <textarea
                    value={props.code}
                    onChange={e => setProp(p => p.code = e.target.value)}
                    rows={12}
                    className="w-full text-xs font-mono p-3 bg-gray-900 text-green-400 border border-gray-700 rounded-lg focus:ring-indigo-500"
                    placeholder="<div style='color: red;'>Hello World</div>"
                />
            </div>

            <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase block border-b pb-1">Spacing (px)</label>
                <div className="grid grid-cols-2 gap-4">
                    {['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].map(key => (
                        <div key={key}>
                            <label className="text-[10px] text-gray-400 block mb-1 capitalize">{key.replace('padding', '')}</label>
                            <input 
                                type="number" 
                                value={props[key]} 
                                onChange={e => setProp(p => p[key] = parseInt(e.target.value))}
                                className="w-full text-sm border-gray-200 rounded-md"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

CustomCodeWidget.craft = {
    displayName: 'Custom Code',
    props: {
        code: '<div style="padding: 20px; background: #f3f4f6; border: 2px dashed #d1d5db; text-align: center; border-radius: 8px;">\n  <p style="margin: 0; color: #6b7280; font-family: sans-serif;">Paste your custom HTML or CSS here</p>\n</div>',
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 0,
        paddingRight: 0,
    },
    related: {
        settings: CustomCodeSettings
    }
};