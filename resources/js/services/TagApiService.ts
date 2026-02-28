const BASE_URL = '/api/top-tags';

const getXsrfToken = () => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return '';
};

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': getXsrfToken()
});

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