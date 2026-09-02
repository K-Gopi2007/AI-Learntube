import os

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def write_file(path, content):
    ensure_dir(path)
    with open(path, 'w') as f:
        f.write(content)

# 1. API Service
write_file('Frontend/src/services/api.ts', """
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
  getProfile: async () => {
    const res = await authenticatedFetch(`${BASE_URL}/auth/me`);
    if (!res.ok) return null;
    return res.json();
  }
};
""")

# 2. Update Analytics Page
write_file('Frontend/src/app/(app)/analytics/page.tsx', """
"use client";
import React, { useEffect, useState } from 'react';
import MasteryScoreCard from '@/components/MasteryScoreCard';
import LearningProgressChart from '@/components/LearningProgressChart';
import TopicRadarChart from '@/components/TopicRadarChart';
import { api } from '@/services/api';
import { Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [dash, setDash] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [dashData, profileData] = await Promise.all([
        api.getAnalyticsDashboard(),
        api.getProfile()
      ]);
      setDash(dashData);
      setProfile(profileData);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Activity className="animate-spin" size={32}/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {profile?.username || 'Student'}!</h1>
          <p className="text-muted-foreground">Here is your learning overview for today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MasteryScoreCard score={dash?.mastery_score || 0} maxScore={100} />
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500">Study Time</h3>
            <p className="text-3xl font-bold text-slate-800">{Math.floor((dash?.study_time || 0) / 60)}m</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500">Videos Watched</h3>
            <p className="text-3xl font-bold text-slate-800">{dash?.videos_watched || 0}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 backdrop-blur border border-white/30 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-medium text-slate-500">Quiz Attempts</h3>
            <p className="text-3xl font-bold text-slate-800">{dash?.quiz_attempts || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgressChart />
        <TopicRadarChart />
      </div>
    </div>
  );
}
""")

# 3. Update History Page
write_file('Frontend/src/app/(app)/history/page.tsx', """
"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Activity, PlayCircle, Clock } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [histData, resumeData] = await Promise.all([
        api.getLearningHistory(),
        api.getResumeHistory()
      ]);
      setHistory(histData || []);
      setResume(resumeData?.continue_learning || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex h-[80vh] items-center justify-center"><Activity className="animate-spin" size={32}/></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Learning History</h1>
      
      {resume && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg mb-8">
            <h2 className="flex items-center gap-2 text-sm font-medium opacity-90"><PlayCircle size={18}/> Continue Learning</h2>
            <h3 className="text-2xl font-bold mt-2">{resume.title}</h3>
            <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full" style={{width: `${resume.completion_percentage}%`}}></div>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <span className="text-sm">{Math.round(resume.completion_percentage)}% Completed</span>
                <a href={`https://youtube.com/watch?v=${resume.video_id}&t=${Math.floor(resume.last_timestamp)}s`} target="_blank" className="bg-white text-indigo-600 px-4 py-2 rounded-full font-bold text-sm shadow-sm hover:bg-indigo-50 transition">
                    Resume <span className="ml-1">-></span>
                </a>
            </div>
        </div>
      )}

      <h2 className="text-xl font-bold flex items-center gap-2"><Clock size={20}/> Recently Watched</h2>
      <div className="grid grid-cols-1 gap-4">
        {history.map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-slate-800">{item.video_title}</h4>
                    <p className="text-sm text-slate-500 mt-1">Last opened: {new Date(item.last_opened).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{width: `${Math.min(100, item.completion_percentage)}%`}}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-700 w-12">{Math.round(item.completion_percentage)}%</span>
                </div>
            </div>
        ))}
        {history.length === 0 && <p className="text-slate-500 italic">No history available yet.</p>}
      </div>
    </div>
  );
}
""")

print("Successfully generated frontend pages.")
