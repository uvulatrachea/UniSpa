<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $table = 'cart';
    protected $primaryKey = 'id';
    public $timestamps = false; // set true if you have created_at/updated_at

    protected $fillable = ['customer_id', 'items'];

    // ✅ THIS FIXES "cart empty" because items will be array, not string
    protected $casts = [
        'items' => 'array',
    ];
}
