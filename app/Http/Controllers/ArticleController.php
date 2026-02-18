<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleService;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\StoreCommentRequest; // Импортируем новый класс
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Blog;

/**
 * Контроллер для обработки HTTP-запросов, связанных со статьями.
 * Отвечает за прием запросов и возврат ответов, делегируя бизнес-логику сервисам.
 */
class ArticleController extends Controller
{
    // Внедряем сервис через конструктор (Dependency Injection)
    public function __construct(
        protected ArticleService $service
    ) {}

    public function index(Request $request, Blog $blog)
    {
        $search = $request->query('search');

        // Берем статьи ТОЛЬКО этой конкретной папки ($blog)
        return $blog->articles()
            ->when($search, function($query) use ($search) {
                $query->where('title', 'like', "%{$search}%");
            })
            ->with(['blog', 'user'])
            ->latest()
            ->get();
    }

    public function portfolio()
    {
        // А здесь — ТОЛЬКО статьи из системного блога
        $portfolioBlog = Blog::where('is_portfolio', true)->first();
        
        if (!$portfolioBlog) return response()->json([], 200);

        return $portfolioBlog->articles()->latest()->get();
    }

    public function show(Article $article)
    {
        return $article->load('comments');
    }

    public function store(ArticleStoreRequest $request, $blogId)
    {
        // Если ID нет или он кривой — сервер должен выдать ошибку, а не молча слать в портфолио!
        $blog = Blog::findOrFail($blogId); 

        $data = $request->validated();
        $data['blog_id'] = $blog->id;
        $data['user_id'] = Auth::id();

        return $this->service->createArticle($data);
    }

    public function update(ArticleStoreRequest $request, Article $article)
    {
        return $this->service->updateArticle($article, $request->validated());
    }

    public function community()
    {
        // Берем статьи только из НЕ-системных блогов
        return Article::whereHas('blog', function($query) {
            $query->where('is_portfolio', false);
        })
        ->with(['blog', 'user']) // Загружаем автора и папку!
        ->latest()
        ->get();
    }

    // Используем наш новый Form Request для валидации
    public function storeComment(StoreCommentRequest $request, Article $article)
    {
        return $this->service->addComment($article, $request->validated());
    }

    // Делегируем удаление сервису
    public function destroy(Article $article)
    {
        $this->service->deleteArticle($article);
        return response()->json(['message' => 'Deleted']);
    }
}