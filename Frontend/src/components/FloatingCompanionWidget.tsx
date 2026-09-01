"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, FileText, Layers, HelpCircle, AlertTriangle, ChevronRight, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import Link from 'next/link';

export default function FloatingCompanionWidget() {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('tutor');

  const tabs = [
    { id: 'tutor', icon: MessageSquare, label: 'AI Tutor' },
    { id: 'notes', icon: FileText, label: 'Notes' },
    { id: 'flashcards', icon: Layers, label: 'Flashcards' },
    { id: 'quiz', icon: HelpCircle, label: 'Quiz' },
    { id: 'weak', icon: AlertTriangle, label: 'Weak Topics' },
  ];

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: 0, y: 0 }}
      className="fixed bottom-24 right-8 z-50 flex flex-col items-end gap-4"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="origin-bottom-right"
          >
            <Card className="w-[380px] h-[500px] bg-white/80 backdrop-blur-2xl shadow-glass border-white/60 overflow-hidden flex flex-col rounded-2xl pointer-events-auto">
              <div className="h-14 bg-slate-900 text-white flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="font-bold">LearnTube AI</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setExpanded(false)} className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-1 overflow-x-auto custom-scrollbar shrink-0">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'}`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                {activeTab === 'tutor' && (
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                      <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none text-sm text-slate-800">
                        I noticed you paused during the "Fibonacci Sequence" explanation. Would you like me to clarify how memoization works here?
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pl-11">
                      <Button variant="outline" size="sm" className="justify-start text-xs rounded-xl hover:bg-primary hover:text-white">Yes, explain memoization</Button>
                      <Button variant="outline" size="sm" className="justify-start text-xs rounded-xl">Generate a practice question</Button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'weak' && (
                  <div className="space-y-3">
                    <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Detected Knowledge Gaps</h3>
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700 font-semibold mb-1">
                        <AlertTriangle className="w-4 h-4" /> Memoization Overhead
                      </div>
                      <p className="text-xs text-red-600/80 mb-3">You missed 2 questions on this topic previously.</p>
                      <Button asChild size="sm" className="w-full text-xs h-8 bg-red-600 hover:bg-red-700">
                        <Link href="/teach-topic">Start Remediation Lesson</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="space-y-3 text-sm">
                    <p className="text-muted-foreground italic">Auto-generated from transcript...</p>
                    <ul className="list-disc pl-4 space-y-2">
                      <li><strong>Dynamic Programming</strong> trades space for time.</li>
                      <li>Overlapping subproblems are required.</li>
                      <li>Optimal substructure is required.</li>
                    </ul>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <HelpCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold">Ready for a challenge?</h4>
                      <p className="text-xs text-muted-foreground mt-1">Test your knowledge on the video.</p>
                    </div>
                    <Button asChild size="sm" className="rounded-full px-6">
                      <Link href="/quiz">Start Quick Quiz</Link>
                    </Button>
                  </div>
                )}
                
                {activeTab === 'flashcards' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                      <Layers className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold">12 Flashcards Generated</h4>
                      <p className="text-xs text-muted-foreground mt-1">Review key concepts from this video.</p>
                    </div>
                    <Button asChild size="sm" variant="secondary" className="rounded-full px-6 bg-secondary/20 hover:bg-secondary/30 text-secondary-foreground">
                      <Link href="/dashboard">Open Flashcard View</Link>
                    </Button>
                  </div>
                )}
              </div>
              
              {activeTab === 'tutor' && (
                <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                  <div className="relative">
                    <input type="text" placeholder="Ask a question..." className="w-full bg-slate-100 border-none rounded-full pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!expanded && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setExpanded(true)}
          className="w-14 h-14 bg-gradient-primary rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.4)] flex items-center justify-center text-white border-2 border-white/20 pointer-events-auto"
        >
          <Bot className="w-6 h-6" />
        </motion.button>
      )}
    </motion.div>
  );
}