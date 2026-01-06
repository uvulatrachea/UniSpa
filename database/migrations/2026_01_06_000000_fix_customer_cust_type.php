<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('customer')) {
            // Table may be 'customers' in some envs; skip if not present
            return;
        }

        if (Schema::hasColumn('customer', 'cust_type')) {
            // Modify the column to be larger
            DB::statement("ALTER TABLE `customer` MODIFY `cust_type` VARCHAR(32) NULL;");
        } else {
            Schema::table('customer', function (Blueprint $table) {
                $table->string('cust_type', 32)->nullable()->after('verification_status');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('customer')) {
            return;
        }

        if (Schema::hasColumn('customer', 'cust_type')) {
            // Try to revert to a small varchar (original size unknown); set to 10
            DB::statement("ALTER TABLE `customer` MODIFY `cust_type` VARCHAR(10) NULL;");
        }
    }
};
