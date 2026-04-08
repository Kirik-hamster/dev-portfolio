<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\PageView;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogPageViews
{
    public function handle(Request $request, Closure $next)
    {
        // Выполняем запрос дальше, чтобы не тормозить пользователя
        $response = $next($request);

        // Логируем только GET-запросы (просмотры страниц), чтобы не считать отправку форм
        if ($request->isMethod('GET')) {
            PageView::updateOrCreate(
                [
                    'user_id'    => Auth::id(), // null если гость
                    'page_path'  => $request->getPathInfo(), // Например, /article/5
                    'viewed_at'  => now()->toDateString(),
                    'ip_address' => $request->ip(),
                ],
                [
                    'is_guest'    => !Auth::check(),
                    'views_count' => \DB::raw('views_count + 1'), // Инкрементируем
                ]
            );
        }

        return $response;
    }
}