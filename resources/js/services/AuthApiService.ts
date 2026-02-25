const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

export const AuthApiService = {
    // CSRF Cookie
    async getCsrf() {
        return fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    },

    async getUser() {
        return fetch('/api/user', { credentials: 'include' });
    },

    // Вход
    async login(data: any) {
        await this.getCsrf();
        return fetch('/api/login', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    },

    // Регистрация
    async register(data: any) {
        await this.getCsrf();
        return fetch('/api/register', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    },

    // Код для смены пароля
    async requestPasswordCode() {
        return fetch('/api/password/request-code', {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    },

    // Обновление пароля
    async updatePassword(data: any) {
        return fetch('/api/password/update', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    }
};