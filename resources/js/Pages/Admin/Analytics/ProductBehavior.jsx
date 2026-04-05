import React, { useState } from 'react';
import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, router } from '@inertiajs/react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// ─── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filter, setFilter, customStart, setCustomStart, customEnd, setCustomEnd, onApply }) {
    const handleChange = (e) => {
        const v = e.target.value;
        setFilter(v);
        if (v !== 'custom') router.get(route('admin.analytics.behavior'), { filter: v }, { preserveState: true, replace: true });
    };
    return (
        <div className="flex flex-col sm:flex-row items-center gap-2">
            <select value={filter} onChange={handleChange}
                className="border-gray-200 rounded-xl shadow-sm text-sm py-2 px-3 bg-white focus:border-indigo-400 focus:ring-indigo-400">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="custom">Custom Date</option>
            </select>
            {filter === 'custom' && (
                <div className="flex items-center gap-2">
                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="border-gray-200 rounded-xl text-sm py-2 px-3" />
                    <span className="text-gray-400">→</span>
                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="border-gray-200 rounded-xl text-sm py-2 px-3" />
                    <button onClick={onApply} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">Apply</button>
                </div>
            )}
        </div>
    );
}

// ─── Most Viewed: Chart + List ────────────────────────────────────────────────
function MostViewedSection({ data }) {
    const chartData = data.slice(0, 8).map(item => ({
        name: item.product?.name?.split(' ').slice(0, 3).join(' ') || 'Unknown',
        views: item.total_views,
    }));
    const COLORS = ['#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE', '#93C5FD', '#67E8F9', '#6EE7B7', '#BBF7D0'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Most Viewed Products</h3>
            <p className="text-xs text-gray-400 mb-5">Ranked by total page views for this period</p>

            {data.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No view data available for this period.</p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Bar chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" axisLine={false} tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 11 }} width={110} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                                    formatter={(v) => [Number(v).toLocaleString(), 'Views']}
                                />
                                <Bar dataKey="views" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Ranked list */}
                    <div className="space-y-3">
                        {data.slice(0, 8).map((item, idx) => (
                            <div key={item.product_id || idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold w-4 text-sm">{idx + 1}</span>
                                    {item.product?.thumbnail
                                        ? <img src={`/storage/${item.product.thumbnail}`} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-xs text-gray-400">—</span></div>
                                    }
                                    <span className="text-sm font-medium text-gray-600 truncate max-w-[160px]">
                                        {item.product?.name || 'Unknown Product'}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full whitespace-nowrap">
                                    {Number(item.total_views || 0).toLocaleString()} views
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Most Added-to-Cart: Chart + List ─────────────────────────────────────────
function MostATCSection({ data }) {
    const chartData = data.slice(0, 8).map(item => ({
        name: item.product?.name?.split(' ').slice(0, 3).join(' ') || 'Unknown',
        atc: item.total_atc,
    }));
    const COLORS = ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981', '#059669'];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Most Added-to-Cart</h3>
            <p className="text-xs text-gray-400 mb-5">Ranked by add-to-cart count for this period</p>

            {data.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No add-to-cart data available for this period.</p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Bar chart */}
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 11 }} width={110} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                                    formatter={(v) => [Number(v).toLocaleString(), 'Add-to-Carts']}
                                />
                                <Bar dataKey="atc" radius={[0, 6, 6, 0]} maxBarSize={28}>
                                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Ranked list */}
                    <div className="space-y-3">
                        {data.slice(0, 8).map((item, idx) => (
                            <div key={item.product_id || idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-gray-400 font-bold w-4 text-sm">{idx + 1}</span>
                                    {item.product?.thumbnail
                                        ? <img src={`/storage/${item.product.thumbnail}`} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                                        : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-xs text-gray-400">—</span></div>
                                    }
                                    <span className="text-sm font-medium text-gray-600 truncate max-w-[160px]">
                                        {item.product?.name || 'Unknown Product'}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">
                                    {Number(item.total_atc || 0).toLocaleString()} additions
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Views vs ATC Comparison Chart ───────────────────────────────────────────
function ViewsVsATCChart({ topViewed, topATC }) {
    const atcMap = Object.fromEntries(topATC.map(i => [i.product_id, i.total_atc]));
    const combined = topViewed.slice(0, 8).map(item => ({
        name: item.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
        views: item.total_views,
        atc: atcMap[item.product_id] || 0,
        atcRate: item.total_views > 0 ? Math.round(((atcMap[item.product_id] || 0) / item.total_views) * 100) : 0,
    }));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Views vs Add-to-Cart</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Browse interest vs purchase intent per product</p>
                </div>
                <div className="flex gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-400 inline-block" />Views</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 inline-block" />ATC</span>
                </div>
            </div>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={combined} margin={{ top: 5, right: 10, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                            formatter={(v, name) => [Number(v).toLocaleString(), name === 'views' ? 'Views' : 'Add-to-Carts']}
                        />
                        <Bar dataKey="views" fill="#A5B4FC" radius={[4, 4, 0, 0]} maxBarSize={18} />
                        <Bar dataKey="atc" fill="#6EE7B7" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {/* ATC Rate pills */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {combined.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <span className="text-xs text-gray-500 truncate max-w-[80px]">{item.name}</span>
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${item.atcRate > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                            {item.atcRate}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Scroll Depth: Progress Bars + Bar Chart ──────────────────────────────────
function ScrollDepthSection({ data }) {
    const COLORS = { '25%': '#6366F1', '50%': '#8B5CF6', '75%': '#EC4899', '100%': '#EF4444' };
    const maxCount = Math.max(...data.map(d => d.count), 1);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-1">Average Scroll Depth</h3>
            <p className="text-xs text-gray-400 mb-5">How far users scroll on product pages</p>

            {data.length === 0 || data.every(d => d.count === 0) ? (
                <p className="text-sm text-gray-500 py-8 text-center">No scroll depth data available for this period.</p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Visual progress bars */}
                    <div className="space-y-4">
                        {data.map((item, i) => {
                            const pct = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
                            const color = COLORS[item.event_value] || '#6366F1';
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: color }}>
                                                {item.event_value}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Reached {item.event_value}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {Number(item.count).toLocaleString()} <span className="text-xs text-gray-400 font-normal">users</span>
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Bar chart */}
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="event_value" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }}
                                    formatter={(v) => [v, 'Users']} />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                    {data.map((item, i) => <Cell key={i} fill={COLORS[item.event_value] || '#6366F1'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
            <p className="mt-4 text-xs text-gray-400 italic">* Shows how many users reached each percentage mark of product pages.</p>
        </div>
    );
}

// ─── Checkout Conversion: Chart + Table ──────────────────────────────────────
function CheckoutConversionSection({ data }) {
    const chartData = data.slice(0, 7).map(item => ({
        name: item.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
        checkouts: item.checkouts,
        purchases: item.purchases,
        rate: item.rate,
    }));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900">Checkout to Order Conversion (By Product)</h3>
                <p className="text-xs text-gray-400 mt-0.5">How many checkout initiations result in completed orders</p>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-gray-500 py-8 text-center">No checkout initiation data available for this period.</p>
            ) : (
                <>
                    {/* Bar chart */}
                    <div className="h-56 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 35 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                                    formatter={(v, name) => [v, name === 'checkouts' ? 'Checkouts Started' : 'Orders Completed']}
                                />
                                <Bar dataKey="checkouts" name="checkouts" fill="#E0E7FF" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="purchases" name="purchases" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border-t border-gray-100 pt-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                                    <th className="pb-2 font-medium">Product</th>
                                    <th className="pb-2 font-medium text-center">Checkouts Initiated</th>
                                    <th className="pb-2 font-medium text-center">Orders Completed</th>
                                    <th className="pb-2 font-medium text-right">Conversion Rate</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-gray-50">
                                {data.map((item) => (
                                    <tr key={item.product_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-3 flex items-center gap-3">
                                            {item.product?.thumbnail
                                                ? <img src={`/storage/${item.product.thumbnail}`} alt={item.product.name} className="w-9 h-9 rounded-lg object-cover" />
                                                : <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><span className="text-xs text-gray-400">—</span></div>
                                            }
                                            <span className="font-medium text-gray-700 truncate max-w-[180px]">{item.product?.name || 'Unknown Product'}</span>
                                        </td>
                                        <td className="py-3 text-center text-gray-600 font-medium">{Number(item.checkouts).toLocaleString()}</td>
                                        <td className="py-3 text-center text-green-600 font-medium">{Number(item.purchases).toLocaleString()}</td>
                                        <td className="py-3 text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                                item.rate >= 50 ? 'bg-green-100 text-green-700' :
                                                item.rate > 20  ? 'bg-yellow-100 text-yellow-700' :
                                                                  'bg-red-100 text-red-700'
                                            }`}>{item.rate}%</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            <p className="mt-4 text-xs text-gray-400 italic">
                * Data compares the number of times a product entered the checkout sequence vs how many times it was successfully purchased.
            </p>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ProductBehavior({
    topViewed = [], topATC = [], scrollDepth = [],
    checkoutConversion = [], dateRange, currentFilter
}) {
    const [filter, setFilter] = useState(currentFilter || 'today');
    const [customStart, setCustomStart] = useState(dateRange?.start || '');
    const [customEnd, setCustomEnd] = useState(dateRange?.end || '');

    const applyCustomFilter = () => {
        router.get(route('admin.analytics.behavior'), {
            filter: 'custom', start_date: customStart, end_date: customEnd
        }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <Head title="Product Behavior Analytics" />

            <div className="p-4 md:p-8 space-y-7">

                {/* ── Header ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Behavior Insights</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            Interaction data from <span className="font-semibold text-gray-600">{dateRange?.start}</span> to <span className="font-semibold text-gray-600">{dateRange?.end}</span>
                        </p>
                    </div>
                    <FilterBar
                        filter={filter} setFilter={setFilter}
                        customStart={customStart} setCustomStart={setCustomStart}
                        customEnd={customEnd} setCustomEnd={setCustomEnd}
                        onApply={applyCustomFilter}
                    />
                </div>

                {/* ── Most Viewed: chart + list ── */}
                <MostViewedSection data={topViewed} />

                {/* ── Most Added-to-Cart: chart + list ── */}
                <MostATCSection data={topATC} />

                {/* ── Views vs ATC Comparison ── */}
                <ViewsVsATCChart topViewed={topViewed} topATC={topATC} />

                {/* ── Scroll Depth: progress bars + chart ── */}
                <ScrollDepthSection data={scrollDepth} />

                {/* ── Checkout Conversion: chart + table ── */}
                <CheckoutConversionSection data={checkoutConversion} />

            </div>
        </AdminLayout>
    );
}