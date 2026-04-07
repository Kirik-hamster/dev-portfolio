import { MailSettings } from "@/types";

import { getHeaders } from "./apiUtils";

export const SettingsApiService = {
    // Получить текущие настройки
    async getMail(): Promise<MailSettings> {
        const response = await fetch('/api/admin/settings/mail', {
            headers: getHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки');
        return response.json();
    },
    // Сохранить настройки
    async updateMail(data: MailSettings): Promise<Response> {
        return fetch('/api/admin/settings/mail', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
    },

    // Отправить тестовое письмо
    async testMail(email: string): Promise<Response> {
        return fetch('/api/admin/settings/mail-test', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ email })
        });
    },

    async getUsers(query: string = '', page: number = 1, reported: boolean = false) {
        const response = await fetch(`/api/admin/users?search=${query}&page=${page}&reported=${reported ? 1 : 0}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    },

    async updateUserRole(userId: number, role: string) {
        return fetch(`/api/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ role })
        });
    },

    async uploadResume(file: File) {
        const formData = new FormData();
        formData.append('resume', file);

        const response = await fetch('/api/admin/settings/resume', {
            method: 'POST',
            headers: getHeaders(false),
            body: formData,
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ошибка сервера');
        }
        
        return response.json();
    },

    async deleteResume() {
        const response = await fetch('/api/admin/settings/resume', {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
            },
            credentials: 'include'
        });
        return response.json();
    }
};