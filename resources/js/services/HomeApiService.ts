import { HomeSettings } from "../types";
import { getHeaders } from "./apiUtils";

export const HomeApiService = {
    async fetchSettings() {
        try {
            const res = await fetch('/api/home-settings', {
                credentials: 'include' // ⚡️ Добавили для стабильности сессии
            });
            if (!res.ok) throw new Error('Failed to fetch settings');
            return await res.json();
        } catch (error) {
            console.error("HomeApiService Error:", error);
            // Возвращаем пустой объект, чтобы .then() в HomePage не упал
            return {}; 
        }
    },

    async updateSettings(data: HomeSettings): Promise<boolean> {
        try {
            const res = await fetch('/api/home-settings', {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
                credentials: 'include'
            });
            return res.ok;
        } catch (error) {
            console.error("Update error:", error);
            return false;
        }
    },

    async uploadAvatar(blob: Blob) {
        const formData = new FormData();
        formData.append('image', blob, 'avatar.webp');

        // Для FormData шлем getHeaders(false), чтобы не ставить JSON content-type
        const response = await fetch('/api/admin/home/avatar', {
            method: 'POST',
            headers: getHeaders(false),
            body: formData,
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Ошибка при загрузке аватара');
        return response.json();
    }
};