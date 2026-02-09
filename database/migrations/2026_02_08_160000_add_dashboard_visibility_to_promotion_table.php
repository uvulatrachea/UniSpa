<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('promotion')) {
            return;
        }

        if (!Schema::hasColumn('promotion', 'show_in_dashboard_header')) {
            Schema::table('promotion', function (Blueprint $table) {
                $table->boolean('show_in_dashboard_header')->default(true);
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('promotion')) {
            return;
        }

        if (Schema::hasColumn('promotion', 'show_in_dashboard_header')) {
            Schema::table('promotion', function (Blueprint $table) {
                $table->dropColumn('show_in_dashboard_header');
            });
        }
    }
};
