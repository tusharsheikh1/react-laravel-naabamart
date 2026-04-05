<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Mass assignable attributes
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',     // Added
        'permissions',   // JSON permissions
    ];

    /**
     * Hidden attributes
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Attribute casting
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'permissions'       => 'array',   // JSON → Array
        'is_active'         => 'boolean', // Added
    ];

    /**
     * Role Check Methods
     */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isStaff()
    {
        return $this->role === 'staff' || $this->role === 'admin';
    }

    public function isUser()
    {
        return $this->role === 'user';
    }

    /**
     * Check if user account is active
     */
    public function isActive()
    {
        return $this->is_active === true;
    }

    /**
     * Permission Check
     */
    public function hasPermission($permission)
    {
        // Admins have all permissions
        if ($this->isAdmin()) {
            return true;
        }

        // Only active staff can have permissions
        if (!$this->isActive() || $this->role !== 'staff') {
            return false;
        }

        $permissions = $this->permissions ?? [];

        return in_array($permission, $permissions);
    }

    /**
     * Orders assigned to this user (if staff)
     */
    public function assignedOrders()
    {
        return $this->hasMany(Order::class, 'assigned_to');
    }
}