<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('service_category', function (Blueprint $table) {
            $table->id(); // PK: id (bigint)

            $table->string('name');          // category name
            $table->string('gender')->nullable(); // men / women / unisex (optional text)
            $table->integer('capacity_units')->default(1); // seats/rooms/tables

            $table->timestamps();

            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_category');
    }
};
