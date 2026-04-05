<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductRecommendation extends Model
{
    protected $fillable = [
        'primary_product_id', 'recommended_product_id', 'relationship_type', 'confidence_score'
    ];

    protected $casts = [
        'confidence_score' => 'float',
    ];

    public function primaryProduct() {
        return $this->belongsTo(Product::class, 'primary_product_id');
    }

    public function recommendedProduct() {
        return $this->belongsTo(Product::class, 'recommended_product_id');
    }
}