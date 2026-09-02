import os
import json

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# Update api.ts
api_path = 'Frontend/src/services/api.ts'
with open(api_path, 'r', encoding='utf-8') as f:
    api_content = f.read()

# Add missing api methods
if 'getVideo:' not in api_content:
    api_content = api_content.replace('getProfile: async () => {', '''
  getVideo: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}`);
    if (!res.ok) return null;
    return res.json();
  },
  generateNotes: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}/notes/generate`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
  },
  generateQuiz: async (id: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/videos/${id}/quiz/generate`, { method: 'POST' });
    if (!res.ok) return null;
    return res.json();
  },
  evaluateTeachBack: async (videoId: string, concept: string, explanation: string) => {
    const res = await authenticatedFetch(`${BASE_URL}/teach-me-back/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ video_id: videoId, concept, explanation })
    });
    if (!res.ok) return null;
    return res.json();
  },
  getProfile: async () => {''')
    write_file(api_path, api_content)


# 1. /video/page.tsx
write_file('Frontend/src/app/(app)/video/page.tsx', '''"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Share2, HelpCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function VideoLearningPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'O5nskjZ_GoI';
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getVideo(videoId);
      setVideo(data);
      setLoading(false);
    };
    load();
  }, [videoId]);

  if (loading) return <div className="flex justify-center items-center h-64"><Activity className="animate-spin" size={32} /></div>;
  if (!video) return <div className="text-center p-12 text-slate-500">Video not found in database.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-black rounded-xl relative overflow-hidden group shadow-lg flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{video.title || 'Untitled Video'}</h1>
              <Badge variant="secondary">Playing</Badge>
            </div>
            <p className="text-muted-foreground">Watch the video and generate notes when you are ready to study.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = `/notes?v=${videoId}`}><BookOpen className="w-4 h-4 mr-2" /> View Notes</Button>
            <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Generate Flashcards</Button>
            <Button className="ml-auto" onClick={() => window.location.href = `/mock-test?v=${videoId}`}>Take Mock Test <HelpCircle className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Real-time Activity
              </h3>
              <p className="text-sm text-muted-foreground">Interact with the video to capture learning history securely into the database.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-indigo-500">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Teach it back?</h4>
                <p className="text-sm text-muted-foreground mb-4">Validate your understanding via the Teach-Back framework.</p>
                <Button className="w-full" onClick={() => window.location.href = `/teach-back?v=${videoId}`}>Start Teach-Back</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
''')

# 2. /learn/page.tsx
write_file('Frontend/src/app/(app)/learn/page.tsx', '''"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Activity } from 'lucide-react';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'O5nskjZ_GoI';
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getVideo(videoId);
      setVideo(data);
      setLoading(false);
    };
    load();
  }, [videoId]);

  if (loading) return <div className="flex justify-center items-center h-64"><Activity className="animate-spin" size={32} /></div>;

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <div className="w-full h-full relative group flex flex-col items-center justify-center">
         <iframe
            width="80%"
            height="80%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between text-white pointer-events-none">
          <h1 className="text-2xl font-bold text-shadow-md">{video?.title}</h1>
        </div>
      </div>
    </div>
  );
}
''')

# 3. /mock-test/page.tsx
write_file('Frontend/src/app/(app)/mock-test/page.tsx', '''"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Activity, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MockTestPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'O5nskjZ_GoI';
  
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Optionally auto-fetch if it already exists, for now we let user generate
  }, []);

  const generateQuiz = async () => {
    setGenerating(true);
    const data = await api.generateQuiz(videoId);
    setQuiz(data);
    setGenerating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mock Test</h1>
        <Button onClick={generateQuiz} disabled={generating}>
          {generating ? <Activity className="animate-spin mr-2" size={16}/> : null}
          Generate New Test
        </Button>
      </div>

      {!quiz && !generating && (
        <Card className="text-center p-12 text-slate-500 bg-white/50 backdrop-blur">
          <p>Click "Generate New Test" to build a dynamic test using Gemini AI.</p>
        </Card>
      )}

      {generating && (
        <Card className="text-center p-12 text-slate-500 flex flex-col items-center bg-white/50 backdrop-blur">
            <Activity className="animate-spin mb-4" size={32} />
            <p>Generating questions using Gemini 3.6 Flash...</p>
        </Card>
      )}

      {quiz && quiz.questions && (
        <div className="space-y-6">
          {quiz.questions.map((q: any, i: number) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle className="text-lg">Question {i + 1}: {q.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt: string, j: number) => (
                  <div key={j} className={`p-3 rounded border ${opt === q.correct_answer ? 'bg-green-50 border-green-200 font-medium' : 'bg-slate-50 border-slate-100'}`}>
                    {opt === q.correct_answer && <CheckCircle2 className="inline mr-2 w-4 h-4 text-green-500"/>}
                    {opt}
                  </div>
                ))}
                <p className="text-sm text-slate-500 mt-4 italic">Explanation: {q.explanation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
''')


# 4. /teach-back/page.tsx
write_file('Frontend/src/app/(app)/teach-back/page.tsx', '''"use client";
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Activity, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeachBackPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'O5nskjZ_GoI';
  
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');
  const [result, setResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);

  const submitTeachBack = async () => {
    if(!concept || !explanation) return;
    setEvaluating(true);
    const data = await api.evaluateTeachBack(videoId, concept, explanation);
    setResult(data);
    setEvaluating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teach-Back</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Explain a Concept</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
                <label className="text-sm font-medium">Concept Name</label>
                <input 
                    type="text" 
                    value={concept} 
                    onChange={e => setConcept(e.target.value)} 
                    className="w-full mt-1 p-2 border rounded"
                    placeholder="e.g. Binary Search Trees"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Your Explanation</label>
                <textarea 
                    value={explanation} 
                    onChange={e => setExplanation(e.target.value)} 
                    className="w-full mt-1 p-2 border rounded h-32"
                    placeholder="Explain it as if teaching a beginner..."
                />
            </div>
            <Button onClick={submitTeachBack} disabled={evaluating || !concept || !explanation} className="w-full">
              {evaluating ? <Activity className="animate-spin mr-2" size={16}/> : null}
              Submit for AI Evaluation
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardHeader>
            <CardTitle>AI Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {!result && !evaluating && <p className="text-slate-500">Submit an explanation to receive Gemini evaluation.</p>}
            {evaluating && <div className="flex items-center text-slate-500"><Activity className="animate-spin mr-2"/> Analyzing your explanation...</div>}
            
            {result && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-lg font-bold">
                        Score: {result.score} / 100 <Star className="text-yellow-500 w-5 h-5"/>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm">Feedback</h4>
                        <p className="text-sm text-slate-700">{result.feedback}</p>
                    </div>
                    {result.knowledge_gaps && result.knowledge_gaps.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-red-500">Detected Gaps</h4>
                            <ul className="list-disc pl-5 text-sm text-slate-700">
                                {result.knowledge_gaps.map((g: string, i: number) => <li key={i}>{g}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
''')

# Delete mock ExamPreparationCard.tsx mock text if it exists (Optional, replacing the string)
exam_prep = 'Frontend/src/components/ExamPreparationCard.tsx'
if os.path.exists(exam_prep):
    with open(exam_prep, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('Complete Mock Test #3', '{`Complete pending mocks`}')
    content = content.replace('Data Structures Midterm', '{examName}')
    with open(exam_prep, 'w', encoding='utf-8') as f:
        f.write(content)

print("SUCCESS")
