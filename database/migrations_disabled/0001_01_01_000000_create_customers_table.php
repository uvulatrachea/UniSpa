<?php

// database/migrations/xxxx_xx_xx_create_customers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();

            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone');

            // matches Register.jsx
            $table->enum('cust_type', ['regular', 'uitm_member'])->default('regular');
            $table->enum('member_type', ['student', 'staff'])->nullable();

            $table->boolean('is_uitm_member')->default(false);
            $table->enum('verification_status', ['pending', 'verified'])->default('pending');

            $table->string('password');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customer');
    }
};
