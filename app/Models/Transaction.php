<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type',
        'amount',
        'date',
        'description',
        'reference_type',
        'reference_id',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function histories()
    {
        return $this->hasMany(TransactionHistory::class);
    }

    protected static function booted()
    {
        static::created(function ($transaction) {
            TransactionHistory::create([
                'transaction_id' => $transaction->id,
                'action' => 'created',
                'old_values' => null,
                'new_values' => $transaction->getAttributes(),
                'changed_by' => auth()->id(),
            ]);
        });

        static::updated(function ($transaction) {
            TransactionHistory::create([
                'transaction_id' => $transaction->id,
                'action' => 'updated',
                'old_values' => $transaction->getOriginal(),
                'new_values' => $transaction->getAttributes(),
                'changed_by' => auth()->id(),
            ]);
        });

        static::deleted(function ($transaction) {
            TransactionHistory::create([
                'transaction_id' => $transaction->id,
                'action' => 'deleted',
                'old_values' => $transaction->getAttributes(),
                'new_values' => null,
                'changed_by' => auth()->id(),
            ]);
        });
    }
}