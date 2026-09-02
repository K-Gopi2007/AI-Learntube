
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return fetch(url, { ...options, headers });
};

export const api = {
  getAnalyticsDashboard: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/analytics/dashboard`);
    if (!res.ok) return null;
    return res.json();
  },
  getLearningHistory: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/history`);
    if (!res.ok) return [];
    return res.json();
  },
  getResumeHistory: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/history/resume`);
    if (!res.ok) return null;
    return res.json();
  },
  getKnowledgeMap: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/knowledge-map/`);
    if (!res.ok) return null;
    return res.json();
  },
  getAdaptivePath: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/learning-paths/`);
    if (!res.ok) return null;
    return res.json();
  },
  
  getVideo: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  generateNotes: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}/notes/generate`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
  },
  generateQuiz: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}/quiz/generate`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
  },
  evaluateTeachBack: async (videoId: string, concept: string, explanation: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/teach-me-back/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId, concept, explanation })
    });
    if (!res.ok) return null;
    return res.json();
  },
  getProfile: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/auth/me`);
    if (!res.ok) return null;
    return res.json();
  }
};
