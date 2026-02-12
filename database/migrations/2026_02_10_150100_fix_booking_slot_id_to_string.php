<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // booking.slot_id must be string to match slot.slot_id (string PK)
        if (Schema::hasTable('booking')) {
            Schema::table('booking', function (Blueprint $table) {
                $table->string('slot_id', 50)->change();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('booking')) {
            Schema::table('booking', function (Blueprint $table) {
                $table->unsignedBigInteger('slot_id')->change();
            });
        }
    }
};
