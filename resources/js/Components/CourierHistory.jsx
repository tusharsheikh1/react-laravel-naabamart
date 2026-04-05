import { useState } from 'react';

const COURIERS = ['pathao', 'steadfast', 'parceldex', 'redx', 'paperfly'];

const parseResponse = (raw) => {
    if (!raw || raw.status !== 'success' || !raw.courierData) return null;
    const cd = raw.courierData;
    const rows = COURIERS.map((key) => {
        const d = cd[key] || {};
        return {
            key,
            name:      d.name             || key,
            logo:      d.logo             || null,
            total:     d.total_parcel     ?? 0,
            success:   d.success_parcel   ?? 0,
            cancelled: d.cancelled_parcel ?? 0,
            ratio:     d.success_ratio    ?? 0,
        };
    });
    const s = cd.summary || {};
    return {
        rows,
        summary: {
            total:     s.total_parcel     ?? rows.reduce((a, r) => a + r.total,     0),
            success:   s.success_parcel   ?? rows.reduce((a, r) => a + r.success,   0),
            cancelled: s.cancelled_parcel ?? rows.reduce((a, r) => a + r.cancelled, 0),
            ratio:     s.success_ratio    ?? null,
        },
    };
};

const Spinner = () => (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '2px solid #e2e8f0', borderTopColor: '#0f172a',
            animation: 'ch-spin 0.7s linear infinite'
        }} />
    </div>
);

export default function CourierHistory({ initialHistory, fetchedAt, customerPhone, orderId }) {
    const [rawData,    setRawData]    = useState(initialHistory || null);
    const [lastFetch,  setLastFetch]  = useState(fetchedAt || null);
    const [refreshing, setRefreshing] = useState(false);
    const [error,      setError]      = useState(null);

    const refresh = async () => {
        if (!customerPhone) return;
        setRefreshing(true);
        setError(null);
        try {
            const params = new URLSearchParams({ phone: customerPhone });
            if (orderId) params.append('order_id', orderId);
            const res = await fetch(
                route('admin.orders.bdcourier.check') + '?' + params.toString(),
                { headers: { 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json' } }
            );
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setRawData(await res.json());
            setLastFetch(new Date().toISOString());
        } catch {
            setError('Failed to refresh data.');
        } finally {
            setRefreshing(false);
        }
    };

    const parsed = rawData ? parseResponse(rawData) : null;

    const formatAge = (iso) => {
        if (!iso) return null;
        const diffMs  = Date.now() - new Date(iso).getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1)  return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24)  return `${diffHr}h ago`;
        return `${Math.floor(diffHr / 24)}d ago`;
    };

    return (
        <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                @keyframes ch-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .ch-wrap { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }

                .ch-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafafa;
                }
                .ch-header-left { display: flex; align-items: center; gap: 10px; }
                .ch-icon {
                    width: 28px; height: 28px;
                    background: #0f172a;
                    border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .ch-title { font-size: 13px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
                .ch-header-right { display: flex; align-items: center; gap: 8px; }
                .ch-age { font-size: 11px; color: #94a3b8; font-weight: 500; }
                .ch-refresh-btn {
                    background: none;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    width: 26px; height: 26px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer;
                    color: #64748b;
                    transition: all 0.15s ease;
                }
                .ch-refresh-btn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #0f172a; }
                .ch-refresh-btn:disabled { opacity: 0.4; cursor: default; }
                .ch-spin-icon { animation: ch-spin 0.7s linear infinite; }

                .ch-error {
                    font-size: 12px;
                    color: #b91c1c;
                    background: #fef2f2;
                    border-bottom: 1px solid #fecaca;
                    padding: 8px 16px;
                }

                .ch-table { width: 100%; border-collapse: collapse; }
                .ch-th {
                    text-align: left;
                    padding: 8px 14px;
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafafa;
                }
                .ch-th-center { text-align: center; }
                .ch-tr { transition: background 0.1s; }
                .ch-tr:hover { background: #f8fafc; }
                .ch-td { padding: 10px 14px; border-bottom: 1px solid #f8fafc; }
                .ch-td-center { text-align: center; }
                .ch-courier-name { font-size: 12px; font-weight: 600; color: #374151; text-transform: capitalize; }
                .ch-courier-logo { height: 18px; max-width: 72px; object-fit: contain; }
                .ch-num { font-size: 13px; font-weight: 700; color: #0f172a; }

                .ch-badge-success {
                    display: inline-block;
                    min-width: 28px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #15803d;
                    background: #f0fdf4;
                    border-radius: 5px;
                    padding: 2px 8px;
                }
                .ch-badge-cancel {
                    display: inline-block;
                    min-width: 28px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #dc2626;
                    background: #fef2f2;
                    border-radius: 5px;
                    padding: 2px 8px;
                }

                .ch-tfoot-row { background: #f8fafc; border-top: 2px solid #e2e8f0; }
                .ch-tfoot-label { font-size: 11px; font-weight: 700; color: #475569; padding: 10px 14px; }
                .ch-tfoot-num { font-size: 13px; font-weight: 800; color: #0f172a; text-align: center; padding: 10px 14px; }
                .ch-badge-success-strong {
                    display: inline-block;
                    min-width: 28px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #15803d;
                    background: #dcfce7;
                    border-radius: 5px;
                    padding: 2px 8px;
                }
                .ch-badge-cancel-strong {
                    display: inline-block;
                    min-width: 28px;
                    font-size: 12px;
                    font-weight: 800;
                    color: #dc2626;
                    background: #fee2e2;
                    border-radius: 5px;
                    padding: 2px 8px;
                }

                .ch-ratio-bar { padding: 12px 16px; border-top: 1px solid #f1f5f9; display: flex; align-items: center; gap: 12px; }
                .ch-ratio-track { flex: 1; height: 5px; background: #e2e8f0; border-radius: 99px; overflow: hidden; }
                .ch-ratio-fill { height: 100%; background: #0f172a; border-radius: 99px; transition: width 0.5s ease; }
                .ch-ratio-label { font-size: 11px; font-weight: 700; color: #0f172a; white-space: nowrap; }

                .ch-empty { font-size: 12px; color: #94a3b8; text-align: center; padding: 24px 0; }
                .ch-fading { opacity: 0.4; transition: opacity 0.2s; }
            `}</style>

            <div className="ch-wrap">
                {/* Header */}
                <div className="ch-header">
                    <div className="ch-header-left">
                        <div className="ch-icon">
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zm0 0V9a1 1 0 011-1h2.5l2.5 4v4h-5l-1-1z" />
                            </svg>
                        </div>
                        <span className="ch-title">Courier History</span>
                    </div>
                    <div className="ch-header-right">
                        {lastFetch && !refreshing && (
                            <span className="ch-age">{formatAge(lastFetch)}</span>
                        )}
                        {customerPhone && (
                            <button className="ch-refresh-btn" onClick={refresh} disabled={refreshing} title="Refresh">
                                <svg className={refreshing ? 'ch-spin-icon' : ''} width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && <div className="ch-error">{error}</div>}

                {/* Spinner for initial load */}
                {refreshing && !parsed && <Spinner />}

                {/* Table */}
                {parsed && (
                    <>
                        <table className={`ch-table ${refreshing ? 'ch-fading' : ''}`}>
                            <thead>
                                <tr>
                                    <th className="ch-th">Courier</th>
                                    <th className="ch-th ch-th-center">Total</th>
                                    <th className="ch-th ch-th-center">Delivered</th>
                                    <th className="ch-th ch-th-center">Cancelled</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parsed.rows.map((row) => (
                                    <tr key={row.key} className="ch-tr">
                                        <td className="ch-td">
                                            {row.logo
                                                ? <img src={row.logo} alt={row.name} className="ch-courier-logo" />
                                                : <span className="ch-courier-name">{row.name}</span>
                                            }
                                        </td>
                                        <td className="ch-td ch-td-center">
                                            <span className="ch-num">{row.total}</span>
                                        </td>
                                        <td className="ch-td ch-td-center">
                                            <span className="ch-badge-success">{row.success}</span>
                                        </td>
                                        <td className="ch-td ch-td-center">
                                            <span className="ch-badge-cancel">{row.cancelled}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="ch-tfoot-row">
                                    <td className="ch-tfoot-label">Total</td>
                                    <td className="ch-tfoot-num">{parsed.summary.total}</td>
                                    <td className="ch-tfoot-num">
                                        <span className="ch-badge-success-strong">{parsed.summary.success}</span>
                                    </td>
                                    <td className="ch-tfoot-num">
                                        <span className="ch-badge-cancel-strong">{parsed.summary.cancelled}</span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>

                        {parsed.summary.ratio != null && (
                            <div className="ch-ratio-bar">
                                <div className="ch-ratio-track">
                                    <div className="ch-ratio-fill" style={{ width: `${parsed.summary.ratio}%` }} />
                                </div>
                                <span className="ch-ratio-label">{Number(parsed.summary.ratio).toFixed(1)}% success rate</span>
                            </div>
                        )}
                    </>
                )}

                {!refreshing && !parsed && !error && (
                    <div className="ch-empty">No data available.</div>
                )}
            </div>
        </div>
    );
}