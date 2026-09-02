const BASE_URL = import.meta.env.VITE_API_URL || 'https://learntube-api.production.com/api';

export interface VideoAnalysis {
  id: string;
  youtube_video_id: string;
  title: string;
}

const getToken = async (): Promise<string | null> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['access_token'], (result) => {
        resolve(result.access_token || null);
      });
    });
  }
  return null;
};

export const setToken = async (token: string | null) => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise<void>((resolve) => {
      if (token) {
        chrome.storage.local.set({ access_token: token }, () => resolve());
      } else {
        chrome.storage.local.remove(['access_token'], () => resolve());
      }
    });
  }
};

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...((options.headers as any) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    await setToken(null);
    throw new Error('UNAUTHORIZED');
  }
  return res;
};

export const api = {
  // Auth
  register: async (name: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed');
    return data;
  },
  
  login: async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed');
    return data;
  },

  getMe: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  // Video
  getVideo: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}`);
    if (!res.ok) throw new Error('Video not found');
    return res.json();
  },

  getTranscript: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/transcript`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Transcript unavailable for this video.');
    return res.json();
  },

  analyzeVideo: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/analyze`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('AI analysis is temporarily unavailable.');
    return res.json();
  },
  
  getNotes: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/notes`);
    return res.json();
  },

  generateNotes: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/notes/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('AI analysis is temporarily unavailable.');
    return res.json();
  },

  getFlashcards: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/flashcards`);
    return res.json();
  },
  
  generateFlashcards: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/flashcards/generate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const detail = errData?.detail || '';
      if (typeof detail === 'string' && detail.includes('No transcript')) {
        throw new Error('No transcript');
      }
      throw new Error('Flashcard generation is temporarily unavailable.');
    }
    return res.json();
  },

  getQuiz: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/quiz`);
    return res.json();
  },

  generateQuiz: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${videoId}/quiz/generate`, {
      method: 'POST',
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const detail = errData?.detail || '';
      if (typeof detail === 'string' && detail.includes('No transcript')) {
        throw new Error('No transcript');
      }
      throw new Error('Quiz generation is temporarily unavailable.');
    }
    return res.json();
  },

  submitQuiz: async (quizId: number, answers: { question_id: number, selected_answer: string }[]) => {
    const res = await authenticatedFetch(`${BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Unable to submit assessment. Please try again.');
    return res.json();
  },

  getLearningPath: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/learning-paths/`);
    if (!res.ok) throw new Error('Unable to fetch learning path.');
    return res.json();
  },

  getKnowledgeMap: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/knowledge-map/`);
    if (!res.ok) throw new Error('Unable to fetch knowledge map.');
    return res.json();
  },

  evaluateTeachBack: async (topic: string, explanation: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/teach/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, explanation }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.detail || 'AI evaluation is temporarily unavailable.');
    }
    return res.json();
  },

  askAI: async (videoId: string, question: string, timestamp?: number) => {
    const res = await authenticatedFetch(`${BASE_URL}/chat/${videoId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, timestamp }),
    });
    if (!res.ok) throw new Error('Failed to send question to AI.');
    return res.json();
  },

  explainMoment: async (videoId: string, timestamp: number) => {
    const res = await authenticatedFetch(`${BASE_URL}/chat/${videoId}/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timestamp }),
    });
    if (!res.ok) throw new Error('Failed to get explanation.');
    return res.json();
  },

  getChatHistory: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/chat/${videoId}/history`);
    if (!res.ok) throw new Error('Failed to fetch chat history.');
    return res.json();
  },

  getExamKit: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/exam-kit/${videoId}`);
    if (!res.ok) {
      if (res.status === 404) return null; // No kit yet
      throw new Error('Failed to fetch Exam Kit.');
    }
    return res.json();
  },

  generateExamKit: async (videoId: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/exam-kit/${videoId}/generate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate Exam Kit. Please try again.');
    return res.json();
  },

  getAnalyticsDashboard: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/analytics/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch analytics dashboard.');
    return res.json();
  },

  getLearningHistory: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/history`);
    if (!res.ok) throw new Error('Failed to fetch learning history.');
    return res.json();
  },

  getResumeHistory: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/history/resume`);
    if (!res.ok) throw new Error('Failed to fetch resume history.');
    return res.json();
  },

  updateHistory: async (data: { video_id: string; last_timestamp: number; duration: number }) => {
    const res = await authenticatedFetch(`${BASE_URL}/history/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update history.');
    return res.json();
  }
};
