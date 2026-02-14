<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleService;
use App\Http\Requests\ArticleStoreRequest;
use App\Http\Requests\StoreCommentRequest; // Импортируем новый класс
use Illuminate\Http\Request;

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

    public function index(Request $request)
    {
        return $this->service->getFilteredArticles($request->search);
    }

    public function show(Article $article)
    {
        return $article->load('comments');
    }

    public function store(ArticleStoreRequest $request)
    {
        return $this->service->createArticle($request->validated());
    }

    public function update(ArticleStoreRequest $request, Article $article)
    {
        return $this->service->updateArticle($article, $request->validated());
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