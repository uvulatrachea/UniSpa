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
        Schema::create('booking', function (Blueprint $table) {
            $table->string('booking_id')->primary(); // string primary key
            $table->unsignedBigInteger('customer_id'); // assuming customers table uses bigint
            $table->unsignedBigInteger('slot_id'); // assuming slots table uses bigint
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('final_amount', 10, 2)->default(0);
            $table->decimal('deposit_amount', 10, 2)->default(0);
            $table->string('status')->default('pending'); // adjust default as needed
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('unpaid'); // adjust default
            $table->string('depo_qr_pic')->nullable();
            $table->string('digital_receipt')->nullable();
            $table->timestamps();

            // Optional foreign keys if you have related tables
            //$table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            //$table->foreign('slot_id')->references('id')->on('slots')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking');
    }
};
