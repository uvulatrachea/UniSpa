<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ensure the Postgres `customers` table contains the columns used by the
     * current customer authentication/signup flows.
     *
     * Some environments were created from raw SQL dumps and may miss these columns
     * even though Laravel migrations were marked as "Ran".
     */
    public function up(): void
    {
        if (! Schema::hasTable('customers')) {
            return;
        }

        Schema::table('customers', function (Blueprint $table) {
            if (! Schema::hasColumn('customers', 'is_email_verified')) {
                $table->boolean('is_email_verified')->default(false);
            }

            if (! Schema::hasColumn('customers', 'auth_method')) {
                $table->string('auth_method', 50)->nullable();
            }

            if (! Schema::hasColumn('customers', 'profile_completed')) {
                $table->boolean('profile_completed')->default(false);
            }

            if (! Schema::hasColumn('customers', 'google_id')) {
                $table->string('google_id')->nullable();
            }

            if (! Schema::hasColumn('customers', 'otp_token')) {
                $table->string('otp_token')->nullable();
            }

            if (! Schema::hasColumn('customers', 'otp_expires_at')) {
                $table->timestamp('otp_expires_at')->nullable();
            }
        });
    }

    public function down(): void
    {
        // Intentionally left blank. Dropping columns could break running environments.
    }
};
