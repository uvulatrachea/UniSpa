<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('otp_verifications')) {
            Schema::create('otp_verifications', function (Blueprint $table) {
                $table->id();
                $table->string('email')->index();
                $table->string('otp_token');
                $table->timestamp('expires_at')->nullable();
                $table->integer('attempts')->default(0);
                $table->string('type')->default('signup'); // signup, login
                $table->json('signup_data')->nullable();
                $table->timestamps();

                $table->unique(['email', 'type']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_verifications');
    }
};
