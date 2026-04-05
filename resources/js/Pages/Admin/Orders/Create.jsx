import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Create({ products, shippingMethods, staffMembers, lead }) {
    const { data, setData, post, processing, errors } = useForm({
        customer_name: lead?.full_name || '',
        customer_phone: lead?.phone || '',
        shipping_area: '',
        shipping_address: lead?.address || '',
        order_source: lead ? 'Website' : 'Phone',
        payment_method: 'cod',
        payment_status: 'pending',
        assigned_to: '', 
        lead_id: lead?.id || '', // Track the lead ID for conversion
        items: []
    });

    // Handle complex data like Cart Items from the lead
    useEffect(() => {
        if (lead?.cart_data) {
            const leadItems = Object.values(lead.cart_data).map(item => ({
                product_id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price
            }));
            setData('items', leadItems);
        }
    }, [lead]);

    const addItem = (productId) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return;
        
        setData('items', [...data.items, {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            price: product.price
        }]);
    };

    const removeItem = (index) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.orders.store'));
    };

    return (
        <AdminLayout>
            <Head title={lead ? "Convert Lead to Order" : "Create Manual Order"} />
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">
                        {lead ? `Convert Lead: ${lead.phone}` : "Create Manual Order"}
                    </h1>
                    {lead && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Lead Conversion
                        </span>
                    )}
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Order Source</label>
                            <select 
                                value={data.order_source} 
                                onChange={e => setData('order_source', e.target.value)}
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="Phone">Phone Call</option>
                                <option value="Message">Message (FB/WhatsApp)</option>
                                <option value="Website">Website (Manual Entry)</option>
                            </select>
                            {errors.order_source && <span className="text-red-500 text-xs mt-1">{errors.order_source}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Assign To Staff</label>
                            <select 
                                value={data.assigned_to} 
                                onChange={e => setData('assigned_to', e.target.value)}
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Auto Assign (Least Busy)</option>
                                {staffMembers && staffMembers.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name}
                                    </option>
                                ))}
                            </select>
                            {errors.assigned_to && <span className="text-red-500 text-xs mt-1">{errors.assigned_to}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Customer Name</label>
                            <input 
                                type="text" 
                                value={data.customer_name} 
                                onChange={e => setData('customer_name', e.target.value)} 
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                            {errors.customer_name && <span className="text-red-500 text-xs mt-1">{errors.customer_name}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Phone Number</label>
                            <input 
                                type="text" 
                                value={data.customer_phone} 
                                onChange={e => setData('customer_phone', e.target.value)} 
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                            />
                            {errors.customer_phone && <span className="text-red-500 text-xs mt-1">{errors.customer_phone}</span>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Delivery Area</label>
                            <select 
                                value={data.shipping_area} 
                                onChange={e => setData('shipping_area', e.target.value)} 
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Select Area</option>
                                {shippingMethods.map(sm => (
                                    <option key={sm.id} value={sm.name}>{sm.name}</option>
                                ))}
                            </select>
                            {errors.shipping_area && <span className="text-red-500 text-xs mt-1">{errors.shipping_area}</span>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Full Address</label>
                            <textarea 
                                value={data.shipping_address} 
                                onChange={e => setData('shipping_address', e.target.value)} 
                                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                                rows="3"
                            />
                            {errors.shipping_address && <span className="text-red-500 text-xs mt-1">{errors.shipping_address}</span>}
                        </div>
                    </div>

                    <div className="border-t pt-4 mt-6">
                        <h3 className="font-bold mb-2">Select Products</h3>
                        {errors.items && <div className="text-red-500 text-xs mb-2">{errors.items}</div>}
                        
                        <select 
                            onChange={e => {
                                addItem(e.target.value);
                                e.target.value = ''; // Reset select after adding
                            }} 
                            className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 mb-4"
                        >
                            <option value="">Search/Select Product to Add...</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - ৳{p.price}</option>
                            ))}
                        </select>

                        {data.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="py-2 px-2 font-medium text-sm text-gray-700">Product</th>
                                            <th className="py-2 px-2 font-medium text-sm text-gray-700 w-24">Price</th>
                                            <th className="py-2 px-2 font-medium text-sm text-gray-700 w-24">Qty</th>
                                            <th className="py-2 px-2 font-medium text-sm text-gray-700 w-20 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="border-b text-sm">
                                                <td className="py-2 px-2">{item.name}</td>
                                                <td className="py-2 px-2">৳{item.price}</td>
                                                <td className="py-2 px-2">
                                                    <input 
                                                        type="number" 
                                                        min="1"
                                                        value={item.quantity} 
                                                        onChange={e => {
                                                            const items = [...data.items];
                                                            items[index].quantity = parseInt(e.target.value) || 1;
                                                            setData('items', items);
                                                        }}
                                                        className="w-16 rounded border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1" 
                                                    />
                                                </td>
                                                <td className="py-2 px-2 text-right">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeItem(index)} 
                                                        className="text-red-600 hover:text-red-800 font-medium text-xs uppercase"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-sm border rounded bg-gray-50">
                                No products added to the order yet.
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t mt-6">
                        <button 
                            type="submit" 
                            disabled={processing || data.items.length === 0}
                            className="bg-black text-white px-8 py-3 rounded-md font-bold disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                        >
                            {processing ? 'Saving...' : 'Save Order'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}