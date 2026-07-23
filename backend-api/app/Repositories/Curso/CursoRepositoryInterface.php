<?php

namespace App\Repositories\Curso;

interface CursoRepositoryInterface
{
    public function all($filters = [], $perPage = 15);
    public function find($id);
    public function destacados($limit = 5);
    public function buscar($query, $perPage = 15);
    // Métodos para compra, etc. pueden agregarse después
    public function destacadosPublicos($limit = 5);
    public function buscarPublicos($query, $limit = 5);
    public function detallePublico($id);

    public function porLineaPublicos($idLineaAcademica, $limit = 10);
}
