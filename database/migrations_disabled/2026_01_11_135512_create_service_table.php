<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service', function (Blueprint $table) {
            $table->id(); // bigint PK: id

            // FK -> service_category.id
            $table->foreignId('category_id')
                ->constrained('service_category')
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            $table->decimal('price', 10, 2)->default(0);
            $table->integer('duration_minutes')->default(0);

            $table->text('image_url')->nullable();
            $table->boolean('is_popular')->default(false);

            // Use JSON for Postgres (best + easiest)
            $table->json('tags')->nullable();

            $table->timestamps();

            // Optional: prevent duplicate service names in same category
            $table->unique(['category_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service');
    }
};
