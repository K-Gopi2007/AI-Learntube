import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle, Target, ArrowRight, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react';

export default function AdaptivePathTab() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pathData, setPathData] = useState<any>(null);
  const loadPath = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.getLearningPath();
      setPathData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load learning path.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPath();
  }, []);

  if (errorMsg) {
    return (
      <div className="error-state" style={{ color: '#ef4444', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={20} />
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (loading || !pathData) {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
        <span>Analyzing knowledge profile...</span>
      </div>
    );
  }

  const { next_recommendation, path } = pathData;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'REMEDIATION': return '#ef4444';
      case 'PRACTICE': return '#fbbf24';
      case 'LEARN': return '#6366f1';
      case 'ADVANCE': return '#4ade80';
      default: return '#94a3b8';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'REMEDIATION': return <AlertCircle size={16} />;
      case 'PRACTICE': return <PlayCircle size={16} />;
      case 'LEARN': return <BookOpen size={16} />;
      case 'ADVANCE': return <CheckCircle2 size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div style={{ padding: '16px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
        <Target size={24} color="#6366f1" />
        <h3 style={{ margin: 0, fontSize: '18px' }}>Your Learning Path</h3>
      </div>

      {next_recommendation && (
        <div style={{ 
          background: `linear-gradient(to right, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))`, 
          border: `1px solid ${getActionColor(next_recommendation.action)}`,
          borderRadius: '12px', padding: '20px',
          boxShadow: `0 4px 12px rgba(0, 0, 0, 0.2)`
        }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '1px', color: '#94a3b8', textTransform: 'uppercase' }}>
            Next Recommendation
          </span>
          <h4 style={{ fontSize: '20px', color: '#f8fafc', margin: '8px 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {getActionIcon(next_recommendation.action)} {next_recommendation.topic}
          </h4>
          
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Why?</span>
            <span style={{ fontSize: '14px', color: '#cbd5e1' }}>{next_recommendation.reason}</span>
          </div>

          <button style={{
            width: '100%', padding: '12px', borderRadius: '8px',
            background: getActionColor(next_recommendation.action),
            color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
          }}>
            Start Learning <ArrowRight size={18} />
          </button>
        </div>
      )}

      <div>
        <h4 style={{ margin: '0 0 16px 0', color: '#cbd5e1', fontSize: '14px', letterSpacing: '0.5px' }}>YOUR PATH</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {path.map((item: any, index: number) => (
            <div key={index} style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ 
                  width: '24px', height: '24px', borderRadius: '50%', 
                  background: index === 0 ? getActionColor(item.action) : '#334155',
                  color: index === 0 ? '#fff' : '#94a3b8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 'bold', zIndex: 2
                }}>
                  {index + 1}
                </div>
                {index < path.length - 1 && (
                  <div style={{ width: '2px', flex: 1, background: '#334155', margin: '4px 0' }} />
                )}
              </div>
              
              <div style={{ 
                flex: 1, padding: '12px', borderRadius: '8px', marginBottom: '16px',
                background: index === 0 ? 'rgba(30, 41, 59, 0.8)' : 'transparent',
                border: index === 0 ? `1px solid ${getActionColor(item.action)}20` : '1px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 style={{ margin: '0 0 4px 0', color: index === 0 ? '#f8fafc' : '#cbd5e1', fontSize: '15px' }}>
                    {item.topic}
                  </h5>
                  <span style={{ 
                    fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                    background: `${getActionColor(item.action)}20`,
                    color: getActionColor(item.action), fontWeight: 600
                  }}>
                    {item.action}
                  </span>
                </div>
                {index === 0 && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
