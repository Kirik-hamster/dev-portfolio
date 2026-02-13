import { Article } from '../types';

// Получаем CSRF-токен один раз для всех запросов
const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const BASE_URL = '/api/articles';

export const ArticleApiService = {
    // Получить список (индекс)
    async fetchAll(query = ''): Promise<Article[]> {
        const response = await fetch(`${BASE_URL}?search=${query}`);
        if (!response.ok) throw new Error('Ошибка при загрузке списка');
        return response.json();
    },

    // Получить одну статью (show)
    async fetchOne(id: number): Promise<Article> {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Статья не найдена');
        return response.json();
    },

    // Создать или обновить (store/update)
    async save(data: any, id?: number) {
        const url = id ? `${BASE_URL}/${id}` : BASE_URL;
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(data)
        });
        return response;
    },

    // Удалить (destroy)
    async delete(id: number) {
        return fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'X-CSRF-TOKEN': getCsrfToken() }
        });
    },

    // Добавить комментарий
    async addComment(articleId: number, commentData: { author_name: string, content: string }) {
        return fetch(`${BASE_URL}/${articleId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken()
            },
            body: JSON.stringify(commentData)
        });
    }
};