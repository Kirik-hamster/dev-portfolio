<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection; // ЭТОГО НЕ ХВАТАЛО
use App\Interfaces\ArticleRepositoryInterface;
use App\Models\Article;
use App\Models\Comment;

class ArticleRepository implements ArticleRepositoryInterface // Проверь название!
{
    public function getFiltered(?string $search): Collection
    {
        return Article::when($search, function ($query, $search) {
            $query->where('title', 'like', "%{$search}%");
        })->latest()->get();
    }

    public function create(array $data): Article
    {
        // Обязательно добавляем текущего юзера, иначе будет 500 ошибка
        return Article::create(array_merge($data, ['user_id' => auth()->id()]));
    }
    
    public function update(Article $article, array $data): bool
    {
        return $article->update($data);
    }

    public function delete(Article $article): bool
    {
        return $article->delete();
    }

    public function addComment(Article $article, array $data)
    {
        // Создаем комментарий, привязанный к статье
        return $article->comments()->create($data);
    }
}