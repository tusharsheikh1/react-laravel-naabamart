<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'product_id', 'warehouse_id', 'movement_type', 'quantity_changed', 'balance_after', 'reference_type', 'reference_id'
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function warehouse() {
        return $this->belongsTo(Warehouse::class);
    }

    // Allows linking to Order, ReturnAndRefund, or manual adjustments
    public function reference() {
        return $this->morphTo();
    }
}