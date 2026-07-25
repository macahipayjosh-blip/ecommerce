<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vendor_id',
        'order_number',
        'status',
        'payment_method',
        'payment_collected',
        'seller_credited',
        'subtotal',
        'tax',
        'shipping',
        'auction_fee',
        'total',
        'notes',
        'address_id',
        'proof_photo',
        'return_reason',
        'delivered_at',
    ];

    protected $casts = [
        'subtotal'           => 'decimal:2',
        'tax'                => 'decimal:2',
        'shipping'           => 'decimal:2',
        'total'              => 'decimal:2',
        'payment_collected'  => 'boolean',
        'seller_credited'    => 'boolean',
        'delivered_at'       => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function shipment()
    {
        return $this->hasOne(Shipment::class);
    }

    public function paymentTransactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function messages()
    {
        return $this->hasMany(\App\Models\OrderMessage::class)->oldest();
    }
}

