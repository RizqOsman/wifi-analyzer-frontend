import axios from './axios';

export const dashboardAPI = {
    getStats: async () => {
        console.log('[dashboardAPI] Route: GET /dashboard/stats');
        const response = await axios.get('/dashboard/stats');
        return response.data;
    },

    getHealth: async () => {
        console.log('[dashboardAPI] Route: GET /dashboard/health');
        const response = await axios.get('/dashboard/health');
        return response.data;
    },

    getActivity: async (limit = 10) => {
        console.log(`[dashboardAPI] Route: GET /dashboard/activity?limit=${limit}`);
        const response = await axios.get(`/dashboard/activity?limit=${limit}`);
        return response.data;
    }
};
