<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'base_charge',
        'base_weight',
        'additional_charge_per_kg',
        'free_delivery_threshold',
        'status',
    ];

    protected $casts = [
        'base_charge' => 'decimal:2',
        'base_weight' => 'decimal:2',
        'additional_charge_per_kg' => 'decimal:2',
        'free_delivery_threshold' => 'decimal:2',
        'status' => 'boolean',
    ];
}