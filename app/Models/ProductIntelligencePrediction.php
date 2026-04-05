<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductIntelligencePrediction extends Model
{
    protected $primaryKey = 'product_id';
    public $incrementing = false; // Primary key is not an auto-incrementing ID

    protected $fillable = [
        'product_id', 'predicted_demand_30d', 'predicted_stockout_date', 'suggested_dynamic_price', 'velocity_score'
    ];

    protected $casts = [
        'predicted_stockout_date' => 'date',
        'suggested_dynamic_price' => 'float',
        'velocity_score' => 'float',
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }
}