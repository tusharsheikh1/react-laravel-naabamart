<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerProductAffinity extends Model
{
    public $timestamps = false; // We only use last_calculated_at

    protected $fillable = [
        'user_id', 'product_id', 'affinity_score', 'last_calculated_at'
    ];

    protected $casts = [
        'affinity_score' => 'float',
        'last_calculated_at' => 'datetime',
    ];

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function product() {
        return $this->belongsTo(Product::class);
    }
}