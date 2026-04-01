<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Если юзер не залогинен — выкидываем
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        // 2. Проверяем, есть ли его роль в списке разрешенных (которые мы передали в роуте)
        if (!in_array($request->user()->role, $roles)) {
            return response()->json(['message' => 'Forbidden: You do not have the required role'], 403);
        }

        return $next($request);
    }
}