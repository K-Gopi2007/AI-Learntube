"use client";
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
