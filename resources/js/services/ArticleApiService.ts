import { Article } from '../types';

// Функция для чтения куки (Sanctum кладет токен именно туда)
const getXsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return '';
};

const BASE_URL = '/api/articles';

// Базовые заголовки для всех POST/PUT/DELETE запросов
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': getXsrfToken() // ВАЖНО: именно X-XSRF-TOKEN
});

export const ArticleApiService = {
    async fetchAll(query = ''): Promise<Article[]> {
        const response = await fetch(`${BASE_URL}?search=${query}`, {
            headers: { 'Accept': 'application/json' }
        });
        return response.ok ? response.json() : [];
    },

    async fetchOne(id: number): Promise<Article> {
        const response = await fetch(`${BASE_URL}/${id}`);
        if (!response.ok) throw new Error('Статья не найдена');
        return response.json();
    },

    async save(data: any, id?: number) {
        const url = id ? `${BASE_URL}/${id}` : BASE_URL;
        const method = id ? 'PUT' : 'POST';

        return fetch(url, {
            method,
            headers: getHeaders(),
            credentials: 'include', // ОБЯЗАТЕЛЬНО для передачи сессии админа
            body: JSON.stringify(data)
        });
    },

    async delete(id: number) {
        return fetch(`${BASE_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
    },

    async addComment(articleId: number, commentData: any) {
        return fetch(`${BASE_URL}/${articleId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(commentData)
        });
    }
};