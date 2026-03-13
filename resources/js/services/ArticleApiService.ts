import { Article, ArticleInput } from '../types';

const getXsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return '';
};

const BASE_URL = '/api/articles';

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': getXsrfToken()
});

export const ArticleApiService = {
     // Получить статьи конкретного блога (папки)
    async fetchByBlog(blogId: number, params: any): Promise<any> {
        const queryParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            search: params.search || '',
            sort: params.sort || 'latest',
            tag: params.tag || '',
            favorites_only: params.favorites_only ? '1' : '0'
        });

        const response = await fetch(`/api/blogs/${blogId}/articles?${queryParams.toString()}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.ok ? response.json() : { data: [], last_page: 1 };
    },
    // Получить статьи системного портфолио
    async fetchPortfolio(params: any): Promise<any> {
        const queryParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            search: params.search || '',
            sort: params.sort || 'latest',
            search_type: params.search_type || 'title',
            favorites_only: params.favorites_only ? '1' : '0'
        });

        const response = await fetch(`/api/portfolio?${queryParams.toString()}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        return response.ok ? response.json() : { data: [], last_page: 1 };
    },

   

    async fetchOne(id: string | number): Promise<Article> {
        const response = await fetch(`/api/articles/${id}`);
        if (!response.ok) throw new Error('Article not found');
        return response.json();
    },

    /**
     * Получить статьи сообщества (лента всех блогов)
     */
    async fetchCommunity(params: any): Promise<any> {
        const queryParams = new URLSearchParams({
            page: (params.page || 1).toString(),
            tag: params.tag || '',
            search: params.search || '',
            search_type: params.search_type || 'title',
            sort: params.sort || 'latest',
            favorites_only: params.favorites_only ? '1' : '0'
        });

        const response = await fetch(`/api/community-articles?${queryParams.toString()}`, {
            headers: getHeaders(),
        });
        return response.ok ? response.json() : { data: [], last_page: 1 };
    },

    // Обновленный метод сохранения
    async save(data: ArticleInput, blogId?: number, id?: number) {
        if (!id && !blogId) {
            console.error("ОШИБКА: blogId потерялся перед отправкой!");
            alert("Ошибка: Не выбрана папка. Вернитесь в профиль и выберите папку снова.");
            return Promise.reject("Missing blogId");
        }

        const url = id 
            ? `${BASE_URL}/${id}` 
            : `/api/blogs/${blogId}/articles`;
        
        const method = id ? 'PUT' : 'POST';

        return fetch(url, {
            method,
            headers: getHeaders(),
            credentials: 'include',
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

    async addComment(articleId: number, content: string) {
        return fetch(`/api/articles/${articleId}/comments`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ content })
        });
    },

    async toggleLike(id: number) {
        return fetch(`${BASE_URL}/${id}/toggle-like`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    },
    async toggleFavorite(id: number) {
        return fetch(`${BASE_URL}/${id}/toggle-favorite`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    }
};