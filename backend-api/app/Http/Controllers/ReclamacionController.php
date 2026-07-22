<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReclamacionRequest;
use App\Http\Requests\RespondReclamacionRequest;
use App\Mail\NuevoReclamoMail;
use App\Mail\RespuestaReclamoMail;
use App\Models\Reclamacion;
use App\Services\TrackingCodeGenerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReclamacionController extends Controller
{
    /**
     * POST /api/reclamaciones
     * Registro público de un reclamo/queja desde el formulario del front.
     */
    public function store(ReclamacionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['tracking_code'] = TrackingCodeGenerator::generate($data['nombres'], $data['claim_type']);
        $data['processing_status'] = 'Pendiente';
        $data['status'] = true;

        $reclamacion = Reclamacion::create($data);

        try {
            Mail::to(config('mail.receptor'))
                ->send(new NuevoReclamoMail($reclamacion, isAdminCopy: true));

            Mail::to($reclamacion->email)
                ->send(new NuevoReclamoMail($reclamacion, isAdminCopy: false));
        } catch (\Throwable $e) {
            Log::error('Error enviando correo de registro de reclamo: '.$e->getMessage());
        }

        return response()->json([
            'message' => 'Reclamación registrada correctamente.',
            'id' => $reclamacion->id,
            'tracking_code' => $reclamacion->tracking_code,
        ], 201);
    }

    /**
     * GET /api/reclamaciones/buscar?tracking_code=...&dni=...
     * Búsqueda pública para el tab de "Seguimiento" del front.
     * Filtra en el servidor y SOLO devuelve el registro que coincide.
     */
    public function buscar(Request $request): JsonResponse
    {
        $request->validate([
            'tracking_code' => ['nullable', 'string'],
            'dni' => ['nullable', 'string'],
        ]);

        if (! $request->filled('tracking_code') && ! $request->filled('dni')) {
            return response()->json([
                'error' => 'Debes indicar un código de seguimiento o un DNI.',
            ], 422);
        }

        $reclamacion = Reclamacion::where('status', true)
            ->where(function ($query) use ($request) {
                if ($request->filled('tracking_code')) {
                    $query->where('tracking_code', $request->tracking_code);
                }
                if ($request->filled('dni')) {
                    $query->orWhere('dni', $request->dni);
                }
            })
            ->first();

        if (! $reclamacion) {
            return response()->json([
                'error' => 'No se encontró ningún reclamo con los datos ingresados.',
            ], 404);
        }

        return response()->json($reclamacion);
    }

    /**
     * GET /api/reclamaciones (panel admin, proteger con middleware de auth)
     */
    public function index(): JsonResponse
    {
        $reclamaciones = Reclamacion::where('status', true)
            ->orderByDesc('createdAt')
            ->get();

        return response()->json($reclamaciones);
    }

    /**
     * PUT /api/reclamaciones/{id}/responder (panel admin)
     */
    public function respond(RespondReclamacionRequest $request, int $id): JsonResponse
    {
        $reclamacion = Reclamacion::find($id);

        if (! $reclamacion) {
            return response()->json(['error' => 'Reclamación no encontrada'], 404);
        }

        $reclamacion->update([
            'admin_response' => $request->admin_response,
            'processing_status' => $request->processing_status,
            'responded_at' => now(),
        ]);

        try {
            Mail::to(config('mail.receptor'))
                ->send(new RespuestaReclamoMail($reclamacion, isAdminCopy: true));

            Mail::to($reclamacion->email)
                ->send(new RespuestaReclamoMail($reclamacion, isAdminCopy: false));
        } catch (\Throwable $e) {
            Log::error('Error enviando correo de respuesta de reclamo: '.$e->getMessage());
        }

        return response()->json($reclamacion);
    }
}