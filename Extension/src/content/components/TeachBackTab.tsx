import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle, Send, CheckCircle2, XCircle, Mic } from 'lucide-react';

export default function TeachBackTab() {
  const [topic, setTopic] = useState<string>('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [remediationMode, setRemediationMode] = useState(false);

  // Auto-detect topic based on learning path
  useEffect(() => {
    let isMounted = true;
    const fetchPath = async () => {
      try {
        const pathData = await api.getLearningPath();
        if (isMounted && pathData?.next_recommendation?.topic) {
          setTopic(pathData.next_recommendation.topic);
        }
      } catch (e) {
        if (isMounted) setTopic('Binary Search Tree'); // fallback
      }
    };
    fetchPath();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      setErrorMsg('No explanation provided.');
      return;
    }
    
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await api.evaluateTeachBack(topic, explanation);
      setResults(data);
      setRemediationMode(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI evaluation is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleLearnTopic = () => {
    setRemediationMode(true);
  };

  const handleTryAgain = () => {
    setResults(null);
    setExplanation('');
    setRemediationMode(false);
    setErrorMsg(null);
  };

  if (loading) {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
        <span>Evaluating your explanation...</span>
      </div>
    );
  }

  if (remediationMode) {
    return (
      <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        <h3 style={{ color: '#f8fafc', marginTop: 0, fontSize: '18px' }}>Learning: {results?.knowledge_gaps?.[0] || topic}</h3>
        
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
          <h4 style={{ color: '#818cf8', margin: '0 0 8px 0', fontSize: '14px' }}>Quick Review</h4>
          <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
            {results?.knowledge_gaps?.[0]} is a critical component of {topic}. 
            Focus on understanding how it impacts the overall structure and efficiency of the concept.
          </p>
        </div>
        
        <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: '#e2e8f0', margin: '0 0 12px 0', fontSize: '14px' }}>Key Points</h4>
          <ul style={{ color: '#94a3b8', fontSize: '13px', margin: 0, paddingLeft: '20px' }}>
            <li style={{ marginBottom: '8px' }}>Make sure to define the core constraints.</li>
            <li style={{ marginBottom: '8px' }}>Explain the best, average, and worst-case scenarios.</li>
            <li>Use a simple analogy to make it clear.</li>
          </ul>
        </div>
        
        <button 
          onClick={handleTryAgain}
          style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
        >
          Teach it again
        </button>
      </div>
    );
  }

  if (results) {
    return (
      <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '16px', color: '#94a3b8', margin: '0 0 4px 0', letterSpacing: '1px' }}>🧠 YOUR TEACH-BACK RESULT</h2>
        <h3 style={{ fontSize: '22px', color: '#f8fafc', margin: '0 0 20px 0' }}>{results.topic}</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Mastery</span>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: results.score >= 80 ? '#4ade80' : results.score >= 50 ? '#fbbf24' : '#ef4444' }}>
            {results.score}%
          </span>
        </div>
        
        <h4 style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 12px 0' }}>Concept understanding</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {results.concept_scores?.map((c: any, i: number) => {
            let color = '#ef4444';
            let icon = '🔴';
            if (c.score >= 80) { color = '#4ade80'; icon = '🟢'; }
            else if (c.score >= 50) { color = '#fbbf24'; icon = '🟡'; }
            
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '6px' }}>
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>{c.concept}</span>
                <span style={{ color, fontSize: '13px', fontWeight: 600 }}>{c.score}% {icon}</span>
              </div>
            );
          })}
        </div>

        {results.knowledge_gaps?.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ color: '#f87171', margin: '0 0 8px 0', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> KNOWLEDGE GAP
            </h4>
            <div style={{ color: '#fca5a5', fontSize: '14px', fontWeight: 500 }}>
              {results.knowledge_gaps[0]}
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
          <h4 style={{ color: '#818cf8', margin: '0 0 8px 0', fontSize: '13px' }}>💡 AI FEEDBACK</h4>
          <p style={{ color: '#e0e7ff', fontSize: '14px', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
            "{results.feedback}"
          </p>
        </div>

        {results.knowledge_gaps?.length > 0 ? (
          <div style={{ borderTop: '1px solid #334155', paddingTop: '20px', marginTop: '20px' }}>
            <h4 style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 8px 0', letterSpacing: '0.5px' }}>🎯 RECOMMENDED NEXT STEP</h4>
            <p style={{ color: '#e2e8f0', fontSize: '14px', margin: '0 0 16px 0' }}>Review: {results.knowledge_gaps[0]}</p>
            
            <button 
              onClick={handleLearnTopic}
              style={{ width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginBottom: '12px' }}
            >
              Learn This Topic
            </button>
            <button 
              onClick={handleTryAgain}
              style={{ width: '100%', padding: '12px', background: 'transparent', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '8px', fontWeight: 500, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <button 
            onClick={handleTryAgain}
            style={{ width: '100%', padding: '12px', background: '#4ade80', color: '#0f172a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '20px' }}
          >
            Teach Another Topic
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontSize: '18px', color: '#f8fafc', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🗣️ Teach This Topic
      </h2>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      <div style={{ background: '#1e293b', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Topic:</span>
        <input 
          type="text" 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid #475569', color: '#f8fafc', fontSize: '16px', padding: '4px 0', outline: 'none' }}
          placeholder="e.g. Binary Search Tree"
        />
      </div>

      <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
        <span style={{ fontSize: '12px', color: '#818cf8', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Prompt:</span>
        <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
          "Explain {topic || 'this concept'} in your own words. Imagine you are teaching this concept to another student."
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Type your explanation here..."
          style={{ 
            flex: 1, width: '100%', background: '#0f172a', border: '1px solid #334155', 
            borderRadius: '8px', padding: '16px', color: '#e2e8f0', fontSize: '14px', 
            resize: 'none', outline: 'none', lineHeight: 1.5
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button 
          onClick={handleSubmit}
          style={{ flex: 1, padding: '14px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
        >
          Evaluate My Explanation <Send size={18} />
        </button>
      </div>
    </div>
  );
}
