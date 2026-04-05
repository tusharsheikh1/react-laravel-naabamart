import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    AreaChart, Area, BarChart, Bar, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── CONFIG & HELPERS ────────────────────────────────────────────────────────

const GRANULARITIES = [
    { key: 'minute', label: 'Minute', icon: '⏱' },
    { key: 'hour',   label: 'Hour',   icon: '⏰' },
    { key: 'day',    label: 'Day',    icon: '📅' },
    { key: 'month',  label: 'Month',  icon: '🗓' },
    { key: 'year',   label: 'Year',   icon: '📆' },
    { key: 'custom', label: 'Custom', icon: '✏️' },
];

function getDefaultRange(granularity) {
    const now = new Date();
    
    const pad = (n) => n.toString().padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const fmtDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    switch (granularity) {
        case 'minute': {
            const start = new Date(now); start.setHours(now.getHours() - 2);
            return { start: fmt(start), end: fmt(now) };
        }
        case 'hour': {
            const start = new Date(now); start.setDate(now.getDate() - 1);
            return { start: fmt(start), end: fmt(now) };
        }
        case 'day': {
            const start = new Date(now); start.setDate(now.getDate() - 30);
            return { start: fmtDate(start), end: fmtDate(now) };
        }
        case 'month': {
            const start = new Date(now); start.setFullYear(now.getFullYear() - 1);
            return { start: fmtDate(start), end: fmtDate(now) };
        }
        case 'year': {
            const start = new Date(now); start.setFullYear(now.getFullYear() - 5);
            return { start: fmtDate(start), end: fmtDate(now) };
        }
        default: {
            const start = new Date(now); start.setDate(now.getDate() - 7);
            return { start: fmt(start), end: fmt(now) };
        }
    }
}

function formatBucket(bucket, granularity) {
    try {
        switch (granularity) {
            case 'minute':
                return bucket.slice(11, 16); 
            case 'hour':
                return bucket.slice(11, 16); 
            case 'day': {
                const d = new Date(bucket + 'T00:00:00');
                return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
            }
            case 'month': {
                const [y, m] = bucket.split('-');
                return new Date(y, m - 1).toLocaleString('default', { month: 'short', year: '2-digit' });
            }
            case 'year':
                return bucket;
            default:
                return bucket;
        }
    } catch {
        return bucket;
    }
}

function formatTooltipLabel(bucket, granularity) {
    try {
        switch (granularity) {
            case 'minute':
            case 'hour':
                return new Date(bucket.replace(' ', 'T')).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
            case 'day':
                return new Date(bucket + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short', month: 'long', day: 'numeric'
                });
            case 'month': {
                const [y, m] = bucket.split('-');
                return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
            }
            case 'year':
                return `Year ${bucket}`;
            default:
                return bucket;
        }
    } catch {
        return bucket;
    }
}

const STATUS_COLORS = {
    total_orders: '#6366F1',
    pending:      '#F59E0B',
    shipped:      '#3B82F6',
    delivered:    '#10B981',
    cancelled:    '#EF4444',
    returned:     '#8B5CF6',
};

const STATUS_LABELS = {
    total_orders: 'All Orders',
    pending:      'Pending',
    shipped:      'Shipped',
    delivered:    'Delivered',
    cancelled:    'Cancelled',
    returned:     'Returned',
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function OrderTimelineChart() {
    const [granularity,  setGranularity]  = useState('day');
    const [range,        setRange]        = useState(() => getDefaultRange('day'));
    const [customStart,  setCustomStart]  = useState('');
    const [customEnd,    setCustomEnd]    = useState('');
    const [chartData,    setChartData]    = useState([]);
    const [meta,         setMeta]         = useState(null);
    const [loading,      setLoading]      = useState(false);
    const [error,        setError]        = useState(null);
    const [visibleSeries, setVisibleSeries] = useState(['total_orders']);
    const [viewMode,     setViewMode]     = useState('orders'); // 'orders' | 'revenue'
    const abortRef = useRef(null);

    const fetchData = useCallback(async (gran, start, end) => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({ granularity: gran, start, end });
            const res = await fetch(`/admin/orders/timeline?${params}`, {
                signal: abortRef.current.signal,
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            setChartData(json.data || []);
            setMeta(json.meta || null);
        } catch (e) {
            if (e.name !== 'AbortError') setError('Failed to load timeline data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (granularity === 'custom') return;
        const r = getDefaultRange(granularity);
        setRange(r);
        fetchData(granularity, r.start, r.end);
    }, [granularity]);

    const toggleSeries = (key) => {
        setVisibleSeries(prev =>
            prev.includes(key)
                ? prev.length > 1 ? prev.filter(k => k !== key) : prev
                : [...prev, key]
        );
    };

    const applyCustom = () => {
        if (!customStart || !customEnd) return;
        setRange({ start: customStart, end: customEnd });
        fetchData('custom', customStart, customEnd);
    };

    const totalOrders  = meta?.total_orders  || 0;
    const totalRevenue = meta?.total_revenue || 0;
    const peakBucket   = chartData.reduce((best, d) => d.total_orders > (best?.total_orders || 0) ? d : best, null);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* ── Card Header ── */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Order Timeline</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Order volume over time — zoom in to any granularity
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg self-start md:self-auto">
                    <button
                        onClick={() => setViewMode('orders')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'orders' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Orders
                    </button>
                    <button
                        onClick={() => setViewMode('revenue')}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === 'revenue' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Revenue
                    </button>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {/* ── Granularity Tabs ── */}
                <div className="flex flex-wrap gap-2">
                    {GRANULARITIES.map(g => (
                        <button
                            key={g.key}
                            onClick={() => setGranularity(g.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                granularity === g.key
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                        >
                            <span>{g.icon}</span>
                            {g.label}
                        </button>
                    ))}
                </div>

                {/* ── Custom Date-Time Range ── */}
                {granularity === 'custom' && (
                    <div className="flex flex-wrap items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-indigo-700">From</label>
                            <input
                                type="datetime-local"
                                value={customStart}
                                onChange={e => setCustomStart(e.target.value)}
                                className="border border-indigo-200 rounded-lg text-sm py-1.5 px-3 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-indigo-700">To</label>
                            <input
                                type="datetime-local"
                                value={customEnd}
                                onChange={e => setCustomEnd(e.target.value)}
                                className="border border-indigo-200 rounded-lg text-sm py-1.5 px-3 bg-white focus:ring-indigo-400 focus:border-indigo-400"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-transparent">Apply</label>
                            <button
                                onClick={applyCustom}
                                disabled={!customStart || !customEnd}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                            >
                                Apply Range
                            </button>
                        </div>
                        {customStart && customEnd && (
                            <div className="ml-auto flex flex-col gap-1">
                                <label className="text-xs font-semibold text-indigo-700">Granularity within range</label>
                                <div className="flex gap-1">
                                    {GRANULARITIES.filter(g => g.key !== 'custom').map(g => (
                                        <button
                                            key={g.key}
                                            onClick={() => {
                                                setRange({ start: customStart, end: customEnd });
                                                fetchData(g.key, customStart, customEnd);
                                            }}
                                            className="px-3 py-1 rounded-lg text-xs font-semibold border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-100 transition-colors"
                                        >
                                            {g.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Summary Tiles ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Orders', value: totalOrders.toLocaleString(), sub: `in range`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'Total Revenue', value: `৳${Math.round(totalRevenue).toLocaleString()}`, sub: 'excl. cancelled', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Avg per Bucket', value: meta?.buckets > 0 ? (totalOrders / meta.buckets).toFixed(1) : '—', sub: `per ${granularity === 'custom' ? 'period' : granularity}`, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Peak', value: peakBucket ? peakBucket.total_orders : '—', sub: peakBucket ? formatBucket(peakBucket.bucket, meta?.granularity || granularity) : 'no data', color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((tile, i) => (
                        <div key={i} className={`${tile.bg} rounded-xl p-3`}>
                            <p className="text-xs font-semibold text-gray-500">{tile.label}</p>
                            <p className={`text-xl font-black mt-0.5 ${tile.color}`}>{tile.value}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{tile.sub}</p>
                        </div>
                    ))}
                </div>

                {/* ── Status Series Toggle (orders view only) ── */}
                {viewMode === 'orders' && (
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_LABELS).map(([key, label]) => {
                            const active = visibleSeries.includes(key);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleSeries(key)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                        active ? 'text-white border-transparent shadow-sm' : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                                    }`}
                                    style={active ? { background: STATUS_COLORS[key], borderColor: STATUS_COLORS[key] } : {}}
                                >
                                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: active ? 'white' : STATUS_COLORS[key] }} />
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* ── Chart ── */}
                <div className="h-80 relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg z-10">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span className="text-sm font-medium">Loading…</span>
                            </div>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    {!loading && !error && chartData.length === 0 && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                            <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-gray-400 text-sm">No orders found in this range.</p>
                        </div>
                    )}

                    {!loading && !error && chartData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === 'revenue' ? (
                                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="tlRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                    <XAxis dataKey="bucket" axisLine={false} tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }} minTickGap={40}
                                        tickFormatter={(v) => formatBucket(v, meta?.granularity || granularity)}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', fontSize: 12 }}
                                        labelFormatter={(v) => formatTooltipLabel(v, meta?.granularity || granularity)}
                                        formatter={(v) => [`৳${Number(v).toLocaleString()}`, 'Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10B981" strokeWidth={2.5} fill="url(#tlRevenue)" dot={false} />
                                </AreaChart>
                            ) : (
                                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -5, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="tlTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                    <XAxis dataKey="bucket" axisLine={false} tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }} minTickGap={40}
                                        tickFormatter={(v) => formatBucket(v, meta?.granularity || granularity)}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.12)', fontSize: 12 }}
                                        labelFormatter={(v) => formatTooltipLabel(v, meta?.granularity || granularity)}
                                        formatter={(v, name) => [v, STATUS_LABELS[name] || name]}
                                    />
                                    {visibleSeries.includes('total_orders') && (
                                        <Area type="monotone" dataKey="total_orders" name="total_orders" stroke="#6366F1" strokeWidth={2.5} fill="url(#tlTotal)" dot={false} />
                                    )}
                                    {['pending','shipped','delivered','cancelled','returned'].filter(k => visibleSeries.includes(k)).map(k => (
                                        <Bar key={k} dataKey={k} name={k} fill={STATUS_COLORS[k]} radius={[3, 3, 0, 0]} maxBarSize={chartData.length <= 7 ? 32 : chartData.length <= 30 ? 18 : 10} />
                                    ))}
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>

                {meta && (
                    <p className="text-xs text-gray-400 text-right">
                        Showing <span className="font-semibold text-gray-500">{meta.buckets}</span> {meta.granularity} buckets
                        &nbsp;·&nbsp;
                        {new Date(meta.start).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {' '}→{' '}
                        {new Date(meta.end).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                )}
            </div>
        </div>
    );
}