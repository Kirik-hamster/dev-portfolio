import { getHeaders } from "./apiUtils";

export const StatsApiService = {
    async getSummary(type: string = 'all', from: string = '', to: string = '') {
        const response = await fetch(`/api/admin/stats/summary?type=${type}&from=${from}&to=${to}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    },

    async getUserStats(type = 'all', from = '', to = '') {
        const response = await fetch(`/api/admin/stats/users?type=${type}&from=${from}&to=${to}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    },

    async getPathDetails(userId: number | null, ip: string, date: string) {
        const userPart = userId ? `user_id=${userId}` : `ip_address=${ip}`;
        const response = await fetch(`/api/admin/stats/details?${userPart}&date=${date}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return response.json();
    }
};