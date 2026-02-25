<?php
namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Article;
use App\Models\CommentLike;
use Illuminate\Http\Request;

class CommentController extends Controller {
    // 1. Получить список (с сортировкой по лайкам)
    public function index(Article $article) {
        return $article->comments()
            ->whereNull('parent_id')
            ->with([
                'user:id,name,role', 
                'replies.user:id,name,role',
                'replies.replies.user:id,name,role' 
            ])
            ->withCount('likes') // Laravel сам добавит поле likes_count
            ->orderBy('likes_count', 'desc') // Самые залайканные сверху
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // 2. Оставить комментарий
    public function store(Request $request, Article $article) {
        $data = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id'
        ]);
        
        return $article->comments()->create([
            'content' => $data['content'],
            'user_id' => auth()->id(),
            'parent_id' => $data['parent_id'] ?? null
        ])->load('user');
    }

    // Редактирование (только автор)
    public function update(Request $request, Comment $comment) {
        if ($comment->user_id !== auth()->id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $data = $request->validate(['content' => 'required|string|max:1000']);
        $comment->update([
            'content' => $data['content'],
            'is_edited' => true,
            'edited_at' => now()
        ]);
        return $comment->load('user');
    }

    // Удаление (автор ИЛИ админ)
    public function destroy(Comment $comment) {
        $user = auth()->user();
        if ($comment->user_id === $user->id || $user->role === 'admin') {
            $comment->delete();
            return response()->json(['message' => 'Deleted']);
        }
        return response()->json(['error' => 'Forbidden'], 403);
    }

    // Поставить/убрать лайк (Toggle)
    public function toggleLike(Comment $comment)
    {
        $userId = auth()->id();
        $like = $comment->likes()->where('user_id', $userId)->first();
        
        if ($like) {
            $like->delete();
        } else {
            $comment->likes()->create(['user_id' => $userId]);
        }

        // Возвращаем только количество лайков, чтобы фронт обновил цифру локально
        return response()->json([
            'likes_count' => $comment->likes()->count()
        ]);
    }

    public function userHistory(Request $request) 
    {
        // 1. Берем только комментарии авторизованного пользователя
        $query = $request->user()->comments()
            // 2. Жадная загрузка статьи и её тегов (чтобы не было 100500 запросов к БД)
            ->with(['article']) 
            // 3. Считаем лайки и ответы для каждого комментария
            ->withCount(['likes', 'replies']);

        // 4. Поиск по названию статьи (если пришел параметр search)
        if ($request->filled('search')) {
            $query->whereHas('article', function($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%");
            });
        }

        // 5. Фильтр по тегам статьи
        if ($request->filled('tag')) {
            $query->whereHas('article.tags', function($q) use ($request) {
                $q->where('slug', $request->tag);
            });
        }

        // 6. Сортировка: по популярности (лайки), активности (ответы) или новые
        if ($request->sort === 'popular') {
            $query->orderByDesc('likes_count');
        } elseif ($request->sort === 'active') {
            $query->orderByDesc('replies_count');
        } else {
            $query->latest();
        }

        // 7. Отдаем с пагинацией по 10 штук
        return $query->paginate(10);
    }
}