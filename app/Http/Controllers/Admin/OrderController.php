<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User; 
use App\Models\Blacklist; 
use App\Services\SteadfastCourierService;
use App\Services\BDCourierService;
use App\Services\OrderService;
use App\Services\AnalyticsEventService; 
use App\Services\SmsService; 
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class OrderController extends Controller
{
    protected $steadfast;
    protected $bdCourier;
    protected $orderService;
    protected $smsService; 

    // How many hours before we re-fetch from BDCourier API
    const COURIER_HISTORY_TTL_HOURS = 24;

    public function __construct(
        SteadfastCourierService $steadfast, 
        BDCourierService $bdCourier, 
        OrderService $orderService,
        SmsService $smsService
    ) {
        $this->steadfast = $steadfast;
        $this->bdCourier = $bdCourier;
        $this->orderService = $orderService;
        $this->smsService = $smsService;
    }

    /**
     * Display a listing of orders with filtering.
     */
    public function index(Request $request)
    {
        // Eager load the relationships
        $query = Order::with(['user', 'assignedStaff'])->latest();

        // Apply filters via helper
        $this->applyFilters($query, $request);

        // --- Handle Dynamic Pagination ---
        $perPage = $request->input('per_page', 10);
        $perPage = in_array($perPage, [10, 25, 50, 100]) ? (int) $perPage : 10;

        $orders = $query->paginate($perPage)->withQueryString();

        // Fetch active staff members to populate the assignment dropdowns
        $staffMembers = User::whereIn('role', ['admin', 'staff'])
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();

        // Quick Stats for the header cards
        $todaysOrdersCount = Order::whereDate('created_at', Carbon::today())->count();
        $pendingOrdersCount = Order::where('order_status', 'pending')->count();

        return Inertia::render('Admin/Orders/Index', [
            'orders'             => $orders,
            'filters'            => $request->only(['search', 'status', 'courier_status', 'source', 'assigned_to', 'per_page', 'date_filter', 'start_date', 'end_date']),
            'staffMembers'       => $staffMembers, 
            'todaysOrdersCount'  => $todaysOrdersCount,
            'pendingOrdersCount' => $pendingOrdersCount,
        ]);
    }

    /**
     * Export orders to CSV based on current filters.
     */
    public function export(Request $request)
    {
        $query = Order::with(['user', 'assignedStaff'])->latest();

        // Apply exactly the same filters as the index method
        $this->applyFilters($query, $request);

        // Fetch all matching orders
        $orders = $query->get();

        $fileName = 'orders_export_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Order ID', 'Date', 'Customer Name', 'Phone', 'Email', 
            'Address', 'Source', 'Total Amount', 'Order Status', 
            'Courier Status', 'Payment Status', 'Payment Method', 'Assigned To'
        ];

        $callback = function() use($orders, $columns) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for UTF-8 compatibility (helps Excel read Bengali/special characters)
            fputs($file, "\xEF\xBB\xBF");
            
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->order_number,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->customer_name ?? ($order->user->name ?? 'Guest'),
                    $order->customer_phone,
                    $order->user->email ?? 'N/A',
                    trim($order->shipping_address), 
                    $order->order_source ?? 'N/A',
                    $order->total_amount,
                    $order->order_status,
                    $order->courier_status ?? 'Not Synced',
                    $order->payment_status,
                    $order->payment_method,
                    $order->assignedStaff->name ?? 'Unassigned'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display the specified order details.
     */
    public function show(Order $order)
    {
        // Eager load assignedStaff and items
        $order->load(['items.product', 'user', 'assignedStaff']);

        $initialCourierHistory = $this->getCourierHistory($order);

        $customerHistory = Order::where('id', '!=', $order->id)
            ->where(function ($query) use ($order) {
                $query->where('customer_phone', $order->customer_phone);
                if ($order->ip_address) {
                    $query->orWhere('ip_address', $order->ip_address);
                }
                if ($order->device_fingerprint) {
                    $query->orWhere('device_fingerprint', $order->device_fingerprint);
                }
            })
            ->select('id', 'order_number', 'total_amount', 'order_status', 'created_at', 'customer_phone', 'ip_address')
            ->latest()
            ->take(10) 
            ->get();

        $historySummary = [
            'total_orders' => $customerHistory->count(),
            'delivered'    => $customerHistory->where('order_status', 'delivered')->count(),
            'cancelled'    => $customerHistory->whereIn('order_status', ['cancelled', 'number_off', 'vule_order_korche', 'partially_cancelled'])->count(),
        ];

        $availableProducts = Product::select('id', 'name', 'price', 'discount_type', 'discount_value')
            ->get()
            ->map(function ($product) {
                return [
                    'id'             => $product->id,
                    'name'           => $product->name,
                    'price'          => $product->price,
                    'discount_price' => $product->final_price,
                ];
            });

        // Fetch active staff members to populate the assignment dropdown
        $staffMembers = User::whereIn('role', ['admin', 'staff'])
            ->where('is_active', true)
            ->select('id', 'name')
            ->get();

        return Inertia::render('Admin/Orders/Show', [
            'order'                 => $order,
            'initialCourierHistory' => $initialCourierHistory,
            'customerHistory'       => $customerHistory,
            'historySummary'        => $historySummary,
            'availableProducts'     => $availableProducts,
            'staffMembers'          => $staffMembers, 
        ]);
    }

    /**
     * Render the order invoice.
     */
    public function invoice(Order $order)
    {
        $order->load(['items.product', 'user']);

        return Inertia::render('Admin/Orders/Invoice', [
            'order' => $order,
            'orderItems' => $order->items
        ]);
    }

    /**
     * Render the shipping label sticker.
     */
    public function label(Order $order)
    {
        $order->load(['items.product', 'user']);

        return Inertia::render('Admin/Orders/Label', [
            'order' => $order,
            'orderItems' => $order->items
        ]);
    }

    /**
     * Update order details and items.
     */
    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'shipping_area'    => 'required|string|max:255',
            'shipping_address' => 'required|string',
            'notes'            => 'nullable|string',
            'new_admin_note'   => 'nullable|string', 
            'items'            => 'required|array|min:1',
            'items.*.id'       => 'nullable|exists:order_items,id',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.color'    => 'nullable|string',
            'items.*.size'     => 'nullable|string',
        ]);

        $this->orderService->updateOrder($order, $validated);

        return redirect()->back()->with('success', 'Order and Items updated successfully!');
    }

    /**
     * Update only system status and synchronize real-time analytics.
     */
    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'order_status'   => 'required|string',
            'payment_status' => 'required|string',
        ]);

        $oldStatus = $order->order_status;
        $newStatus = $request->order_status;
        $paymentStatus = $request->payment_status;

        $cancelledStatuses = ['Number off', 'Vule order korche', 'Cancelled', 'cancelled', 'way_to_return', 'returned', 'partially_cancelled'];
        
        $wasCancelled = in_array($oldStatus, $cancelledStatuses);
        $isCancelled = in_array($newStatus, $cancelledStatuses);

        $analyticsService = app(AnalyticsEventService::class);
        $order->loadMissing('items');

        // Logic to deduct or restore metrics based on status transitions
        if (!$wasCancelled && $isCancelled) {
            foreach ($order->items as $item) {
                $analyticsService->logEvent($item->product_id, 'cancel_purchase', null, [
                    'quantity' => $item->quantity, 
                    'revenue' => $item->price * $item->quantity,
                    'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                ], $order->created_at);
            }
        } elseif ($wasCancelled && !$isCancelled) {
            foreach ($order->items as $item) {
                $analyticsService->logEvent($item->product_id, 'purchase', null, [
                    'quantity' => $item->quantity, 
                    'revenue' => $item->price * $item->quantity,
                    'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                ], $order->created_at);
            }
        }

        // Add to Edit History
        $history = $order->edit_history ?? [];
        $history[] = [
            'action' => "Changed status to: Order({$newStatus}), Payment({$paymentStatus})",
            'user'   => Auth::user() ? Auth::user()->name : 'System',
            'time'   => now()->toISOString(),
        ];

        $order->update([
            'order_status'   => $newStatus,
            'payment_status' => $paymentStatus,
            'edit_history'   => $history,
        ]);

        // --- Send Status Update SMS using Templates ---
        if ($oldStatus !== $newStatus) {
            try {
                if ($newStatus === 'shipped') {
                    $this->smsService->sendTemplatedSms(
                        $order->customer_phone, 'sms_template_order_shipped', 
                        "Dear {name}, your order {order_number} has been shipped and is on its way to you.", 
                        ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                    );
                } elseif ($newStatus === 'delivered') {
                    $this->smsService->sendTemplatedSms(
                        $order->customer_phone, 'sms_template_order_delivered', 
                        "Dear {name}, your order {order_number} has been delivered successfully. Thank you for staying with us!", 
                        ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                    );
                } elseif (in_array($newStatus, $cancelledStatuses)) {
                    $this->smsService->sendTemplatedSms(
                        $order->customer_phone, 'sms_template_order_cancelled', 
                        "Dear {name}, your order {order_number} has been cancelled. If you have any queries, please contact our support.", 
                        ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                    );
                }
            } catch (\Exception $e) {
                Log::error('Order Status SMS failed: ' . $e->getMessage());
            }
        }

        return redirect()->back()->with('success', 'Order status updated successfully.');
    }

    /**
     * Remove the specified order and deduct analytics if active.
     */
    public function destroy(Order $order)
    {
        $cancelledStatuses = ['Number off', 'Vule order korche', 'Cancelled', 'cancelled', 'way_to_return', 'returned', 'partially_cancelled'];
        $order->loadMissing('items');

        if (!in_array($order->order_status, $cancelledStatuses)) {
            $analyticsService = app(AnalyticsEventService::class);
            foreach ($order->items as $item) {
                $analyticsService->logEvent($item->product_id, 'cancel_purchase', null, [
                    'quantity' => $item->quantity, 
                    'revenue' => $item->price * $item->quantity,
                    'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                ], $order->created_at);
            }
        }

        $order->delete();
        return redirect()->route('admin.orders.index')->with('success', 'Order deleted successfully');
    }

    /**
     * Manually assign an order to a specific staff member.
     */
    public function assignStaff(Request $request, Order $order)
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
        ]);

        $staff = User::findOrFail($request->staff_id);

        $history = $order->edit_history ?? [];
        $history[] = [
            'action' => "Manually assigned to staff: {$staff->name}",
            'user'   => Auth::user() ? Auth::user()->name : 'System',
            'time'   => now()->toISOString(),
        ];

        $order->update([
            'assigned_to'  => $staff->id,
            'edit_history' => $history,
        ]);

        return redirect()->back()->with('success', "Order assigned to {$staff->name} successfully.");
    }

    /**
     * Bulk assign selected orders to a specific staff member.
     */
    public function bulkAssignStaff(Request $request)
    {
        $request->validate([
            'ids'      => 'required|array',
            'ids.*'    => 'exists:orders,id',
            'staff_id' => 'required|exists:users,id',
        ]);

        $staff = User::findOrFail($request->staff_id);
        $orders = Order::whereIn('id', $request->ids)->get();

        foreach ($orders as $order) {
            $history = $order->edit_history ?? [];
            $history[] = [
                'action' => "Bulk assigned to staff: {$staff->name}",
                'user'   => Auth::user() ? Auth::user()->name : 'System',
                'time'   => now()->toISOString(),
            ];

            $order->update([
                'assigned_to'  => $staff->id,
                'edit_history' => $history,
            ]);
        }

        return redirect()->back()->with('success', "Selected orders assigned to {$staff->name} successfully.");
    }

    /**
     * Bulk delete orders.
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:orders,id',
        ]);

        $cancelledStatuses = ['Number off', 'Vule order korche', 'Cancelled', 'cancelled', 'way_to_return', 'returned', 'partially_cancelled'];
        $analyticsService = app(AnalyticsEventService::class);
        $orders = Order::with('items')->whereIn('id', $request->ids)->get();

        foreach ($orders as $order) {
            if (!in_array($order->order_status, $cancelledStatuses)) {
                foreach ($order->items as $item) {
                    $analyticsService->logEvent($item->product_id, 'cancel_purchase', null, [
                        'quantity' => $item->quantity, 
                        'revenue' => $item->price * $item->quantity,
                        'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                    ], $order->created_at);
                }
            }
            $order->delete();
        }

        return redirect()->back()->with('success', 'Selected orders deleted successfully.');
    }

    /**
     * Bulk update order status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids'            => 'required|array',
            'ids.*'          => 'exists:orders,id',
            'order_status'   => 'nullable|string',
            'payment_status' => 'nullable|string',
        ]);

        $updateData = [];
        if ($request->filled('order_status'))   $updateData['order_status']   = $request->order_status;
        if ($request->filled('payment_status')) $updateData['payment_status'] = $request->payment_status;

        if (!empty($updateData)) {
            $cancelledStatuses = ['Number off', 'Vule order korche', 'Cancelled', 'cancelled', 'way_to_return', 'returned', 'partially_cancelled'];
            $analyticsService = app(AnalyticsEventService::class);
            $orders = Order::with('items')->whereIn('id', $request->ids)->get();
            
            foreach($orders as $order) {
                $oldStatus = $order->order_status;
                $newStatus = $request->order_status ?? $oldStatus;

                $wasCancelled = in_array($oldStatus, $cancelledStatuses);
                $isCancelled = in_array($newStatus, $cancelledStatuses);

                if (!$wasCancelled && $isCancelled) {
                    foreach ($order->items as $item) {
                        $analyticsService->logEvent($item->product_id, 'cancel_purchase', null, [
                            'quantity' => $item->quantity, 
                            'revenue' => $item->price * $item->quantity,
                            'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                        ], $order->created_at);
                    }
                } elseif ($wasCancelled && !$isCancelled) {
                    foreach ($order->items as $item) {
                        $analyticsService->logEvent($item->product_id, 'purchase', null, [
                            'quantity' => $item->quantity, 
                            'revenue' => $item->price * $item->quantity,
                            'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                        ], $order->created_at);
                    }
                }

                $history = $order->edit_history ?? [];
                $history[] = [
                    'action' => "Bulk updated status",
                    'user'   => Auth::user() ? Auth::user()->name : 'System',
                    'time'   => now()->toISOString(),
                ];
                $order->update(array_merge($updateData, ['edit_history' => $history]));

                // --- Bulk Send Status Update SMS using Templates ---
                if ($oldStatus !== $newStatus) {
                    try {
                        if ($newStatus === 'shipped') {
                            $this->smsService->sendTemplatedSms(
                                $order->customer_phone, 'sms_template_order_shipped', 
                                "Dear {name}, your order {order_number} has been shipped and is on its way to you.", 
                                ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                            );
                        } elseif ($newStatus === 'delivered') {
                            $this->smsService->sendTemplatedSms(
                                $order->customer_phone, 'sms_template_order_delivered', 
                                "Dear {name}, your order {order_number} has been delivered successfully. Thank you for staying with us!", 
                                ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                            );
                        } elseif (in_array($newStatus, $cancelledStatuses)) {
                            $this->smsService->sendTemplatedSms(
                                $order->customer_phone, 'sms_template_order_cancelled', 
                                "Dear {name}, your order {order_number} has been cancelled. If you have any queries, please contact our support.", 
                                ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                            );
                        }
                    } catch (\Exception $e) {
                        Log::error('Bulk Order Status SMS failed: ' . $e->getMessage());
                    }
                }
            }
        }

        return redirect()->back()->with('success', 'Selected orders updated successfully.');
    }

    /**
     * Send a single order to Steadfast Courier.
     */
    public function sendToSteadfast(Order $order)
    {
        if ($order->consignment_id) {
            return redirect()->back()->with('error', 'This order has already been sent to Steadfast.');
        }

        $shippingData = $this->extractShippingDetails($order);
        $cleanPhone   = $this->cleanPhone($shippingData['phone']);

        $codAmount = ($order->payment_status === 'paid') ? 0 : ($order->payment_method === 'cod' ? (float) $order->total_amount : 0);

        $response = $this->steadfast->createOrder([
            'invoice'           => (string) $order->order_number,
            'recipient_name'    => (string) $shippingData['name'],
            'recipient_phone'   => $cleanPhone,
            'recipient_address' => (string) $shippingData['address'],
            'cod_amount'        => $codAmount,
            'note'              => (string) ($order->notes ?? ''),
        ]);

        if (isset($response['status']) && $response['status'] == 200) {
            $history = $order->edit_history ?? [];
            $history[] = [
                'action' => "Dispatched to Steadfast Courier",
                'user'   => Auth::user() ? Auth::user()->name : 'System',
                'time'   => now()->toISOString(),
            ];

            $order->update([
                'tracking_code'  => $response['consignment']['tracking_code'],
                'consignment_id' => $response['consignment']['consignment_id'],
                'order_status'   => 'shipped',
                'courier_status' => 'in_review',
                'edit_history'   => $history,
            ]);

            // --- Send Dispatched SMS with Tracking using Template ---
            try {
                $trackingCode = $response['consignment']['tracking_code'];
                $this->smsService->sendTemplatedSms(
                    $cleanPhone, 'sms_template_order_dispatched', 
                    "Dear {name}, your order {order_number} has been handed over to Steadfast Courier. Tracking Code: {tracking_code}.", 
                    [
                        '{name}' => $order->customer_name,
                        '{order_number}' => $order->order_number,
                        '{tracking_code}' => $trackingCode
                    ]
                );
            } catch (\Exception $e) {
                Log::error('Courier Dispatch SMS failed: ' . $e->getMessage());
            }

            return redirect()->back()->with('success', 'Order sent to Steadfast and marked as shipped!');
        }

        $errorMsg = is_string($response['message'] ?? null) ? $response['message'] : json_encode($response);
        return redirect()->back()->with('error', 'Failed to send order to Steadfast: ' . $errorMsg);
    }

    /**
     * Bulk send orders to Steadfast Courier.
     */
    public function bulkSendToSteadfast(Request $request)
    {
        $request->validate([
            'ids'   => 'required|array',
            'ids.*' => 'exists:orders,id',
        ]);

        $orders = Order::whereIn('id', $request->input('ids'))
            ->whereNull('consignment_id')
            ->get();

        if ($orders->isEmpty()) {
            return redirect()->back()->with('error', 'No valid orders selected, or they have already been sent.');
        }

        $successCount  = 0;

        foreach ($orders as $order) {
            $shippingData = $this->extractShippingDetails($order);
            $cleanPhone   = $this->cleanPhone($shippingData['phone']);

            $codAmount = ($order->payment_status === 'paid') ? 0 : ($order->payment_method === 'cod' ? (float) $order->total_amount : 0);

            $response = $this->steadfast->createOrder([
                'invoice'           => (string) $order->order_number,
                'recipient_name'    => (string) $shippingData['name'],
                'recipient_phone'   => $cleanPhone,
                'recipient_address' => (string) $shippingData['address'],
                'cod_amount'        => $codAmount,
                'note'              => (string) ($order->notes ?? 'Bulk Order'),
            ]);

            if (isset($response['status']) && $response['status'] == 200) {
                $history = $order->edit_history ?? [];
                $history[] = [
                    'action' => "Bulk Dispatched to Steadfast Courier",
                    'user'   => Auth::user() ? Auth::user()->name : 'System',
                    'time'   => now()->toISOString(),
                ];

                $order->update([
                    'tracking_code'  => $response['consignment']['tracking_code'],
                    'consignment_id' => $response['consignment']['consignment_id'],
                    'order_status'   => 'shipped',
                    'courier_status' => 'in_review',
                    'edit_history'   => $history,
                ]);

                // --- Send Dispatched SMS with Tracking using Template ---
                try {
                    $trackingCode = $response['consignment']['tracking_code'];
                    $this->smsService->sendTemplatedSms(
                        $cleanPhone, 'sms_template_order_dispatched', 
                        "Dear {name}, your order {order_number} has been handed over to Steadfast Courier. Tracking Code: {tracking_code}.", 
                        [
                            '{name}' => $order->customer_name,
                            '{order_number}' => $order->order_number,
                            '{tracking_code}' => $trackingCode
                        ]
                    );
                } catch (\Exception $e) {
                    Log::error('Bulk Courier Dispatch SMS failed: ' . $e->getMessage());
                }

                $successCount++;
            }
        }

        return redirect()->back()->with('success', "{$successCount} orders processed.");
    }

    /**
     * Fetch real-time status from Steadfast Courier and Sync with System.
     */
    public function checkSteadfastStatus(Order $order)
    {
        if (!$order->consignment_id) {
            return response()->json(['success' => false, 'message' => 'No consignment ID found.']);
        }

        $response = $this->steadfast->checkStatusByConsignmentId($order->consignment_id);

        if (isset($response['status']) && $response['status'] == 200) {
            $courierStatus = strtolower(trim($response['delivery_status']));
            $oldStatus = $order->order_status;
            
            $newStatus = $oldStatus;
            $paymentStatus = $order->payment_status;

            // 1. Map Courier Status to System Status
            if ($courierStatus === 'delivered') {
                $newStatus = 'delivered';
                $paymentStatus = 'paid'; // Auto-mark as paid
            } elseif (in_array($courierStatus, ['cancelled', 'returned', 'returned_to_merchant'])) {
                $newStatus = 'cancelled';
            } elseif (in_array($courierStatus, ['partial_delivered', 'partially_delivered', 'partially_cancelled'])) {
                $newStatus = 'partially_cancelled'; // New partial cancellation system status
            }

            $updateData = ['courier_status' => $response['delivery_status']];

            // 2. If the mapped system status is different from the current status, sync it
            if ($oldStatus !== $newStatus) {
                $updateData['order_status'] = $newStatus;
                $updateData['payment_status'] = $paymentStatus;

                // Add 'partially_cancelled' to cancellation tracking
                $cancelledStatuses = ['Number off', 'Vule order korche', 'Cancelled', 'cancelled', 'way_to_return', 'returned', 'partially_cancelled'];
                $wasCancelled = in_array($oldStatus, $cancelledStatuses);
                $isCancelled = in_array($newStatus, $cancelledStatuses);

                $analyticsService = app(AnalyticsEventService::class);
                $order->loadMissing('items');

                // Adjust Analytics Gross Margin / Revenue automatically
                if (!$wasCancelled && $isCancelled) {
                    foreach ($order->items as $item) {
                        $analyticsService->logEvent($item->product_id, 'cancel_purchase', null, [
                            'quantity' => $item->quantity, 
                            'revenue' => $item->price * $item->quantity,
                            'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                        ], $order->created_at);
                    }
                } elseif ($wasCancelled && !$isCancelled) {
                    foreach ($order->items as $item) {
                        $analyticsService->logEvent($item->product_id, 'purchase', null, [
                            'quantity' => $item->quantity, 
                            'revenue' => $item->price * $item->quantity,
                            'gross_margin' => ($item->price - ($item->unit_cost ?? 0)) * $item->quantity
                        ], $order->created_at);
                    }
                }

                // Add to Edit History
                $history = $order->edit_history ?? [];
                $history[] = [
                    'action' => "Auto-synced status from Courier: Order({$newStatus}), Payment({$paymentStatus})",
                    'user'   => 'System (Courier Sync)',
                    'time'   => now()->toISOString(),
                ];
                $updateData['edit_history'] = $history;

                // Send Automated SMS
                try {
                    if ($newStatus === 'delivered') {
                        $this->smsService->sendTemplatedSms(
                            $order->customer_phone, 'sms_template_order_delivered', 
                            "Dear {name}, your order {order_number} has been delivered successfully. Thank you for staying with us!", 
                            ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                        );
                    } elseif (in_array($newStatus, $cancelledStatuses)) {
                        $this->smsService->sendTemplatedSms(
                            $order->customer_phone, 'sms_template_order_cancelled', 
                            "Dear {name}, your order {order_number} has been cancelled. If you have any queries, please contact our support.", 
                            ['{name}' => $order->customer_name, '{order_number}' => $order->order_number]
                        );
                    }
                } catch (\Exception $e) {
                    Log::error('Order Status SMS failed during Courier Sync: ' . $e->getMessage());
                }
            }

            $order->update($updateData);

            return response()->json([
                'success' => true, 
                'delivery_status' => $response['delivery_status'],
                'system_status_updated' => $oldStatus !== $newStatus,
                'new_order_status' => $newStatus
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Failed to fetch status.']);
    }

    /**
     * Check courier history via BDCourier API.
     */
    public function bdCourierCheck(Request $request)
    {
        $request->validate([
            'phone'    => 'required|string|min:10|max:15',
            'order_id' => 'nullable|exists:orders,id',
        ]);

        $phone = $this->cleanPhone($request->phone);
        $data  = $this->bdCourier->checkByPhone($phone);

        if (isset($data['error'])) {
            return response()->json(['success' => false, 'message' => $data['error']], 500);
        }

        if ($request->filled('order_id')) {
            Order::where('id', $request->order_id)->update([
                'courier_history'            => json_encode($data),
                'courier_history_fetched_at' => now(),
            ]);
        }

        return response()->json($data);
    }

    /**
     * Block an order's IP Address and Device Fingerprint.
     */
    public function blockClient(Order $order)
    {
        $blockedCount = 0;

        if (!empty($order->ip_address)) {
            $ipBlock = Blacklist::firstOrCreate(
                ['type' => 'ip', 'value' => $order->ip_address],
                ['reason' => "Blocked from fake Order #{$order->order_number}"]
            );
            if ($ipBlock->wasRecentlyCreated) $blockedCount++;
        }

        if (!empty($order->device_fingerprint)) {
            $deviceBlock = Blacklist::firstOrCreate(
                ['type' => 'device_fingerprint', 'value' => $order->device_fingerprint],
                ['reason' => "Blocked from fake Order #{$order->order_number}"]
            );
            if ($deviceBlock->wasRecentlyCreated) $blockedCount++;
        }

        if ($blockedCount > 0) {
            return redirect()->back()->with('success', "Security: Successfully blocked {$blockedCount} identifiers (IP/Device).");
        }

        return redirect()->back()->with('error', 'These identifiers are already blocked or none were found.');
    }

    // --- Private Helpers ---

    /**
     * Helper to apply filtering logic (shared between index and export).
     */
    private function applyFilters($query, Request $request)
    {
        // Date Filtering - Changed default from 'today' to 'all'
        $dateFilter = $request->input('date_filter', 'all'); 

        switch ($dateFilter) {
            case 'today':
                $query->whereDate('created_at', Carbon::today());
                break;
            case 'yesterday':
                $query->whereDate('created_at', Carbon::yesterday());
                break;
            case 'this_week':
                $query->whereBetween('created_at', [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()]);
                break;
            case 'last_week':
                $query->whereBetween('created_at', [Carbon::now()->subWeek()->startOfWeek(), Carbon::now()->subWeek()->endOfWeek()]);
                break;
            case 'this_month':
                $query->whereMonth('created_at', Carbon::now()->month)->whereYear('created_at', Carbon::now()->year);
                break;
            case 'last_month':
                $query->whereMonth('created_at', Carbon::now()->subMonth()->month)->whereYear('created_at', Carbon::now()->subMonth()->year);
                break;
            case 'this_year':
                $query->whereYear('created_at', Carbon::now()->year);
                break;
            case 'last_year':
                $query->whereYear('created_at', Carbon::now()->subYear()->year);
                break;
            case 'custom':
                if ($request->filled('start_date') && $request->filled('end_date')) {
                    $query->whereBetween('created_at', [
                        Carbon::parse($request->start_date)->startOfDay(),
                        Carbon::parse($request->end_date)->endOfDay()
                    ]);
                }
                break;
        }

        // Search text
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($sub) use ($search) {
                      $sub->where('name', 'like', "%{$search}%")
                          ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // System Status
        if ($request->filled('status') && $request->status !== 'all') {
            if ($request->status === 'cancelled') {
                $query->whereIn('order_status', [
                    'cancelled', 
                    'number_off', 
                    'vule_order_korche', 
                    'way_to_return', 
                    'returned',
                    'partially_cancelled'
                ]);
            } else {
                $query->where('order_status', $request->status);
            }
        }

        // Order Source
        if ($request->filled('source') && $request->source !== 'all') {
            $query->where('order_source', $request->source);
        }

        // Courier Status
        if ($request->filled('courier_status') && $request->courier_status !== 'all') {
            if ($request->courier_status === 'synced') {
                $query->whereNotNull('consignment_id');
            } elseif ($request->courier_status === 'not_synced') {
                $query->whereNull('consignment_id');
            } else {
                $query->where('courier_status', $request->courier_status);
            }
        }

        // Filter by Assigned Staff
        if ($request->filled('assigned_to') && $request->assigned_to !== 'all') {
            if ($request->assigned_to === 'unassigned') {
                $query->whereNull('assigned_to');
            } else {
                $query->where('assigned_to', $request->assigned_to);
            }
        }
    }

    private function getCourierHistory(Order $order): ?array
    {
        if (!$order->customer_phone) {
            return null;
        }

        $ttl     = self::COURIER_HISTORY_TTL_HOURS;
        $isStale = is_null($order->courier_history_fetched_at)
                   || $order->courier_history_fetched_at->lt(now()->subHours($ttl));

        if (!$isStale && !is_null($order->courier_history)) {
            return is_array($order->courier_history)
                ? $order->courier_history
                : json_decode($order->courier_history, true);
        }

        $phone  = $this->cleanPhone($order->customer_phone);
        $result = $this->bdCourier->checkByPhone($phone);

        if (isset($result['error'])) {
            if (!is_null($order->courier_history)) {
                return is_array($order->courier_history)
                    ? $order->courier_history
                    : json_decode($order->courier_history, true);
            }
            return null;
        }

        $order->update([
            'courier_history'            => json_encode($result),
            'courier_history_fetched_at' => now(),
        ]);

        return $result;
    }

    private function cleanPhone(string $phone): string
    {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($clean) > 11 && str_starts_with($clean, '88')) {
            $clean = substr($clean, 2);
        }
        return $clean;
    }

    private function extractShippingDetails(Order $order): array
    {
        return [
            'name'    => $order->customer_name ?? 'Guest',
            'phone'   => $order->customer_phone ?? '',
            'address' => trim(($order->shipping_area ? $order->shipping_area . ', ' : '') . $order->shipping_address),
        ];
    }
}