
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
                    Resume <span className="ml-1">&rarr;</span>
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
