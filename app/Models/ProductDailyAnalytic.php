<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductDailyAnalytic extends Model
{
    protected $fillable = [
        'product_id', 
        'date', 
        'views', 
        'add_to_carts', 
        'cart_abandonments',
        'purchases', 
        'units_sold', 
        'revenue', 
        'gross_margin', 
        'returns', 
        'conversion_rate',
        'add_to_cart_rate',    // (Add to Carts / Views)
        'abandonment_rate',    // (Abandonments / Add to Carts)
        'return_rate'          // (Returns / Units Sold)
    ];

    protected $casts = [
        'date' => 'date',
        'revenue' => 'decimal:2',
        'gross_margin' => 'decimal:2',
        'conversion_rate' => 'float',
        'add_to_cart_rate' => 'float',
        'abandonment_rate' => 'float',
        'return_rate' => 'float',
    ];

    public function product() 
    {
        return $this->belongsTo(Product::class);
    }
}