<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OtpVerification extends Model
{
    protected $table = 'otp_verifications';
    
    protected $fillable = [
        'email',
        'otp_token',
        'expires_at',
        'attempts',
        'type',
        'signup_data'
    ];
    
    protected $casts = [
        'expires_at' => 'datetime',
        'signup_data' => 'array'
    ];
    
    public $timestamps = true;
}
