<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking', function (Blueprint $table) {
            $table->bigIncrements('booking_id');

            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('slot_id')->unique(); // in DB: slot_id UNIQUE

            $table->decimal('total_amount', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('final_amount', 10, 2);

            // deposit
            $table->decimal('deposit_amount', 10, 2)->nullable();
            $table->decimal('deposit_required', 10, 2)->default(0);
            $table->decimal('deposit_paid', 10, 2)->default(0);

            $table->string('booking_code', 20)->nullable()->unique();
            $table->text('special_requests')->nullable();

            $table->string('status', 20)->default('cart'); 
            // cart,pending,accepted,cancelled,completed

            $table->string('payment_method', 20)->nullable(); 
            // stripe,qr
            $table->string('payment_status', 20)->default('pending'); 
            // pending,paid

            $table->binary('digital_receipt')->nullable();

            $table->timestamps();

            $table->foreign('customer_id')
                ->references('customer_id')
                ->on('customers')
                ->cascadeOnDelete();

            $table->foreign('slot_id')
                ->references('slot_id')
                ->on('slot')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking');
    }
};
