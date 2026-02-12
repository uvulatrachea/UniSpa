<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Student staff availability: pending -> approved/rejected
        if (Schema::hasTable('schedule')) {
            Schema::table('schedule', function (Blueprint $table) {
                if (!Schema::hasColumn('schedule', 'approval_status')) {
                    $table->string('approval_status', 20)->default('approved');
                }
            });
        }

        // Slot hard constraints: no double booking staff+room for same date+start_time.
        if (Schema::hasTable('slot')) {
            Schema::table('slot', function (Blueprint $table) {
                if (!Schema::hasColumn('slot', 'room_id')) {
                    $table->unsignedBigInteger('room_id')->nullable();
                }
            });
        }

        // Add unique indexes (if the columns exist).
        if (Schema::hasTable('slot')) {
            /**
             * Data cleanup BEFORE adding hard unique constraints.
             *
             * If the DB already contains duplicate (room_id, slot_date, start_time) or
             * (staff_id, slot_date, start_time), Postgres will refuse to create the unique index.
             *
             * Strategy (safe + fast):
             * - Keep ONE row per duplicate key.
             * - Prefer keeping the row that is linked to a booking.
             * - For the other duplicates, set the colliding FK (room_id/staff_id) to NULL.
             *   (NULL does not violate a unique constraint.)
             *
             * This avoids deleting data while still allowing the constraint to be created.
             * Admin can re-assign room/staff later if needed.
             */
            try {
                $driver = Schema::getConnection()->getDriverName();
                if (in_array($driver, ['pgsql', 'mysql'], true)) {
                    // Use separate transactions for cleanup to avoid transaction rollback issues
                    DB::transaction(function () {
                        if (Schema::hasColumn('slot', 'room_id')) {
                            DB::statement(<<<SQL
                                UPDATE slot s
                                SET room_id = NULL
                                FROM (
                                    SELECT slot_id
                                    FROM (
                                        SELECT s2.slot_id,
                                               ROW_NUMBER() OVER (
                                                   PARTITION BY s2.room_id, s2.slot_date, s2.start_time
                                                   ORDER BY CASE WHEN b.booking_id IS NULL THEN 1 ELSE 0 END, s2.slot_id
                                               ) AS rn
                                        FROM slot s2
                                        LEFT JOIN booking b ON b.slot_id = s2.slot_id
                                        WHERE s2.room_id IS NOT NULL
                                    ) ranked
                                    WHERE ranked.rn > 1
                                ) d
                                WHERE s.slot_id = d.slot_id
                            SQL);
                        }

                        if (Schema::hasColumn('slot', 'staff_id')) {
                            DB::statement(<<<SQL
                                UPDATE slot s
                                SET staff_id = NULL
                                FROM (
                                    SELECT slot_id
                                    FROM (
                                        SELECT s2.slot_id,
                                               ROW_NUMBER() OVER (
                                                   PARTITION BY s2.staff_id, s2.slot_date, s2.start_time
                                                   ORDER BY CASE WHEN b.booking_id IS NULL THEN 1 ELSE 0 END, s2.slot_id
                                               ) AS rn
                                        FROM slot s2
                                        LEFT JOIN booking b ON b.slot_id = s2.slot_id
                                        WHERE s2.staff_id IS NOT NULL
                                    ) ranked
                                    WHERE ranked.rn > 1
                                ) d
                                WHERE s.slot_id = d.slot_id
                            SQL);
                        }
                    }, 3); // Retry up to 3 times
                }
            } catch (\Throwable $e) {
                // If cleanup fails, we'll let the subsequent unique constraint fail with a clearer error.
                // Log the error for debugging
                \Log::warning('Slot cleanup failed: ' . $e->getMessage());
            }

            Schema::table('slot', function (Blueprint $table) {
                // Staff collision: one staff can't have two slots at same date+start.
                if (Schema::hasColumn('slot', 'staff_id')) {
                    $table->unique(['staff_id', 'slot_date', 'start_time'], 'slot_staff_date_time_unique');
                }

                // Room collision: one room can't have two slots at same date+start.
                if (Schema::hasColumn('slot', 'room_id')) {
                    $table->unique(['room_id', 'slot_date', 'start_time'], 'slot_room_date_time_unique');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('slot')) {
            Schema::table('slot', function (Blueprint $table) {
                if (Schema::hasColumn('slot', 'staff_id')) {
                    $table->dropUnique('slot_staff_date_time_unique');
                }
                if (Schema::hasColumn('slot', 'room_id')) {
                    $table->dropUnique('slot_room_date_time_unique');
                }
                // keep room_id column if existed previously
            });
        }

        if (Schema::hasTable('schedule')) {
            Schema::table('schedule', function (Blueprint $table) {
                if (Schema::hasColumn('schedule', 'approval_status')) {
                    $table->dropColumn('approval_status');
                }
            });
        }
    }
};
