import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, lazy, Suspense } from 'react';
import axios from 'axios';
import InternalAdminNotes from '@/Components/InternalAdminNotes';

// =========================================================================
// Lazy Loaded Components (Loaded asynchronously to speed up initial paint)
// =========================================================================
const CourierHistory = lazy(() => import('@/Components/CourierHistory'));
const TrustAndTracking = lazy(() => import('@/Components/TrustAndTracking'));
const SteadfastLogistics = lazy(() => import('@/Components/SteadfastLogistics'));
const EditHistoryLog = lazy(() => import('@/Components/EditHistoryLog'));

// Skeleton loader to show while the heavy components are being fetched/rendered
const SidebarSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        <div className="bg-white/50 p-6 rounded-2xl border border-gray-100 h-48"></div>
        <div className="bg-white/50 p-6 rounded-2xl border border-gray-100 h-32"></div>
        <div className="bg-white/50 p-6 rounded-2xl border border-gray-100 h-64"></div>
    </div>
);

const StatusBadge = ({ status, config, className = "" }) => {
    const style = config[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const label = status?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${style.bg} ${style.text} ${className}`}>
            {label || 'N/A'}
        </span>
    );
};

export default function Show({ 
    order, 
    initialCourierHistory, 
    courierHistoryFetchedAt, 
    customerHistory = [], 
    historySummary = { total_orders: 0, delivered: 0, cancelled: 0 },
    availableProducts = [],
    staffMembers = [] 
}) {
    // ----------------------
    // STATE & FORMS
    // ----------------------
    const { data: statusData, setData: setStatusData, put: putStatus, processing: processingStatus } = useForm({
        order_status: order.order_status,
        payment_status: order.payment_status,
    });

    const { data: assignData, setData: setAssignData, post: postAssign, processing: processingAssign } = useForm({
        staff_id: order.assigned_to || '',
    });

    const [liveStatus, setLiveStatus] = useState(null);
    const [fetchingStatus, setFetchingStatus] = useState(false);
    
    // State to delay rendering of the sidebar to unblock initial paint
    const [loadExtras, setLoadExtras] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const editForm = useForm({
        customer_name: order.customer_name || '',
        customer_phone: order.customer_phone || '',
        shipping_area: order.shipping_area || '',
        shipping_address: order.shipping_address || '',
        notes: order.notes || '',
        new_admin_note: '', 
        items: order.items ? order.items.map(i => ({...i})) : [],
    });

    // ----------------------
    // CONFIG & HELPERS
    // ----------------------
    const statusConfigs = {
        order: {
            pending:           { bg: 'bg-yellow-100', text: 'text-yellow-800' },
            call_dite_hobe:    { bg: 'bg-orange-100', text: 'text-orange-800' },
            call_dhorena:      { bg: 'bg-pink-100',   text: 'text-pink-800'   },
            pore_nibe:         { bg: 'bg-purple-100', text: 'text-purple-800' },
            processing:        { bg: 'bg-blue-100',   text: 'text-blue-800'   },
            shipped:           { bg: 'bg-indigo-100', text: 'text-indigo-800' },
            delivered:         { bg: 'bg-green-100',  text: 'text-green-800'  },
            cancelled:         { bg: 'bg-red-100',    text: 'text-red-800'    },
            partially_cancelled:{ bg: 'bg-red-100',    text: 'text-red-800'    },
            number_off:        { bg: 'bg-red-100',    text: 'text-red-800'    },
            vule_order_korche: { bg: 'bg-red-100',    text: 'text-red-800'    },
            way_to_return:     { bg: 'bg-orange-100', text: 'text-orange-800' }, 
            returned:          { bg: 'bg-red-200',    text: 'text-red-900'    },    
        },
        payment: {
            pending:  { bg: 'bg-orange-100',  text: 'text-orange-800'  },
            paid:     { bg: 'bg-emerald-100', text: 'text-emerald-800' },
            failed:   { bg: 'bg-red-100',     text: 'text-red-800'     },
            refunded: { bg: 'bg-gray-200',    text: 'text-gray-800'    }, 
        },
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        let parseableString = dateString;
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
            parseableString = dateString.replace(' ', 'T') + 'Z';
        }
        const date = new Date(parseableString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // ----------------------
    // HANDLERS
    // ----------------------
    const handleUpdateStatus = (e) => {
        e.preventDefault();
        putStatus(route('admin.orders.update-status', order.id));
    };

    const handleAssignStaff = (e) => {
        e.preventDefault();
        postAssign(route('admin.orders.assign', order.id), { preserveScroll: true });
    };

    const handleSendToSteadfast = () => {
        if (confirm('Send this order to Steadfast Courier?')) {
            router.post(route('admin.orders.steadfast.send', order.id));
        }
    };

    const handleBlockUser = () => {
        if (confirm("🚨 SECURITY WARNING: Are you sure you want to block this user's IP and Device? They will no longer be able to place orders.")) {
            router.post(route('admin.orders.block', order.id));
        }
    };

    const fetchLiveStatus = () => {
        if (!order.consignment_id) return;
        setFetchingStatus(true);
        axios.get(route('admin.orders.steadfast.status', order.id))
            .then(res => res.data.success && setLiveStatus(res.data.delivery_status))
            .finally(() => setFetchingStatus(false));
    };

    // ----------------------
    // LIFECYCLE
    // ----------------------
    useEffect(() => { 
        fetchLiveStatus(); 
        
        // Yield to the browser to paint the main left-side UI first, 
        // then silently load the heavier components.
        const timer = setTimeout(() => {
            setLoadExtras(true);
        }, 100);
        
        return () => clearTimeout(timer);
    }, [order.consignment_id]);

    const handleAddProduct = (e) => {
        const productId = e.target.value;
        if (!productId) return;
        const product = availableProducts.find(p => p.id == productId);
        if (product) {
            editForm.setData('items', [
                ...editForm.data.items,
                {
                    product_id: product.id,
                    product: product, 
                    price: product.discount_price || product.price,
                    quantity: 1, color: '', size: ''
                }
            ]);
        }
        e.target.value = ""; 
    };

    const handleRemoveItem = (index) => {
        const newItems = [...editForm.data.items];
        newItems.splice(index, 1);
        editForm.setData('items', newItems);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...editForm.data.items];
        newItems[index][field] = value;
        editForm.setData('items', newItems);
    };

    const submitOrderDetails = (e) => {
        e.preventDefault();
        editForm.put(route('admin.orders.update', order.id), {
            onSuccess: () => {
                setIsEditing(false);
                editForm.setData('new_admin_note', ''); 
            }
        });
    };

    const currentTotal = isEditing 
        ? editForm.data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        : order.total_amount;

    return (
        <AdminLayout>
            <Head title={`Order ${order.order_number}`} />

            {/* HEADER SECTION */}
            <div className="mb-6 print:hidden">
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Link href={route('admin.orders.index')} className="hover:text-indigo-600 transition-colors">Orders</Link>
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    <span className="text-gray-900 font-semibold">{order.order_number}</span>
                </nav>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{order.order_number}</h1>
                            <StatusBadge status={order.order_status} config={statusConfigs.order} />
                            <StatusBadge status={order.payment_status} config={statusConfigs.payment} />
                            
                            {order.assigned_staff && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Assigned: {order.assigned_staff.name}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            Placed on <span className="font-medium text-gray-700">{formatDateTime(order.created_at)}</span> 
                            via <span className="font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md">{order.order_source || 'Website'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* ACTION TOOLBAR (Status + Assignment + Print/Block) */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 print:hidden">
                <div className="flex flex-wrap items-end gap-6">
                    {/* Status Updates */}
                    <form onSubmit={handleUpdateStatus} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Order Status</label>
                            <select
                                value={statusData.order_status}
                                onChange={e => setStatusData('order_status', e.target.value)}
                                className="w-40 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 shadow-sm"
                            >
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="partially_cancelled">Partially Cancelled</option>
                                <option value="call_dite_hobe">Call Dite Hobe</option>
                                <option value="call_dhorena">Call Dhorena</option>
                                <option value="pore_nibe">Pore Nibe</option>
                                <option value="number_off">Number Off (Cancelled)</option>
                                <option value="vule_order_korche">Vule Order Korche (Cancelled)</option>
                                <option disabled>──────────</option>
                                <option value="way_to_return">Way to Return</option>
                                <option value="returned">Returned</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Payment</label>
                            <select
                                value={statusData.payment_status}
                                onChange={e => setStatusData('payment_status', e.target.value)}
                                className="w-32 rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 text-sm py-2 shadow-sm"
                            >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={processingStatus}
                            className="bg-indigo-600 text-white rounded-lg px-4 py-2 font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-70 text-sm h-[38px] whitespace-nowrap flex items-center gap-2"
                        >
                            {processingStatus ? '...' : 'Update'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                    {/* Staff Assignment */}
                    <form onSubmit={handleAssignStaff} className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                Assign Staff
                            </label>
                            <select
                                value={assignData.staff_id}
                                onChange={e => setAssignData('staff_id', e.target.value)}
                                className="w-40 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500 text-sm py-2 shadow-sm"
                            >
                                <option value="">-- Unassigned --</option>
                                {staffMembers && staffMembers.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={processingAssign || assignData.staff_id == order.assigned_to || !assignData.staff_id}
                            className="bg-blue-50 text-blue-700 border border-blue-200 rounded-lg px-4 py-2 font-semibold hover:bg-blue-600 hover:text-white disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 transition-colors shadow-sm text-sm h-[38px] whitespace-nowrap"
                        >
                            {processingAssign ? '...' : 'Assign'}
                        </button>
                    </form>
                </div>

                <div className="flex gap-3 xl:ml-auto">
                    <button
                        type="button"
                        onClick={handleBlockUser}
                        className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm text-sm font-semibold text-red-700 hover:bg-red-600 hover:text-white focus:ring-2 focus:ring-red-500 transition h-[38px] whitespace-nowrap"
                        title="Block IP and Device Fingerprint"
                    >
                        <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        Block Device
                    </button>
                    
                    <a
                        href={route('admin.orders.label', order.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition h-[38px] whitespace-nowrap"
                    >
                        <svg className="mr-2 h-4 w-4 text-gray-500 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Print Label
                    </a>
                    <a
                        href={route('admin.orders.invoice', order.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition h-[38px] whitespace-nowrap"
                    >
                        <svg className="mr-2 h-4 w-4 text-gray-500 group-hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Invoice
                    </a>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT MAIN - ORDER DETAILS */}
                <div className="lg:col-span-8 space-y-6 relative">
                    <form onSubmit={submitOrderDetails}>
                        
                        {/* Control Edit Toggle */}
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {isEditing ? 'Editing Order Information' : 'Order Information'}
                            </h2>
                            {!isEditing && (
                                <button type="button" onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-sm flex items-center gap-2 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Edit Details
                                </button>
                            )}
                        </div>

                        {/* Customer & Shipping Details */}
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isEditing ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-gray-200'} mb-6 transition-all`}>
                            <h3 className="text-base font-bold text-gray-900 mb-5 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Customer Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Customer Name</label>
                                    {isEditing ? (
                                        <input type="text" required value={editForm.data.customer_name} onChange={e => editForm.setData('customer_name', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                    ) : (
                                        <p className="font-medium text-gray-900 text-base">{order.customer_name || 'N/A'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                                    {isEditing ? (
                                        <input type="text" required value={editForm.data.customer_phone} onChange={e => editForm.setData('customer_phone', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                    ) : (
                                        <p className="font-medium text-gray-900 text-base">{order.customer_phone || 'N/A'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shipping Area</label>
                                    {isEditing ? (
                                        <input type="text" required value={editForm.data.shipping_area} onChange={e => editForm.setData('shipping_area', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                    ) : (
                                        <p className="font-medium text-gray-900 text-base">{order.shipping_area || 'N/A'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Address</label>
                                    {isEditing ? (
                                        <textarea required value={editForm.data.shipping_address} onChange={e => editForm.setData('shipping_address', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows="2"></textarea>
                                    ) : (
                                        <p className="font-medium text-gray-900 text-base">{order.shipping_address || 'N/A'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order Items Table */}
                        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${isEditing ? 'border-indigo-300 ring-4 ring-indigo-50' : 'border-gray-200'} mb-6 transition-all`}>
                            <h3 className="text-base font-bold text-gray-900 mb-5 pb-2 border-b border-gray-100 flex items-center gap-2">
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                Order Items
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
                                    <thead>
                                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-y border-gray-200">
                                            <th className="py-3 px-4 w-1/2">Product</th>
                                            <th className="py-3 px-4 text-right">Price</th>
                                            <th className="py-3 px-4 text-center">Qty</th>
                                            <th className="py-3 px-4 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(isEditing ? editForm.data.items : order.items)?.map((item, index) => (
                                            <tr key={index} className="group hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-gray-900 mb-1">{item.product?.name || `Product #${item.product_id}`}</p>
                                                    {isEditing ? (
                                                        <div className="flex gap-2 mt-2">
                                                            <input type="text" placeholder="Color" value={item.color || ''} onChange={e => handleItemChange(index, 'color', e.target.value)} className="w-24 text-sm border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                                            <input type="text" placeholder="Size" value={item.size || ''} onChange={e => handleItemChange(index, 'size', e.target.value)} className="w-24 text-sm border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                                                        </div>
                                                    ) : (
                                                        (item.color || item.size) && (
                                                            <div className="flex gap-2 mt-1">
                                                                {item.color && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Color: {item.color}</span>}
                                                                {item.size && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">Size: {item.size}</span>}
                                                            </div>
                                                        )
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right font-medium text-gray-600 align-top md:align-middle">
                                                    {isEditing ? (
                                                        <input type="number" min="0" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} className="w-24 text-sm border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right ml-auto" required />
                                                    ) : (
                                                        `৳${item.price}`
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-center align-top md:align-middle">
                                                    {isEditing ? (
                                                        <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} className="w-20 text-sm border-gray-300 rounded shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center mx-auto" required />
                                                    ) : (
                                                        <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{item.quantity}</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-gray-900 relative align-top md:align-middle">
                                                    ৳{item.price * item.quantity}
                                                    {isEditing && (
                                                        <button type="button" onClick={() => handleRemoveItem(index)} className="absolute -right-2 top-1/2 -translate-y-1/2 text-red-500 hover:text-white bg-red-50 hover:bg-red-600 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {isEditing && (
                                    <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
                                        <select onChange={handleAddProduct} defaultValue="" className="w-full md:w-1/2 text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                            <option value="" disabled>+ Add a product to order...</option>
                                            {availableProducts.map(prod => (
                                                <option key={prod.id} value={prod.id}>{prod.name} (৳{prod.discount_price || prod.price})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-end border-t border-gray-100 pt-6 gap-6">
                                <div className="w-full md:w-1/2">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Customer Notes / Shipping
                                    </label>
                                    {isEditing ? (
                                        <textarea value={editForm.data.notes} onChange={e => editForm.setData('notes', e.target.value)} className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows="3" placeholder="Notes visible on invoice..."></textarea>
                                    ) : (
                                        <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100/50">
                                            <p className="text-gray-700 text-sm">{order.notes || <span className="italic text-gray-400">No notes provided.</span>}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right w-full md:w-auto bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <p className="text-slate-500 uppercase tracking-wider text-xs font-bold mb-1">Total Amount</p>
                                    <p className="text-4xl font-black text-indigo-600">৳{currentTotal}</p>
                                </div>
                            </div>
                        </div>

                        {/* Internal Admin Notes */}
                        <InternalAdminNotes 
                            order={order} 
                            isEditing={isEditing} 
                            editForm={editForm} 
                            formatDateTime={formatDateTime} 
                        />

                        {/* EDIT MODE ACTION BUTTONS */}
                        {isEditing && (
                            <div className="sticky bottom-6 z-50 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-indigo-100 flex justify-end gap-3 mt-8">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        editForm.reset(); 
                                    }} 
                                    className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={editForm.processing} 
                                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    {editForm.processing ? 'Saving...' : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </form>
                </div>

                {/* RIGHT SIDEBAR (Lazy Loaded + Deferred) */}
                <div className="lg:col-span-4 space-y-6 print:hidden">
                    {loadExtras ? (
                        <Suspense fallback={<SidebarSkeleton />}>
                            <TrustAndTracking 
                                order={order}
                                historySummary={historySummary}
                                customerHistory={customerHistory}
                            />
                            
                            <EditHistoryLog 
                                history={order.edit_history} 
                                formatDateTime={formatDateTime} 
                            />

                            <SteadfastLogistics 
                                order={order}
                                liveStatus={liveStatus}
                                fetchingStatus={fetchingStatus}
                                fetchLiveStatus={fetchLiveStatus}
                                handleSendToSteadfast={handleSendToSteadfast}
                            />
                            
                            <CourierHistory
                                orderId={order.id}
                                customerPhone={order.customer_phone}
                                initialHistory={initialCourierHistory}
                                fetchedAt={courierHistoryFetchedAt}
                            />
                        </Suspense>
                    ) : (
                        <SidebarSkeleton />
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}