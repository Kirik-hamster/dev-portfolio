import { getHeaders } from "./apiUtils";

export const StatsApiService = {
    async getSummary() {
        const response = await fetch('/api/admin/stats/summary', {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    },

    async getUserStats() {
        const response = await fetch('/api/admin/stats/users', {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    }
};