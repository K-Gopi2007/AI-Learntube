"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic2, Square, Send, Loader2, Sparkles, AlertCircle } from "lucide-react";

interface EvaluationResult {
  score: number;
  definition: number;
  understanding: number;
  examples: number;
  complexity: number;
  gaps: string[];
}

export default function TeachMeBackPage() {
  const [text, setText] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [recording, setRecording] = useState(false);

  const handleSubmit = () => {
    if (!text.trim()) return;
    setEvaluating(true);
    setTimeout(() => {
      setResult({
        score: 75,
        definition: 90,
        understanding: 80,
        examples: 50,
        complexity: 80,
        gaps: ["Did not explain how to handle deletion of a node with two children in a BST.", "Lacked a real-world analogy."]
      });
      setEvaluating(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Teach-Me-Back</h1>
        <p className="text-muted-foreground">Explain a concept in your own words. The AI will evaluate your understanding and find knowledge gaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Topic: Binary Search Trees</span>
              <Button variant="outline" size="sm">Change Topic</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <textarea
              className="flex-1 w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-muted/30"
              placeholder="Explain what a Binary Search Tree is, how insertion works, and its time complexity..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <Button 
                variant={recording ? "destructive" : "secondary"} 
                onClick={() => setRecording(!recording)}
              >
                {recording ? <><Square className="w-4 h-4 mr-2" /> Stop</> : <><Mic2 className="w-4 h-4 mr-2" /> Record Audio</>}
              </Button>
              <Button onClick={handleSubmit} disabled={evaluating || !text.trim()}>
                {evaluating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating</> : <><Send className="w-4 h-4 mr-2" /> Submit Explanation</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result ? (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Evaluation Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border shadow-sm">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path strokeDasharray="100, 100" className="text-muted stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path strokeDasharray={`${result.score}, 100`} className="text-primary stroke-current" strokeWidth="3" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute font-bold text-lg">{result.score}%</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">Overall Mastery</h3>
                  <p className="text-sm text-muted-foreground">Good understanding, but needs more examples.</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-white rounded-lg border shadow-sm">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Definition</span><span className="font-medium">{result.definition}%</span></div>
                  <Progress value={result.definition} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Understanding</span><span className="font-medium">{result.understanding}%</span></div>
                  <Progress value={result.understanding} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Examples</span><span className="font-medium">{result.examples}%</span></div>
                  <Progress value={result.examples} className="h-1.5" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm"><span>Complexity Analysis</span><span className="font-medium">{result.complexity}%</span></div>
                  <Progress value={result.complexity} className="h-1.5" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><AlertCircle className="w-4 h-4 text-orange-500" /> Knowledge Gaps Detected</h4>
                <ul className="space-y-2">
                  {result.gaps.map((gap: string, i: number) => (
                    <li key={i} className="text-sm p-3 bg-orange-50 text-orange-900 rounded-md border border-orange-100">{gap}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex items-center justify-center text-muted-foreground border-dashed bg-transparent shadow-none">
            <CardContent className="flex flex-col items-center pt-6">
              <Sparkles className="w-12 h-12 mb-4 opacity-20" />
              <p>Submit your explanation to see the AI evaluation.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}