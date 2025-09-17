const API_BASE = 'http://192.168.0.23:3000/api';

export const api = {
    getLeaderboard: async (companyId: string) => {
        const response = await fetch(`${API_BASE}/company/${companyId}/leaderboard`);
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        return response.json();
    },

    getNews: async (companyId: string) => {
        const response = await fetch(`${API_BASE}/company/${companyId}/news`);
        if (!response.ok) throw new Error('Failed to fetch news');
        return response.json();
    },

    getPDFs: async (companyId: string) => {
        const response = await fetch(`${API_BASE}/company/${companyId}/pdfs`);
        if (!response.ok) throw new Error('Failed to fetch PDFs');
        return response.json();
    }
};
