<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashSaleProduct extends Model
{
    protected $fillable = [
        'flash_sale_id', 'product_id', 'seller_id',
        'flash_price', 'flash_stock', 'sold_count',
        'max_per_customer', 'status',
    ];

    protected $casts = [
        'flash_price' => 'decimal:2',
    ];

    public function flashSale()
    {
        return $this->belongsTo(FlashSale::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    public function remainingStock(): int
    {
        return max(0, $this->flash_stock - $this->sold_count);
    }
}
