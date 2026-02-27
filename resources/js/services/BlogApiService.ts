import { Blog, BlogInput, BlogPagination } from '../types';

const BLOG_URL = '/api/blogs';

// Вспомогательная функция для заголовков (можно вынести в общий utils)
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

export const BlogApiService = {
    async fetchAll(page: number = 1, tag: string | null = null): Promise<BlogPagination> {
        const tagParam = tag ? `&tag=${encodeURIComponent(tag)}` : '';
        const res = await fetch(`${BLOG_URL}?page=${page}${tagParam}`, {
            credentials: 'include'
        });
        return res.json();
    },

    async fetchOne(id: number): Promise<any> {
        const res = await fetch(`${BLOG_URL}/${id}`, { 
            headers: getHeaders(),
            credentials: 'include' 
        });
        if (!res.ok) throw new Error('Blog metadata not found');
        return res.json(); // Возвращает объект {id, title, description, user: {...}}
    },

    async fetchMyBlogs(page: number = 1): Promise<BlogPagination> {
        const res = await fetch(`${BLOG_URL}?my_only=1&page=${page}`, { credentials: 'include' });
        return res.json(); // Теперь возвращает объект с .data и .last_page
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