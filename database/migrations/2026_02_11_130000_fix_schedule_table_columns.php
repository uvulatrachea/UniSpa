<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename 'id' to 'schedule_id' if needed
        if (Schema::hasColumn('schedule', 'id') && !Schema::hasColumn('schedule', 'schedule_id')) {
            Schema::table('schedule', function (Blueprint $table) {
                $table->renameColumn('id', 'schedule_id');
            });
        }

        // Add 'created_by' column if missing
        if (!Schema::hasColumn('schedule', 'created_by')) {
            Schema::table('schedule', function (Blueprint $table) {
                $table->string('created_by', 20)->default('admin')->after('status');
            });
        }

        // Add 'approval_notes' column if missing
        if (!Schema::hasColumn('schedule', 'approval_notes')) {
            Schema::table('schedule', function (Blueprint $table) {
                $table->text('approval_notes')->nullable()->after('approval_status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('schedule', 'schedule_id') && !Schema::hasColumn('schedule', 'id')) {
            Schema::table('schedule', function (Blueprint $table) {
                $table->renameColumn('schedule_id', 'id');
            });
        }

        Schema::table('schedule', function (Blueprint $table) {
            if (Schema::hasColumn('schedule', 'created_by')) {
                $table->dropColumn('created_by');
            }
            if (Schema::hasColumn('schedule', 'approval_notes')) {
                $table->dropColumn('approval_notes');
            }
        });
    }
};
