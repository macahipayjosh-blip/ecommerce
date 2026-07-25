<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'compare_at_price',
        'cost_per_item',
        'sku',
        'barcode',
        'stock_quantity',
        'low_stock_threshold',
        'weight',
        'weight_unit',
        'category_id',
        'brand_id',
        'vendor_id',
        'status',
        'taxable',

        // Auction fields
        'is_auction',
        'reserve_price',
        'auction_start_at',
        'auction_end_at',
        'automatic_extend_minutes',
        'auction_status',
        'breed',
        'age',
        'location',
        'health_records',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'compare_at_price' => 'decimal:2',
        'cost_per_item' => 'decimal:2',
        'weight' => 'decimal:2',
        'dimensions' => 'array',
        'taxable' => 'boolean',
        'auction_start_at' => 'datetime',
        'auction_end_at' => 'datetime',
        'health_records' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function vendor()
    {
        return $this->seller();
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function getAvgRatingAttribute(): float
    {
        if (isset($this->attributes['reviews_avg_rating'])) {
            return round((float) $this->attributes['reviews_avg_rating'], 1);
        }
        if ($this->relationLoaded('reviews')) {
            return round($this->reviews->avg('rating') ?? 0, 1);
        }
        return round($this->reviews()->avg('rating') ?? 0, 1);
    }

    public function getReviewsCountAttribute(): int
    {
        if (isset($this->attributes['reviews_count'])) {
            return (int) $this->attributes['reviews_count'];
        }
        if ($this->relationLoaded('reviews')) {
            return $this->reviews->count();
        }
        return $this->reviews()->count();
    }

    protected $appends = ['avg_rating', 'reviews_count'];

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bids()
    {
        return $this->hasMany(\App\Models\AuctionBid::class);
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_quantity', '>', 0);
    }

    // Accessors for images, inventory logs, etc.
}

