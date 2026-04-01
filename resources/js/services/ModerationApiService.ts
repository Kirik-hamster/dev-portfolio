import { getHeaders } from "./apiUtils";

export const ModerationApiService = {
    async sendReport(data: {
        reported_id: number;
        reason: string;
        reportable_id: number;
        reportable_type: 'article' | 'comment' | 'blog';
    }): Promise<Response> {
        return fetch('/api/reports', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
            credentials: 'include'
        });
    },

    async banUser(userId: number, hours: number) {
        return fetch(`/api/admin/users/${userId}/ban`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ hours }),
            credentials: 'include'
        });
    }
};