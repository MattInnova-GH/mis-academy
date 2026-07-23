<?php

namespace App\Services;

use Illuminate\Support\Str;

class ChatbotService
{
    public function __construct(
        private CursoService $cursoService,
        private LineaAcademicaService $lineaAcademicaService,
        private RutaAcademicaService $rutaAcademicaService,
    ) {}

    public function normalize(string $text): string
    {
        $text = Str::ascii($text);
        $text = mb_strtolower($text, 'UTF-8');
        $text = preg_replace('/[^a-z0-9 ]/', ' ', $text);
        $text = preg_replace('/\s+/', ' ', $text);

        return trim($text);
    }

    private function extraerTermino(string $normalized, array $stopWords): string
    {
        $palabras = array_filter(
            explode(' ', $normalized),
            fn($p) => $p !== '' && !in_array($p, $stopWords, true)
        );

        return trim(implode(' ', $palabras));
    }

    public function getResponse(string $userInput): array
    {
        $normalized = $this->normalize($userInput);
        $rules = config('chatbot.rules', []);

        $bestRule = null;
        $bestScore = 0;

        foreach ($rules as $rule) {
            $score = 0;
            foreach ($rule['patterns'] as $pattern) {
                if (str_contains($normalized, $pattern)) {
                    $score += count(explode(' ', $pattern));
                }
            }
            if ($score > $bestScore) {
                $bestScore = $score;
                $bestRule = $rule;
            }
        }

        if (!$bestRule || $bestScore === 0) {
            $fallback = config('chatbot.fallback');
            return [
                'text' => $fallback['text'],
                'links' => [],
                'quickReplies' => $fallback['quickReplies'],
            ];
        }

        if (!empty($bestRule['handler']) && method_exists($this, $bestRule['handler'])) {
            return $this->{$bestRule['handler']}($normalized, $bestRule);
        }

        return [
            'text' => $bestRule['response'],
            'links' => $bestRule['links'] ?? [],
            'quickReplies' => [...($bestRule['quickReplies'] ?? []), '🔍 Otras consultas'],
        ];
    }

    private function listarCursosDestacados(string $normalized, array $rule): array
    {
        $cursos = $this->cursoService->cursoDestacadosPublicos(5);

        if ($cursos->isEmpty()) {
            return [
                'text' => 'Por ahora no tenemos cursos destacados publicados, pero puedes revisar el catálogo completo.',
                'links' => [['label' => 'Ver catálogo', 'path' => '/cursos']],
                'quickReplies' => $rule['quickReplies'] ?? [],
            ];
        }

        $lista = $cursos->map(fn($c) => $this->lineaCurso($c))->implode("\n");

        return [
            'text' => "📚 Estos son algunos de nuestros cursos destacados:\n\n{$lista}",
            'links' => [['label' => 'Ver todos los cursos', 'path' => '/cursos']],
            'quickReplies' => [...($rule['quickReplies'] ?? []), '🔍 Otras consultas'],
        ];
    }

    private function buscarCursoPorNombre(string $normalized, array $rule): array
    {
        $stopWords = ['cuanto', 'cuesta', 'precio', 'de', 'del', 'curso', 'costo', 'el', 'la', 'vale', 'es'];
        $termino = $this->extraerTermino($normalized, $stopWords);

        if ($termino === '') {
            return [
                'text' => '¿De qué curso te gustaría saber el precio? Escribe el nombre del curso.',
                'links' => [],
                'quickReplies' => ['Ver catálogo de cursos'],
            ];
        }

        $resultado = $this->cursoService->buscarCursosPublicos($termino, 3);

        if ($resultado->isEmpty()) {
            return [
                'text' => "No encontré un curso relacionado a \"{$termino}\". Puedes revisar el catálogo completo.",
                'links' => [['label' => 'Ver catálogo', 'path' => '/cursos']],
                'quickReplies' => $rule['quickReplies'] ?? [],
            ];
        }

        $lista = $resultado->map(fn($c) => $this->lineaCurso($c))->implode("\n");
        $primero = $resultado->first();

        return [
            'text' => "Encontré esto:\n\n{$lista}",
            'links' => [['label' => 'Ver detalle', 'path' => "/cursos/{$primero->slug}"]],
            'quickReplies' => $rule['quickReplies'] ?? [],
        ];
    }

    private function listarLineasAcademicas(string $normalized, array $rule): array
    {
        $lineas = $this->lineaAcademicaService->lineasActivas(20);
        $lista = $lineas->map(fn($l) => "• {$l->nombre}")->implode("\n");

        return [
            'text' => $lista !== ''
                ? "Estas son nuestras líneas académicas:\n\n{$lista}"
                : 'Por ahora no tenemos líneas académicas activas publicadas.',
            'links' => [['label' => 'Ver líneas académicas', 'path' => '/lineas-academicas']],
            'quickReplies' => $rule['quickReplies'] ?? [],
        ];
    }

    private function listarRutasAcademicas(string $normalized, array $rule): array
    {
        $rutas = $this->rutaAcademicaService->rutasDestacadasPublicas(5);

        if ($rutas->isEmpty()) {
            $rutas = $this->rutaAcademicaService->rutasActivasPublicas(5);
        }

        if ($rutas->isEmpty()) {
            return [
                'text' => 'Por ahora no tenemos rutas académicas publicadas.',
                'links' => [['label' => 'Ver rutas académicas', 'path' => '/rutas-academicas']],
                'quickReplies' => $rule['quickReplies'] ?? [],
            ];
        }

        $lista = $rutas->map(function ($r) {
            $precio = $r->precio ? "S/ {$r->precio}" : 'Consultar precio';
            $horas = $r->horas_totales ? "{$r->horas_totales}h · " : '';
            return "• **{$r->nombre}** — {$horas}{$precio}";
        })->implode("\n");

        return [
            'text' => "Estas son algunas de nuestras rutas académicas:\n\n{$lista}",
            'links' => [['label' => 'Ver rutas académicas', 'path' => '/rutas-academicas']],
            'quickReplies' => [...($rule['quickReplies'] ?? []), '🔍 Otras consultas'],
        ];
    }

    private function lineaCurso(mixed $curso): string
    {
        $precio = !empty($curso->precio_descuento)
            ? "S/ {$curso->precio_descuento} (antes S/ {$curso->precio})"
            : "S/ {$curso->precio}";

        $nivel = $curso->nivel ? " · Nivel {$curso->nivel}" : '';

        return "• **{$curso->nombre}** — {$precio}{$nivel}";
    }

    private function listarCursosPorLinea(string $normalized, array $rule): array
    {
        $lineas = $this->lineaAcademicaService->lineasActivas(20);
        $aliases = config('chatbot.lineas_alias', []);

        $lineaEncontrada = null;

        foreach ($lineas as $linea) {
            $nombreNormalizado = $this->normalize($linea->nombre);
            $slugNormalizado = str_replace('-', ' ', $linea->slug ?? '');

            if ($slugNormalizado !== '' && str_contains($normalized, $slugNormalizado)) {
                $lineaEncontrada = $linea;
                break;
            }

            if (str_contains($normalized, $nombreNormalizado)) {
                $lineaEncontrada = $linea;
                break;
            }

            foreach ($aliases[$linea->slug] ?? [] as $keyword) {
                if (str_contains($normalized, $this->normalize($keyword))) {
                    $lineaEncontrada = $linea;
                    break 2;
                }
            }
        }

        if (!$lineaEncontrada) {
            $listado = $lineas->map(fn($l) => "• {$l->nombre}")->implode("\n");

            return [
                'text' => "¿De qué línea académica te gustaría ver cursos? Estas son nuestras líneas:\n\n{$listado}",
                'links' => [['label' => 'Ver líneas académicas', 'path' => '/lineas-academicas']],
                'quickReplies' => $lineas->pluck('nombre')->take(4)->toArray(),
            ];
        }

        $cursos = $this->cursoService->cursosPorLineaPublica($lineaEncontrada->id_linea_academica, 10);

        if ($cursos->isEmpty()) {
            return [
                'text' => "Por ahora no tenemos cursos publicados en {$lineaEncontrada->nombre}.",
                'links' => [['label' => 'Ver catálogo completo', 'path' => '/cursos']],
                'quickReplies' => $rule['quickReplies'] ?? [],
            ];
        }

        $lista = $cursos->map(fn($c) => $this->lineaCurso($c))->implode("\n");

        return [
            'text' => "Estos son los cursos de **{$lineaEncontrada->nombre}**:\n\n{$lista}",
            'links' => [['label' => "Ver {$lineaEncontrada->nombre}", 'path' => "/lineas-academicas/{$lineaEncontrada->slug}"]],
            'quickReplies' => [...($rule['quickReplies'] ?? []), '🔍 Otras consultas'],
        ];
    }
}
