<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'booking';
    protected $primaryKey = 'booking_id';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'booking_id',
        'customer_id',
        'slot_id',
        'total_amount',
        'discount_amount',
        'final_amount',
        'status',
        'deposit_amount',
        'payment_method',
        'payment_status',
        'depo_qr_pic',
        'digital_receipt'
    ];
    
    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'deposit_amount' => 'decimal:2'
    ];
    
    public $timestamps = false;
    
    // Relationships
    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customer_id', 'customer_id');
    }
    
    public function slot()
    {
        return $this->belongsTo(Slot::class, 'slot_id', 'slot_id');
    }
    
    public function participants()
    {
        return $this->hasMany(BookingParticipant::class, 'booking_id', 'booking_id');
    }
    
    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id', 'booking_id');
    }
}