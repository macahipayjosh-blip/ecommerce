<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'is_auction')) {
                $table->boolean('is_auction')->default(false)->after('price');
            }
            if (!Schema::hasColumn('products', 'reserve_price')) {
                $table->decimal('reserve_price', 10, 2)->nullable()->after('price');
            }
            if (!Schema::hasColumn('products', 'auction_start_at')) {
                $table->timestamp('auction_start_at')->nullable()->after('reserve_price');
            }
            if (!Schema::hasColumn('products', 'auction_end_at')) {
                $table->timestamp('auction_end_at')->nullable()->after('auction_start_at');
            }
            if (!Schema::hasColumn('products', 'automatic_extend_minutes')) {
                $table->unsignedSmallInteger('automatic_extend_minutes')->default(0)->after('auction_end_at');
            }
            if (!Schema::hasColumn('products', 'breed')) {
                $table->string('breed')->nullable()->after('description');
            }
            if (!Schema::hasColumn('products', 'age')) {
                $table->string('age')->nullable()->after('breed');
            }
            if (!Schema::hasColumn('products', 'location')) {
                $table->string('location')->nullable()->after('age');
            }
            if (!Schema::hasColumn('products', 'health_records')) {
                $table->json('health_records')->nullable()->after('location');
            }
            if (!Schema::hasColumn('products', 'auction_status')) {
                $table->enum('auction_status', ['pending', 'live', 'ended', 'settled'])->default('pending')->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['is_auction', 'reserve_price', 'auction_start_at', 'auction_end_at', 'automatic_extend_minutes', 'breed', 'age', 'location', 'health_records', 'auction_status']);
        });
    }
};
