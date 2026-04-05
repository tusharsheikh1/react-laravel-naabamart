import React from 'react';
import { Link } from '@inertiajs/react';

const TopProductsTable = ({ products }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Products</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-3 px-4 text-sm font-medium text-gray-500">Product</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500">Revenue</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500">Sold</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Conv. Rate</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">ATC Rate</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Aband. Rate</th>
                            <th className="py-3 px-4 text-sm font-medium text-gray-500 text-center">Returns</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item) => (
                            <tr key={item.product_id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={item.product?.thumbnail || '/placeholder.png'} 
                                            alt="" 
                                            className="w-10 h-10 rounded shadow-sm object-cover"
                                        />
                                        <span className="font-medium text-gray-700 line-clamp-1">{item.product?.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-600 font-semibold">
                                    ৳{parseFloat(item.total_revenue).toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-gray-600">{item.total_sold} units</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseFloat(item.avg_conversion_rate) > 2 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {parseFloat(item.avg_conversion_rate).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center text-sm text-gray-600">
                                    {parseFloat(item.avg_atc_rate).toFixed(2)}%
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${parseFloat(item.avg_abandonment_rate) > 70 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {parseFloat(item.avg_abandonment_rate).toFixed(2)}%
                                    </span>
                                </td>
                                <td className="py-3 px-4 text-center text-gray-600">
                                    {item.total_returns > 0 ? (
                                        <span className="text-red-500 font-medium">{item.total_returns}</span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopProductsTable;