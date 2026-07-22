<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reclamacion extends Model
{
    protected $table = 'libro_reclamaciones';

    // La tabla real usa createdAt / updatedAt (camelCase), no created_at / updated_at
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'tracking_code',
        'doc_type', 'dni', 'apellido_paterno', 'apellido_materno', 'nombres',
        'telefono', 'email', 'department', 'province', 'district', 'domicilio',
        'is_minor',
        'parent_doc_type', 'parent_dni', 'parent_apellido_paterno', 'parent_apellido_materno',
        'parent_nombres', 'parent_telefono', 'parent_email', 'parent_department',
        'parent_province', 'parent_district', 'parent_domicilio',
        'service_type', 'amount', 'service_description',
        'claim_description', 'claim_request', 'claim_type',
        'processing_status', 'admin_response', 'responded_at',
        'status',
    ];

    protected $casts = [
        'is_minor' => 'boolean',
        'status' => 'boolean',
        'service_type' => 'array', // se guarda como JSON en la columna text
        'amount' => 'decimal:2',
        'responded_at' => 'datetime',
    ];

    /**
     * Equivalente al "Nº 00000123" que muestra el front (padStart de 8 dígitos).
     */
    public function getFormattedIdAttribute(): string
    {
        return str_pad((string) $this->id, 8, '0', STR_PAD_LEFT);
    }
}