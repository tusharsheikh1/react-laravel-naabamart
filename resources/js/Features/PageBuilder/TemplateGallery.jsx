import React, { useState, useMemo } from 'react';
import { useEditor } from '@craftjs/core';
import { TEMPLATES } from './PageTemplates';

/**
 * TemplateGallery  (Improved)
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsive, searchable, filterable modal for picking a pre-built template.
 *
 * Props:
 *   onClose — callback to close the modal
 */
export const TemplateGallery = ({ onClose }) => {
    const { actions } = useEditor();
    const [selected, setSelected]     = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading]       = useState(false);
    const [search, setSearch]         = useState('');
    const [activeTag, setActiveTag]   = useState('সব');

    /* ── Derive unique category tags from templates ── */
    const allTags = useMemo(() => {
        const tags = new Set();
        TEMPLATES.forEach(t => { if (t.category) tags.add(t.category); });
        return ['সব', ...Array.from(tags)];
    }, []);

    /* ── Filtered list ── */
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return TEMPLATES.filter(t => {
            const matchTag = activeTag === 'সব' || t.category === activeTag;
            const matchSearch =
                !q ||
                (t.name || '').toLowerCase().includes(q) ||
                (t.nameEn || '').toLowerCase().includes(q) ||
                (t.description || '').toLowerCase().includes(q);
            return matchTag && matchSearch;
        });
    }, [search, activeTag]);

    const handleApply = () => {
        if (!selected) return;
        setLoading(true);
        setTimeout(() => {
            try {
                actions.deserialize(selected.json);
                onClose();
            } catch (err) {
                console.error('Template deserialise error', err);
                alert('টেমপ্লেট লোড করতে সমস্যা হয়েছে। পেজ রিফ্রেশ করুন।');
            } finally {
                setLoading(false);
            }
        }, 80);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', sans-serif",
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

                @keyframes spin    { to { transform: rotate(360deg); } }
                @keyframes fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes modalIn { from { opacity: 0; transform: scale(0.97) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }

                .tg-modal { animation: modalIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

                /* ── Grid ── */
                .tg-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }
                @media (max-width: 720px) {
                    .tg-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .tg-grid { grid-template-columns: 1fr; }
                    .tg-footer-row { flex-direction: column !important; align-items: stretch !important; }
                    .tg-footer-row > p { text-align: center; }
                    .tg-footer-btns { justify-content: center; }
                    .tg-header-actions { flex-direction: column !important; gap: 8px !important; }
                }

                /* ── Cards ── */
                .tg-card {
                    background: #ffffff;
                    border: 2px solid #e8edf5;
                    border-radius: 18px;
                    padding: 0;
                    cursor: pointer;
                    text-align: left;
                    overflow: hidden;
                    transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                    outline: none;
                    display: flex;
                    flex-direction: column;
                }
                .tg-card:hover {
                    border-color: #c7d2e8;
                    box-shadow: 0 8px 24px -6px rgba(0,0,0,0.10);
                    transform: translateY(-3px);
                }
                .tg-card.tg-selected {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.18), 0 10px 28px -8px rgba(79,70,229,0.22);
                    transform: translateY(-3px);
                }

                /* ── Preview area ── */
                .tg-preview {
                    height: 120px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .tg-preview-noise {
                    position: absolute; inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
                    opacity: 0.35;
                    pointer-events: none;
                }
                .tg-preview-lines {
                    position: absolute; inset: 0; pointer-events: none;
                }

                /* ── Tags ── */
                .tg-tag-btn {
                    border: 1.5px solid #e2e8f0;
                    background: #fff;
                    color: #475569;
                    border-radius: 999px;
                    padding: 5px 14px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.15s ease;
                    font-family: inherit;
                }
                .tg-tag-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
                .tg-tag-btn.active {
                    background: #4f46e5; border-color: #4f46e5;
                    color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,0.25);
                }

                /* ── Search ── */
                .tg-search {
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 8px 14px 8px 36px;
                    font-size: 13px;
                    color: #0f172a;
                    outline: none;
                    transition: border-color 0.15s;
                    background: #fff;
                    font-family: inherit;
                    width: 220px;
                    min-width: 0;
                }
                .tg-search:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.12); }
                @media (max-width: 520px) { .tg-search { width: 100%; } }

                /* ── Footer buttons ── */
                .tg-btn {
                    border: none; border-radius: 11px;
                    padding: 10px 22px; font-size: 14px; font-weight: 700;
                    cursor: pointer; font-family: inherit;
                    display: inline-flex; align-items: center; gap: 7px;
                    transition: all 0.18s ease;
                    white-space: nowrap;
                }
                .tg-btn-cancel {
                    background: #fff; border: 1.5px solid #cbd5e1; color: #475569;
                }
                .tg-btn-cancel:hover { background: #f8fafc; color: #1e293b; }
                .tg-btn-apply {
                    background: #4f46e5; color: #fff;
                    box-shadow: 0 4px 14px rgba(79,70,229,0.28);
                }
                .tg-btn-apply:hover { background: #4338ca; }
                .tg-btn-apply:disabled {
                    background: #f1f5f9; color: #94a3b8;
                    cursor: not-allowed; box-shadow: none;
                }
                .tg-btn-danger {
                    background: #e11d48; color: #fff;
                    box-shadow: 0 4px 14px rgba(225,29,72,0.26);
                }
                .tg-btn-danger:hover { background: #be123c; }

                /* ── Empty state ── */
                .tg-empty {
                    grid-column: 1 / -1;
                    display: flex; flex-direction: column;
                    align-items: center; justify-content: center;
                    padding: 56px 20px; gap: 12px; color: #94a3b8;
                }

                /* ── Badge ── */
                .tg-badge {
                    font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
                    text-transform: uppercase; padding: 2px 8px; border-radius: 999px;
                    background: rgba(255,255,255,0.28); color: rgba(255,255,255,0.9);
                    position: absolute; top: 10px; left: 12px;
                    backdrop-filter: blur(4px);
                    border: 1px solid rgba(255,255,255,0.3);
                }

                /* ── Selected checkmark ── */
                .tg-check {
                    position: absolute; top: 10px; right: 10px;
                    width: 26px; height: 26px; border-radius: 50%;
                    background: #4f46e5; color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 13px; font-weight: 900;
                    box-shadow: 0 2px 8px rgba(79,70,229,0.45);
                    animation: fadeIn 0.2s ease;
                }

                /* ── Dot palette ── */
                .tg-dots {
                    position: absolute; bottom: 10px; right: 12px;
                    display: flex; gap: 5px;
                }
                .tg-dot {
                    width: 12px; height: 12px; border-radius: 50%;
                    border: 2px solid rgba(255,255,255,0.7);
                    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
                }

                /* ── Fake UI lines in preview ── */
                .tg-ui-line {
                    position: absolute;
                    border-radius: 4px;
                    background: rgba(255,255,255,0.35);
                }

                /* ── Scrollbar ── */
                .tg-scroll::-webkit-scrollbar { width: 6px; }
                .tg-scroll::-webkit-scrollbar-track { background: transparent; }
                .tg-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 9px; }
                .tg-scroll::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>

            {/* ── Modal shell ── */}
            <div className="tg-modal" style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                width: '100%',
                maxWidth: 960,
                maxHeight: '92vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.06)',
            }}>

                {/* ══ Header ══ */}
                <div style={{
                    padding: '24px 28px 16px',
                    borderBottom: '1px solid #f1f5f9',
                    flexShrink: 0,
                }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: 13,
                                background: 'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                                flexShrink: 0,
                            }}>🎨</div>
                            <div>
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                                    প্রি-বিল্ট ল্যান্ডিং পেজ টেমপ্লেট
                                </h2>
                                <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                                    একটি টেমপ্লেট বেছে নিন — সব উইজেট, স্টাইল ও কন্টেন্ট স্বয়ংক্রিয়ভাবে লোড হয়ে যাবে।
                                </p>
                            </div>
                        </div>
                        {/* Close */}
                        <button
                            onClick={onClose}
                            style={{
                                background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#64748b',
                                borderRadius: 10, width: 36, height: 36, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, flexShrink: 0, lineHeight: 1,
                                fontFamily: 'inherit', transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background='#f1f5f9'; e.currentTarget.style.color='#1e293b'; }}
                            onMouseLeave={e => { e.currentTarget.style.background='#f8fafc'; e.currentTarget.style.color='#64748b'; }}
                        >✕</button>
                    </div>

                    {/* Search + Filter row */}
                    <div className="tg-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {/* Search */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                            <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input
                                className="tg-search"
                                type="text"
                                placeholder="টেমপ্লেট খুঁজুন…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Category tags */}
                        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    className={`tg-tag-btn ${activeTag === tag ? 'active' : ''}`}
                                    onClick={() => setActiveTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        {/* Count badge */}
                        <div style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
                            {filtered.length} টেমপ্লেট
                        </div>
                    </div>
                </div>

                {/* ══ Grid ══ */}
                <div className="tg-scroll" style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 28px',
                    backgroundColor: '#f8fafc',
                }}>
                    <div className="tg-grid">
                        {filtered.length === 0 ? (
                            <div className="tg-empty">
                                <span style={{ fontSize: 44 }}>🔍</span>
                                <p style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#64748b' }}>কোনো টেমপ্লেট পাওয়া যায়নি</p>
                                <p style={{ margin: 0, fontSize: 13 }}>অনুগ্রহ করে অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন।</p>
                            </div>
                        ) : filtered.map(tmpl => {
                            const isSelected = selected?.id === tmpl.id;
                            const p = tmpl.palette || ['#6366f1', '#8b5cf6', '#ec4899'];

                            return (
                                <button
                                    key={tmpl.id}
                                    type="button"
                                    onClick={() => setSelected(tmpl)}
                                    className={`tg-card ${isSelected ? 'tg-selected' : ''}`}
                                >
                                    {/* ── Colour preview area ── */}
                                    <div
                                        className="tg-preview"
                                        style={{ background: `linear-gradient(135deg, ${p[0]} 0%, ${p[1]} 55%, ${p[2] || p[1]}88 100%)` }}
                                    >
                                        {/* noise overlay */}
                                        <div className="tg-preview-noise" />

                                        {/* Fake UI wireframe lines */}
                                        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 5, opacity: 0.4 }}>
                                            <div style={{ height: 6, width: '72%', borderRadius: 4, background: 'rgba(255,255,255,0.6)' }} />
                                            <div style={{ height: 4, width: '55%', borderRadius: 4, background: 'rgba(255,255,255,0.4)' }} />
                                            <div style={{ height: 4, width: '40%', borderRadius: 4, background: 'rgba(255,255,255,0.3)' }} />
                                        </div>

                                        {/* Category badge */}
                                        {tmpl.category && (
                                            <span className="tg-badge">{tmpl.category}</span>
                                        )}

                                        {/* Selected checkmark */}
                                        {isSelected && <div className="tg-check">✓</div>}

                                        {/* Emoji centered */}
                                        <span style={{ fontSize: 40, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))', position: 'relative', zIndex: 1 }}>
                                            {tmpl.emoji}
                                        </span>

                                        {/* Palette dots */}
                                        <div className="tg-dots">
                                            {p.map((c, i) => (
                                                <div key={i} className="tg-dot" style={{ backgroundColor: c }} />
                                            ))}
                                        </div>
                                    </div>

                                    {/* ── Card body ── */}
                                    <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {/* Name */}
                                        <div style={{
                                            fontSize: 15, fontWeight: 700,
                                            color: isSelected ? '#3730a3' : '#0f172a',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                        }}>
                                            {tmpl.name}
                                            {isSelected && (
                                                <span style={{ fontSize: 10, fontWeight: 700, background: '#ede9fe', color: '#4f46e5', borderRadius: 6, padding: '1px 6px' }}>
                                                    নির্বাচিত
                                                </span>
                                            )}
                                        </div>

                                        {/* English name */}
                                        {tmpl.nameEn && (
                                            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                                {tmpl.nameEn}
                                            </div>
                                        )}

                                        {/* Description */}
                                        {tmpl.description && (
                                            <p style={{
                                                fontSize: 12, color: '#64748b', lineHeight: 1.6,
                                                margin: '4px 0 0', display: '-webkit-box',
                                                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                            }}>
                                                {tmpl.description}
                                            </p>
                                        )}

                                        {/* Widget count / meta */}
                                        {tmpl.widgetCount && (
                                            <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round">
                                                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                                                </svg>
                                                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
                                                    {tmpl.widgetCount} টি উইজেট
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ══ Footer ══ */}
                <div className="tg-footer-row" style={{
                    padding: '16px 28px',
                    borderTop: '1px solid #e8edf5',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12, flexShrink: 0,
                    backgroundColor: '#fff',
                }}>
                    <p style={{ fontSize: 13, color: '#475569', margin: 0, fontWeight: 500, flex: 1, minWidth: 0 }}>
                        {selected
                            ? <span>
                                <strong style={{ color: '#0f172a' }}>"{selected.name}"</strong> নির্বাচিত।{' '}
                                <span style={{ color: '#dc2626' }}>বর্তমান ডিজাইন মুছে যাবে।</span>
                              </span>
                            : 'এগিয়ে যেতে যেকোনো একটি টেমপ্লেট নির্বাচন করুন।'}
                    </p>

                    <div className="tg-footer-btns" style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                        <button onClick={onClose} className="tg-btn tg-btn-cancel">
                            বাতিল করুন
                        </button>

                        {!confirming ? (
                            <button
                                disabled={!selected}
                                onClick={() => setConfirming(true)}
                                className="tg-btn tg-btn-apply"
                                style={{ cursor: selected ? 'pointer' : 'not-allowed' }}
                            >
                                টেমপ্লেট ব্যবহার করুন →
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: 8, animation: 'fadeIn 0.25s ease' }}>
                                <button onClick={() => setConfirming(false)} className="tg-btn tg-btn-cancel">
                                    না, ফিরে যান
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={loading}
                                    className={`tg-btn ${loading ? 'tg-btn-apply' : 'tg-btn-danger'}`}
                                    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                                >
                                    {loading ? (
                                        <>
                                            <svg style={{ animation: 'spin 0.8s linear infinite', width: 15, height: 15 }} viewBox="0 0 24 24" fill="none">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                                                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                            লোড হচ্ছে…
                                        </>
                                    ) : '⚠️ হ্যাঁ, কনফার্ম করুন'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};