<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Customer extends Authenticatable
{
    use HasFactory;

    protected $table = 'customer';
    
    // Primary key
    protected $primaryKey = 'customer_id';
    
    protected $keyType = 'string';
    
    public $incrementing = false;
    
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
    
    protected $hidden = ['password'];
    
    protected $casts = [
        'is_uitm_member' => 'boolean',
        'created_at' => 'datetime'
    ];
    
    public $timestamps = false;
    
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'customer_id', 'customer_id');
    }
    
    public function memberVerification()
    {
        return $this->hasOne(MemberVerification::class, 'customer_id', 'customer_id');
    }
}