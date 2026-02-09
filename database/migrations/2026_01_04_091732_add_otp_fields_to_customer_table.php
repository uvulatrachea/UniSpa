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
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'phone')) {
                $table->string('phone', 20)->nullable();
            }

            if (!Schema::hasColumn('customers', 'is_uitm_member')) {
                $table->boolean('is_uitm_member')->default(false);
            }

            if (!Schema::hasColumn('customers', 'verification_status')) {
                $table->string('verification_status', 10)->default('pending');
            }

            if (!Schema::hasColumn('customers', 'cust_type')) {
                $table->string('cust_type', 15)->default('regular');
            }

            if (!Schema::hasColumn('customers', 'otp_token')) {
                $table->string('otp_token')->nullable();
            }

            if (!Schema::hasColumn('customers', 'otp_expires_at')) {
                $table->timestamp('otp_expires_at')->nullable();
            }

            if (!Schema::hasColumn('customers', 'is_email_verified')) {
                $table->boolean('is_email_verified')->default(false);
            }

            if (!Schema::hasColumn('customers', 'google_id')) {
                $table->string('google_id')->nullable();
            }

            if (!Schema::hasColumn('customers', 'auth_method')) {
                $table->string('auth_method')->nullable();
            }

            if (!Schema::hasColumn('customers', 'profile_completed')) {
                $table->boolean('profile_completed')->default(false);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $drops = [
                'phone',
                'is_uitm_member',
                'verification_status',
                'cust_type',
                'otp_token',
                'otp_expires_at',
                'is_email_verified',
                'google_id',
                'auth_method',
                'profile_completed',
            ];

            foreach ($drops as $col) {
                if (Schema::hasColumn('customers', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
