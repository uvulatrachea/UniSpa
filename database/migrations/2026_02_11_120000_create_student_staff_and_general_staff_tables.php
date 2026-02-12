<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('student_staff')) {
            Schema::create('student_staff', function (Blueprint $table) {
                $table->unsignedBigInteger('staff_id')->primary();
                $table->integer('working_hours')->default(20);
                $table->timestamps();

                $table->foreign('staff_id')
                    ->references('staff_id')
                    ->on('staff')
                    ->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('general_staff')) {
            Schema::create('general_staff', function (Blueprint $table) {
                $table->unsignedBigInteger('staff_id')->primary();
                $table->timestamps();

                $table->foreign('staff_id')
                    ->references('staff_id')
                    ->on('staff')
                    ->cascadeOnDelete();
            });
        }

        if (!Schema::hasTable('general_staff_qualification')) {
            Schema::create('general_staff_qualification', function (Blueprint $table) {
                $table->id('qualification_id');
                $table->unsignedBigInteger('staff_id');
                $table->string('qualification_name', 200);
                $table->string('institution', 200)->nullable();
                $table->year('year_obtained')->nullable();
                $table->timestamps();

                $table->foreign('staff_id')
                    ->references('staff_id')
                    ->on('staff')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('general_staff_qualification');
        Schema::dropIfExists('general_staff');
        Schema::dropIfExists('student_staff');
    }
};
