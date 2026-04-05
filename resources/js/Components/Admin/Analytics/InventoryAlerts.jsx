import React from 'react';

export default function InventoryAlerts({ alerts }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8 h-full">
            {/* Stockout Predictions */}
            <div>
                <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Real-Time Stockout Risk (14 Days)
                </h3>
                {!alerts.stockouts || alerts.stockouts.length === 0 ? (
                    <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-sm text-center border border-gray-100">
                        No immediate stockouts predicted based on AI velocity.
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {alerts.stockouts.map(alert => (
                            <li key={alert.product_id} className="text-sm flex flex-col p-3 bg-red-50 border border-red-100 rounded-lg text-red-800 shadow-sm">
                                <div className="flex justify-between font-bold mb-1">
                                    <span className="truncate pr-2">{alert.product?.name}</span>
                                    <span className="whitespace-nowrap bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs">
                                        {alert.days_until_stockout} days left
                                    </span>
                                </div>
                                <div className="text-xs flex justify-between opacity-80 font-medium">
                                    <span>Current Stock: {alert.total_stock}</span>
                                    <span>Empty by: {new Date(alert.predicted_stockout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Low Stock Hard Alerts */}
            <div>
                <h3 className="text-lg font-bold text-amber-600 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                    Low Stock Threshold Reached
                </h3>
                {!alerts.lowStock || alerts.lowStock.length === 0 ? (
                    <div className="bg-gray-50 text-gray-500 p-4 rounded-lg text-sm text-center border border-gray-100">
                        Inventory levels are healthy across all products.
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {alerts.lowStock.map(alert => (
                            <li key={alert.id} className="text-sm flex justify-between items-center p-3 bg-amber-50 border border-amber-100 rounded-lg text-amber-900 shadow-sm">
                                <span className="truncate pr-4 font-medium">{alert.product?.name}</span>
                                <span className="font-bold whitespace-nowrap bg-amber-200 text-amber-900 px-2 py-1 rounded text-xs">
                                    {alert.current_stock} left
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}