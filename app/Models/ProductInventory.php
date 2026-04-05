<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductInventory extends Model
{
    protected $table = 'product_inventory';
    protected $fillable = [
        'product_id', 'warehouse_id', 'current_stock', 'low_stock_threshold', 'last_restocked_at'
    ];

    protected $casts = [
        'last_restocked_at' => 'datetime',
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function warehouse() {
        return $this->belongsTo(Warehouse::class);
    }
}