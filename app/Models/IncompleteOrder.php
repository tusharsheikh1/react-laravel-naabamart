<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IncompleteOrder extends Model
{
    protected $fillable = [
        'session_id', 
        'user_id', 
        'full_name', 
        'phone', 
        'address', 
        'cart_data', 
        'is_converted',
        'status'
    ];

    protected $casts = [
        'cart_data' => 'array',
        'is_converted' => 'boolean',
    ];
}