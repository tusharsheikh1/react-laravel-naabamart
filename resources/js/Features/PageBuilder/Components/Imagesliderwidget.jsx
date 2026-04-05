import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

// ─── Main Widget ───────────────────────────────────────────────────────────
export const ImageSliderWidget = ({
    images,
    headline,
    showHeadline,
    headlineColor,
    headlineFontSize,
    headlineWeight,
    autoPlay,
    autoPlayInterval,
    showDots,
    showArrows,
    borderRadius,
    aspectRatio,
    objectFit,
    bgColor,
    paddingTop,
    paddingBottom,
    paddingLeft,
    paddingRight,
    transitionSpeed,
    overlayColor,
    overlayOpacity,
    captionBgColor,
    captionTextColor,
    showCaptions,
}) => {
    const { connectors: { connect, drag } } = useNode();
    const [current, setCurrent] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const timerRef = useRef(null);

    const validImages = images.filter(img => img.url);

    const goTo = useCallback((index) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrent(index);
        setTimeout(() => setIsTransitioning(false), transitionSpeed);
    }, [isTransitioning, transitionSpeed]);

    const next = useCallback(() => {
        goTo((current + 1) % Math.max(validImages.length, 1));
    }, [current, validImages.length, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + Math.max(validImages.length, 1)) % Math.max(validImages.length, 1));
    }, [current, validImages.length, goTo]);

    useEffect(() => {
        if (!autoPlay || validImages.length <= 1) return;
        timerRef.current = setInterval(next, autoPlayInterval * 1000);
        return () => clearInterval(timerRef.current);
    }, [autoPlay, autoPlayInterval, next, validImages.length]);

    const ratioMap = { '16:9': '56.25%', '4:3': '75%', '1:1': '100%', '3:2': '66.67%', '21:9': '42.86%', 'auto': null };
    const paddingBottom_ = ratioMap[aspectRatio];

    const arrowBtn = {
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 10,
        background: 'rgba(0,0,0,0.45)',
        color: '#fff',
        border: 'none',
        borderRadius: '50%',
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '18px',
        lineHeight: 1,
        transition: 'background 0.2s',
    };

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                backgroundColor: bgColor,
                paddingTop: `${paddingTop}px`,
                paddingBottom: `${paddingBottom}px`,
                paddingLeft: `${paddingLeft}px`,
                paddingRight: `${paddingRight}px`,
            }}
        >
            {/* Headline */}
            {showHeadline && headline && (
                <h2 style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    fontSize: `${headlineFontSize}px`,
                    fontWeight: headlineWeight,
                    color: headlineColor,
                    lineHeight: 1.25,
                }}>
                    {headline}
                </h2>
            )}

            {/* Slider container */}
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: `${borderRadius}px`,
                ...(paddingBottom_ ? { paddingBottom: paddingBottom_ } : {}),
                background: '#f1f5f9',
                userSelect: 'none',
            }}>
                {validImages.length === 0 ? (
                    /* Empty state */
                    <div style={{
                        padding: '60px 24px',
                        textAlign: 'center',
                        color: '#94a3b8',
                        ...(paddingBottom_ ? { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } : {}),
                    }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>🖼️</div>
                        <p style={{ fontSize: 14 }}>Add images in settings to build your slider</p>
                    </div>
                ) : (
                    <>
                        {/* Slides */}
                        {validImages.map((img, i) => (
                            <div
                                key={i}
                                style={{
                                    position: paddingBottom_ ? 'absolute' : 'relative',
                                    inset: 0,
                                    opacity: i === current ? 1 : 0,
                                    transition: `opacity ${transitionSpeed}ms ease`,
                                    zIndex: i === current ? 1 : 0,
                                }}
                            >
                                <img
                                    src={img.url}
                                    alt={img.caption || `Slide ${i + 1}`}
                                    style={{
                                        width: '100%',
                                        height: paddingBottom_ ? '100%' : 'auto',
                                        display: 'block',
                                        objectFit,
                                    }}
                                />

                                {/* Overlay */}
                                {overlayOpacity > 0 && (
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        backgroundColor: overlayColor,
                                        opacity: overlayOpacity / 100,
                                        pointerEvents: 'none',
                                    }} />
                                )}

                                {/* Caption */}
                                {showCaptions && img.caption && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0, left: 0, right: 0,
                                        backgroundColor: captionBgColor,
                                        color: captionTextColor,
                                        padding: '10px 16px',
                                        fontSize: '14px',
                                        fontWeight: 500,
                                        textAlign: 'center',
                                    }}>
                                        {img.caption}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Arrows */}
                        {showArrows && validImages.length > 1 && (
                            <>
                                <button onClick={prev} style={{ ...arrowBtn, left: 12 }} title="Previous">‹</button>
                                <button onClick={next} style={{ ...arrowBtn, right: 12 }} title="Next">›</button>
                            </>
                        )}

                        {/* Dots */}
                        {showDots && validImages.length > 1 && (
                            <div style={{
                                position: 'absolute',
                                bottom: 12, left: 0, right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '6px',
                                zIndex: 10,
                            }}>
                                {validImages.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goTo(i)}
                                        style={{
                                            width: i === current ? 20 : 8,
                                            height: 8,
                                            borderRadius: 4,
                                            border: 'none',
                                            cursor: 'pointer',
                                            backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                                            transition: 'all 0.3s',
                                            padding: 0,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Settings Panel ────────────────────────────────────────────────────────
const SliderSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const set = (key, val) => setProp(pr => { pr[key] = val; });

    const [uploadingIndex, setUploadingIndex] = useState(null);

    const addImage = () => setProp(pr => { pr.images.push({ url: '', caption: '' }); });
    const removeImage = (i) => setProp(pr => { pr.images.splice(i, 1); });
    const setImage = (i, field, val) => setProp(pr => { pr.images[i][field] = val; });
    const moveImage = (i, dir) => setProp(pr => {
        const to = i + dir;
        if (to < 0 || to >= pr.images.length) return;
        [pr.images[i], pr.images[to]] = [pr.images[to], pr.images[i]];
    });

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingIndex(index);
        try {
            const response = await axios.post('/admin/landing-pages/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.url) {
                setImage(index, 'url', response.data.url);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please ensure it is a valid image file under 5MB.");
        } finally {
            setUploadingIndex(null);
            e.target.value = null; // Reset the file input
        }
    };

    return (
        <div className="space-y-4 pb-6">

            {/* Headline */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Headline</div>
                <div className="p-3 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p.showHeadline} onChange={e => set('showHeadline', e.target.checked)} className="rounded" />
                        <span className="text-sm">Show Headline</span>
                    </label>
                    {p.showHeadline && (
                        <>
                            <input type="text" value={p.headline} onChange={e => set('headline', e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg px-3 py-2" placeholder="Slider headline..." />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Font Size ({p.headlineFontSize}px)</label>
                                    <input type="range" min={16} max={60} value={p.headlineFontSize} onChange={e => set('headlineFontSize', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 block mb-1">Color</label>
                                    <input type="color" value={p.headlineColor} onChange={e => set('headlineColor', e.target.value)} className="block w-full h-8 rounded border border-gray-200 cursor-pointer" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Weight</label>
                                <select value={p.headlineWeight} onChange={e => set('headlineWeight', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                                    {['400','600','700','800','900'].map(w => <option key={w} value={w}>{w}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Behavior */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Behavior</div>
                <div className="p-3 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p.autoPlay} onChange={e => set('autoPlay', e.target.checked)} className="rounded" />
                        <span className="text-sm">Auto Play</span>
                    </label>
                    {p.autoPlay && (
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Interval ({p.autoPlayInterval}s)</label>
                            <input type="range" min={1} max={10} step={0.5} value={p.autoPlayInterval} onChange={e => set('autoPlayInterval', parseFloat(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                    )}
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Transition Speed ({p.transitionSpeed}ms)</label>
                        <input type="range" min={100} max={1000} step={50} value={p.transitionSpeed} onChange={e => set('transitionSpeed', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p.showArrows} onChange={e => set('showArrows', e.target.checked)} className="rounded" />
                        <span className="text-sm">Show Arrows</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p.showDots} onChange={e => set('showDots', e.target.checked)} className="rounded" />
                        <span className="text-sm">Show Dot Indicators</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={p.showCaptions} onChange={e => set('showCaptions', e.target.checked)} className="rounded" />
                        <span className="text-sm">Show Captions</span>
                    </label>
                </div>
            </div>

            {/* Appearance */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">Appearance</div>
                <div className="p-3 space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Aspect Ratio</label>
                        <select value={p.aspectRatio} onChange={e => set('aspectRatio', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                            <option value="16:9">16:9 Widescreen</option>
                            <option value="4:3">4:3 Standard</option>
                            <option value="3:2">3:2</option>
                            <option value="1:1">1:1 Square</option>
                            <option value="21:9">21:9 Ultrawide</option>
                            <option value="auto">Auto (natural height)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Image Fit</label>
                        <select value={p.objectFit} onChange={e => set('objectFit', e.target.value)} className="w-full text-xs border-gray-300 rounded-lg">
                            <option value="cover">Cover (crop to fill)</option>
                            <option value="contain">Contain (letterbox)</option>
                            <option value="fill">Stretch</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Border Radius ({p.borderRadius}px)</label>
                        <input type="range" min={0} max={40} value={p.borderRadius} onChange={e => set('borderRadius', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600">Background Color</label>
                        <input type="color" value={p.bgColor} onChange={e => set('bgColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600">Overlay Color</label>
                        <input type="color" value={p.overlayColor} onChange={e => set('overlayColor', e.target.value)} className="h-6 w-8 rounded border border-gray-200 cursor-pointer" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Overlay Opacity ({p.overlayOpacity}%)</label>
                        <input type="range" min={0} max={80} value={p.overlayOpacity} onChange={e => set('overlayOpacity', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Pad Top ({p.paddingTop}px)</label>
                            <input type="range" min={0} max={100} value={p.paddingTop} onChange={e => set('paddingTop', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Pad Bottom ({p.paddingBottom}px)</label>
                            <input type="range" min={0} max={100} value={p.paddingBottom} onChange={e => set('paddingBottom', parseInt(e.target.value))} className="w-full accent-indigo-500" />
                        </div>
                    </div>
                    {p.showCaptions && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Caption Bg</label>
                                <input type="color" value={p.captionBgColor} onChange={e => set('captionBgColor', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Caption Text</label>
                                <input type="color" value={p.captionTextColor} onChange={e => set('captionTextColor', e.target.value)} className="block w-full h-7 rounded border border-gray-200 cursor-pointer" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Images */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Images ({p.images.length})
                </div>
                <div className="p-3 space-y-4">
                    {p.images.map((img, i) => (
                        <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs font-bold text-gray-400 w-5 text-center">{i + 1}</span>
                                <div className="flex gap-0.5 ml-auto">
                                    <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↑</button>
                                    <button onClick={() => moveImage(i, 1)} disabled={i === p.images.length - 1} className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">↓</button>
                                    <button onClick={() => removeImage(i)} className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 font-bold text-sm">×</button>
                                </div>
                            </div>
                            
                            {img.url && (
                                <div className="h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                                    <img src={img.url} className="w-full h-full object-contain" alt="" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">Image Source</label>
                                    <input
                                        type="text"
                                        value={img.url}
                                        onChange={e => setImage(i, 'url', e.target.value)}
                                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="URL (https://... or /storage/...)"
                                    />
                                    <div className="mt-2">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={e => handleImageUpload(e, i)}
                                            disabled={uploadingIndex === i}
                                            className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                                        />
                                        {uploadingIndex === i && <p className="text-[11px] text-indigo-600 mt-1 font-medium">Uploading image...</p>}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block">Caption</label>
                                    <input
                                        type="text"
                                        value={img.caption || ''}
                                        onChange={e => setImage(i, 'caption', e.target.value)}
                                        className="w-full text-xs border-gray-300 rounded-lg px-3 py-2"
                                        placeholder="Caption (optional)"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addImage} className="w-full py-2.5 text-sm text-indigo-600 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition">
                        + Add Image Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

ImageSliderWidget.craft = {
    displayName: 'Image Slider',
    props: {
        images: [
            { url: '', caption: '' },
            { url: '', caption: '' },
        ],
        headline: 'Our Product Gallery',
        showHeadline: false,
        headlineColor: '#0f172a',
        headlineFontSize: 30,
        headlineWeight: '700',
        autoPlay: true,
        autoPlayInterval: 4,
        showDots: true,
        showArrows: true,
        showCaptions: false,
        borderRadius: 12,
        aspectRatio: '16:9',
        objectFit: 'cover',
        bgColor: 'transparent',
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        transitionSpeed: 500,
        overlayColor: '#000000',
        overlayOpacity: 0,
        captionBgColor: 'rgba(0,0,0,0.6)',
        captionTextColor: '#ffffff',
    },
    related: { settings: SliderSettings },
};