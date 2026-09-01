"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const questions = [
  {
    id: 1,
    question: "What is the worst-case time complexity of searching in a Binary Search Tree?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct: 2,
    explanation: "In the worst case (a skewed tree), you might have to traverse all N nodes."
  },
  {
    id: 2,
    question: "Which traversal of a BST visits nodes in ascending order?",
    options: ["Pre-order", "In-order", "Post-order", "Level-order"],
    correct: 1,
    explanation: "In-order traversal visits the left subtree, then the root, then the right subtree, resulting in sorted order."
  }
];

export default function QuizPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
    }
  };

  const reset = () => {
    setCurrentIdx(0);
    setSelected(null);
    setShowResult(false);
    setIsFinished(false);
    setScore(0);
  };

  if (isFinished) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
        <h1 className="text-4xl font-bold">Quiz Complete!</h1>
        <div className="w-32 h-32 mx-auto border-8 border-primary rounded-full flex items-center justify-center text-4xl font-bold text-primary">
          {Math.round((score / questions.length) * 100)}%
        </div>
        <p className="text-xl text-muted-foreground">You got {score} out of {questions.length} correct.</p>
        <Button onClick={reset} size="lg"><RotateCcw className="w-4 h-4 mr-2" /> Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium text-muted-foreground">
          <span>Question {currentIdx + 1} of {questions.length}</span>
          <span>Time: 05:00</span>
        </div>
        <Progress value={((currentIdx) / questions.length) * 100} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-8 space-y-6">
              <h2 className="text-2xl font-semibold">{q.question}</h2>
              
              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  let stateClass = "border-border hover:border-primary hover:bg-primary/5";
                  if (showResult) {
                    if (idx === q.correct) stateClass = "border-green-500 bg-green-50 text-green-900";
                    else if (idx === selected) stateClass = "border-red-500 bg-red-50 text-red-900";
                    else stateClass = "border-border opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showResult}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${stateClass}`}
                    >
                      <span className="font-medium">{opt}</span>
                      {showResult && idx === q.correct && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {showResult && idx === selected && idx !== q.correct && <XCircle className="w-5 h-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {showResult && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-4 border-t">
                  <h4 className="font-semibold text-primary mb-1">Explanation</h4>
                  <p className="text-muted-foreground text-sm">{q.explanation}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-end">
        <Button size="lg" disabled={!showResult} onClick={handleNext}>
          {currentIdx === questions.length - 1 ? 'Finish' : 'Next Question'} <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}