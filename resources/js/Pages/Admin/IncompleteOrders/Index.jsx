import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line,
    ComposedChart, Area, AreaChart
} from 'recharts';

// ─── Status Donut ─────────────────────────────────────────────────────────────
function LeadStatusDonut({ stats }) {
    const total = stats.totalCaptured || 1;
    const data = [
        { name: 'Converted', value: stats.convertedCount || 0, color: '#16a34a' },
        { name: 'Lost',      value: stats.lostCount || 0,       color: '#ef4444' },
        { name: 'Active',    value: Math.max(0, total - (stats.convertedCount || 0) - (stats.lostCount || 0)), color: '#3b82f6' },
    ].filter(d => d.value > 0);

    const displayData = data.length > 0 ? data : [{ name: 'No data', value: 1, color: '#E5E7EB' }];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
            {/* Donut */}
            <div className="relative flex-shrink-0" style={{ width: 110, height: 110 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={displayData}
                            cx="50%" cy="50%"
                            innerRadius={33} outerRadius={52}
                            paddingAngle={displayData.length > 1 ? 3 : 0}
                            dataKey="value" startAngle={90} endAngle={-270}
                        >
                            {displayData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0].payload;
                                return (
                                    <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl">
                                        <p className="font-semibold">{item.name}</p>
                                        <p>{item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</p>
                                    </div>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-base font-black text-gray-900">{(stats.totalCaptured || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">leads</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Lead Breakdown</p>
                {[
                    { label: 'Active',    value: Math.max(0, total - (stats.convertedCount || 0) - (stats.lostCount || 0)), color: '#3b82f6' },
                    { label: 'Converted', value: stats.convertedCount || 0, color: '#16a34a' },
                    { label: 'Lost',      value: stats.lostCount || 0, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                            <span className="text-gray-600">{s.label}</span>
                        </span>
                        <span className="font-bold text-gray-800 tabular-nums">
                            {s.value.toLocaleString()}
                            <span className="font-normal text-gray-400 ml-1">({total > 0 ? Math.round((s.value / total) * 100) : 0}%)</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Conversion Funnel ────────────────────────────────────────────────────────
function ConversionFunnel({ stats }) {
    const total     = stats.totalCaptured || 0;
    const converted = stats.convertedCount || 0;
    const lost      = stats.lostCount || 0;
    const active    = Math.max(0, total - converted - lost);

    const steps = [
        { label: 'Leads Captured', value: total,     color: '#6366f1', pct: 100 },
        { label: 'Still Active',   value: active,    color: '#3b82f6', pct: total > 0 ? Math.round((active / total) * 100) : 0 },
        { label: 'Converted',      value: converted, color: '#16a34a', pct: total > 0 ? Math.round((converted / total) * 100) : 0 },
    ];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Conversion Funnel</p>
            <div className="space-y-3">
                {steps.map((step, i) => (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-1 text-xs">
                            <span className="font-semibold text-gray-600">{step.label}</span>
                            <span className="font-black text-gray-800 tabular-nums">
                                {step.value.toLocaleString()} <span className="font-normal text-gray-400">({step.pct}%)</span>
                            </span>
                        </div>
                        <div className="h-6 bg-gray-100 rounded-lg overflow-hidden">
                            <div
                                className="h-full rounded-lg flex items-center pl-2.5 transition-all duration-700"
                                style={{ width: `${Math.max(step.pct, 3)}%`, background: step.color }}
                            >
                                {step.pct >= 12 && <span className="text-white text-[10px] font-bold">{step.pct}%</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500">Success Ratio</span>
                <span className="text-2xl font-black text-[#2d5a27]">{stats.conversionRatio}%</span>
            </div>
        </div>
    );
}

// ─── Daily Trend Chart ────────────────────────────────────────────────────────
function DailyTrendChart({ orders }) {
    // Build daily buckets from current page's order data
    const dailyData = useMemo(() => {
        const buckets = {};
        orders.forEach(order => {
            const day = new Date(order.created_at).toLocaleDateString('en-CA'); // YYYY-MM-DD
            if (!buckets[day]) buckets[day] = { date: day, captured: 0, converted: 0, lost: 0 };
            buckets[day].captured += 1;
            if (order.status === 'converted') buckets[day].converted += 1;
            if (order.status === 'lost')      buckets[day].lost      += 1;
        });
        return Object.values(buckets)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(d => ({
                ...d,
                label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            }));
    }, [orders]);

    if (dailyData.length < 2) {
        return (
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-52">
                <p className="text-sm text-gray-400">Not enough date range on this page to render a trend.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Daily Lead Activity</p>
                    <p className="text-xs text-gray-500 mt-0.5">Captured vs converted on current page</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />Captured</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#2d5a27] inline-block" />Converted</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Lost</span>
                </div>
            </div>
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={dailyData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gCaptured" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                            formatter={(v, name) => [v, name === 'captured' ? 'Leads Captured' : name === 'converted' ? 'Converted' : 'Lost']}
                        />
                        <Area type="monotone" dataKey="captured" name="captured"
                            stroke="#6366f1" strokeWidth={2} fill="url(#gCaptured)" dot={false} />
                        <Bar dataKey="converted" name="converted" fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={20} />
                        <Bar dataKey="lost"      name="lost"      fill="#fca5a5" radius={[3, 3, 0, 0]} maxBarSize={20} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Cart Value Distribution ──────────────────────────────────────────────────
function CartValueChart({ orders, calculateCartTotal }) {
    const buckets = useMemo(() => {
        const ranges = [
            { label: '৳0–500',   min: 0,    max: 500   },
            { label: '৳500–1k',  min: 500,  max: 1000  },
            { label: '৳1k–2k',   min: 1000, max: 2000  },
            { label: '৳2k–5k',   min: 2000, max: 5000  },
            { label: '৳5k+',     min: 5000, max: Infinity },
        ].map(r => ({ ...r, count: 0 }));

        orders.forEach(order => {
            const val    = calculateCartTotal(order.cart_data);
            const bucket = ranges.find(r => val >= r.min && val < r.max);
            if (bucket) bucket.count++;
        });

        return ranges;
    }, [orders]);

    const COLORS = ['#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1', '#4338ca'];

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cart Value Distribution</p>
            <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={buckets} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="label" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }}
                            allowDecimals={false} />
                        <Tooltip
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                            formatter={(v) => [v, 'Leads']}
                        />
                        <Bar dataKey="count" radius={[5, 5, 0, 0]} maxBarSize={44}>
                            {buckets.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Index({ incompleteOrders, filters, stats }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate,   setEndDate]   = useState(filters.end_date   || '');

    const handleFilter = (status = filters.status || 'pending') => {
        router.get(route('admin.incomplete-orders.index'), {
            start_date: startDate, end_date: endDate, status,
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setStartDate('');
        setEndDate('');
        router.get(route('admin.incomplete-orders.index'), { status: filters.status || 'pending' }, { preserveState: true });
    };

    const markLost = (id) => {
        if (confirm('Mark this lead as Lost? It will stay in analytics but leave the active list.')) {
            router.patch(route('admin.incomplete-orders.mark-lost', id));
        }
    };

    // FIX: Wired up the markAsConverted action to the new route
    const markConverted = (id) => {
        if (confirm('Mark this lead as Converted? This will update its status to converted.')) {
            router.patch(route('admin.incomplete-orders.mark-converted', id));
        }
    };

    const deleteLead = (id) => {
        if (confirm('Permanently delete this lead? This will affect your total captured analytics and cannot be undone.')) {
            router.delete(route('admin.incomplete-orders.destroy', id));
        }
    };

    // FIX: Safely handles both array and object-keyed cart_data coming from the server
    const calculateCartTotal = (cartData) => {
        if (!cartData) return 0;
        const cartArray = Array.isArray(cartData) ? cartData : Object.values(cartData);
        return cartArray.reduce((total, item) => total + (Number(item.price) * Number(item.quantity)), 0);
    };

    // FIX: Correctly counts items regardless of whether cart_data is an array or object
    const getCartItemCount = (cartData) => {
        if (!cartData) return 0;
        return Array.isArray(cartData) ? cartData.length : Object.keys(cartData).length;
    };

    const allOrders = incompleteOrders.data || [];

    return (
        <AdminLayout>
            <Head title="Lead Analytics & Management" />

            {/* ── Stats: 4 cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Captured"        val={stats.totalCaptured}         color="text-gray-900" />
                <StatCard title="Converted"             val={stats.convertedCount}        color="text-green-600" />
                <StatCard title="Not Converted (Lost)"  val={stats.lostCount}             color="text-red-500" />
                <StatCard title="Success Ratio"         val={`${stats.conversionRatio}%`} color="text-blue-600" />
            </div>

            {/* ── Charts Row 1: Donut + Funnel + Trend ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                <LeadStatusDonut stats={stats} />
                <ConversionFunnel stats={stats} />
                <DailyTrendChart orders={allOrders} />
            </div>

            {/* ── Charts Row 2: Cart Value Distribution + Quick Stats ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
                <div className="xl:col-span-1">
                    <CartValueChart orders={allOrders} calculateCartTotal={calculateCartTotal} />
                </div>

                {/* ── Quick Stats panel ── */}
                <div className="xl:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Current Page — Lead Snapshot</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Page Total',
                                value: allOrders.length,
                                sub: 'leads on this page',
                                color: 'text-indigo-600',
                                bg: 'bg-indigo-50',
                            },
                            {
                                label: 'Cart Value',
                                value: `৳${allOrders.reduce((s, o) => s + calculateCartTotal(o.cart_data), 0).toLocaleString()}`,
                                sub: 'potential revenue',
                                color: 'text-emerald-600',
                                bg: 'bg-emerald-50',
                            },
                            {
                                label: 'Avg Cart',
                                value: allOrders.length > 0
                                    ? `৳${Math.round(allOrders.reduce((s, o) => s + calculateCartTotal(o.cart_data), 0) / allOrders.length).toLocaleString()}`
                                    : '৳0',
                                sub: 'per lead',
                                color: 'text-blue-600',
                                bg: 'bg-blue-50',
                            },
                            {
                                label: 'Pending',
                                value: allOrders.filter(o => o.status === 'pending').length,
                                sub: 'awaiting action',
                                color: 'text-amber-600',
                                bg: 'bg-amber-50',
                            },
                        ].map((s, i) => (
                            <div key={i} className={`${s.bg} rounded-xl p-4`}>
                                <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Status Tabs & Date Filters ── */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
                    {['pending', 'converted', 'lost', 'all'].map((s) => (
                        <button
                            key={s}
                            onClick={() => handleFilter(s)}
                            className={`flex-1 lg:flex-none px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                                (filters.status || 'pending') === s
                                    ? 'bg-white text-[#2d5a27] shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {s === 'pending' ? 'Active Leads' : s}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                        className="text-xs rounded-lg border-gray-200" />
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                        className="text-xs rounded-lg border-gray-200" />
                    <button onClick={() => handleFilter()}
                        className="bg-[#2d5a27] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#234720]">
                        Filter
                    </button>
                    {(startDate || endDate) && (
                        <button onClick={clearFilters}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-300">
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Leads Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer Info</th>
                            <th className="px-6 py-4">Cart Summary</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {allOrders.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                                    No leads found for this filter.
                                </td>
                            </tr>
                        )}
                        {allOrders.map((order) => {
                            // Format WhatsApp number (e.g., if strictly 11 digits in BD, prefix 88)
                            const cleanPhone = order.phone ? order.phone.replace(/[^0-9]/g, '') : '';
                            
                            // Prepare convincing WhatsApp message
                            const cartArray = Array.isArray(order.cart_data) ? order.cart_data : Object.values(order.cart_data || {});
                            const productNames = cartArray.map(item => item.name || item.title || 'Product').join(', ');
                            const customerName = order.full_name ? order.full_name.split(' ')[0] : 'there';
                            
                            const message = `Hi ${customerName},\n\nWe noticed you left some items in your cart! 🛒\n\nYou were looking at: *${productNames}*.\n\nIf you faced any issues while ordering or need help completing it, just reply to this message. We'd love to assist you!`;
                            const encodedMessage = encodeURIComponent(message);

                            const waLink = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('0') ? '88' + cleanPhone : cleanPhone}?text=${encodedMessage}` : '#';

                            return (
                                <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {new Date(order.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">
                                            {order.full_name || <span className="text-gray-400 italic">No name provided</span>}
                                        </div>
                                        
                                        {/* Added Call & WhatsApp Actions */}
                                        {order.phone ? (
                                            <div className="flex items-center gap-2 mt-1 mb-1">
                                                <span className="text-[#2d5a27] font-semibold">{order.phone}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <a 
                                                        href={`tel:${order.phone}`} 
                                                        title="Call" 
                                                        className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                                    </a>
                                                    <a 
                                                        href={waLink} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        title="WhatsApp" 
                                                        className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437-9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 font-semibold mt-1 mb-1">N/A</div>
                                        )}

                                        {order.address && (
                                            <div className="text-xs text-gray-500 truncate max-w-xs">{order.address}</div>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-800">
                                            ৳{calculateCartTotal(order.cart_data).toLocaleString()}
                                        </div>
                                        {/* FIX: Use getCartItemCount() — works correctly for both array and object cart_data */}
                                        <div className="text-xs text-gray-500">
                                            {getCartItemCount(order.cart_data)} Items
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {order.status === 'pending' && (
                                                <>
                                                    {/* Convert via Manual Order (full order creation flow) */}
                                                    <Link
                                                        href={route('admin.orders.create', order.id)}
                                                        className="bg-[#2d5a27] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#234720]"
                                                    >
                                                        Create Order
                                                    </Link>
                                                    {/* FIX: Mark as converted directly without creating a new order */}
                                                    <button
                                                        onClick={() => markConverted(order.id)}
                                                        className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-100"
                                                    >
                                                        Mark Converted
                                                    </button>
                                                    <button
                                                        onClick={() => markLost(order.id)}
                                                        className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-100"
                                                    >
                                                        Mark Lost
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => deleteLead(order.id)}
                                                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                <span>
                    Showing {incompleteOrders.from || 0} to {incompleteOrders.to || 0} of {incompleteOrders.total} leads
                </span>
                <div className="flex gap-1 flex-wrap">
                    {incompleteOrders.links.map((link, idx) => (
                        <Link
                            key={idx}
                            href={link.url || '#'}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 border rounded ${
                                link.active
                                    ? 'bg-[#2d5a27] text-white border-[#2d5a27]'
                                    : 'bg-white hover:bg-gray-50'
                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    ))}
                </div>
            </div>

        </AdminLayout>
    );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
const StatCard = ({ title, val, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-2xl font-black ${color}`}>{val}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        pending:   'bg-blue-100 text-blue-700',
        converted: 'bg-green-100 text-green-700',
        lost:      'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};