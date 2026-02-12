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
        Schema::create('verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->string('unique_id');
            $table->string('otp');
            $table->enum('type',['register','reset_password']);
            $table->enum('send_via',['email','sms','ws']);
            $table->integer('resend')->default(0);
            $table->enum('status',['active','valid','invalid']);
            $table->timestamps();
            
            // Add foreign key constraint to customers table
            $table->foreign('customer_id')->references('customer_id')->on('customers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verifications');
    }
};
