<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 
        'product_id', 
        'quantity', 
        'price', 
        'unit_cost', // Added to snapshot the cost at the time of order
        'color', 
        'size'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'unit_cost' => 'decimal:2', // Added cast
        'quantity' => 'integer',
    ];

    // --- Existing Relationships ---

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // --- New Analytics Relationships ---

    public function returnAndRefund()
    {
        return $this->hasOne(ReturnAndRefund::class);
    }
}