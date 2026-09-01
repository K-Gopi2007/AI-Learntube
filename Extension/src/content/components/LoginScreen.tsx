import React, { useState } from 'react';
import { api, setToken } from '../../services/api';
import { Bot, Loader2, AlertCircle } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        await setToken(data.access_token);
      } else {
        const data = await api.register(name, email, password);
        await setToken(data.access_token);
      }
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Bot size={48} color="#6366f1" style={{ marginBottom: '12px' }} />
        <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '24px' }}>LearnTube AI</h2>
        <p style={{ color: '#94a3b8', marginTop: '8px', fontSize: '14px' }}>
          {isLogin ? 'Welcome back!' : 'Create your account'}
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isLogin && (
          <div>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', outline: 'none' }}
            />
          </div>
        )}
        
        <div>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', marginBottom: '6px' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#f8fafc', outline: 'none' }}
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Login' : 'Create Account')}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button 
          type="button"
          onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
          style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '14px' }}
        >
          {isLogin ? "Don't have an account? Create Account" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}
