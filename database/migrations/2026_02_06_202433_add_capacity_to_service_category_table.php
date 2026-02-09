<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('service_category', function (Blueprint $table) {
            if (!Schema::hasColumn('service_category', 'capacity_units')) {
                $table->integer('capacity_units')->default(1);
            }
        });
    }

    public function down(): void
    {
        Schema::table('service_category', function (Blueprint $table) {
            if (Schema::hasColumn('service_category', 'capacity_units')) {
                $table->dropColumn('capacity_units');
            }
        });
    }
};
