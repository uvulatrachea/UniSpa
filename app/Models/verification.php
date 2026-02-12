<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class verification extends Model
{
    use HasFactory;

    protected $table = 'verifications';
    protected $primaryKey = 'id';
    protected $fillable = [
        'customer_id',
        'unique_id',
        'otp',
        'type',
        'send_via',
        'resend',
        'status',
    ];

    protected $casts = [
        'type' => 'string',
        'send_via' => 'string',
        'status' => 'string',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }
}