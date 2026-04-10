<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\PageView;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogPageViews
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($request->isMethod('GET') && !$request->ajax() || $request->is('api/*')) {
            $path = $request->getPathInfo();

            // Исключаем системные пути и картинки, чтобы не мусорить
            if (str_contains($path, '/storage') || str_contains($path, '/admin/stats')) {
                return $response;
            }

            // УМНАЯ ЛОГИКА ПОРТФОЛИО:
            // Если путь /article/{id} или /api/articles/{id}, проверяем, не портфолио ли это
            if (preg_match('/articles?\/(\[0-9]+)/', $path, $matches)) {
                $articleId = $matches[1];
                $isPortfolio = \Cache::remember("art_{$articleId}_is_portfolio", 3600, function() use ($articleId) {
                    $art = Article::find($articleId);
                    return $art && $art->blog && $art->blog->is_portfolio;
                });

                if ($isPortfolio) {
                    $path = '/portfolio/article/' . $articleId; // Помечаем виртуально
                }
            }

            PageView::updateOrCreate(
                [
                    'user_id'    => Auth::id(),
                    'page_path'  => $path,
                    'viewed_at'  => now()->toDateString(),
                    'ip_address' => $request->ip(),
                ],
                [
                    'is_guest'    => !Auth::check(),
                    'views_count' => \DB::raw('views_count + 1'),
                    'user_agent'  => $request->userAgent(),
                ]
            );
        }

        return $response;
    }
}