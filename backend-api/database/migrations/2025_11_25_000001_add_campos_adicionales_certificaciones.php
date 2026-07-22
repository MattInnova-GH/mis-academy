<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {
            $table->string('tipo_certificado', 20)->default('empresa')->after('id_certificacion');
            $table->string('nombre_curso', 255)->nullable()->after('url_certificado');
            $table->string('nombre_estudiante', 255)->nullable()->after('nombre_curso');
            $table->date('fecha_inicio')->nullable()->after('nombre_estudiante');
            $table->date('fecha_fin')->nullable()->after('fecha_inicio');
            $table->integer('total_horas')->nullable()->after('fecha_fin');
            $table->string('email_destinatario', 255)->nullable()->after('total_horas');
        });
    }

    public function down(): void
    {
        Schema::table('certificaciones', function (Blueprint $table) {
            $table->dropColumn([
                'tipo_certificado',
                'nombre_curso',
                'nombre_estudiante',
                'fecha_inicio',
                'fecha_fin',
                'total_horas',
                'email_destinatario'
            ]);
        });
    }
};
