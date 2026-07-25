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
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'rider_fee')) {
                $table->decimal('rider_fee', 10, 2)->default(0)->after('total');
            }
            if (!Schema::hasColumn('orders', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('updated_at');
            }
            if (!Schema::hasColumn('orders', 'proof_photo')) {
                $table->string('proof_photo')->nullable()->after('delivered_at');
            }
            if (!Schema::hasColumn('orders', 'return_reason')) {
                $table->text('return_reason')->nullable()->after('proof_photo');
            }
            if (!Schema::hasColumn('orders', 'payment_collected')) {
                $table->boolean('payment_collected')->default(false)->after('return_reason');
            }
            if (!Schema::hasColumn('orders', 'seller_credited')) {
                $table->boolean('seller_credited')->default(false)->after('payment_collected');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $columns = ['rider_fee', 'delivered_at', 'proof_photo', 'return_reason', 'payment_collected', 'seller_credited'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
