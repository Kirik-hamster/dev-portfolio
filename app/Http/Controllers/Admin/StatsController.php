<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageView;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
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
                AND page_path != '/api/user' 
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
            $from = $request->query('from');
            $to = $request->query('to');
            // ⚡️ Добавляем получение количества строк из запроса (по дефолту 50)
            $perPage = $request->query('per_page', 50); 

            $query = PageView::select(
                array_merge(
                    ['user_id', 'ip_address', 'is_guest', DB::raw('SUM(views_count) as total'), DB::raw("MAX(viewed_at) as last_visit")],
                    $this->getCategorySql()
                )
            );

            if ($from) $query->where('viewed_at', '>=', $from);
            if ($to) $query->where('viewed_at', '<=', $to);
            if ($type === 'users') $query->where('is_guest', false);
            if ($type === 'guests') $query->where('is_guest', true);

            $results = $query->groupBy('user_id', 'ip_address', 'is_guest')
                ->with('user:id,name,email')
                ->orderBy('last_visit', 'desc')
                ->paginate((int)$perPage);

            // Так как paginate вернул объект LengthAwarePaginator, 
            // нам нужно пройтись по его коллекции элементов, чтобы добавить историю
            $results->getCollection()->transform(function($item) use ($from, $to) {
                $historyQuery = PageView::select(
                    array_merge(
                        ['viewed_at', DB::raw('SUM(views_count) as total')],
                        $this->getCategorySql()
                    )
                )
                ->where('ip_address', $item->ip_address)
                ->where('user_id', $item->user_id);

                if ($from) $historyQuery->where('viewed_at', '>=', $from);
                if ($to) $historyQuery->where('viewed_at', '<=', $to);

                $item->history = $historyQuery->groupBy('viewed_at')
                    ->orderBy('viewed_at', 'desc')
                    ->get();
                return $item;
            });

            // Возвращаем весь объект пагинации (там внутри будет ключ 'data' с твоими строками)
            return response()->json($results);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
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