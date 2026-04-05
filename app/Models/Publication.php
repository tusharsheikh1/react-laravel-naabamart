<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Publication extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'description', 'image'];

    /**
     * Get the products associated with the publication.
     */
    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}