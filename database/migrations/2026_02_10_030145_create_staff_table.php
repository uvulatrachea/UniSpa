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
          Schema::create('staff', function (Blueprint $table) {
            $table->id('staff_id'); // primary key, auto-increment
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('password');
            $table->string('staff_type')->nullable(); // e.g., fulltime, parttime
            $table->string('role')->nullable();       // e.g., admin, staff
            $table->string('work_status')->nullable(); // e.g., active, inactive
            $table->rememberToken();                  // adds 'remember_token'
            $table->timestamps();                     // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
