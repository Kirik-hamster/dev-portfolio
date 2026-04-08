<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageView; // ПРОВЕРЬ ЭТОТ ИМПОРТ
use App\Models\User;     // И ЭТОТ
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // ОБЯЗАТЕЛЬНО ДЛЯ DB::raw

class StatsController extends Controller
{
    public function getSummary()
    {
        try {
            // Проверяем существование таблиц (на случай, если миграция не прошла)
            $totalUsers = User::count();
            $totalViews = PageView::sum('views_count') ?? 0;

            // Собираем статистику за 7 дней
            $dailyViews = PageView::select(
                    DB::raw('DATE(viewed_at) as viewed_at'), 
                    DB::raw('SUM(views_count) as count')
                )
                ->where('viewed_at', '>=', now()->subDays(6))
                ->groupBy('viewed_at')
                ->orderBy('viewed_at', 'asc')
                ->get();

            return response()->json([
                'total_users' => $totalUsers,
                'total_views' => (int)$totalViews,
                'daily_views' => $dailyViews
            ]);
        } catch (\Exception $e) {
            // Если что-то упало, вернем текст ошибки, чтобы увидеть её в Network
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getUserStats()
    {
        return response()->json([]);
    }
}