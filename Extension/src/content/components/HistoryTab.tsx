import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PlayCircle, Clock, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const HistoryTab: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [resumeItem, setResumeItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [histRes, resumeRes] = await Promise.all([
          api.getLearningHistory(),
          api.getResumeHistory()
        ]);
        setHistoryItems(histRes);
        setResumeItem(resumeRes.continue_learning);
      } catch (err) {
        console.error('Failed to load history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResume = (videoId: string, timestamp: number) => {
    window.location.href = `https://www.youtube.com/watch?v=${videoId}&t=${Math.floor(timestamp)}s`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Activity size={32} color="#8b5cf6" />
        </motion.div>
      </div>
    );
  }

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', padding: '16px', overflowY: 'auto', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      {resumeItem && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          style={{ ...cardStyle, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <PlayCircle size={16} /> Continue Learning
              </h3>
              <h2 style={{ margin: '8px 0 0 0', fontSize: '1.1rem', fontWeight: 600, lineHeight: 1.3 }}>
                {resumeItem.title.length > 50 ? resumeItem.title.substring(0, 50) + '...' : resumeItem.title}
              </h2>
            </div>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '3px', overflow: 'hidden', margin: '16px 0' }}>
            <div style={{ width: `${resumeItem.completion_percentage}%`, height: '100%', background: 'white', borderRadius: '3px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {Math.round(resumeItem.completion_percentage)}% Completed
            </span>
            <button 
              onClick={() => handleResume(resumeItem.video_id, resumeItem.last_timestamp)}
              style={{
                background: 'white', color: '#8b5cf6', border: 'none', padding: '6px 16px', borderRadius: '20px',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Resume <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <h3 style={{ fontSize: '1rem', color: '#1e293b', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={18} color="#64748b" /> Recently Watched
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {historyItems.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px', fontSize: '0.9rem' }}>
              No history found yet. Start watching a video!
            </div>
          ) : (
            historyItems.map((item, idx) => (
              <div key={idx} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', fontWeight: 600, flex: 1, paddingRight: '12px' }}>
                    {item.video_title.length > 60 ? item.video_title.substring(0, 60) + '...' : item.video_title}
                  </h4>
                  {item.completion_percentage >= 95 && <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, item.completion_percentage)}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500, width: '36px', textAlign: 'right' }}>
                    {Math.round(item.completion_percentage)}%
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(item.last_opened).toLocaleDateString()}
                  </span>
                  <button 
                    onClick={() => handleResume(item.video_id, item.last_timestamp)}
                    style={{
                      background: 'transparent', color: '#8b5cf6', border: '1px solid #8b5cf6', padding: '4px 12px', borderRadius: '16px',
                      fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Watch
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>

    </div>
  );
};
