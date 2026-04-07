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

    async banUser(userId: number, hours: number, reason: string) {
        return fetch(`/api/admin/users/${userId}/ban`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ hours, reason }),
            credentials: 'include'
        });
    },

    async getUserReports(userId: number, resolved: boolean = false) {
        const response = await fetch(`/api/admin/users/${userId}/reports?resolved=${resolved ? 1 : 0}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    },

    async resolveReport(reportId: number) {
        return fetch(`/api/admin/reports/${reportId}/resolve`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include'
        });
    }
};