import { getHeaders } from "./apiUtils";

const BASE_URL = '/api/top-tags';

export const TagApiService = {
    /**
     * Получить список популярных тегов для верхней капсулы.
     */
    async fetchTopTags(): Promise<string[]> {
        const response = await fetch(BASE_URL, {
            headers: getHeaders(),
            credentials: 'include'
        });
        
        if (!response.ok) return [];
        return response.json();
    }
};