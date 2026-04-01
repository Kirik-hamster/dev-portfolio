import { getHeaders } from "./apiUtils";

export const UserApiService = {
    async getPublicProfile(userId: number) {
        const response = await fetch(`/api/users/${userId}/public-profile`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        if (!response.ok) throw new Error('User not found');
        return response.json();
    }
};
