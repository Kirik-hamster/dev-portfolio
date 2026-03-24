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

    async updateSettings(data: any) {
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
    }
};