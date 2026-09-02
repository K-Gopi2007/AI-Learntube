
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
