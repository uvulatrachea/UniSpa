<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $table = 'service';
    protected $primaryKey = 'id';     // ✅ correct
    public $incrementing = true;      // ✅ bigint auto
    protected $keyType = 'int';
    public $timestamps = true;        // ✅ you DO have created_at/updated_at now

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'price',
        'duration_minutes',
        'image_url',
        'is_popular',
        'tags',
        'location_mode'
    ];

    public function promotions()
    {
        return $this->belongsToMany(
            Promotion::class,
            'promotion_service',
            'service_id',       // pivot column
            'promotion_id',     // pivot column
            'id',               // local key on service table
            'promotion_id'      // key on promotion table
        );
    }
}
