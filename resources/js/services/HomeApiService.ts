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
        const res = await fetch('/api/home-settings');
        return res.json();
    },
    async updateSettings(data: any) {
        const res = await fetch('/api/home-settings', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
        return res.ok;
    }
};