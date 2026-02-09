<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Customer extends Authenticatable
{
    use HasFactory;

    // NOTE: Database schema uses plural table name.
    protected $table = 'customers';
    
    // Primary key
    protected $primaryKey = 'customer_id';
    
    protected $keyType = 'int';
    
    public $incrementing = true;
    
    protected $fillable = [
        'customer_id',
        'name',
        'email',
        'password',
        'phone',
        'is_uitm_member',
        'verification_status',
        'cust_type',
        'created_at',
        'otp_token',
        'otp_expires_at',
        'is_email_verified',
        'google_id',
        'auth_method',
        'profile_completed'
    ];
    
    protected $hidden = ['password', 'remember_token'];
    
    protected $casts = [
        'is_uitm_member' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'is_email_verified' => 'boolean',
        'profile_completed' => 'boolean',
    ];
    
    public $timestamps = true;
    
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id', 'customer_id');
    }
    
    public function memberVerification()
    {
        return $this->hasOne(MemberVerification::class, 'customer_id', 'customer_id');
    }
}