import { Comment } from '../types';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

export const CommentApiService = {
    // Добавить комментарий
    async add(articleId: number, content: string): Promise<Response> {
        return fetch(`/api/articles/${articleId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ content })
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
    }
};