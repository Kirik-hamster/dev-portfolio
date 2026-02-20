import { Blog, BlogInput } from '../types';

const BLOG_URL = '/api/blogs';

// Вспомогательная функция для заголовков (можно вынести в общий utils)
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

export const BlogApiService = {
    async fetchAll(): Promise<Blog[]> {
        const res = await fetch(`${BLOG_URL}?my_only=1`);
        return res.json();
    },

    async save(data: BlogInput, id?: number): Promise<Response> {
        const url = id ? `${BLOG_URL}/${id}` : BLOG_URL;
        const method = id ? 'PUT' : 'POST';

        return fetch(url, {
            method,
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data)
        });
    },

    async delete(id: number): Promise<Response> {
        return fetch(`${BLOG_URL}/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
    }
};