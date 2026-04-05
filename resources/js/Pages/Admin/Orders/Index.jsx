import AdminLayout from '@/Layouts/Admin/Layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// =========================================================================
// Global Queue System for Sequential API Loading (Prevents Page Lag)
// =========================================================================

const steadfastQueue = [];
let isProcessingSteadfastQueue = false;

const processSteadfastQueue = async () => {
    if (isProcessingSteadfastQueue) return;
    isProcessingSteadfastQueue = true;

    while (steadfastQueue.length > 0) {
        const { orderId, callback, force } = steadfastQueue.shift();
        
        const cacheKey = `steadfast_status_${orderId}`;
        
        // Skip API call if we aren't forcing a refresh and we have a cached value
        if (!force) {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached !== null) {
                callback(cached);
                continue;
            }
        }

        try {
            const res = await axios.get(route('admin.orders.steadfast.status', orderId));
            if (res.data.success) {
                try { sessionStorage.setItem(cacheKey, res.data.delivery_status); } catch(e){}
                callback(res.data.delivery_status);
            } else {
                callback('error');
            }
        } catch (err) {
            callback('error');
        }
    }
    isProcessingSteadfastQueue = false;
};

const enqueueSteadfastFetch = (orderId, callback, force = false) => {
    const cacheKey = `steadfast_status_${orderId}`;
    if (!force) {
        const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
        if (cached !== null) {
            callback(cached);
            return;
        }
    }
    steadfastQueue.push({ orderId, callback, force });
    processSteadfastQueue();
};

const ratioQueue = [];
let isProcessingRatioQueue = false;

const processRatioQueue = async () => {
    if (isProcessingRatioQueue) return;
    isProcessingRatioQueue = true;

    while (ratioQueue.length > 0) {
        const { phone, callback } = ratioQueue.shift();
        
        const cacheKey = `success_ratio_${phone}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached !== null) {
            callback(JSON.parse(cached));
            continue;
        }

        try {
            const res = await axios.get(route('admin.orders.bdcourier.check'), { params: { phone } });
            let val = 'N/A';
            if (res.data?.status === 'success' && res.data?.courierData?.summary?.success_ratio !== undefined) {
                val = res.data.courierData.summary.success_ratio;
            }
            try { sessionStorage.setItem(cacheKey, JSON.stringify(val)); } catch(e){}
            callback(val);
        } catch (err) {
            try { sessionStorage.setItem(cacheKey, JSON.stringify('N/A')); } catch(e){}
            callback('N/A');
        }
    }
    isProcessingRatioQueue = false;
};

const enqueueRatioFetch = (phone, callback) => {
    const cacheKey = `success_ratio_${phone}`;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
    if (cached !== null) {
        callback(JSON.parse(cached));
        return;
    }
    ratioQueue.push({ phone, callback });
    processRatioQueue();
};

// =========================================================================
// React Components
// =========================================================================

const LiveCourierStatus = ({ order }) => {
    const cacheKey = `steadfast_status_${order.id}`;
    
    // Attempt to load from cache first, then database, preventing blank UI flashes
    const [status, setStatus] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) return cached;
        }
        return order.courier_status || null;
    });

    const [loading, setLoading] = useState(!!order.consignment_id && !status);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (!order.consignment_id) {
            setLoading(false);
            return;
        }

        // Always check the queue in the background after page loads
        enqueueSteadfastFetch(order.id, (fetchedStatus) => {
            if (isMounted) {
                if (fetchedStatus !== 'error') setStatus(fetchedStatus);
                setLoading(false);
            }
        });

        return () => { isMounted = false; };
    }, [order.id, order.consignment_id]);

    const handleRefresh = () => {
        if (!order.consignment_id || isRefreshing) return;
        setIsRefreshing(true);
        // Force bypass cache and hit Steadfast API
        enqueueSteadfastFetch(order.id, (fetchedStatus) => {
            if (fetchedStatus !== 'error') setStatus(fetchedStatus);
            setIsRefreshing(false);
        }, true);
    };

    if (!order.consignment_id) {
        return <span className="text-[11px] text-gray-400 font-medium tracking-wide">Not Synced</span>;
    }

    const getCourierColor = (s) => {
        if (!s) return 'bg-gray-100 text-gray-700 ring-gray-500/20';
        const lower = s.toLowerCase();
        if (lower.includes('delivered')) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
        if (lower.includes('cancelled') || lower.includes('partial')) return 'bg-rose-50 text-rose-700 ring-rose-600/20';
        if (lower === 'pending' || lower === 'in_review') return 'bg-blue-50 text-blue-700 ring-blue-700/20';
        if (lower === 'hold') return 'bg-amber-50 text-amber-700 ring-amber-600/20';
        return 'bg-indigo-50 text-indigo-700 ring-indigo-700/20'; 
    };

    // Show text-based loader only if we have literally no status to display
    if (loading && !status) {
        return <span className="text-[11px] text-indigo-500 font-medium animate-pulse flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Fetching...
        </span>;
    }

    return (
        <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ring-1 ring-inset capitalize shadow-sm transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'} ${getCourierColor(status)}`}>
                {isRefreshing ? (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                )}
                {status ? status.replace(/_/g, ' ') : 'Unknown'}
            </span>
            
            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all ${isRefreshing ? 'animate-spin text-indigo-400 cursor-not-allowed' : 'active:scale-90'}`}
                title="Force Refresh Latest Status"
            >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>
        </div>
    );
};

const CustomerSuccessRatio = ({ phone, order }) => {
    const cacheKey = `success_ratio_${phone}`;
    
    const [ratio, setRatio] = useState(() => {
        if (order?.success_ratio !== undefined && order?.success_ratio !== null) {
            return order.success_ratio;
        }
        if (typeof window !== 'undefined') {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached !== null) return JSON.parse(cached);
        }
        return null;
    });

    const [loading, setLoading] = useState(ratio === null);

    useEffect(() => {
        let isMounted = true;
        if (!phone || ratio !== null) {
            setLoading(false);
            return;
        }

        enqueueRatioFetch(phone, (fetchedRatio) => {
            if (isMounted) {
                setRatio(fetchedRatio);
                setLoading(false);
            }
        });

        return () => { isMounted = false; };
    }, [phone, ratio]);

    if (!phone) return null;
    if (loading) return <span className="text-[11px] text-indigo-400 ml-2 animate-spin inline-block" title="Loading ratio...">↻</span>;
    if (ratio === 'N/A' || ratio === null) return <span className="text-[10px] text-gray-500 ml-2 bg-gray-100 px-2 py-0.5 rounded-full font-medium shadow-sm" title="No Data Found">N/A</span>;

    const numRatio = Number(ratio);
    let colorClass = 'text-rose-700 bg-rose-50 ring-rose-600/20';
    if (numRatio >= 80) colorClass = 'text-emerald-700 bg-emerald-50 ring-emerald-600/20';
    else if (numRatio >= 50) colorClass = 'text-amber-700 bg-amber-50 ring-amber-600/20';

    return (
        <span className={`text-[10px] font-bold ml-2 px-2 py-0.5 rounded-full ring-1 ring-inset shadow-sm ${colorClass}`} title="Delivery Success Ratio">
            {numRatio.toFixed(0)}%
        </span>
    );
};

export default function Index({ orders, filters, staffMembers = [], todaysOrdersCount = 0, pendingOrdersCount = 0 }) {
    const { delete: destroy } = useForm();
    const isFirstRender = useRef(true);
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [courierFilter, setCourierFilter] = useState(filters?.courier_status || 'all');
    const [sourceFilter, setSourceFilter] = useState(filters?.source || 'all');
    const [assignedStaffFilter, setAssignedStaffFilter] = useState(filters?.assigned_to || 'all');
    const [perPage, setPerPage] = useState(filters?.per_page || '10');

    // Changed default date filter to 'all'
    const [dateFilter, setDateFilter] = useState(filters?.date_filter || 'all');
    const [startDate, setStartDate] = useState(filters?.start_date || '');
    const [endDate, setEndDate] = useState(filters?.end_date || '');

    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkOrderStatus, setBulkOrderStatus] = useState('');
    const [bulkPaymentStatus, setBulkPaymentStatus] = useState('');
    const [bulkStaffId, setBulkStaffId] = useState('');
    const [isSendingSteadfast, setIsSendingSteadfast] = useState(false);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            router.get(route('admin.orders.index'), {
                search: searchTerm,
                status: statusFilter,
                courier_status: courierFilter,
                source: sourceFilter,
                assigned_to: assignedStaffFilter,
                per_page: perPage,
                date_filter: dateFilter,
                start_date: startDate,
                end_date: endDate
            }, { preserveState: true, preserveScroll: true, replace: true });
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, courierFilter, sourceFilter, assignedStaffFilter, perPage, dateFilter, startDate, endDate]);

    useEffect(() => {
        setSelectedIds([]);
    }, [orders.data]);

    const handleExportCSV = () => {
        const queryParams = new URLSearchParams({
            search: searchTerm,
            status: statusFilter,
            courier_status: courierFilter,
            source: sourceFilter,
            assigned_to: assignedStaffFilter,
            date_filter: dateFilter,
            start_date: startDate,
            end_date: endDate
        }).toString();

        window.location.href = `${route('admin.orders.export')}?${queryParams}`;
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this order?')) {
            destroy(route('admin.orders.destroy', id), {
                preserveScroll: true
            });
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(orders.data.map(order => order.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkDelete = () => {
        if (confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) {
            router.post(route('admin.orders.bulk-delete'), { ids: selectedIds }, {
                preserveScroll: true,
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const handleBulkStatusUpdate = () => {
        if (!bulkOrderStatus && !bulkPaymentStatus) {
            alert("Please select a status to update.");
            return;
        }

        if (confirm(`Update status for ${selectedIds.length} orders?`)) {
            router.post(route('admin.orders.bulk-status'), { 
                ids: selectedIds,
                order_status: bulkOrderStatus,
                payment_status: bulkPaymentStatus
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setBulkOrderStatus('');
                    setBulkPaymentStatus('');
                }
            });
        }
    };

    const handleBulkAssign = () => {
        if (!bulkStaffId) {
            alert("Please select a staff member to assign.");
            return;
        }

        if (confirm(`Assign ${selectedIds.length} orders to the selected staff member?`)) {
            router.post(route('admin.orders.bulk-assign'), { 
                ids: selectedIds,
                staff_id: bulkStaffId
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setBulkStaffId('');
                }
            });
        }
    };

    const handleBulkSteadfast = () => {
        if (confirm(`Are you sure you want to send ${selectedIds.length} orders to Steadfast Courier? Their system status will automatically update to "Shipped".`)) {
            router.post(route('admin.orders.steadfast.bulk'), { ids: selectedIds }, {
                preserveScroll: true,
                onBefore: () => setIsSendingSteadfast(true),
                onFinish: () => setIsSendingSteadfast(false),
                onSuccess: () => setSelectedIds([]) 
            });
        }
    };

    const statusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-800 ring-amber-600/20',
            call_dite_hobe: 'bg-orange-50 text-orange-800 ring-orange-600/20',
            call_dhorena: 'bg-pink-50 text-pink-800 ring-pink-600/20',
            pore_nibe: 'bg-purple-50 text-purple-800 ring-purple-600/20',
            processing: 'bg-blue-50 text-blue-800 ring-blue-700/20',
            shipped: 'bg-indigo-50 text-indigo-800 ring-indigo-700/20',
            delivered: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
            cancelled: 'bg-rose-50 text-rose-800 ring-rose-600/20',
            partially_cancelled: 'bg-rose-50 text-rose-800 ring-rose-600/20',
            number_off: 'bg-rose-50 text-rose-800 ring-rose-600/20',
            vule_order_korche: 'bg-rose-50 text-rose-800 ring-rose-600/20',
            way_to_return: 'bg-orange-50 text-orange-800 ring-orange-600/20',
            returned: 'bg-rose-100 text-rose-900 ring-rose-600/30',
            paid: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
            failed: 'bg-rose-50 text-rose-800 ring-rose-600/20',
            refunded: 'bg-gray-100 text-gray-800 ring-gray-600/20',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 ring-gray-600/20';
    };

    return (
        <AdminLayout>
            <Head title="Manage Orders" />

            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Orders Management</h1>
                    <p className="text-sm text-gray-500 mt-1.5 font-medium">Monitor, filter, and process your incoming store orders.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={handleExportCSV}
                        className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        Export CSV
                    </button>

                    <Link 
                        href={route('admin.orders.create')} 
                        className="flex-1 md:flex-none inline-flex justify-center items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 hover:shadow-md transition-all shadow-sm active:scale-95"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Manual Order
                    </Link>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 tracking-wide uppercase">Today's Orders</div>
                        <div className="text-2xl font-extrabold text-gray-900">{todaysOrdersCount}</div>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-default">
                    <div className="bg-amber-50 p-3 rounded-xl text-amber-600 ring-1 ring-inset ring-amber-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-gray-500 tracking-wide uppercase">Pending Orders</div>
                        <div className="text-2xl font-extrabold text-gray-900">{pendingOrdersCount}</div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
                {/* Primary Row: Search & Date */}
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by Order ID, Customer Name, Phone, or Email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">All Time (Default)</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="this_week">This Week</option>
                                <option value="last_week">Last Week</option>
                                <option value="this_month">This Month</option>
                                <option value="last_month">Last Month</option>
                                <option value="this_year">This Year</option>
                                <option value="last_year">Last Year</option>
                                <option value="custom">Custom Range...</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Secondary Row: Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Any System Status</option>
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

                    <select
                        value={courierFilter}
                        onChange={(e) => setCourierFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Any Courier Status</option>
                        <option value="synced">All Synced Orders</option>
                        <option value="not_synced">Not Synced Yet</option>
                        <option disabled>──────────</option>
                        <option value="in_review">In Review</option>
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                        <option value="partial_delivered">Partial Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="hold">Hold</option>
                    </select>

                    <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Any Source</option>
                        <option value="Website">Website</option>
                        <option value="Phone">Phone</option>
                        <option value="Message">Message</option>
                    </select>

                    <select
                        value={assignedStaffFilter}
                        onChange={(e) => setAssignedStaffFilter(e.target.value)}
                        className="w-full py-2.5 px-3.5 bg-gray-50/30 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                        <option value="all">Any Assigned Staff</option>
                        <option value="unassigned">Unassigned Orders</option>
                        <option disabled>──────────</option>
                        {staffMembers.map(staff => (
                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                    </select>
                </div>

                {/* Custom Date Selector */}
                {dateFilter === 'custom' && (
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full py-2 px-3 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Contextual Bulk Action Bar */}
            {selectedIds.length > 0 && (
                <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 shadow-lg shadow-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 sticky top-4 z-20">
                    <div className="flex items-center gap-3 font-semibold px-2 whitespace-nowrap">
                        <div className="bg-white/20 p-1.5 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <span>{selectedIds.length} Order(s) Selected</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                        <div className="flex flex-wrap items-center gap-1.5 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                            <select
                                value={bulkOrderStatus}
                                onChange={(e) => setBulkOrderStatus(e.target.value)}
                                className="border-0 bg-transparent py-2 pl-3 pr-8 text-sm font-medium text-white focus:ring-0 [&>option]:text-gray-900 cursor-pointer"
                            >
                                <option value="" className="text-gray-500">Update Status...</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="partially_cancelled">Partially Cancelled</option>
                            </select>
                            <div className="w-px h-5 bg-white/20"></div>
                            <select
                                value={bulkPaymentStatus}
                                onChange={(e) => setBulkPaymentStatus(e.target.value)}
                                className="border-0 bg-transparent py-2 pl-3 pr-8 text-sm font-medium text-white focus:ring-0 [&>option]:text-gray-900 cursor-pointer"
                            >
                                <option value="" className="text-gray-500">Update Payment...</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                            <button 
                                onClick={handleBulkStatusUpdate}
                                disabled={!bulkOrderStatus && !bulkPaymentStatus}
                                className="bg-white text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 disabled:bg-white/30 disabled:text-white/50 transition-colors shadow-sm"
                            >
                                Apply
                            </button>
                        </div>

                        {staffMembers && staffMembers.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
                                <select
                                    value={bulkStaffId}
                                    onChange={(e) => setBulkStaffId(e.target.value)}
                                    className="border-0 bg-transparent py-2 pl-3 pr-8 text-sm font-medium text-white focus:ring-0 [&>option]:text-gray-900 cursor-pointer w-36 sm:w-auto"
                                >
                                    <option value="" className="text-gray-500">Assign To...</option>
                                    {staffMembers.map(staff => (
                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleBulkAssign}
                                    disabled={!bulkStaffId}
                                    className="bg-white text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-50 disabled:bg-white/30 disabled:text-white/50 transition-colors shadow-sm"
                                >
                                    Assign
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center gap-2 ml-auto xl:ml-2">
                            <button 
                                onClick={handleBulkSteadfast}
                                disabled={isSendingSteadfast}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white border transition-all duration-200 ${
                                    isSendingSteadfast 
                                        ? 'bg-blue-500/50 border-transparent cursor-not-allowed' 
                                        : 'bg-blue-600 border-blue-500 hover:bg-blue-500 shadow-sm shadow-blue-900/20'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                {isSendingSteadfast ? 'Sending...' : 'Send to Steadfast'}
                            </button>

                            <button 
                                onClick={handleBulkDelete}
                                className="p-2.5 text-white bg-rose-500 hover:bg-rose-400 rounded-xl transition-all shadow-sm border border-rose-400"
                                title="Delete Selected Orders"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Data Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] text-gray-500 uppercase tracking-wider font-bold">
                                <th className="px-5 py-4 w-10">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 transition duration-150 ease-in-out cursor-pointer"
                                        onChange={handleSelectAll}
                                        checked={orders.data.length > 0 && selectedIds.length === orders.data.length}
                                    />
                                </th>
                                <th className="px-5 py-4">Order Info</th>
                                <th className="px-5 py-4">Customer</th>
                                <th className="px-5 py-4">Assignment</th>
                                <th className="px-5 py-4">Shipping / Value</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {orders.data.map((order) => {
                                const customerName = order.customer_name || order.user?.name || 'Guest Customer';
                                const customerEmail = order.user?.email || '';
                                const customerPhone = order.customer_phone || '';
                                const addressDisplay = [order.shipping_area, order.shipping_address]
                                    .filter(Boolean).join(', ') || 'Address not provided';

                                const isSelected = selectedIds.includes(order.id);
                                
                                // Format Phone Number for WhatsApp API
                                const formatWaNumber = (phone) => {
                                    if (!phone) return '';
                                    let cleanNum = phone.replace(/\D/g, '');
                                    // If number starts with 0 and doesn't have country code, add 88 for Bangladesh
                                    if (cleanNum.startsWith('0') && cleanNum.length === 11) {
                                        cleanNum = '88' + cleanNum;
                                    }
                                    return cleanNum;
                                };
                                const waNumber = formatWaNumber(customerPhone);

                                return (
                                    <tr key={order.id} className={`group hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/60' : ''}`}>
                                        <td className="px-5 py-4 align-middle">
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                                                checked={isSelected}
                                                onChange={() => handleSelectOne(order.id)}
                                            />
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <div className="font-bold text-gray-900 tracking-tight">{order.order_number}</div>
                                            <div className="text-xs text-gray-400 font-medium mt-0.5">
                                                {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {order.order_source && order.order_source !== 'Website' && (
                                                <div className="mt-2">
                                                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
                                                        {order.order_source}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-gray-900">{customerName}</span>
                                                {customerPhone && <CustomerSuccessRatio phone={customerPhone} order={order} />}
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {customerEmail && <div className="text-xs text-gray-500">{customerEmail}</div>}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-600">{customerPhone || 'N/A'}</span>
                                                    {customerPhone && (
                                                        <div className="flex items-center gap-1">
                                                            <a
                                                                href={`tel:${customerPhone}`}
                                                                className="p-1 bg-green-50 text-green-600 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors border border-green-200"
                                                                title={`Call ${customerPhone}`}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                                </svg>
                                                            </a>
                                                            <a
                                                                href={`https://wa.me/${waNumber}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-200"
                                                                title={`WhatsApp ${customerPhone}`}
                                                            >
                                                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            {order.assigned_staff ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>
                                                    {order.assigned_staff.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-500/20">
                                                    Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 min-w-[200px] align-middle">
                                            <div className="text-xs font-medium text-gray-500 truncate max-w-[220px]" title={addressDisplay}>
                                                {addressDisplay}
                                            </div>
                                            <div className="text-sm font-extrabold text-gray-900 mt-1.5">
                                                ৳ {Number(order.total_amount).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle">
                                            <div className="flex flex-col items-start gap-2.5">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm ring-1 ring-inset ${statusColor(order.order_status)}`}>
                                                    {order.order_status ? order.order_status.replace(/_/g, ' ') : 'N/A'}
                                                </span>
                                                <LiveCourierStatus order={order} />
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-middle text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Link 
                                                    href={route('admin.orders.show', order.id)} 
                                                    className="inline-flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(order.id)} 
                                                    className="inline-flex items-center justify-center p-2 bg-white border border-gray-200 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-all shadow-sm" 
                                                    title="Delete Order"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {orders.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-50 p-4 rounded-full mb-4 ring-8 ring-gray-50/50">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
                                            <p className="text-sm text-gray-500 max-w-sm">We couldn't find any orders matching your current filters. Try adjusting your search parameters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Pagination Bar */}
            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2 pb-8">
                
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span>Show</span>
                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(e.target.value)}
                        className="py-1.5 pl-3 pr-8 border border-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-50 bg-white shadow-sm cursor-pointer"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span>per page</span>
                </div>

                {orders.links && orders.links.length > 3 && (
                    <div className="flex justify-center items-center space-x-1 overflow-x-auto bg-white p-1 rounded-xl shadow-sm border border-gray-100">
                        {orders.links.map((link, index) => {
                            let label = link.label.replace('&laquo;', '«').replace('&raquo;', '»');
                            
                            return (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveScroll     
                                    preserveState      
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                                        link.active 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                                            : 'bg-transparent text-gray-600 hover:bg-gray-100'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed hover:bg-transparent' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        })}
                    </div>
                )}

                <div className="text-sm text-gray-500 font-medium text-right">
                    Showing <span className="font-bold text-gray-900">{orders.from || 0}</span> to <span className="font-bold text-gray-900">{orders.to || 0}</span> of <span className="font-bold text-gray-900">{orders.total || 0}</span>
                </div>

            </div>
        </AdminLayout>
    );
}