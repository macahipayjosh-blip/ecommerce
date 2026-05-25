<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('flash_sale_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flash_sale_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('flash_price', 10, 2);
            $table->unsignedInteger('flash_stock');
            $table->unsignedInteger('sold_count')->default(0);
            $table->unsignedInteger('max_per_customer')->default(0); // 0 = no limit
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();

            $table->unique(['flash_sale_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('flash_sale_products');
    }
};
