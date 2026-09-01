import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Loader2, AlertCircle } from 'lucide-react';

export default function NotesTab({ videoId, videoTitle }: { videoId: string, videoTitle: string | null }) {
  const [loadingState, setLoadingState] = useState<'idle' | 'video' | 'transcript' | 'analyze' | 'notes' | 'done'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Data states
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [notesData, setNotesData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadPipeline = async () => {
      if (!videoId) return;
      
      try {
        setErrorMsg(null);
        
        // Step 1: GET video
        setLoadingState('video');
        await api.getVideo(videoId);
        
        // Step 2: Get transcript
        setLoadingState('transcript');
        await api.getTranscript(videoId);
        
        // Step 3: Analyze video
        setLoadingState('analyze');
        const analysis = await api.analyzeVideo(videoId);
        if (isMounted) setAnalysisData(analysis);
        
        // Step 4: Get/Generate notes
        setLoadingState('notes');
        let notesList = await api.getNotes(videoId);
        let notes;
        if (notesList && notesList.length > 0) {
          notes = JSON.parse(notesList[0].content);
        } else {
          const newNote = await api.generateNotes(videoId);
          notes = JSON.parse(newNote.content);
        }
        if (isMounted) {
          setNotesData(notes);
          setLoadingState('done');
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'An error occurred during the pipeline.');
          setLoadingState('done');
        }
      }
    };
    
    // Clear state on video change
    setAnalysisData(null);
    setNotesData(null);
    setErrorMsg(null);
    setLoadingState('idle');
    
    loadPipeline();
    
    return () => {
      isMounted = false;
    };
  }, [videoId]);

  const handleSeek = (timestamp: string | number) => {
    // If it's MM:SS format from notes
    let seconds = 0;
    if (typeof timestamp === 'string') {
      const parts = timestamp.split(':').map(Number);
      if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        seconds = parseInt(timestamp, 10);
      }
    } else {
      seconds = timestamp;
    }
    
    if (isNaN(seconds)) return;
    
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.currentTime = seconds;
      videoElement.play();
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
    let loadingText = 'Loading...';
    if (loadingState === 'video') loadingText = 'Loading video...';
    if (loadingState === 'transcript') loadingText = 'Loading transcript...';
    if (loadingState === 'analyze') loadingText = 'Analyzing video...';
    if (loadingState === 'notes') loadingText = 'Generating notes...';
    
    return (
      <div className="loading-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', opacity: 0.7 }}>
        <Loader2 className="animate-spin" size={32} style={{ marginBottom: '12px' }} />
        <span>{loadingText}</span>
      </div>
    );
  }
  
  // Both analysis and notes are available
  return (
    <div className="notes-container" style={{ padding: '16px', overflowY: 'auto', maxHeight: '100%' }}>
      <h3 style={{ marginTop: 0, color: '#e2e8f0', fontSize: '18px' }}>{videoTitle}</h3>
      
      {notesData && (
        <>
          <div className="notes-section">
            <h4 style={{ color: '#818cf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Summary</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{notesData.summary || analysisData?.summary}</p>
          </div>
          
          <div className="notes-section" style={{ marginTop: '16px' }}>
            <h4 style={{ color: '#818cf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Key Concepts</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
              {(notesData.key_concepts || analysisData?.key_concepts || []).map((concept: string, idx: number) => (
                <li key={idx}>{concept}</li>
              ))}
            </ul>
          </div>
          
          {analysisData?.topics && analysisData.topics.length > 0 && (
            <div className="notes-section" style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#818cf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Topics & Timestamps</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {analysisData.topics.map((topic: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: '12px', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <button 
                        onClick={() => handleSeek(topic.start_time)}
                        style={{
                          background: '#334155', border: 'none', color: '#60a5fa', 
                          padding: '2px 6px', borderRadius: '4px', cursor: 'pointer',
                          fontFamily: 'monospace', flexShrink: 0
                        }}
                      >
                        {new Date(topic.start_time * 1000).toISOString().substr(14, 5)}
                      </button>
                      <div>
                        <strong>{topic.topic}</strong>
                        <p style={{ margin: '4px 0 0 0', color: '#94a3b8' }}>{topic.explanation}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {notesData.timestamp_references && notesData.timestamp_references.length > 0 && !analysisData?.topics && (
            <div className="notes-section" style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#818cf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Important Moments</h4>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {notesData.timestamp_references.map((ref: any, idx: number) => (
                  <li key={idx} style={{ marginBottom: '8px', fontSize: '14px', display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleSeek(ref.timestamp)}
                      style={{
                        background: '#334155', border: 'none', color: '#60a5fa', 
                        padding: '2px 6px', borderRadius: '4px', cursor: 'pointer',
                        fontFamily: 'monospace'
                      }}
                    >
                      {ref.timestamp}
                    </button>
                    <span>{ref.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {notesData.important_points && notesData.important_points.length > 0 && (
            <div className="notes-section" style={{ marginTop: '16px' }}>
              <h4 style={{ color: '#818cf8', borderBottom: '1px solid #334155', paddingBottom: '4px' }}>Important Points</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.5' }}>
                {notesData.important_points.map((point: string, idx: number) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
