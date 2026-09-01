import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle, Clock, Check, XCircle } from 'lucide-react';

export default function MockTestTab({ videoId, videoTitle }: { videoId: string, videoTitle: string | null }) {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'generating' | 'submitting' | 'done' | 'results'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadQuiz = async () => {
      if (!videoId) return;
      
      try {
        setErrorMsg(null);
        setLoadingState('loading');
        
        let fetchedQuiz = await api.getQuiz(videoId);
        
        if (!fetchedQuiz) {
          setLoadingState('generating');
          fetchedQuiz = await api.generateQuiz(videoId);
        }
        
        if (isMounted) {
          if (fetchedQuiz && fetchedQuiz.questions && fetchedQuiz.questions.length > 0) {
            setQuiz(fetchedQuiz);
            setLoadingState('done');
          } else {
            setErrorMsg('Failed to load quiz questions.');
            setLoadingState('done');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.message.includes('No transcript')) {
             setErrorMsg('Transcript unavailable for this video.');
          } else {
             setErrorMsg(err.message || 'Quiz generation is temporarily unavailable.');
          }
          setLoadingState('done');
        }
      }
    };
    
    // Clear state on video change
    setQuiz(null);
    setCurrentIndex(0);
    setAnswers({});
    setResults(null);
    setErrorMsg(null);
    
    loadQuiz();
    
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleSeek = (e: React.MouseEvent, seconds: number) => {
    e.stopPropagation();
    if (isNaN(seconds)) return;
    
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = seconds;
      videoElement.play();
    }
  };

  const handleOptionSelect = (questionId: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    
    try {
      setLoadingState('submitting');
      
      const payload = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId, 10),
        selected_answer: ans
      }));
      
      const assessmentResult = await api.submitQuiz(quiz.id, payload);
      
      setResults(assessmentResult);
      setLoadingState('results');
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to submit assessment. Please try again.');
      setLoadingState('done');
    }
  };

  if (errorMsg) {
    return (
      <div className="error-state" style={{ color: '#ef4444', padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <AlertCircle size={20} />
        <span>{errorMsg}</span>
      </div>
    );
  }

  if (loadingState === 'loading' || loadingState === 'generating' || loadingState === 'submitting') {
    let loadingText = 'Loading mock test...';
    if (loadingState === 'generating') loadingText = 'Generating quiz from transcript...';
    if (loadingState === 'submitting') loadingText = 'Evaluating answers...';
    
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
        <span>{loadingText}</span>
      </div>
    );
  }

  if (loadingState === 'results' && results) {
    return (
      <div style={{ padding: '16px', overflowY: 'auto', height: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '20px' }}>Mock Test Complete 🎉</h3>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: results.percentage >= 80 ? '#4ade80' : results.percentage >= 50 ? '#fbbf24' : '#ef4444', marginTop: '8px' }}>
            {results.percentage.toFixed(0)}%
          </div>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>Score: {results.score} / {results.total}</p>
        </div>

        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#cbd5e1' }}>Topic Mastery</h4>
          {Object.entries(results.topic_scores).map(([topic, score]: [string, any]) => {
            let color = '#ef4444'; // weak
            let icon = '🔴';
            if (score >= 80) { color = '#4ade80'; icon = '🟢'; }
            else if (score >= 50) { color = '#fbbf24'; icon = '🟡'; }
            
            return (
              <div key={topic} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <span style={{ color: '#e2e8f0', fontSize: '14px' }}>{topic}</span>
                <span style={{ color, fontWeight: 600, fontSize: '14px' }}>{score.toFixed(0)}% {icon}</span>
              </div>
            );
          })}
        </div>
        
        {results.weak_topics && results.weak_topics.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> Knowledge Gaps Detected
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#fca5a5', fontSize: '14px' }}>
              {results.weak_topics.map((t: string) => (
                <li key={t} style={{ marginBottom: '4px' }}>{t}</li>
              ))}
            </ul>
            <div style={{ marginTop: '12px', fontSize: '13px', color: '#e2e8f0' }}>
              <strong>Recommended:</strong> Review fundamental concepts in the topics above before proceeding.
            </div>
          </div>
        )}
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
        No quiz available for this video.
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const isAnswered = !!answers[currentQuestion.id];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ marginTop: 0, color: '#e2e8f0', fontSize: '18px', marginBottom: '4px' }}>Mock Test</h3>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {videoTitle}
        </p>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <div style={{ flex: 1, margin: '0 12px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#6366f1', width: `${((currentIndex + 1) / totalQuestions) * 100}%`, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question Card */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>
            {currentQuestion.topic || 'General Topic'}
          </span>
          {currentQuestion.source_timestamp != null && (
            <button
              onClick={(e) => handleSeek(e, currentQuestion.source_timestamp)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)', padding: '4px 8px',
                borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                fontFamily: 'monospace'
              }}
              title="Review source in video"
            >
              <Clock size={12} /> Source: {new Date(currentQuestion.source_timestamp * 1000).toISOString().substr(14, 5)}
            </button>
          )}
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: 500, color: '#f8fafc', margin: '0 0 20px 0', lineHeight: 1.5 }}>
          {currentQuestion.question}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {currentQuestion.options.map((option: string, idx: number) => {
            const isSelected = answers[currentQuestion.id] === option;
            return (
              <button
                key={idx}
                onClick={() => handleOptionSelect(currentQuestion.id, option)}
                style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: '8px',
                  background: isSelected ? 'rgba(99, 102, 241, 0.2)' : '#1e293b',
                  border: isSelected ? '1px solid #818cf8' : '1px solid #334155',
                  color: isSelected ? '#e0e7ff' : '#cbd5e1',
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '14px', lineHeight: 1.4
                }}
              >
                <div style={{ 
                  width: '18px', height: '18px', borderRadius: '50%', 
                  border: isSelected ? '5px solid #6366f1' : '1px solid #64748b',
                  flexShrink: 0
                }} />
                {option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' }}>
        <button 
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'transparent', border: 'none', color: currentIndex === 0 ? '#475569' : '#94a3b8',
            cursor: currentIndex === 0 ? 'default' : 'pointer', padding: '8px'
          }}
        >
          <ChevronLeft size={20} /> Previous
        </button>
        
        {currentIndex === totalQuestions - 1 ? (
          <button 
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < totalQuestions}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: Object.keys(answers).length < totalQuestions ? '#334155' : '#6366f1', 
              border: 'none', color: Object.keys(answers).length < totalQuestions ? '#94a3b8' : '#fff',
              cursor: Object.keys(answers).length < totalQuestions ? 'not-allowed' : 'pointer', 
              padding: '8px 16px', borderRadius: '6px', fontWeight: 500
            }}
            title={Object.keys(answers).length < totalQuestions ? 'Answer all questions to submit' : 'Submit Mock Test'}
          >
            Submit Test <CheckCircle size={18} />
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'transparent', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: '8px'
            }}
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
