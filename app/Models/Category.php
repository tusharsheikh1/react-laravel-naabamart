<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    // app/Models/Category.php
protected $fillable = [
    'name', 
    'parent_id', 
    'image', 
    'description', 
    'is_featured', 
    'featured_order', 
    'home_order',
    'show_products_on_home'
];

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    // Add this missing relationship method
    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}