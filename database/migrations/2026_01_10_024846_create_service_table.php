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
        Schema::create('service', function (Blueprint $table) {
            $table->id(); // primary key, auto-increment bigint
            $table->unsignedBigInteger('category_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('duration_minutes')->default(0);
            $table->string('image_url')->nullable();
            $table->boolean('is_popular')->default(false);
            $table->string('tags')->nullable();
            $table->string('location_mode')->nullable();
            $table->timestamps();

            // optional: foreign key if you have category table
            $table->foreign('category_id')->references('id')->on('service_category')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service');
    }
};
