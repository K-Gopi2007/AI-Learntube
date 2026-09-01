import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, Check, RotateCcw, Clock } from 'lucide-react';

export default function FlashcardsTab({ videoId }: { videoId: string }) {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'generating' | 'done'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [responses, setResponses] = useState<Record<number, string>>({}); // id -> 'knew_it' | 'review'

  useEffect(() => {
    let isMounted = true;
    
    const loadFlashcards = async () => {
      if (!videoId) return;
      
      try {
        setErrorMsg(null);
        setLoadingState('loading');
        
        let cards = await api.getFlashcards(videoId);
        
        if (!cards || cards.length === 0) {
          setLoadingState('generating');
          cards = await api.generateFlashcards(videoId);
        }
        
        if (isMounted) {
          setFlashcards(cards || []);
          setLoadingState('done');
        }
      } catch (err: any) {
        if (isMounted) {
          if (err.message.includes('No transcript')) {
             setErrorMsg('Transcript unavailable for this video.');
          } else {
             setErrorMsg(err.message || 'Flashcard generation is temporarily unavailable.');
          }
          setLoadingState('done');
        }
      }
    };
    
    // Clear state on video change
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setResponses({});
    setErrorMsg(null);
    
    loadFlashcards();
    
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleSeek = (e: React.MouseEvent, seconds: number) => {
    e.stopPropagation(); // prevent flipping card
    if (isNaN(seconds)) return;
    
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = seconds;
      videoElement.play();
    }
  };

  const handleResponse = (e: React.MouseEvent, status: string) => {
    e.stopPropagation(); // prevent flipping
    const currentCard = flashcards[currentIndex];
    
    // Create clean data structure for later adaptive engine
    const responseData = {
      cardId: currentCard.id,
      topic: currentCard.topic,
      difficulty: currentCard.difficulty,
      status: status,
      timestamp: Date.now()
    };
    
    console.log("Student response logged:", responseData);
    setResponses(prev => ({ ...prev, [currentCard.id]: status }));
    
    // Auto-advance if not on last card
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentIndex(prev => prev + 1);
      }, 400);
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

  if (loadingState !== 'done') {
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px', color: '#6366f1' }} />
        <span>{loadingState === 'generating' ? 'Generating flashcards...' : 'Loading flashcards...'}</span>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
        No flashcards available for this video.
      </div>
    );
  }
  
  const card = flashcards[currentIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
      
      {/* Progress Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div style={{ flex: 1, margin: '0 12px', height: '4px', background: '#334155', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#6366f1', width: `${((currentIndex + 1) / flashcards.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: '13px', color: '#6366f1', fontWeight: 500 }}>
          {card.difficulty || 'General'}
        </span>
      </div>

      {/* Flashcard */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        style={{
          flex: 1,
          background: isFlipped ? '#1e293b' : '#334155',
          border: '1px solid #475569',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.3s, transform 0.2s',
          minHeight: '200px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '12px', color: '#94a3b8', background: '#0f172a', padding: '4px 8px', borderRadius: '4px' }}>
            {card.topic || 'General Topic'}
          </span>
          
          {card.source_timestamp != null && (
            <button
              onClick={(e) => handleSeek(e, card.source_timestamp)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.2)', padding: '4px 8px',
                borderRadius: '4px', fontSize: '12px', cursor: 'pointer',
                fontFamily: 'monospace'
              }}
              title="Jump to this part of the video"
            >
              <Clock size={12} />
              {new Date(card.source_timestamp * 1000).toISOString().substr(14, 5)}
            </button>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 12px' }}>
          <h3 style={{ fontSize: isFlipped ? '16px' : '20px', fontWeight: isFlipped ? 400 : 600, color: '#f8fafc', margin: 0, lineHeight: 1.5 }}>
            {isFlipped ? card.answer : card.question}
          </h3>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#64748b' }}>
          {isFlipped ? 'Click to see question' : 'Click to flip'}
        </div>
      </div>

      {/* Interaction Controls */}
      {isFlipped && (
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={(e) => handleResponse(e, 'review')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <RotateCcw size={16} /> Need Review
          </button>
          <button
            onClick={(e) => handleResponse(e, 'knew_it')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80',
              border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', cursor: 'pointer',
              fontWeight: 500
            }}
          >
            <Check size={16} /> I Knew This
          </button>
        </div>
      )}

      {/* Navigation Controls */}
      {!isFlipped && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentIndex(prev => Math.max(0, prev - 1)); }}
            disabled={currentIndex === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'transparent', border: 'none', color: currentIndex === 0 ? '#475569' : '#94a3b8',
              cursor: currentIndex === 0 ? 'default' : 'pointer', padding: '8px'
            }}
          >
            <ChevronLeft size={20} /> Previous
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentIndex(prev => Math.min(flashcards.length - 1, prev + 1)); }}
            disabled={currentIndex === flashcards.length - 1}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'transparent', border: 'none', color: currentIndex === flashcards.length - 1 ? '#475569' : '#94a3b8',
              cursor: currentIndex === flashcards.length - 1 ? 'default' : 'pointer', padding: '8px'
            }}
          >
            Next <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
