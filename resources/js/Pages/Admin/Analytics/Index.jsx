import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/Layout';
import StatCard from '@/Components/Admin/Analytics/StatCard';
import InventoryAlerts from '@/Components/Admin/Analytics/InventoryAlerts';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Legend
} from 'recharts';

// ─── Revenue & Views Dual-Axis Area Chart ─────────────────────────────────────
function RevenueViewsChart({ data }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Revenue & Views Trend</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Daily product performance over the period</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />Revenue</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />Views</span>
                </div>
            </div>
            <div className="h-72">
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={8}
                                tickFormatter={(str) => {
                                    const d = new Date(str);
                                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                }}
                            />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                                formatter={(value, name) => [
                                    name === 'daily_revenue' ? `৳${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                                    name === 'daily_revenue' ? 'Revenue' : 'Views'
                                ]}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                            />
                            <Area yAxisId="left" type="monotone" dataKey="daily_revenue" name="daily_revenue"
                                stroke="#10B981" strokeWidth={2.5} fill="url(#gRevenue)" dot={false} />
                            <Area yAxisId="right" type="monotone" dataKey="daily_views" name="daily_views"
                                stroke="#60A5FA" strokeWidth={2} fill="url(#gViews)" dot={false} strokeDasharray="5 3" />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data for this period.</div>
                )}
            </div>
        </div>
    );
}

// ─── Top Products Bar Chart ───────────────────────────────────────────────────
function TopProductsBarChart({ products }) {
    const data = products.slice(0, 8).map(p => ({
        name: p.product?.name?.split(' ').slice(0, 3).join(' ') || 'Unknown',
        revenue: parseFloat(p.total_revenue || 0),
        sold: parseInt(p.total_sold || 0),
    }));
    const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#818CF8', '#93C5FD', '#67E8F9', '#6EE7B7'];

    return (
        <div className="h-64">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                            formatter={(value, name) => [
                                name === 'revenue' ? `৳${Number(value).toLocaleString()}` : value,
                                name === 'revenue' ? 'Revenue' : 'Units Sold'
                            ]}
                        />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={40}>
                            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">No product data for this period.</div>
            )}
        </div>
    );
}

// ─── Conversion Funnel (Updated to use store-wide overview data) ───────────────
function ConversionFunnelChart({ overview }) {
    const { views, atc, purchases } = overview;

    const funnelData = [
        { stage: 'Product Views', count: views, color: '#6366F1', pct: 100 },
        { 
            stage: 'Add to Cart',   
            count: atc,   
            color: '#8B5CF6', 
            pct: views > 0 ? Math.round((atc / views) * 100) : 0 
        },
        { 
            stage: 'Purchased',     
            count: purchases, 
            color: '#10B981', 
            pct: views > 0 ? Math.round((purchases / views) * 100) : 0 
        },
    ];

    return (
        <div className="space-y-4 mt-2">
            {funnelData.map((step, i) => (
                <div key={i}>
                    <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-gray-600">{step.stage}</span>
                        <span className="font-bold text-gray-800">
                            {Number(step.count).toLocaleString()} <span className="text-gray-400 font-normal">({step.pct}%)</span>
                        </span>
                    </div>
                    <div className="h-7 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                            className="h-full rounded-lg flex items-center pl-3 transition-all duration-700"
                            style={{ width: `${Math.max(step.pct, 4)}%`, background: step.color }}
                        >
                            <span className="text-white text-[10px] font-bold">{step.pct}%</span>
                        </div>
                    </div>
                </div>
            ))}
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-gray-100 mt-4">
                {funnelData.map((step, i) => (
                    <div key={i}>
                        <p className="text-base font-bold" style={{ color: step.color }}>{Number(step.count).toLocaleString()}</p>
                        <p className="text-xs text-gray-400">{step.stage}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Rate Comparison Bar Chart ────────────────────────────────────────────────
function RateComparisonChart({ products }) {
    const data = products.slice(0, 7).map(p => ({
        name: p.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
        conversion: parseFloat(p.avg_conversion_rate || 0),
        abandonment: parseFloat(p.avg_abandonment_rate || 0),
        atc: parseFloat(p.avg_atc_rate || 0),
    }));

    return (
        <div className="h-56">
            {data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 35 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false}
                            tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }}
                            tickFormatter={(v) => `${v}%`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                            formatter={(v, name) => [`${parseFloat(v).toFixed(2)}%`,
                                name === 'conversion' ? 'Conversion Rate' :
                                name === 'abandonment' ? 'Abandonment Rate' : 'ATC Rate'
                            ]}
                        />
                        <Bar dataKey="conversion" name="conversion" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                        <Bar dataKey="abandonment" name="abandonment" fill="#F87171" radius={[4, 4, 0, 0]} maxBarSize={18} />
                        <Bar dataKey="atc" name="atc" fill="#60A5FA" radius={[4, 4, 0, 0]} maxBarSize={18} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">No data for this period.</div>
            )}
        </div>
    );
}

// ─── Returns Donut ─────────────────────────────────────────────────────────────
function ReturnsDonutChart({ products }) {
    const withReturns = products.filter(p => parseInt(p.total_returns || 0) > 0).slice(0, 6);
    const noReturns = products.filter(p => parseInt(p.total_returns || 0) === 0).length;
    const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E'];

    if (withReturns.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[160px]">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-sm font-bold text-gray-700">Zero Returns</p>
                <p className="text-xs text-gray-400 mt-0.5">{noReturns} products return-free</p>
            </div>
        );
    }

    const pieData = withReturns.map(p => ({
        name: p.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
        value: parseInt(p.total_returns),
    }));

    return (
        <div className="flex items-center gap-3">
            <div style={{ width: 120, height: 120 }} className="flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={56}
                            paddingAngle={3} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v, name) => [v, name]} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 12 }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1">
                {pieData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                            <span className="text-gray-600 truncate max-w-[90px]">{item.name}</span>
                        </span>
                        <span className="font-bold text-gray-800">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Full Top Products Table ───────────────────────────────────────────────────
function TopProductsTable({ products }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                        <th className="px-5 py-3 font-semibold">Product</th>
                        <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                        <th className="px-4 py-3 font-semibold text-center">Sold</th>
                        <th className="px-4 py-3 font-semibold text-center">Conv.</th>
                        <th className="px-4 py-3 font-semibold text-center">ATC</th>
                        <th className="px-4 py-3 font-semibold text-center">Aband.</th>
                        <th className="px-4 py-3 font-semibold text-center">Returns</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {products.map((item) => {
                        const conv  = parseFloat(item.avg_conversion_rate || 0);
                        const aband = parseFloat(item.avg_abandonment_rate || 0);
                        return (
                            <tr key={item.product_id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={item.product?.thumbnail || '/placeholder.png'} alt=""
                                            className="w-9 h-9 rounded-lg object-cover border border-gray-100" />
                                        <span className="text-sm font-medium text-gray-700 line-clamp-1">{item.product?.name}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                                    ৳{parseFloat(item.total_revenue).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-center text-sm text-gray-600">{item.total_sold}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${conv > 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {conv.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-xs text-gray-500">{parseFloat(item.avg_atc_rate || 0).toFixed(2)}%</td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${aband > 70 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {aband.toFixed(2)}%
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {parseInt(item.total_returns || 0) > 0
                                        ? <span className="text-red-500 font-bold text-sm">{item.total_returns}</span>
                                        : <span className="text-gray-300">—</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AnalyticsIndex({ overview, chartData, topProducts, alerts, dateRange, currentFilter }) {
    const [filter, setFilter] = useState(currentFilter || 'today');
    const [customStart, setCustomStart] = useState(dateRange.start);
    const [customEnd, setCustomEnd] = useState(dateRange.end);

    const handleFilterChange = (e) => {
        const v = e.target.value;
        setFilter(v);
        if (v !== 'custom') router.get(route('admin.analytics.index'), { filter: v }, { preserveState: true, replace: true });
    };

    const applyCustomFilter = () => {
        router.get(route('admin.analytics.index'), { filter: 'custom', start_date: customStart, end_date: customEnd }, { preserveState: true, replace: true });
    };

    const Icons = {
        revenue:    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        margin:     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        views:      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
        conversion: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    };

    return (
        <AdminLayout>
            <Head title="Analytics & Intelligence" />

            <div className="space-y-7 p-4 md:p-8">

                {/* ── Header ── */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics & Intelligence</h1>
                        <p className="text-gray-400 text-sm mt-0.5">
                            Performance data from <span className="font-semibold text-gray-600">{dateRange.start}</span> to <span className="font-semibold text-gray-600">{dateRange.end}</span>
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            Live intelligence active
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <select value={filter} onChange={handleFilterChange}
                                className="border-gray-200 rounded-xl shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 px-3 bg-white">
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
                                    <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
                                        className="border-gray-200 rounded-xl shadow-sm text-sm py-2 px-3" />
                                    <span className="text-gray-400 text-sm">→</span>
                                    <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
                                        className="border-gray-200 rounded-xl shadow-sm text-sm py-2 px-3" />
                                    <button onClick={applyCustomFilter}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm">
                                        Apply
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── KPI Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard title="Product Revenue"   value={overview.revenue}        prefix="৳"  icon={Icons.revenue}    color="text-emerald-600" />
                    <StatCard title="Gross Margin"       value={overview.margin}         prefix="৳"  icon={Icons.margin}     color="text-blue-600" />
                    <StatCard title="Product Views"      value={overview.views}                      icon={Icons.views}      color="text-indigo-600" />
                    <StatCard title="Conversion Rate"    value={overview.conversionRate} suffix="%"  icon={Icons.conversion} color="text-amber-600" />
                </div>

                {/* ── Revenue / Views Trend + Inventory Alerts ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <RevenueViewsChart data={chartData} />
                    </div>
                    <div className="lg:col-span-1">
                        <InventoryAlerts alerts={alerts} />
                    </div>
                </div>

                {/* ── Top Products Bar Chart + Conversion Funnel ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Top Products by Revenue</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Revenue comparison across top products</p>
                            </div>
                        </div>
                        <TopProductsBarChart products={topProducts} />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="mb-2">
                            <h3 className="text-base font-bold text-gray-900">Conversion Funnel</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Aggregated store-wide performance</p>
                        </div>
                        {/* Corrected: Passing overview prop here */}
                        <ConversionFunnelChart overview={overview} />
                    </div>
                </div>

                {/* ── Rate Comparison + Returns Donut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Rate Analysis by Product</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Conversion vs Abandonment vs ATC</p>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Conv.</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />Aband.</span>
                                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400 inline-block" />ATC</span>
                            </div>
                        </div>
                        <RateComparisonChart products={topProducts} />
                    </div>

                    <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="mb-3">
                            <h3 className="text-base font-bold text-gray-900">Returns by Product</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Products with the most returns</p>
                        </div>
                        <ReturnsDonutChart products={topProducts} />
                    </div>
                </div>

                {/* ── Full Top Products Table ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Full Product Performance Breakdown</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Sales, behavior, and return metrics combined</p>
                        </div>
                    </div>
                    <TopProductsTable products={topProducts} />
                </div>

            </div>
        </AdminLayout>
    );
}