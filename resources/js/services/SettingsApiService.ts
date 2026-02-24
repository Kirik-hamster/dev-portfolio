import { MailSettings } from "@/types";

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.split('XSRF-TOKEN=')[1]?.split(';')[0] || '')
});

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
    }
};