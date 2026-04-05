<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'order_number', 
        'customer_name',    
        'customer_phone',   
        'shipping_area',    
        'total_amount', 
        'payment_method', 
        'payment_status', 
        'order_status', 
        'shipping_address', 
        'notes',
        'order_source', // Added for tracking source (Website, Phone, Message)
        'assigned_to',  // NEW: Added for Staff Assignment
        
        // NEW FIELDS
        'admin_notes',
        'edit_history',

        // Tracking Fields
        'ip_address',
        'user_agent',
        'device_fingerprint',
        
        // Added for Steadfast Courier Integration
        'consignment_id', 
        'tracking_code',
        'courier_status',

        // New fields for tracking history
        'courier_history',
        'courier_history_fetched_at'
    ];

    protected $casts = [
        'total_amount'               => 'decimal:2',
        'created_at'                 => 'datetime',
        'courier_history'            => 'array',
        'edit_history'               => 'array', // Cast edit history to array
        'admin_notes'                => 'array', // Cast admin notes to array
        'courier_history_fetched_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Relationship: The staff member assigned to this order
     */
    public function assignedStaff()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}