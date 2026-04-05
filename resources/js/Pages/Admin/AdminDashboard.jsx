import React from 'react';
import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Line, ComposedChart
} from 'recharts';
import OrderTimelineChart from '@/Components/Admin/Analytics/OrderTimelineChart';

// ─── Order Status Donut ────────────────────────────────────────────────────────
function OrderStatusDonut({ stats }) {
    const STATUS_CONFIG = [
        { key: 'pendingOrders',   label: 'Pending',   color: '#F59E0B' },
        { key: 'shippedOrders',   label: 'Shipped',   color: '#3B82F6' },
        { key: 'deliveredOrders', label: 'Delivered', color: '#10B981' },
        { key: 'returnedOrders',  label: 'Returned',  color: '#6366F1' },
        { key: 'cancelledOrders', label: 'Cancelled', color: '#EF4444' },
    ];

    const data = STATUS_CONFIG.map(s => ({
        name: s.label, value: stats?.[s.key] || 0, color: s.color
    })).filter(d => d.value > 0);

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-5 h-full">
            <div className="relative flex-shrink-0" style={{ width: 120, height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.length > 0 ? data : [{ name: 'No data', value: 1, color: '#E5E7EB' }]}
                            cx="50%" cy="50%"
                            innerRadius={36} outerRadius={56}
                            paddingAngle={data.length > 1 ? 3 : 0}
                            dataKey="value" startAngle={90} endAngle={-270}
                        >
                            {(data.length > 0 ? data : [{ color: '#E5E7EB' }]).map((e, i) => (
                                <Cell key={i} fill={e.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const item = payload[0].payload;
                                return (
                                    <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl">
                                        <p className="font-semibold">{item.name}</p>
                                        <p>{item.value.toLocaleString()} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</p>
                                    </div>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-gray-900">{total.toLocaleString()}</span>
                    <span className="text-xs text-gray-400">orders</span>
                </div>
            </div>
            <div className="flex-1 space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Status Breakdown</p>
                {STATUS_CONFIG.map(s => {
                    const val = stats?.[s.key] || 0;
                    const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                    return (
                        <div key={s.key} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                                <span className="text-gray-600">{s.label}</span>
                            </span>
                            <span className="font-bold text-gray-800 tabular-nums">
                                {val.toLocaleString()} <span className="font-normal text-gray-400">({pct}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Revenue Trend Chart ───────────────────────────────────────────────────────
function RevenueTrendChart({ chartData }) {
    return (
        <div className="h-72">
            {chartData && chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="dashRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }}
                            tickLine={false} axisLine={false} minTickGap={30}
                            tickFormatter={(str) => {
                                const d = new Date(str);
                                return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                            }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false}
                            tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: 12 }}
                            formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                        />
                        <Area type="monotone" dataKey="daily_revenue" name="Revenue"
                            stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#dashRev)" dot={false} />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex h-full items-center justify-center text-gray-400 text-sm">
                    No chart data available for this period.
                </div>
            )}
        </div>
    );
}

// ─── Top Products Bar + Line Combo ────────────────────────────────────────────
function TopProductsBarChart({ products }) {
    const data = (products || []).slice(0, 6).map(item => ({
        name: item.product?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown',
        revenue: parseFloat(item.total_revenue || 0),
        sold: parseInt(item.total_sold || 0),
    }));
    const COLORS = ['#6366F1', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    if (data.length === 0) {
        return (
            <div className="flex h-56 items-center justify-center text-gray-400 text-sm">
                No product data for this period.
            </div>
        );
    }

    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 15, left: -10, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10 }} angle={-25} textAnchor="end" interval={0} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                        tickFormatter={v => `৳${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}
                        tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                    <Tooltip
                        contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 12 }}
                        formatter={(v, name) => [
                            name === 'revenue' ? `৳${Number(v).toLocaleString()}` : v,
                            name === 'revenue' ? 'Revenue' : 'Units Sold'
                        ]}
                    />
                    <Bar yAxisId="left" dataKey="revenue" radius={[5, 5, 0, 0]} maxBarSize={36}>
                        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="sold"
                        stroke="#93C5FD" strokeWidth={2} dot={{ fill: '#3B82F6', r: 3 }} />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}


// ══════════════════════════════════════════════════════════════════════════════
// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard({
    overview,
    stats,
    recentOrders,
    chartData,
    topProducts,
    alerts,
    currentFilter = 'today'
}) {
    const handleFilterChange = (e) => {
        router.get(route('admin.dashboard'), { filter: e.target.value }, { preserveState: true });
    };

    const StatCard = ({ title, value, subtitle, icon, colorClass, bgColorClass }) => (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center transition-all hover:shadow-md">
            <div className={`p-4 rounded-xl ${bgColorClass} ${colorClass}`}>{icon}</div>
            <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );

    const MiniStatCard = ({ title, value, colorClass, bgColorClass, icon }) => (
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center transition-all hover:shadow-md">
            <div className={`p-3 rounded-xl ${bgColorClass} ${colorClass}`}>{icon}</div>
            <div className="ml-4">
                <p className="text-xs font-medium text-gray-500 mb-0.5">{title}</p>
                <h3 className="text-xl font-bold text-gray-900">{value}</h3>
            </div>
        </div>
    );

    const statusBadge = (status) => {
        const map = {
            pending:   'bg-amber-100 text-amber-700',
            shipped:   'bg-blue-100 text-blue-700',
            delivered: 'bg-emerald-100 text-emerald-700',
            returned:  'bg-indigo-100 text-indigo-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return map[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <AdminLayout>
            <Head title="Command Center Dashboard" />

            {/* ── Header & Filter ── */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Monitor your store's performance and actionable alerts.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-sm text-gray-500 pl-2">Timeframe:</span>
                    <select value={currentFilter} onChange={handleFilterChange}
                        className="border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer">
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="this_week">This Week</option>
                        <option value="this_month">This Month</option>
                        <option value="last_30_days">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* ── 1. Primary KPI Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Product Revenue"
                    value={`৳${(overview?.revenue || 0).toLocaleString()}`}
                    subtitle={`Margin: ৳${(overview?.margin || 0).toLocaleString()}`}
                    colorClass="text-emerald-600" bgColorClass="bg-emerald-50"
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <StatCard
                    title="Conversion Rate"
                    value={`${overview?.conversionRate || 0}%`}
                    subtitle={`From ${(overview?.views || 0).toLocaleString()} views`}
                    colorClass="text-indigo-600" bgColorClass="bg-indigo-50"
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                />
                <StatCard
                    title="Total Orders"
                    value={(stats?.totalOrders || 0).toLocaleString()}
                    subtitle="Lifetime orders"
                    colorClass="text-blue-600" bgColorClass="bg-blue-50"
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                />
                <StatCard
                    title="Total Customers"
                    value={(stats?.totalCustomers || 0).toLocaleString()}
                    subtitle="Registered users"
                    colorClass="text-purple-600" bgColorClass="bg-purple-50"
                    icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                />
            </div>

            {/* ── 2. Order Status: Mini Cards + Donut ── */}
            <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider font-bold text-gray-500 mb-3 ml-1">Order Status Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
                        <MiniStatCard title="Pending" value={stats?.pendingOrders || 0}
                            colorClass="text-amber-600" bgColorClass="bg-amber-50"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <MiniStatCard title="Shipped" value={stats?.shippedOrders || 0}
                            colorClass="text-blue-600" bgColorClass="bg-blue-50"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>}
                        />
                        <MiniStatCard title="Delivered" value={stats?.deliveredOrders || 0}
                            colorClass="text-emerald-600" bgColorClass="bg-emerald-50"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <MiniStatCard title="Returned" value={stats?.returnedOrders || 0}
                            colorClass="text-indigo-600" bgColorClass="bg-indigo-50"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>}
                        />
                        <MiniStatCard title="Cancelled" value={stats?.cancelledOrders || 0}
                            colorClass="text-red-600" bgColorClass="bg-red-50"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <MiniStatCard title="Total Products" value={stats?.totalProducts || 0}
                            colorClass="text-gray-600" bgColorClass="bg-gray-100"
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                        />
                    </div>
                    <div className="lg:col-span-1">
                        <OrderStatusDonut stats={stats} />
                    </div>
                </div>
            </div>

            {/* ── 3. ORDER TIMELINE CHART ── */}
            <OrderTimelineChart />

            {/* ── 4. Revenue Chart + AI Alerts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Product Revenue Trend</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Daily revenue for the selected period</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Revenue
                        </span>
                    </div>
                    <RevenueTrendChart chartData={chartData} />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden flex flex-col">
                    <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-md font-bold text-red-800">Action Required</h3>
                    </div>
                    <div className="p-4 flex-1 overflow-y-auto max-h-72 space-y-4">
                        {(!alerts?.stockouts?.length && !alerts?.lowStock?.length) ? (
                            <p className="text-sm text-gray-500 text-center mt-10">Inventory looks healthy! No immediate action needed.</p>
                        ) : (
                            <>
                                {alerts.lowStock?.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start border-b border-gray-50 pb-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                            {item.product?.thumbnail && <img src={`/storage/${item.product.thumbnail}`} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{item.product?.name}</p>
                                            <p className="text-xs font-bold text-red-600 mt-1">Out of Stock (or low)</p>
                                        </div>
                                    </div>
                                ))}
                                {alerts.stockouts?.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex gap-3 items-start border-b border-gray-50 pb-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                                            {item.product?.thumbnail && <img src={`/storage/${item.product.thumbnail}`} className="w-full h-full object-cover" alt="" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{item.product?.name}</p>
                                            <p className="text-xs text-amber-600 font-medium mt-1">
                                                AI Predicts stockout in {item.days_until_stockout} days
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <Link href={route('admin.products.index')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                            Manage Inventory &rarr;
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── 5. Top Performers: Chart + Ranked List ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Top Performers</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Revenue & units sold for the selected period</p>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Revenue (bar)</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-300 inline-block rounded" />Units sold (line)</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                    <div className="p-6">
                        <TopProductsBarChart products={topProducts} />
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {topProducts && topProducts.length > 0 ? (
                            topProducts.slice(0, 5).map((item, index) => (
                                <li key={index} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                    <span className="text-sm font-bold text-gray-300 w-5 text-center flex-shrink-0">{index + 1}</span>
                                    <div className="w-11 h-11 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.product?.thumbnail && (
                                            <img src={`/storage/${item.product.thumbnail}`} className="w-full h-full object-cover" alt="" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{item.product?.name || 'Unknown Product'}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.total_sold} units sold</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-bold text-emerald-600">৳{parseFloat(item.total_revenue || 0).toLocaleString()}</p>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="p-8 text-center text-sm text-gray-400">No product data available yet.</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* ── 6. Recent Orders Table ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                    <Link href={route('admin.orders.index')} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        View all &rarr;
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 font-medium">Order ID</th>
                                <th className="px-5 py-3 font-medium">Customer</th>
                                <th className="px-5 py-3 font-medium">Order Total</th>
                                <th className="px-5 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders && recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4 font-semibold text-gray-900">#{order.id}</td>
                                        <td className="px-5 py-4">{order.user?.name || order.customer_name || 'Guest'}</td>
                                        <td className="px-5 py-4 font-medium text-gray-900">৳{parseFloat(order.total_amount).toFixed(2)}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusBadge(order.order_status)}`}>
                                                {order.order_status
                                                    ? order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)
                                                    : 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-5 py-8 text-center text-gray-400">No recent orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </AdminLayout>
    );
}