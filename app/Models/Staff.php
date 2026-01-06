<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Staff extends Model
{
    use HasFactory;

    protected $table = 'staff';
    protected $primaryKey = 'staff_id';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'staff_id',
        'name',
        'email',
        'phone',
        'password',
        'staff_type',
        'role',
        'work_status',
        'created_at'
    ];
    
    protected $hidden = ['password'];
    
    protected $casts = [
        'created_at' => 'datetime'
    ];
    
    public $timestamps = false;
    
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