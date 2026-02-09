<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('promotion_service')) {
            Schema::create('promotion_service', function (Blueprint $table) {
                $table->unsignedBigInteger('promotion_id');
                $table->unsignedBigInteger('service_id');
                $table->primary(['promotion_id', 'service_id']);
            });
        }

        if (!Schema::hasColumn('promotion_service', 'promotion_id')) {
            Schema::table('promotion_service', function (Blueprint $table) {
                $table->unsignedBigInteger('promotion_id')->nullable();
            });
        }

        if (!Schema::hasColumn('promotion_service', 'service_id')) {
            Schema::table('promotion_service', function (Blueprint $table) {
                $table->unsignedBigInteger('service_id')->nullable();
            });
        }

        if (!$this->indexExists('promotion_service', 'promotion_service_promotion_id_index')) {
            Schema::table('promotion_service', function (Blueprint $table) {
                $table->index('promotion_id');
            });
        }

        if (!$this->indexExists('promotion_service', 'promotion_service_service_id_index')) {
            Schema::table('promotion_service', function (Blueprint $table) {
                $table->index('service_id');
            });
        }

        // FK: promotion_service.promotion_id -> promotion.promotion_id
        if (Schema::hasTable('promotion') && !$this->foreignKeyExists('promotion_service', 'fk_promotion_service_promotion')) {
            Schema::table('promotion_service', function (Blueprint $table) {
                $table->foreign('promotion_id', 'fk_promotion_service_promotion')
                    ->references('promotion_id')
                    ->on('promotion')
                    ->cascadeOnDelete();
            });
        }

        // FK: promotion_service.service_id -> service.(service_id|id)
        if (Schema::hasTable('service') && !$this->foreignKeyExists('promotion_service', 'fk_promotion_service_service')) {
            $servicePk = Schema::hasColumn('service', 'service_id') ? 'service_id' : 'id';

            Schema::table('promotion_service', function (Blueprint $table) use ($servicePk) {
                $table->foreign('service_id', 'fk_promotion_service_service')
                    ->references($servicePk)
                    ->on('service')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('promotion_service')) {
            return;
        }

        Schema::table('promotion_service', function (Blueprint $table) {
            if ($this->foreignKeyExists('promotion_service', 'fk_promotion_service_promotion')) {
                $table->dropForeign('fk_promotion_service_promotion');
            }

            if ($this->foreignKeyExists('promotion_service', 'fk_promotion_service_service')) {
                $table->dropForeign('fk_promotion_service_service');
            }
        });
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        $database = DB::getDatabaseName();

        return DB::table('information_schema.table_constraints')
            ->where('table_schema', 'public')
            ->where('table_name', $table)
            ->where('constraint_name', $constraint)
            ->where('constraint_type', 'FOREIGN KEY')
            ->when($database, fn ($q) => $q->where('constraint_catalog', $database))
            ->exists();
    }

    private function indexExists(string $table, string $index): bool
    {
        return DB::table('pg_indexes')
            ->where('schemaname', 'public')
            ->where('tablename', $table)
            ->where('indexname', $index)
            ->exists();
    }
};
