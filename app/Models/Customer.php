<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Notifications\Notifiable;

class Customer extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    protected $table = 'customers';
    protected $primaryKey = 'customer_id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'is_uitm_member',
        'verification_status',
        'cust_type',
        'member_type',
        'is_email_verified',
        'email_verified_at',
        'google_id',
        'auth_method',
        'profile_completed'
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'is_uitm_member' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'is_email_verified' => 'boolean',
        'email_verified_at' => 'datetime',
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

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'customer_id';
    }

    /**
     * Send the email verification notification.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new \App\Notifications\CustomerEmailVerification);
    }
}
