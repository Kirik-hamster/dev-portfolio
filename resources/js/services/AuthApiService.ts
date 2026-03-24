import { getHeaders } from "./apiUtils";

export interface LoginData {
    email: string;
    password?: string; // Опционально, если используем для разных нужд
}

export interface RegisterData extends LoginData {
    name: string;
    password_confirmation: string;
}

export const AuthApiService = {
    // CSRF Cookie
    async getCsrf() {
        return fetch('/sanctum/csrf-cookie', { credentials: 'include' });
    },

    async getUser() {
        return fetch('/api/user', { credentials: 'include' });
    },

    // Вход
    async login(data: LoginData) {
        await this.getCsrf();
        return fetch('/api/login', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    },

    // Регистрация
    async register(data: RegisterData) {
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
    async updatePassword(data: { password: string; code: string }) {
        return fetch('/api/password/update', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    },
    async verifyCode(code: string): Promise<Response> {
        return fetch('/api/verify-code', {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ code })
        });
    },
    async resendVerifyCode(): Promise<Response> {
        return fetch('/api/verify-resend', {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    }
};