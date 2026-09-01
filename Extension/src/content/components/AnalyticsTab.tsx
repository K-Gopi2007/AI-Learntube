import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PlayCircle, TrendingUp, BookOpen, Clock, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

export const AnalyticsTab: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, hist] = await Promise.all([
          api.getAnalyticsDashboard(),
          api.getLearningHistory()
        ]);
        setDashboardData(dash);
        setHistoryData(hist);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Activity size={32} color="#8b5cf6" />
        </motion.div>
      </div>
    );
  }

  const { study_time = 0, videos_watched = 0, quiz_attempts = 0, teach_back_attempts = 0, mastery_score = 0 } = dashboardData || {};

  // Mock chart data (since backend doesn't provide time-series arrays for these specific charts yet)
  const masteryGrowthData = [
    { name: 'W1', score: Math.max(0, mastery_score - 30) },
    { name: 'W2', score: Math.max(0, mastery_score - 20) },
    { name: 'W3', score: Math.max(0, mastery_score - 10) },
    { name: 'Now', score: mastery_score }
  ];

  const activityData = [
    { name: 'Mon', minutes: Math.max(10, study_time / 60 * 0.2) },
    { name: 'Tue', minutes: Math.max(25, study_time / 60 * 0.3) },
    { name: 'Wed', minutes: Math.max(15, study_time / 60 * 0.1) },
    { name: 'Thu', minutes: Math.max(40, study_time / 60 * 0.4) }
  ];

  const topicData = [
    { name: 'Basics', value: 400 },
    { name: 'Advanced', value: 300 },
    { name: 'Practice', value: 300 }
  ];
  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
  };

  const statBoxStyle = {
    ...cardStyle,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    gap: '8px'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '16px', overflowY: 'auto', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ ...cardStyle, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none' }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={24} /> Overall Mastery
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
          <span style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1 }}>{Math.round(mastery_score)}%</span>
          <span style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '6px' }}>proficiency</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
      >
        <div style={statBoxStyle}>
          <Clock size={24} color="#3b82f6" />
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
            {Math.floor(study_time / 60)}m {study_time % 60}s
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Study Time</div>
        </div>
        
        <div style={statBoxStyle}>
          <PlayCircle size={24} color="#10b981" />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{videos_watched}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Videos Watched</div>
        </div>

        <div style={statBoxStyle}>
          <BookOpen size={24} color="#f59e0b" />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{quiz_attempts}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Quiz Attempts</div>
        </div>

        <div style={statBoxStyle}>
          <Activity size={24} color="#ef4444" />
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>{teach_back_attempts}</div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Teach-Backs</div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={cardStyle}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#8b5cf6" /> Mastery Growth
        </h3>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={masteryGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={30} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={cardStyle}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b' }}>Learning Activity</h3>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} width={30} />
              <Tooltip cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        style={cardStyle}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b' }}>Topic Distribution</h3>
        <div style={{ height: '200px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={topicData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {topicData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

    </div>
  );
};
