<?php

namespace App\Repositories\RutaAcademica;

use App\Models\RutaAcademica;
use Illuminate\Support\Facades\Cache;

class RutaAcademicaRepository
{
    public function all($filters = [], $perPage = 15)
    {
        $query = RutaAcademica::query();

        if (!empty($filters['categoria'])) {
            $query->whereHas('lineaAcademica', function ($q) use ($filters) {
                $q->where('nombre', $filters['categoria']);
            });
        }
        if (!empty($filters['nivel'])) {
            $query->where('nivel', $filters['nivel']);
        }
        return $query->paginate($perPage);
    }

    public function find($id)
    {
        return RutaAcademica::with(['lineaAcademica', 'cursos'])->findOrFail($id);
    }

    public function destacadas($limit = 5)
    {
        return Cache::remember('rutas_destacadas_' . $limit, 600, function () use ($limit) {
            return RutaAcademica::where('destacado', true)
                ->orderByDesc('fecha_actualizacion')
                ->limit($limit)
                ->get();
        });
    }

    public function buscar($query, $perPage = 15)
    {
        return RutaAcademica::where('nombre', 'like', "%$query%")
            ->paginate($perPage);
    }

    public function create(array $data)
    {
        return RutaAcademica::create($data);
    }

    public function update($id, array $data)
    {
        $ruta = RutaAcademica::findOrFail($id);
        $ruta->update($data);
        return $ruta;
    }

    public function delete($id)
    {
        $ruta = RutaAcademica::findOrFail($id);
        $ruta->delete();
    }
    
    public function destacadasPublicas($limit = 5)
    {
        return Cache::remember('rutas_destacadas_publicas_' . $limit, 600, function () use ($limit) {
            return RutaAcademica::where('destacado', true)
                ->where('estado', 'Publicado')
                ->select(['id_ruta', 'id_linea_academica', 'nombre', 'descripcion', 'horas_totales', 'nivel', 'precio'])
                ->orderByDesc('fecha_actualizacion')
                ->limit($limit)
                ->get();
        });
    }

    public function buscarPublicas($query, $limit = 5)
    {
        return RutaAcademica::where('nombre', 'like', "%$query%")
            ->where('estado', 'Publicado')
            ->select(['id_ruta', 'id_linea_academica', 'nombre', 'descripcion', 'horas_totales', 'nivel', 'precio'])
            ->limit($limit)
            ->get();
    }

    public function activasPublicas($limit = 5)
    {
        return RutaAcademica::where('estado', 'Publicado')
            ->select(['id_ruta', 'id_linea_academica', 'nombre', 'descripcion', 'horas_totales', 'nivel', 'precio'])
            ->orderByDesc('fecha_creacion')
            ->limit($limit)
            ->get();
    }
}
