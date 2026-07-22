<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('materiales', 'tipo')) {
            Schema::table('materiales', function (Blueprint $table) {
                $table->dropColumn('tipo');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('materiales', 'tipo')) {
            Schema::table('materiales', function (Blueprint $table) {
                $table->enum('tipo', ['PDF', 'DOC', 'PPT', 'Imagen', 'Otro'])
                      ->after('descripcion');
            });
        }
    }
};
