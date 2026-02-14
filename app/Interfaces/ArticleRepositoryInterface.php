<?php

namespace App\Interfaces;

use App\Models\Article;
use Illuminate\Database\Eloquent\Collection;

/**
 * Интерфейс для репозитория статей.
 * Определяет контракт, по которому сервисный слой будет взаимодействовать
 * с данными, не зная о конкретной реализации (например, Eloquent).
 */
interface ArticleRepositoryInterface
{
    public function getFiltered(?string $search): Collection;
    public function create(array $data): Article;
    public function update(Article $article, array $data): bool;
    public function delete(Article $article): ?bool;
    public function addComment(Article $article, array $data);
}
