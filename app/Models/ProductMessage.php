<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductMessage extends Model
{
    protected $fillable = ['product_id', 'sender_id', 'receiver_id', 'message', 'read_at'];
    protected $casts = ['read_at' => 'datetime'];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
