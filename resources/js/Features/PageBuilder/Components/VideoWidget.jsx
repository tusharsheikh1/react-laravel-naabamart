import React from 'react';
import { useNode } from '@craftjs/core';

const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube (Supports standard watch, youtu.be, and shorts)
    const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    
    // Direct embed URL passed as-is
    return url;
};

export const VideoWidget = ({ videoUrl, aspectRatio, borderRadius, shadow, maxWidth, bgColor, padding, caption }) => {
    const { connectors: { connect, drag } } = useNode();
    const embedUrl = getEmbedUrl(videoUrl);

    const padMap = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '9:16': '177.78%' };

    return (
        <div ref={ref => connect(drag(ref))} style={{ backgroundColor: bgColor, padding: `${padding}px` }}>
            <div style={{ maxWidth: `${maxWidth}%`, margin: '0 auto' }}>
                <div style={{
                    position: 'relative',
                    paddingBottom: padMap[aspectRatio] || '56.25%',
                    borderRadius: `${borderRadius}px`,
                    overflow: 'hidden',
                    boxShadow: shadow ? '0 20px 60px rgba(0,0,0,0.2)' : 'none',
                }}>
                    {embedUrl ? (
                        <iframe
                            src={embedUrl}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#94a3b8' }}>
                            <div className="text-center">
                                <div className="text-4xl mb-2">▶️</div>
                                <p className="text-sm">Paste a YouTube or Vimeo URL in settings</p>
                            </div>
                        </div>
                    )}
                </div>
                {caption && <p style={{ textAlign: 'center', marginTop: '12px', color: '#6b7280', fontSize: '14px' }}>{caption}</p>}
            </div>
        </div>
    );
};

const VideoSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Video URL (YouTube or Vimeo)</label>
                <input type="text" value={p.videoUrl} onChange={e => setProp(pr => pr.videoUrl = e.target.value)} placeholder="https://youtube.com/watch?v=..." className="w-full mt-1 text-sm border-gray-300 rounded-md" />
            </div>
            <div>
                <label className="text-sm font-medium">Aspect Ratio</label>
                <select value={p.aspectRatio} onChange={e => setProp(pr => pr.aspectRatio = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                    <option value="16:9">16:9 (Widescreen)</option>
                    <option value="4:3">4:3 (Standard)</option>
                    <option value="1:1">1:1 (Square)</option>
                    <option value="9:16">9:16 (Vertical)</option>
                </select>
            </div>
            <div>
                <label className="text-xs text-gray-500">Max Width ({p.maxWidth}%)</label>
                <input type="range" min="30" max="100" value={p.maxWidth} onChange={e => setProp(pr => pr.maxWidth = parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
                <label className="text-xs text-gray-500">Border Radius ({p.borderRadius}px)</label>
                <input type="range" min="0" max="30" value={p.borderRadius} onChange={e => setProp(pr => pr.borderRadius = parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
                <label className="text-xs text-gray-500">Padding ({p.padding}px)</label>
                <input type="range" min="0" max="80" value={p.padding} onChange={e => setProp(pr => pr.padding = parseInt(e.target.value))} className="w-full" />
            </div>
            <div>
                <label className="text-sm font-medium">Caption (optional)</label>
                <input type="text" value={p.caption} onChange={e => setProp(pr => pr.caption = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md" />
            </div>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Background Color</label>
                <input type="color" value={p.bgColor} onChange={e => setProp(pr => pr.bgColor = e.target.value)} className="h-8 w-14 rounded" />
            </div>
            <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.shadow} onChange={e => setProp(pr => pr.shadow = e.target.checked)} className="rounded" />
                <span className="text-sm">Drop Shadow</span>
            </label>
        </div>
    );
};

VideoWidget.craft = {
    displayName: 'Video Embed',
    props: { videoUrl: '', aspectRatio: '16:9', borderRadius: 12, shadow: true, maxWidth: 85, bgColor: '#f8fafc', padding: 40, caption: '' },
    related: { settings: VideoSettings },
};