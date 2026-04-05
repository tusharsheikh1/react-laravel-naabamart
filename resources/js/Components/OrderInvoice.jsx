// resources/js/Components/OrderInvoice.jsx
import React from 'react';

export default function OrderInvoice({ order }) {
    return (
        <div className="space-y-8">
            {/* Items */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800">Order Items</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {order.items.map((item) => (
                        <div key={item.id} className="p-6 flex items-center gap-6">
                            <div className="h-20 w-20 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 print:hidden">
                                {item.product?.thumbnail ? (
                                    <img src={`/storage/${item.product.thumbnail}`} className="h-full w-full object-cover" alt="" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs text-center p-2">No Image</div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-gray-900 truncate">{item.product?.name || 'Deleted Product'}</h4>
                                <div className="mt-1 flex gap-4 text-sm text-gray-500">
                                    {item.color && <span className="inline-flex items-center gap-1">Color: <span className="text-gray-900 font-medium px-2 py-0.5 bg-gray-100 rounded-md">{item.color}</span></span>}
                                    {item.size  && <span className="inline-flex items-center gap-1">Size: <span className="text-gray-900 font-medium px-2 py-0.5 bg-gray-100 rounded-md">{item.size}</span></span>}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-bold text-gray-900">৳{Number(item.price * item.quantity).toLocaleString()}</p>
                                <p className="text-sm text-gray-500">৳{Number(item.price).toLocaleString()} × {item.quantity}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Payment Method</span>
                            <span className="font-medium uppercase">{order.payment_method}</span>
                        </div>
                        <div className="flex justify-between text-xl font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total Amount</span>
                            <span>৳{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Info</h3>
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Account Name</p>
                            <p className="font-semibold">{order.user?.name || 'Guest Checkout'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email Address</p>
                            <p className="font-semibold break-all">{order.user?.email || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Shipping Destination</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <p className="text-sm font-medium">{order.customer_name}</p>
                            <p className="text-sm text-indigo-600 font-bold">{order.customer_phone}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm leading-relaxed">
                            <span className="block font-bold mb-1">{order.shipping_area}</span>
                            {order.shipping_address}
                        </div>
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Notes</h3>
                <p className="text-gray-700 italic">{order.notes || 'No instructions provided.'}</p>
            </div>
        </div>
    );
}