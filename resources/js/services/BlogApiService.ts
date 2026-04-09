import { Blog, BlogInput, BlogPagination } from '../types/types';
import { getHeaders } from './apiUtils';

const BLOG_URL = '/api/blogs';



export const BlogApiService = {
    async fetchAll(params: { 
        page?: number; 
        tag?: string | null; 
        search?: string; 
        search_type?: string; 
        sort?: string; 
        favorites_only?: boolean 
    }): Promise<BlogPagination> {
        const { page = 1, tag, search, search_type, sort, favorites_only } = params;
        // Динамически строим строку запроса
        const queryParams = new URLSearchParams({
            page: page.toString(),
            ...(tag && { tag }),
            ...(search && { search }),
            ...(search_type && { search_type }),
            ...(sort && { sort }),
            ...(favorites_only && { favorites_only: '1' }),
        });
        const res = await fetch(`${BLOG_URL}?${queryParams.toString()}`, {
            credentials: 'include'
        });
        return res.json();
    },

    async fetchOne(id: number): Promise<Blog> {
        const res = await fetch(`${BLOG_URL}/${id}`, { 
            headers: getHeaders(),
            credentials: 'include' 
        });
        if (!res.ok) throw new Error('Blog metadata not found');
        return res.json(); // Возвращает объект {id, title, description, user: {...}}
    },

    async fetchMyBlogs(page: number = 1): Promise<BlogPagination> {
        const res = await fetch(`${BLOG_URL}?my_only=1&page=${page}`, { 
            credentials: 'include' 
        });
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
    },

    async toggleLike(id: number) {
        return fetch(`${BLOG_URL}/${id}/toggle-like`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    },
    async toggleFavorite(id: number) {
        return fetch(`${BLOG_URL}/${id}/toggle-favorite`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    }
};