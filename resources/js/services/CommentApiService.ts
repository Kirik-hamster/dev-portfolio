import { Comment, CommentWithArticle, PaginatedResponse } from "../types";
import { getHeaders } from "./apiUtils";


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
        const cleanParams: Record<string, string> = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) cleanParams[key] = String(value);
        });
        const query = new URLSearchParams(cleanParams).toString();
        const response = await fetch(`/api/user/comments?${query}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки истории');
        return response.json(); // Возвращает LengthAwarePaginator из Laravel
    },

    async fetchComments(articleId: number, sort = 'new', page = 1) {
        const response = await fetch(`/api/articles/${articleId}/comments?sort=${sort}&page=${page}`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    async fetchReplies(commentId: number, page = 1, sort = 'new') {
        const response = await fetch(`/api/comments/${commentId}/replies?page=${page}&sort=${sort}`, {
            headers: getHeaders(),
        });
        return response.json();
    },

    async getAncestors(commentId: number): Promise<number[]> {
        const response = await fetch(`/api/comments/${commentId}/ancestors`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return response.json();
    }
};