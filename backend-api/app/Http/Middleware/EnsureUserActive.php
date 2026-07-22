<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUserActive
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user->estado !== 'Activo') {

            $user->tokens()->delete();

            return response()->json([
                'message' => 'Usuario desactivado.'
            ], 403);
        }

        return $next($request);
    }
}
