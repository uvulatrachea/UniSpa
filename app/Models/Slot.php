<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slot extends Model
{
    use HasFactory;

    /**
     * NOTE: The database uses singular table name `slot`.
     * Without this, Eloquent defaults to `slots` and PostgreSQL throws:
     *   relation "slots" does not exist
     */
    protected $table = 'slot';

    // Optional but matches schema (string PK)
    protected $primaryKey = 'slot_id';
    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = ['slot_date' => 'date'];

    public function service()
    {
        // FK: slot.service_id -> service.id (per migration)
        return $this->belongsTo(Service::class, 'service_id', 'id');
    }
}
