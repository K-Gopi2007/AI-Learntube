import React, { useEffect, useState } from 'react';
import { api, setToken } from '../../services/api';
import { User, LogOut, Loader2, AlertCircle } from 'lucide-react';

export default function ProfileScreen({ onLogout }: { onLogout: () => void }) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await api.getMe();
        if (isMounted) setProfile(data);
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg('Failed to load profile.');
          if (err.message === 'UNAUTHORIZED') {
            onLogout();
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, [onLogout]);

  const handleLogout = async () => {
    await setToken(null);
    onLogout();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <AlertCircle size={32} color="#ef4444" style={{ marginBottom: '12px' }} />
        <span style={{ color: '#f8fafc' }}>{errorMsg}</span>
        <button onClick={handleLogout} style={{ marginTop: '20px', padding: '8px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '4px' }}>Log Out</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#f8fafc' }}>{profile?.name}</h2>
          <span style={{ color: '#94a3b8', fontSize: '13px' }}>{profile?.email}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Overall Mastery</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4ade80' }}>{profile?.overall_mastery}%</span>
        </div>
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
          <span style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Weak Topics</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>{profile?.weak_topics}</span>
        </div>
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', textAlign: 'center', gridColumn: 'span 2' }}>
          <span style={{ display: 'block', color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}>Learning Streak</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fbbf24' }}>{profile?.learning_streak}</span>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        style={{ width: '100%', padding: '14px', background: 'transparent', color: '#f87171', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
      >
        <LogOut size={18} /> Log Out
      </button>
    </div>
  );
}
