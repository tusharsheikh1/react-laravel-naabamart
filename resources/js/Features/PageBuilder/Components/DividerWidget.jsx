import React from 'react';
import { useNode } from '@craftjs/core';

export const DividerWidget = ({ style, color, thickness, width, marginTop, marginBottom, text, textColor, bgColor }) => {
    const { connectors: { connect, drag } } = useNode();

    const borders = {
        solid: 'solid', dashed: 'dashed', dotted: 'dotted',
        double: 'double', gradient: 'solid',
    };

    const dividerStyle = style === 'gradient'
        ? { height: `${thickness}px`, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, border: 'none' }
        : { borderTop: `${thickness}px ${borders[style] || 'solid'} ${color}`, background: 'none' };

    return (
        <div ref={ref => connect(drag(ref))}
            style={{ backgroundColor: bgColor, paddingTop: `${marginTop}px`, paddingBottom: `${marginBottom}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {text ? (
                <div style={{ display: 'flex', alignItems: 'center', width: `${width}%` }}>
                    <div style={{ flex: 1, ...dividerStyle }} />
                    <span style={{ margin: '0 16px', color: textColor, fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
                    <div style={{ flex: 1, ...dividerStyle }} />
                </div>
            ) : (
                <div style={{ width: `${width}%`, ...dividerStyle }} />
            )}
        </div>
    );
};

const DividerSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    return (
        <div className="space-y-4">
            <div><label className="text-sm font-medium">Style</label>
                <select value={p.style} onChange={e => setProp(pr => pr.style = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                    <option value="solid">Solid</option><option value="dashed">Dashed</option><option value="dotted">Dotted</option><option value="double">Double</option><option value="gradient">Gradient Fade</option>
                </select>
            </div>
            <div className="flex items-center justify-between"><label className="text-sm font-medium">Line Color</label><input type="color" value={p.color} onChange={e => setProp(pr => pr.color = e.target.value)} className="h-8 w-14 rounded" /></div>
            <div><label className="text-xs text-gray-500">Thickness ({p.thickness}px)</label><input type="range" min="1" max="8" value={p.thickness} onChange={e => setProp(pr => pr.thickness = parseInt(e.target.value))} className="w-full" /></div>
            <div><label className="text-xs text-gray-500">Width ({p.width}%)</label><input type="range" min="10" max="100" value={p.width} onChange={e => setProp(pr => pr.width = parseInt(e.target.value))} className="w-full" /></div>
            <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500">Margin Top ({p.marginTop}px)</label><input type="range" min="0" max="80" value={p.marginTop} onChange={e => setProp(pr => pr.marginTop = parseInt(e.target.value))} className="w-full" /></div>
                <div><label className="text-xs text-gray-500">Margin Bottom ({p.marginBottom}px)</label><input type="range" min="0" max="80" value={p.marginBottom} onChange={e => setProp(pr => pr.marginBottom = parseInt(e.target.value))} className="w-full" /></div>
            </div>
            <div><label className="text-sm font-medium">Center Text (optional)</label><input type="text" value={p.text} onChange={e => setProp(pr => pr.text = e.target.value)} placeholder="OR  •  or leave blank" className="w-full mt-1 text-sm border-gray-300 rounded-md" /></div>
            <div className="flex items-center justify-between"><label className="text-sm font-medium">Background</label><input type="color" value={p.bgColor} onChange={e => setProp(pr => pr.bgColor = e.target.value)} className="h-8 w-14 rounded" /></div>
        </div>
    );
};

DividerWidget.craft = {
    displayName: 'Divider',
    props: { style: 'gradient', color: '#d1d5db', thickness: 1, width: 80, marginTop: 20, marginBottom: 20, text: '', textColor: '#9ca3af', bgColor: 'transparent' },
    related: { settings: DividerSettings },
};