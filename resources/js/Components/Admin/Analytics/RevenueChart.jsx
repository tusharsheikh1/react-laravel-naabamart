import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue & Views Trend</h3>
            <div className="h-full w-full pb-6">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                            }}
                            dy={10}
                        />
                        {/* Left Axis for Revenue */}
                        <YAxis 
                            yAxisId="left"
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(value) => `৳${value.toLocaleString()}`}
                        />
                        {/* Right Axis for Views */}
                        <YAxis 
                            yAxisId="right"
                            orientation="right"
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            formatter={(value, name) => [
                                name === 'daily_revenue' ? `৳${Number(value).toLocaleString()}` : value, 
                                name === 'daily_revenue' ? 'Revenue' : 'Views'
                            ]}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                        />
                        <Area 
                            yAxisId="left"
                            type="monotone" 
                            dataKey="daily_revenue" 
                            name="daily_revenue"
                            stroke="#10B981" 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                            strokeWidth={3}
                        />
                        <Area 
                            yAxisId="right"
                            type="monotone" 
                            dataKey="daily_views" 
                            name="daily_views"
                            stroke="#3B82F6" 
                            fillOpacity={1} 
                            fill="url(#colorViews)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}