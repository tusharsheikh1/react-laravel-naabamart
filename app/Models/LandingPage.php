<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingPage extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'content_json' => 'array',
        'tracking_scripts' => 'array',
        'is_published' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // multiple products
    public function products()
    {
        return $this->belongsToMany(Product::class, 'landing_page_product');
    }

    public function variants()
    {
        return $this->hasMany(LandingPage::class, 'parent_id');
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function getConversionRateAttribute()
    {
        return $this->views > 0
            ? round(($this->conversions / $this->views) * 100, 2)
            : 0;
    }
}