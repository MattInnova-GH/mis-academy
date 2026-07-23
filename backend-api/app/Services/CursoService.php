<?php

namespace App\Services;

use App\Repositories\Curso\CursoRepositoryInterface;

class CursoService
{
    protected $cursoRepository;

    public function __construct(CursoRepositoryInterface $cursoRepository)
    {
        $this->cursoRepository = $cursoRepository;
    }

    public function listarCursos($filters = [], $perPage = 15)
    {
        return $this->cursoRepository->all($filters, $perPage);
    }

    public function cursoDestacados($limit = 5)
    {
        return $this->cursoRepository->destacados($limit);
    }

    public function buscarCursos($query, $perPage = 15)
    {
        return $this->cursoRepository->buscar($query, $perPage);
    }

    public function detalleCurso($id)
    {
        return $this->cursoRepository->find($id);
    }

    public function cursoDestacadosPublicos($limit = 5)
    {
        return $this->cursoRepository->destacadosPublicos($limit);
    }

    public function buscarCursosPublicos($query, $limit = 5)
    {
        return $this->cursoRepository->buscarPublicos($query, $limit);
    }

    public function detalleCursoPublico($id)
    {
        return $this->cursoRepository->detallePublico($id);
    }

    public function cursosPorLineaPublica($idLinea, $limit = 10)
    {
        return $this->cursoRepository->porLineaPublicos($idLinea, $limit);
    }
}
