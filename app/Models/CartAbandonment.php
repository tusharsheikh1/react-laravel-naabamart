<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CartAbandonment extends Model
{
    protected $fillable = [
        'session_id', 'user_id', 'product_id', 'added_at', 'abandoned_at', 'recovered'
    ];

    protected $casts = [
        'added_at' => 'datetime',
        'abandoned_at' => 'datetime',
        'recovered' => 'boolean',
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }
}
