<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    private const DANGER_PATHS = [
        '.env', '.git', '.aws', 'docker-compose', 'setup-config', 
        'install.php', 'phpinfo', 'shell', 'backup', 'sql', 
        'wp-admin', 'wp-content', '.secret', 'credentials', 'config'
    ];

    private const BOT_AGENTS = ['python', 'curl', 'go-http', 'java', 'guzzle', 
        'headless', 'postman'];

    // Общая функция для условий CASE WHEN (чтобы не дублировать код)
    private function getCategorySql()
    {
        return [
            DB::raw("SUM(CASE 
                WHEN page_path = '/' 
                OR page_path LIKE '/api/home%' 
                THEN views_count ELSE 0 END) as home"),
            DB::raw("SUM(CASE 
                WHEN page_path LIKE '/portfolio%' 
                OR page_path LIKE '/api/portfolio%' 
                OR page_path LIKE '/api/blogs/1/%' 
                THEN views_count ELSE 0 END) as portfolio"),
            DB::raw("SUM(CASE 
                WHEN (page_path LIKE '/blogs%' 
                OR page_path LIKE '/article%'
                OR page_path LIKE '/api/articles%'
                OR page_path LIKE '/api/blogs%') 
                AND page_path NOT LIKE '/api/blogs/1/%'
                THEN views_count ELSE 0 END) as blogs"),
            DB::raw("SUM(CASE 
                WHEN page_path LIKE '/api/admin%' 
                OR page_path LIKE '/profile/admin%' 
                THEN views_count ELSE 0 END) as admin"),
            DB::raw("SUM(CASE 
                WHEN page_path LIKE '%login%' 
                OR page_path LIKE '%register%' 
                OR page_path LIKE '%verify%' 
                OR page_path LIKE '%csrf%' 
                THEN views_count ELSE 0 END) as auth"),
            DB::raw("SUM(CASE 
                WHEN (page_path LIKE '/profile%' 
                AND page_path NOT LIKE '/profile/admin%') 
                OR page_path LIKE '/api/user' 
                THEN views_count ELSE 0 END) as profile")
        ];
    }

    public function getSummary(Request $request)
    {
        $type = $request->query('type', 'all');
        $from = $request->query('from');
        $to = $request->query('to');

        $query = PageView::query();
        
        if ($from) $query->where('viewed_at', '>=', $from);
        if ($to) $query->where('viewed_at', '<=', $to);
        if ($type === 'users') $query->where('is_guest', false);
        if ($type === 'guests') $query->where('is_guest', true);

        $totals = (clone $query)->select($this->getCategorySql())->first();

        $dailyStats = (clone $query)->select('viewed_at', DB::raw('SUM(views_count) as count'))
            ->groupBy('viewed_at')
            ->orderBy('viewed_at', 'asc')
            ->get();

        return response()->json([
            'total_users' => User::count(),
            'total_views' => (int)$query->sum('views_count'),
            'column_totals' => $totals,
            'daily_views' => $dailyStats
        ]);
    }

public function getUserStats(Request $request)
    {
        try {
            $type = $request->query('type', 'all');
            $perPage = $request->query('per_page', 50);

            $query = PageView::select(
                array_merge(
                    [
                        'user_id', 
                        'ip_address', 
                        'is_guest', 
                        DB::raw('MAX(user_agent) as user_agent'), // Собираем UA без дублирования строк
                        DB::raw('SUM(views_count) as total'), 
                        DB::raw("MAX(viewed_at) as last_visit")
                    ],
                    $this->getCategorySql()
                )
            );

            $query->when($request->from, fn($q) => $q->where('viewed_at', '>=', $request->from))
                  ->when($request->to, fn($q) => $q->where('viewed_at', '<=', $request->to));

            if ($type === 'users') $query->where('is_guest', false);
            if ($type === 'guests') $query->where('is_guest', true);
            if ($type === 'suspicious') {
                $query->where(function($q) {
                    foreach (self::DANGER_PATHS as $path) $q->orWhere('page_path', 'LIKE', "%{$path}%");
                    foreach (self::BOT_AGENTS as $bot) $q->orWhere('user_agent', 'LIKE', "%{$bot}%");
                });
            }

            // ВАЖНО: Убрали user_agent из groupBy, чтобы не было дублей
            $results = $query->groupBy('user_id', 'ip_address', 'is_guest') 
                ->with('user:id,name,email')
                ->orderBy('last_visit', 'desc')
                ->paginate((int)$perPage);

            $results->getCollection()->transform(function($item) {
                // Передаем ВЕСЬ объект для скоринга
                $item->suspicion_score = $this->calculateSuspicionScore($item);
                
                $item->history = PageView::select(array_merge(['viewed_at', 'user_agent', DB::raw('SUM(views_count) as total')], $this->getCategorySql()))
                    ->where('ip_address', $item->ip_address)
                    ->where('user_id', $item->user_id)
                    ->groupBy('viewed_at', 'user_agent')
                    ->orderBy('viewed_at', 'desc')
                    ->get();
                return $item;
            });

            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    private function calculateSuspicionScore($item): int
    {
        $score = 0;
        $ua = strtolower($item->user_agent ?? '');
        
        $badHitsCount = PageView::where('ip_address', $item->ip_address)
            ->where(function($q) {
                foreach (self::DANGER_PATHS as $path) $q->orWhere('page_path', 'LIKE', "%{$path}%");
            })->count();

        if ($badHitsCount > 0) {
            // Если это бот (мало просмотров и сразу в конфиги) - 100%
            if ($item->total < 10) return 100;

            // Если это активный юзер, считаем пропорцию "грязи"
            $dangerRatio = ($badHitsCount / $item->total) * 100;

            if ($item->total > 50 && $dangerRatio < 2) {
                $score = 20; // Почти чист
            } elseif ($dangerRatio < 10) {
                $score = 45; // Подозрительно, но не критично
            } else {
                $score = 90; // Явный сканер
            }
        }

        foreach (self::BOT_AGENTS as $bot) {
            if (str_contains($ua, $bot)) { $score = max($score, 95); break; }
        }

        return min($score, 100);
    }

    public function resetSuspicion(Request $request)
    {
        $query = PageView::query();
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        } else {
            $query->where('ip_address', $request->ip_address);
        }
        $query->delete();
        return response()->json(['message' => 'History cleared']);
    }
    public function getPathDetails(Request $request) {
        $query = PageView::query()->where('viewed_at', $request->date);
        if ($request->user_id) {
            $query->where('user_id', $request->user_id);
        } else {
            $query->where('ip_address', $request->ip_address)->whereNull('user_id');
        }
        return $query->orderBy('updated_at', 'desc')->get();
    }
}