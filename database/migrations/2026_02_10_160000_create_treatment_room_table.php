<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('treatment_room')) {
            Schema::create('treatment_room', function (Blueprint $table) {
                $table->id('room_id');
                $table->string('room_name', 100);
                $table->string('room_type', 50)->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->string('gender', 10)->nullable();          // male / female / unisex
                $table->string('status', 20)->default('available'); // available / occupied / maintenance
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->foreign('category_id')->references('id')->on('service_category')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('treatment_room');
    }
};
