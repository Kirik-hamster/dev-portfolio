import { getHeaders, getXsrfToken } from "./apiUtils";

export const MediaApiService = {
    async uploadImage(file: File): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-XSRF-TOKEN': getXsrfToken()
            },
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    },
    async deleteImage(url: string) {
        return fetch('/api/upload/delete', {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ url })
        });
    }
};