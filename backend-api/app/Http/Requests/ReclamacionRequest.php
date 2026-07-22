<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class ReclamacionRequest extends BaseApiRequest
{
    public function rules(): array
    {
        $isMinor = filter_var($this->input('is_minor'), FILTER_VALIDATE_BOOLEAN);
        $reqIfMinor = $isMinor ? 'required' : 'nullable';

        return [
            'doc_type' => ['required', Rule::in(['DNI', 'CE', 'Pasaporte'])],
            'dni' => ['required', 'string', 'min:8', 'max:20'],
            'apellido_paterno' => ['required', 'string', 'max:50'],
            'apellido_materno' => ['required', 'string', 'max:50'],
            'nombres' => ['required', 'string', 'max:50'],
            'telefono' => ['required', 'string', 'max:15'],
            'email' => ['required', 'email', 'max:100'],
            'department' => ['required', 'string', 'max:50'],
            'province' => ['required', 'string', 'max:50'],
            'district' => ['required', 'string', 'max:50'],
            'domicilio' => ['required', 'string', 'max:200'],

            'is_minor' => ['required', 'boolean'],

            // Bloque del representante, obligatorio solo si is_minor = true
            'parent_doc_type' => [$reqIfMinor, Rule::in(['DNI', 'CE', 'Pasaporte'])],
            'parent_dni' => [$reqIfMinor, 'string', 'min:8', 'max:20'],
            'parent_apellido_paterno' => [$reqIfMinor, 'string', 'max:50'],
            'parent_apellido_materno' => [$reqIfMinor, 'string', 'max:50'],
            'parent_nombres' => [$reqIfMinor, 'string', 'max:50'],
            'parent_telefono' => [$reqIfMinor, 'string', 'max:15'],
            'parent_email' => [$reqIfMinor, 'email', 'max:100'],
            'parent_department' => [$reqIfMinor, 'string', 'max:50'],
            'parent_province' => [$reqIfMinor, 'string', 'max:50'],
            'parent_district' => [$reqIfMinor, 'string', 'max:50'],
            'parent_domicilio' => [$reqIfMinor, 'string', 'max:200'],

            'service_type' => ['required', 'array', 'min:1'],
            'service_type.*' => ['string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'service_description' => ['required', 'string'],

            'claim_description' => ['required', 'string', 'min:50'],
            'claim_request' => ['required', 'string'],
            'claim_type' => ['required', Rule::in(['Reclamo', 'Queja'])],

            'declaration' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'dni.required' => 'El DNI es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico debe ser válido.',
            'declaration.accepted' => 'Debes aceptar la declaración jurada.',
            'service_type.required' => 'Debes seleccionar al menos un tipo de servicio.',
            'service_type.min' => 'Debes seleccionar al menos un tipo de servicio.',
            'claim_description.required' => 'La descripción del reclamo es obligatoria.',
            'claim_description.min' => 'La descripción debe tener al menos 50 caracteres.',
        ];
    }
}