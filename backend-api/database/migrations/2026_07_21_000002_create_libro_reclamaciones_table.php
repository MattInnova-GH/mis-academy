<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * NOTA: en el entorno de producción (mattacademy_misacademy) esta tabla
 * ya fue creada manualmente vía SQL (ver dump de phpMyAdmin). Esta migración
 * existe para que otros entornos (local, staging) puedan crearla igual.
 *
 * Si la ejecutas contra la base donde la tabla YA existe, Laravel fallará
 * con "table already exists". En ese caso, en vez de correr `migrate`,
 * inserta manualmente un registro en la tabla `migrations` con el nombre
 * de este archivo (mismo batch que tus otras migraciones), o simplemente
 * no la incluyas en el deploy de esa base.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('libro_reclamaciones', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code', 50)->unique();

            // Reclamante
            $table->string('doc_type', 20);
            $table->string('dni', 20);
            $table->string('apellido_paterno', 50);
            $table->string('apellido_materno', 50);
            $table->string('nombres', 50);
            $table->string('telefono', 15);
            $table->string('email', 100);
            $table->string('department', 50);
            $table->string('province', 50);
            $table->string('district', 50);
            $table->string('domicilio', 200);
            $table->boolean('is_minor')->default(false);

            // Representante (si es menor de edad)
            $table->string('parent_doc_type', 20)->nullable();
            $table->string('parent_dni', 20)->nullable();
            $table->string('parent_apellido_paterno', 50)->nullable();
            $table->string('parent_apellido_materno', 50)->nullable();
            $table->string('parent_nombres', 50)->nullable();
            $table->string('parent_telefono', 15)->nullable();
            $table->string('parent_email', 100)->nullable();
            $table->string('parent_department', 50)->nullable();
            $table->string('parent_province', 50)->nullable();
            $table->string('parent_district', 50)->nullable();
            $table->string('parent_domicilio', 200)->nullable();

            // Servicio relacionado
            $table->text('service_type'); // JSON array
            $table->decimal('amount', 10, 2)->nullable();
            $table->text('service_description');

            // Detalle de la reclamación
            $table->text('claim_description');
            $table->text('claim_request');
            $table->enum('claim_type', ['Reclamo', 'Queja']);
            $table->enum('processing_status', ['Pendiente', 'En Proceso', 'Respondido', 'Cerrado'])
                ->default('Pendiente');
            $table->text('admin_response')->nullable();
            $table->dateTime('responded_at')->nullable();

            $table->boolean('status')->default(true);

            // Timestamps en camelCase, igual que la tabla real (heredada de Sequelize)
            $table->dateTime('createdAt');
            $table->dateTime('updatedAt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('libro_reclamaciones');
    }
};
