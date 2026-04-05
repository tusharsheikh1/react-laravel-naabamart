import React, { useCallback, useEffect, useState } from 'react';
import { useEditor } from '@craftjs/core';
import { TemplateGallery } from './TemplateGallery';

// ─── Tracking Scripts Modal ────────────────────────────────────────────────
const TrackingModal = ({ page, onClose, onSave }) => {
    const [scripts, setScripts] = useState({
        fb_pixels    : page?.tracking_scripts?.fb_pixels    || '',
        ga_tags      : page?.tracking_scripts?.ga_tags      || '',
        custom_css   : page?.tracking_scripts?.custom_css   || '',
        custom_js    : page?.tracking_scripts?.custom_js    || '',
    });

    const handle = (key, val) => setScripts(s => ({ ...s, [key]: val }));

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
        }}>
            <div style={{
                backgroundColor: '#fff', borderRadius: 16,
                width: '100%', maxWidth: 600,
                maxHeight: '90vh', overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>⚙️ Tracking & Custom Code</h3>
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Facebook Pixel, Google Analytics, custom CSS & JS</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', padding: '4px 8px' }}>✕</button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="space-y-5">

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook Pixel ID(s)</label>
                        <p className="text-xs text-gray-400 mb-2">Comma-separated if multiple: <code className="bg-gray-100 px-1 rounded">123456789, 987654321</code></p>
                        <input
                            type="text"
                            value={scripts.fb_pixels}
                            onChange={e => handle('fb_pixels', e.target.value)}
                            placeholder="e.g. 1234567890123"
                            className="w-full text-sm border-gray-300 rounded-lg px-3 py-2.5 border focus:outline-none focus:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Google Tag / Analytics ID(s)</label>
                        <p className="text-xs text-gray-400 mb-2">e.g. <code className="bg-gray-100 px-1 rounded">G-XXXXXXXXXX</code> or <code className="bg-gray-100 px-1 rounded">GTM-XXXXXXX</code></p>
                        <input
                            type="text"
                            value={scripts.ga_tags}
                            onChange={e => handle('ga_tags', e.target.value)}
                            placeholder="e.g. G-ABC123456"
                            className="w-full text-sm border-gray-300 rounded-lg px-3 py-2.5 border focus:outline-none focus:border-indigo-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Custom CSS</label>
                        <p className="text-xs text-gray-400 mb-2">Injected into <code className="bg-gray-100 px-1 rounded">&lt;style&gt;</code> on the live page. No need for <code>&lt;style&gt;</code> tags.</p>
                        <textarea
                            rows={5}
                            value={scripts.custom_css}
                            onChange={e => handle('custom_css', e.target.value)}
                            placeholder={`.my-section { background: red; }\n:root { --theme-color: #16a34a; }`}
                            className="w-full text-xs font-mono border-gray-300 rounded-lg px-3 py-2.5 border focus:outline-none focus:border-indigo-400 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Custom JavaScript</label>
                        <p className="text-xs text-gray-400 mb-2">Injected at end of <code className="bg-gray-100 px-1 rounded">&lt;body&gt;</code>. No need for <code>&lt;script&gt;</code> tags.</p>
                        <textarea
                            rows={5}
                            value={scripts.custom_js}
                            onChange={e => handle('custom_js', e.target.value)}
                            placeholder={`console.log('Page loaded');\nwindow.addEventListener('lp_conversion', e => { /* track conversion */ });`}
                            className="w-full text-xs font-mono border-gray-300 rounded-lg px-3 py-2.5 border focus:outline-none focus:border-indigo-400 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        Cancel
                    </button>
                    <button onClick={() => { onSave(scripts); onClose(); }}
                        className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm">
                        Save Tracking Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Topbar ───────────────────────────────────────────────────────────
export const Topbar = ({ onSave, device, setDevice, saving, saveStatus, pageTitle, pageSlug, page, onSaveTracking }) => {
    const { query, canUndo, canRedo, actions: { history } } = useEditor((state, query) => ({
        canUndo: query.history.canUndo(),
        canRedo: query.history.canRedo(),
    }));

    const [showTracking,  setShowTracking]  = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const handleSave = useCallback(() => {
        const json = query.serialize();
        onSave(json);
    }, [query, onSave]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [handleSave]);

    const devices = [
        { key: 'desktop', icon: '🖥', label: 'Desktop' },
        { key: 'tablet',  icon: '📱', label: 'Tablet'  },
        { key: 'mobile',  icon: '📲', label: 'Mobile'  },
    ];

    return (
        <>
            {/* ── Modals ── */}
            {showTracking  && (
                <TrackingModal
                    page={page}
                    onClose={() => setShowTracking(false)}
                    onSave={onSaveTracking}
                />
            )}
            {showTemplates && (
                <TemplateGallery onClose={() => setShowTemplates(false)} />
            )}

            <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm z-10 shrink-0">

                {/* Left: Back + Undo/Redo + title */}
                <div className="flex gap-1 items-center min-w-0">
                    <a href="/admin/landing-pages"
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition mr-1 text-sm"
                        title="Back to pages">
                        Back
                    </a>
                    <button disabled={!canUndo} onClick={() => history.undo()} title="Undo (Ctrl+Z)"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 text-sm transition">
                        ↩ Undo
                    </button>
                    <button disabled={!canRedo} onClick={() => history.redo()} title="Redo (Ctrl+Y)"
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-30 text-sm transition">
                        ↪ Redo
                    </button>
                    <span className="hidden md:block ml-3 text-sm font-semibold text-gray-700 truncate max-w-[180px]">
                        {pageTitle || 'Untitled Page'}
                    </span>
                </div>

                {/* Center: Viewport toggles */}
                <div className="flex bg-gray-100 p-1 rounded-xl gap-0.5">
                    {devices.map(({ key, icon, label }) => (
                        <button key={key} onClick={() => setDevice(key)} title={label}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${device === key ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                            <span>{icon}</span>
                            <span className="hidden md:inline">{label}</span>
                        </button>
                    ))}
                </div>

                {/* Right: Templates + Tracking + Preview + Save */}
                <div className="flex gap-2 items-center">

                    {/* ── TEMPLATES BUTTON ── */}
                    <button
                        onClick={() => setShowTemplates(true)}
                        title="প্রি-বিল্ট টেমপ্লেট"
                        className="hidden sm:flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition"
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff',
                            boxShadow: '0 2px 12px rgba(99,102,241,0.35)',
                            border: 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                        <span>✨</span>
                        <span className="hidden lg:inline">টেমপ্লেট</span>
                    </button>

                    <button
                        onClick={() => setShowTracking(true)}
                        title="Tracking & Custom Code"
                        className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                        ⚙️ <span className="hidden lg:inline">Tracking</span>
                    </button>

                    {pageSlug && (
                        <a href={`/lp/${pageSlug}`} target="_blank" rel="noreferrer"
                            className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                            Preview
                        </a>
                    )}

                    <button onClick={handleSave} disabled={saving} title="Save (Ctrl+S)"
                        className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all shadow-sm ${
                            saving          ? 'bg-indigo-400 cursor-not-allowed'
                          : saveStatus === 'success' ? 'bg-green-500'
                          : saveStatus === 'error'   ? 'bg-red-500'
                          :                           'bg-indigo-600 hover:bg-indigo-700'
                        }`}>
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Saving…
                            </span>
                        ) : saveStatus === 'success' ? '✓ Saved!'
                          : saveStatus === 'error'   ? '✕ Error'
                          :                           'Save & Publish'}
                    </button>
                </div>
            </div>
        </>
    );
};