<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $table = 'service';
    protected $primaryKey = 'service_id';
    protected $keyType = 'string';
    public $incrementing = false;
    
    protected $fillable = [
        'service_id',
        'category_id',
        'name',
        'price',
        'duration_minutes',
        'description'
    ];
    
    public $timestamps = false;
    
    public function category()
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id', 'category_id');
    }
    
    public function slots()
    {
        return $this->hasMany(Slot::class, 'service_id', 'service_id');
    }
    
    public function promotions()
    {
        return $this->belongsToMany(Promotion::class, 'promotion_service', 'service_id', 'promotion_id');
    }
}