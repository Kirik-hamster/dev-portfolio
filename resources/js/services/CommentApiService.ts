import { Comment } from '../types';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

// Тип для параметров фильтрации
export interface HistoryParams {
    search?: string;
    tag?: string;
    sort?: 'latest' | 'popular' | 'active';
    page?: number;
}

export const CommentApiService = {
    // Добавить комментарий
    async add(articleId: number, content: string, parentId: number | null = null): Promise<Response> {
        return fetch(`/api/articles/${articleId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ content, parent_id: parentId })
        });
    },

    async update(commentId: number, content: string): Promise<Response> {
        return fetch(`/api/comments/${commentId}`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ content })
        });
    },

    async delete(commentId: number): Promise<Response> {
        return fetch(`/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
    },

    // Лайкнуть/дизлайкнуть
    async toggleLike(commentId: number): Promise<{ likes_count: number }> {
        const response = await fetch(`/api/comments/${commentId}/toggle-like`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка лайка');
        return response.json(); // Возвращаем сразу объект с цифрой
    },

    async getHistory(params: HistoryParams) {
        // Формируем query string из объекта
        const query = new URLSearchParams(params as any).toString();
        const response = await fetch(`/api/user/comments?${query}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки истории');
        return response.json(); // Возвращает LengthAwarePaginator из Laravel
    }
};