<?php

namespace App\Services;

use App\Models\Article;
use Illuminate\Support\Str;

class ArticleService
{
    public function getFilteredArticles(?string $search = null)
    {
        return Article::withCount('comments')
            ->when($search, fn($q) => 
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
            )
            ->latest()
            ->get();
    }

    public function createArticle(array $data): Article
    {
        // Автоматическая генерация слага, если его нет (OOP подход)
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        return Article::create($data);
    }

    public function updateArticle(Article $article, array $data): Article
    {
        $article->update($data);
        return $article;
    }

    public function addComment(Article $article, array $data)
    {
        return $article->comments()->create($data);
    }
}