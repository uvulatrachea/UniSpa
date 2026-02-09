<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BookingParticipant extends Model
{
    use HasFactory;

    /**
     * DB table is singular: `booking_participant`.
     * Without this, Eloquent assumes `booking_participants`.
     */
    protected $table = 'booking_participant';

    protected $primaryKey = 'participant_id';
    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'is_self',
        'name',
        'phone',
        'email',
        'is_uitm_member',
        'discount_amount',
    ];
}
