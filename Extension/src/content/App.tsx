import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, X, Minus, BookOpen, Brain, 
  Map, FileText, Activity, GraduationCap, Target, User as UserIcon
} from 'lucide-react';
import { api } from '../services/api';
import NotesTab from './components/NotesTab';
import FlashcardsTab from './components/FlashcardsTab';
import MockTestTab from './components/MockTestTab';
import AdaptivePathTab from './components/AdaptivePathTab';
import KnowledgeMapTab from './components/KnowledgeMapTab';
import TeachBackTab from './components/TeachBackTab';
import { AskAITab } from './components/AskAITab';
import { ExamKitTab } from './components/ExamKitTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { HistoryTab } from './components/HistoryTab';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import { setToken } from '../services/api';
import { MessageSquare, Award, BarChart3, Clock } from 'lucide-react';

const TABS = [
  { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'askai', label: 'Ask AI', icon: MessageSquare },
  { id: 'flashcards', label: 'Flashcards', icon: BookOpen },
  { id: 'examkit', label: 'Exam Kit', icon: Award },
  { id: 'learning_path', label: 'Learning Path', icon: Target },
  { id: 'mindmap', label: 'Knowledge Map', icon: Map },
  { id: 'mocktest', label: 'Mock Test', icon: Activity },
  { id: 'teachback', label: 'Teach-Back', icon: GraduationCap },
  { id: 'profile', label: 'Profile', icon: UserIcon },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  
  // Dragging state
  const [position, setPosition] = useState({ x: window.innerWidth - 400, y: window.innerHeight - 620 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['access_token'], (result) => {
        setIsAuthenticated(!!result.access_token);
      });
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    const updateVideoInfo = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const v = urlParams.get('v');
      setVideoId(v);
      
      // YouTube stores the title in multiple places. document.title often has " - YouTube" appended.
      // We can try to grab it from the DOM element, but document.title is a safe fallback.
      setTimeout(() => {
        const titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
        if (titleEl) {
          setVideoTitle(titleEl.textContent);
        } else {
          setVideoTitle(document.title.replace(' - YouTube', ''));
        }
      }, 1000); // Wait for DOM to render title
    };

    updateVideoInfo();
    
    // YouTube SPA navigation events
    window.addEventListener('yt-navigate-finish', updateVideoInfo);
    window.addEventListener('popstate', updateVideoInfo);

    return () => {
      window.removeEventListener('yt-navigate-finish', updateVideoInfo);
      window.removeEventListener('popstate', updateVideoInfo);
    };
  }, []);

  // Restore position from session storage (simulated here with local state, could be chrome.storage)
  useEffect(() => {
    chrome.storage.session?.get(['panelPosition'], (result) => {
      if (result.panelPosition) {
        setPosition(result.panelPosition);
      }
    });
  }, []);

  // Track Watch Time History
  useEffect(() => {
    if (!isAuthenticated || !videoId) return;
    
    // Initial ping
    const vid = document.querySelector('video');
    api.updateHistory({ 
      video_id: videoId, 
      last_timestamp: vid?.currentTime || 0, 
      duration: vid?.duration || 0
    }).catch(console.error);

    const interval = setInterval(() => {
      const vidElement = document.querySelector('video');
      if (vidElement && !vidElement.paused) {
        api.updateHistory({ 
          video_id: videoId, 
          last_timestamp: vidElement.currentTime, 
          duration: vidElement.duration || 0
        }).catch(console.error);
      }
    }, 30000); // Track every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, videoId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    
    // Attach to window so we can drag outside the panel
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragRef.current) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;
    
    // Clamp to screen bounds
    newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
    newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    
    // Save position
    if (chrome.storage?.session) {
      chrome.storage.session.set({ panelPosition: position });
    }
  };

  const handleOpenPanel = async () => {
    setIsOpen(true);
    setIsMinimized(false);
    
    // As per requirements: "When the companion opens, send the detected video ID to the backend."
    if (videoId) {
      try {
        console.log(`Sending video ID ${videoId} to backend...`);
        // Just calling to verify the backend connection exists
        await api.getVideo(videoId);
      } catch (err) {
        console.log('Video not analyzed yet or backend unavailable.', err);
      }
    }
  };

  if (!videoId) return null; // Don't show if not on a video page

  return (
    <div className="floating-container">
      <div 
        className="draggable-area" 
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      >
        {!isOpen || isMinimized ? (
          <button 
            className="trigger-btn"
            onPointerDown={handlePointerDown}
            onClick={handleOpenPanel}
            title="Open LearnTube AI"
          >
            <Bot size={28} />
          </button>
        ) : (
          <div className="panel-container">
            <div className="panel-header" onPointerDown={handlePointerDown}>
              <div className="panel-title">
                <Bot size={20} color="#6366f1" />
                LearnTube AI
              </div>
              <div className="panel-controls" onPointerDown={e => e.stopPropagation()}>
                <button className="control-btn" onClick={() => setIsMinimized(true)}>
                  <Minus size={16} />
                </button>
                <button className="control-btn" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            {isAuthenticated === false ? (
              <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
            ) : (
              <>
                <div className="panel-tabs">
                  {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
            
            <div className="panel-content" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {activeTab === 'analytics' ? (
                <AnalyticsTab />
              ) : activeTab === 'history' ? (
                <HistoryTab />
              ) : activeTab === 'notes' ? (
                <NotesTab videoId={videoId} videoTitle={videoTitle} />
              ) : activeTab === 'askai' ? (
                <AskAITab videoId={videoId} />
              ) : activeTab === 'flashcards' ? (
                <FlashcardsTab videoId={videoId} />
              ) : activeTab === 'examkit' ? (
                <ExamKitTab videoId={videoId} />
              ) : activeTab === 'mocktest' ? (
                <MockTestTab videoId={videoId} videoTitle={videoTitle} />
              ) : activeTab === 'learning_path' ? (
                <AdaptivePathTab />
              ) : activeTab === 'mindmap' ? (
                <KnowledgeMapTab />
              ) : activeTab === 'teachback' ? (
                <TeachBackTab />
              ) : activeTab === 'profile' ? (
                <ProfileScreen onLogout={() => setIsAuthenticated(false)} />
              ) : (
                <div className="empty-state">
                  <Bot size={48} opacity={0.5} />
                  <p>AI Backend not connected yet.</p>
                  <p style={{ fontSize: '12px' }}>
                    {TABS.find(t => t.id === activeTab)?.label} functionality will appear here once the API is wired up.
                  </p>
                </div>
              )}
            </div>
            </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
