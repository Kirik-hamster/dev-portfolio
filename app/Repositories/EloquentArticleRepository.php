<?php

namespace App\Repositories;

use App\Interfaces\ArticleRepositoryInterface;
use App\Models\Article;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

/**
 * Eloquent-реализация репозитория статей.
 * Содержит всю логику для работы с базой данных через Eloquent ORM.
 */
class EloquentArticleRepository implements ArticleRepositoryInterface
{
    public function getFiltered(?string $search): Collection
    {
        return Article::withCount('comments')
            ->when($search, fn($q) => 
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
            )
            ->latest()
            ->get();
    }

    public function create(array $data): Article
    {
        // Генерация слага остается частью логики создания, близкой к данным
        $data['slug'] = $data['slug'] ?? Str::slug($data['title']);
        return Article::create($data);
    }

    public function update(Article $article, array $data): bool
    {
        return $article->update($data);
    }

    public function delete(Article $article): ?bool
    {
        return $article->delete();
    }

    public function addComment(Article $article, array $data)
    {
        return $article->comments()->create($data);
    }
}
