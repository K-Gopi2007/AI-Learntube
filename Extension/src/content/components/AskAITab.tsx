import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

interface AskAITabProps {
  videoId: string;
}

interface Message {
  id: number;
  role: string;
  content: string;
  timestamp_context?: number;
}

export const AskAITab: React.FC<AskAITabProps> = ({ videoId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, [videoId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const history = await api.getChatHistory(videoId);
      setMessages(history);
    } catch (err) {
      console.error(err);
    }
  };

  const getCurrentTimestamp = () => {
    const video = document.querySelector('video');
    return video ? video.currentTime : undefined;
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput('');
    const timestamp = getCurrentTimestamp();

    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: question, timestamp_context: timestamp }]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.askAI(videoId, question, timestamp);
      setMessages(prev => [...prev, { id: tempId + 1, role: 'assistant', content: res.response, timestamp_context: timestamp }]);
    } catch (err: any) {
      setError(err.message || 'Error asking AI');
      // Remove temp message on error to allow retry
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  const handleExplainMoment = async () => {
    if (loading) return;
    const timestamp = getCurrentTimestamp();
    if (timestamp === undefined) {
      setError('Could not detect video timestamp.');
      return;
    }

    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, role: 'user', content: `Explain what is happening at ${Math.floor(timestamp)}s`, timestamp_context: timestamp }]);
    setLoading(true);
    setError(null);

    try {
      const res = await api.explainMoment(videoId, timestamp);
      setMessages(prev => [...prev, { id: tempId + 1, role: 'assistant', content: res.explanation, timestamp_context: timestamp }]);
    } catch (err: any) {
      setError(err.message || 'Error explaining moment');
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>💬 Ask AI</h2>
        <button
          onClick={handleExplainMoment}
          disabled={loading}
          style={{
            padding: '6px 12px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem'
          }}
        >
          ✨ Explain This Moment
        </button>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        padding: '8px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        {messages.length === 0 && !loading && (
          <p style={{ textAlign: 'center', color: '#64748b', marginTop: 'auto', marginBottom: 'auto' }}>
            Ask a question or click "Explain This Moment" to start!
          </p>
        )}
        {messages.map(msg => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.role === 'user' ? '#3b82f6' : 'white',
              color: msg.role === 'user' ? 'white' : '#1e293b',
              padding: '8px 12px',
              borderRadius: '8px',
              maxWidth: '80%',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
            }}
          >
            <p style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '8px 12px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>AI is thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

      <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};
