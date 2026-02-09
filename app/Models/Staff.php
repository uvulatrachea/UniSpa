<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Staff extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    protected $table = 'staff';
    protected $primaryKey = 'staff_id';
    protected $keyType = 'int';
    public $incrementing = true;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'staff_type',
        'role',
        'work_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function generalStaff()
    {
        return $this->hasOne(GeneralStaff::class, 'staff_id', 'staff_id');
    }

    public function studentStaff()
    {
        return $this->hasOne(StudentStaff::class, 'staff_id', 'staff_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'staff_id', 'staff_id');
    }

    public function slots()
    {
        return $this->hasMany(Slot::class, 'staff_id', 'staff_id');
    }
}
