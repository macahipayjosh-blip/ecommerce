<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuctionDispute extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'reporter_id',
        'resolved_by',
        'status',
        'reason',
        'resolution',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}
