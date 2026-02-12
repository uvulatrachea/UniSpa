<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('booking_participant')) {
            Schema::create('booking_participant', function (Blueprint $table) {
                $table->id('participant_id');
                $table->string('booking_id');
                $table->boolean('is_self')->default(false);
                $table->string('name');
                $table->string('phone')->nullable();
                $table->string('email')->nullable();
                $table->boolean('is_uitm_member')->default(false);
                $table->decimal('discount_amount', 10, 2)->default(0);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_participant');
    }
};
