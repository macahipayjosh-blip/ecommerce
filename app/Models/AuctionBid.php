<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuctionBid extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'user_id',
        'amount',
        'max_proxy_amount',
        'is_proxy',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'max_proxy_amount' => 'decimal:2',
        'is_proxy' => 'boolean',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
