<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlashSale extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'discount_type',
        'discount_value',
        'start_time',
        'end_time',
        'applicable_products',
        'active',
        'created_by',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'applicable_products' => 'array',
        'active' => 'boolean',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function flashSaleProducts()
    {
        return $this->hasMany(FlashSaleProduct::class);
    }

    public function approvedProducts()
    {
        return $this->hasMany(FlashSaleProduct::class)->where('status', 'approved');
    }

    public function getApplicableProducts()
    {
        if (!$this->applicable_products) {
            return collect();
        }
        return Product::whereIn('id', $this->applicable_products)->get();
    }

    public function isActive()
    {
        return $this->active && now()->between($this->start_time, $this->end_time);
    }
}
