"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertOctagon, Target } from 'lucide-react';

export default function WeaknessDetectionCard({ 
  weaknesses = ["Dynamic Programming", "Dijkstra's Algorithm"] 
}: { 
  weaknesses?: string[] 
}) {
  return (
    <Card className="border-red-200/50 bg-red-50/40 backdrop-blur-md shadow-glass">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-full text-red-600 mt-1 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 text-lg mb-1">Knowledge Gaps Detected</h3>
            <p className="text-sm text-red-700/80 mb-4">We noticed you struggled with these concepts in recent quizzes.</p>
            <ul className="space-y-2 mb-4">
              {weaknesses.map((w, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-medium text-red-800 bg-red-100/50 px-3 py-2 rounded-md">
                  <Target className="w-4 h-4 text-red-500 shrink-0" /> {w}
                </li>
              ))}
            </ul>
            <Button variant="destructive" size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white">
              Generate Revision Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}