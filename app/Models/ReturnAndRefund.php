<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnAndRefund extends Model
{
    protected $table = 'returns_and_refunds';
    protected $fillable = [
        'order_item_id', 'user_id', 'reason', 'refund_amount', 'condition'
    ];

    public function orderItem() {
        return $this->belongsTo(OrderItem::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }
}