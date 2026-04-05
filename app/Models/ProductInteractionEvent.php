<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductInteractionEvent extends Model
{
    public const UPDATED_AT = null; // We only have created_at in the migration

    protected $fillable = [
        'session_id', 'user_id', 'product_id', 'event_type', 'event_value', 'metadata'
    ];

    protected $casts = [
        'metadata' => 'array', // Automatically cast JSON to array
        'event_value' => 'float',
    ];

    public function product() {
        return $this->belongsTo(Product::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}