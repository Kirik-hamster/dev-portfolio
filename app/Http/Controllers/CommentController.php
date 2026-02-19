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
            ->with('user:id,name,role') // Берем только нужное о юзере
            ->withCount('likes') // Laravel сам добавит поле likes_count
            ->orderBy('likes_count', 'desc') // Самые залайканные сверху
            ->orderBy('created_at', 'desc')
            ->get();
    }

    // 2. Оставить комментарий
    public function store(Request $request, Article $article) {
        $data = $request->validate(['content' => 'required|string|max:1000']);
        
        return $article->comments()->create([
            'content' => $data['content'],
            'user_id' => auth()->id() // Берем ID из сессии
        ])->load('user');
    }

    // 3. Поставить/убрать лайк (Toggle)
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
}