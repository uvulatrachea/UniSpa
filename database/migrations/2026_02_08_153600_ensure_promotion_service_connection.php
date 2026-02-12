<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotion_service', function (Blueprint $table) {
            $table->unsignedBigInteger('promotion_id');
            $table->unsignedBigInteger('service_id');

            $table->primary(['promotion_id', 'service_id']);

            // Indexes (optional, improves performance)
            $table->index('promotion_id');
            $table->index('service_id');

            // Foreign keys
            $table->foreign('promotion_id')
                ->references('promotion_id') // adjust to actual promotion PK
                ->on('promotion')
                ->cascadeOnDelete();

            $table->foreign('service_id')
                ->references('id') // service PK
                ->on('service')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotion_service');
    }
};
