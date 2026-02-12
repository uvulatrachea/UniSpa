<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->boolean('is_uitm_member')->default(false);
            $table->string('verification_status')->nullable();
            $table->string('cust_type')->nullable();
            $table->string('member_type')->nullable();
            $table->string('otp_token')->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            $table->boolean('is_email_verified')->default(false);
            $table->string('google_id')->nullable();
            $table->string('auth_method')->nullable();
            $table->boolean('profile_completed')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
