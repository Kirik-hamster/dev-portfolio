<?php

namespace App\Services;

use App\Interfaces\ArticleRepositoryInterface;
use App\Models\Article;

/**
 * Сервис для управления бизнес-логикой, связанной со статьями.
 * Делегирует операции с данными репозиторию, оставляя за собой
 * только оркестрацию и специфическую бизнес-логику (если она есть).
 */
class ArticleService
{
    // Внедряем зависимость от интерфейса, а не от конкретной реализации
    public function __construct(
        protected ArticleRepositoryInterface $repository
    ) {}

    public function getFilteredArticles(?string $search = null)
    {
        return $this->repository->getFiltered($search);
    }

    public function createArticle(array $data): Article
    {
        // Здесь могла бы быть сложная бизнес-логика:
        // - Отправка уведомлений
        // - Проверка прав
        // - Начисление бонусов и т.д.
        return $this->repository->create($data);
    }

    public function updateArticle(Article $article, array $data): Article
    {
        $this->repository->update($article, $data);
        // Возвращаем обновленную модель
        return $article->fresh();
    }

    public function addComment(Article $article, array $data)
    {
        return $this->repository->addComment($article, $data);
    }

    public function deleteArticle(Article $article): ?bool
    {
        return $this->repository->delete($article);
    }
}