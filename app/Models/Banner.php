<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'group', 'title', 'subtitle', 'image', 'mobile_image', 'link', 
        'desktop_size', 'mobile_size', 'order', 'status',
    ];

    protected $casts = [
        'status' => 'boolean',
        'order'  => 'integer',
    ];

    public function scopeActive($query) { return $query->where('status', true); }
    public function scopeGroup($query, string $group) { return $query->where('group', $group); }
    public function scopeOrdered($query) { return $query->orderBy('order')->orderBy('id'); }

    public static function forGroup(string $group): \Illuminate\Support\Collection
    {
        return static::group($group)->active()->ordered()->get();
    }

    public static function groupCatalogue(): array
    {
        return [
            'banner_1' => 'Banner 1',
            'banner_2' => 'Banner 2',
            'banner_3' => 'Banner 3',
            'banner_4' => 'Banner 4',
            'banner_5' => 'Banner 5',
        ];
    }
}