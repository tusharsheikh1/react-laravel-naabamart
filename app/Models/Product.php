<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'type',
        'sku',
        'price',
        'cost_price', // For Gross Margin calculations
        'weight',
        'discount_type',
        'discount_value',
        'is_free_shipping',
        'short_description',
        'description',
        'thumbnail',
        'pages',
        'edition',
        'language',
        'country',
        'digital_file',
        'download_link',
        'license_key',
        'meta_title',
        'meta_description',
        'stock_quantity',
        'has_variants',
        'status'
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'weight' => 'decimal:2',
        'is_free_shipping' => 'boolean',
        'has_variants' => 'boolean',
        'status' => 'boolean',
    ];

    /**
     * Helper to get the actual price after discount
     */
    public function getFinalPriceAttribute()
    {
        $price = (float) $this->price;

        if ($this->discount_value > 0) {
            if ($this->discount_type === 'percent') {
                return $price - ($price * ($this->discount_value / 100));
            } elseif ($this->discount_type === 'fixed') {
                return $price - $this->discount_value;
            }
        }

        return $price;
    }

    /**
     * Get aggregate analytics summary for this product across its history.
     */
    public function getAnalyticsSummaryAttribute()
    {
        return $this->dailyAnalytics()
            ->selectRaw('
                SUM(views) as total_views,
                SUM(units_sold) as total_units_sold,
                SUM(revenue) as total_revenue,
                SUM(gross_margin) as total_margin,
                SUM(returns) as total_returns,
                AVG(conversion_rate) as avg_conversion_rate,
                AVG(add_to_cart_rate) as avg_atc_rate,
                AVG(abandonment_rate) as avg_abandonment_rate
            ')
            ->first();
    }

    // --- Relationships ---
    
    public function categories()
    {
        return $this->belongsToMany(Category::class);
    }

    public function authors()
    {
        return $this->belongsToMany(Author::class);
    }

    public function publications()
    {
        return $this->belongsToMany(Publication::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    // --- Analytics & Intelligence Relationships ---

    public function interactionEvents()
    {
        return $this->hasMany(ProductInteractionEvent::class);
    }

    public function dailyAnalytics()
    {
        return $this->hasMany(ProductDailyAnalytic::class);
    }

    public function inventory()
    {
        return $this->hasMany(ProductInventory::class);
    }

    public function aiPredictions()
    {
        return $this->hasOne(ProductIntelligencePrediction::class);
    }

    public function recommendations()
    {
        return $this->hasMany(ProductRecommendation::class, 'primary_product_id');
    }
}