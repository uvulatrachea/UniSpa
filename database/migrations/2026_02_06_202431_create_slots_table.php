<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('slot', function (Blueprint $table) {
            $table->string('slot_id')->primary(); // e.g. SLxxxxx

            // service table PK is "id"
            $table->unsignedBigInteger('service_id');

            // optional (only FK if you already have staff table)
            $table->unsignedBigInteger('staff_id')->nullable();

            $table->date('slot_date');
            $table->time('start_time');
            $table->time('end_time');

            // available / blocked
            $table->string('status')->default('available');

            $table->timestamps();

            // ✅ FK -> service.id (NOT service_id)
            $table->foreign('service_id')->references('id')->on('service')->cascadeOnDelete();

            // Prevent duplicate slots for same service + date + start_time
            $table->unique(['service_id', 'slot_date', 'start_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slot');
    }
};
