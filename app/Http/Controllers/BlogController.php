<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BlogController extends Controller
{
    public function index(Request $request) 
    {
        $query = Blog::query()
            ->with('user')
            ->withCount(['articles', 'likes', 'favorites']);

        // 1. ПОИСК
        if ($request->filled('search')) {
            $search = $request->search;
            $type = $request->get('search_type', 'title');
            $query->where(function($q) use ($search, $type) {
                if ($type === 'author') {
                    $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"));
                } else {
                    $q->where('title', 'like', "%{$search}%");
                }
            });
        }

        // 2. ТЕГИ
        if ($request->filled('tag')) {
            $tag = mb_strtolower($request->tag);
            $query->whereRaw('LOWER(top_tags) LIKE ?', ["%{$tag}%"]); 
        }

        // 3. ИЗБРАННОЕ
        if ($request->boolean('favorites_only')) {
            if (auth()->check()) {
                $query->whereHas('favorites', fn($q) => $q->where('user_id', auth()->id()));
            } else {
                return response()->json(['data' => [], 'last_page' => 1], 200);
            }
        }

        // 4. СОРТИРОВКА (ОДИН БЛОК!)
        $sort = $request->get('sort', 'latest');
        if ($sort === 'popular') {
            $query->orderByDesc('likes_count');
        } else {
            $query->latest();
        }

        // 5. ФИЛЬТРАЦИЯ ПО ТИПУ
        if ($request->has('my_only')) {
            return $query->where('user_id', Auth::id())->paginate(12);
        }

        return $query->where('is_portfolio', false)->paginate(9);
    }
    
    // Получить один блог с автором этого блога
    public function show(Blog $blog)
    {
        // Подгружаем автора и СЧЕТЧИКИ лайков, статей и избранного
        return $blog->load('user')->loadCount(['likes', 'articles', 'favorites']);
    }

    public function update(Request $request, Blog $blog)
    {
        // Проверка: может ли этот юзер менять этот блог?
        if ($blog->user_id !== Auth::id()) return response()->json(['message' => 'Forbidden'], 403);

        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $blog->update($data);
        return $blog;
    }

    public function destroy(Blog $blog)
    {
        if ($blog->user_id !== Auth::id()) return response()->json(['message' => 'Forbidden'], 403);
        
        // 1. Сначала удаляем все статьи, принадлежащие этому блогу
        $blog->articles()->delete(); 
        
        // 2. Теперь удаляем саму папку
        $blog->delete();
        
        return response()->json(['message' => 'Deleted']);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $data['user_id'] = Auth::id();
        $data['is_portfolio'] = false; // Обычные блоги пользователей

        return Blog::create($data);
    }

    public function toggleLike(Blog $blog) {
        $blog->likes()->toggle(auth()->id());
        return response()->json(['is_liked' => $blog->is_liked, 'likes_count' => $blog->likes()->count()]);
    }

    public function toggleFavorite(Blog $blog) {
        $blog->favorites()->toggle(auth()->id());
        return response()->json(['is_favorited' => $blog->is_favorited]);
    }
}