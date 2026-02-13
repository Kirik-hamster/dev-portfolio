<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Services\ArticleService;
use App\Http\Requests\ArticleStoreRequest;
use Illuminate\Http\Request;

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

    public function storeComment(Request $request, Article $article)
    {
        $data = $request->validate([
            'author_name' => 'required|string|max:255',
            'content'     => 'required|string',
        ]);
        return $this->service->addComment($article, $data);
    }

    public function destroy(Article $article)
    {
        $article->delete();
        return response()->json(['message' => 'Deleted']);
    }
}