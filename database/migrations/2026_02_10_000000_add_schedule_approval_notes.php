<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (Schema::hasTable('schedule')) {
            Schema::table('schedule', function (Blueprint $table) {
                if (!Schema::hasColumn('schedule', 'approval_notes')) {
                    $table->text('approval_notes')->nullable();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('schedule')) {
            Schema::table('schedule', function (Blueprint $table) {
                if (Schema::hasColumn('schedule', 'approval_notes')) {
                    $table->dropColumn('approval_notes');
                }
            });
        }
    }
};
