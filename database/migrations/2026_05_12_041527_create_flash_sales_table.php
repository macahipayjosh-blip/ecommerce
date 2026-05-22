<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('flash_sales')) {
            Schema::create('flash_sales', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->text('description')->nullable();
                $table->enum('discount_type', ['percentage', 'fixed']);
                $table->decimal('discount_value', 10, 2);
                $table->datetime('start_time');
                $table->datetime('end_time');
                $table->json('applicable_products')->nullable(); // array of product IDs
                $table->boolean('active')->default(true);
                $table->unsignedBigInteger('created_by'); // admin user ID
                $table->timestamps();

                $table->foreign('created_by')->references('id')->on('users');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flash_sales');
    }
};
