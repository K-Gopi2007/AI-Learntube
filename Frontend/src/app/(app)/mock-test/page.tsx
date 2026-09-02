"use client";
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
