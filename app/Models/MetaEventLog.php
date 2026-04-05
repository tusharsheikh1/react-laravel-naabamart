<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetaEventLog extends Model
{
    protected $fillable = [
        'event_name', 'event_id', 'user_data', 'custom_data', 'status', 'api_response'
    ];

    protected $casts = [
        'user_data' => 'array',
        'custom_data' => 'array',
        'api_response' => 'array',
    ];
}