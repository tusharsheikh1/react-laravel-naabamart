import React from 'react';

export default function StatCard({ title, value, prefix = '', suffix = '', icon }) {
    return (
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between border border-gray-100">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    {prefix}{value.toLocaleString()}{suffix}
                </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
                {icon}
            </div>
        </div>
    );
}