<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class RespondReclamacionRequest extends BaseApiRequest
{
    public function rules(): array
    {
        return [
            'admin_response' => ['required', 'string'],
            'processing_status' => ['required', Rule::in(['En Proceso', 'Respondido', 'Cerrado'])],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_response.required' => 'La respuesta es obligatoria.',
            'processing_status.required' => 'El estado es obligatorio.',
        ];
    }
}