"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle2 } from 'lucide-react';

export default function ExamPreparationCard({ 
  examName = "Final Assessment", 
  readiness = 78, 
  daysLeft = 5 
}: { 
  examName?: string, 
  readiness?: number, 
  daysLeft?: number 
}) {
  return (
    <Card className="overflow-hidden shadow-glass border-white/50 bg-white/40 backdrop-blur-md">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-xl mb-1">{examName}</h3>
            <p className="text-blue-100 text-sm flex items-center gap-1 font-medium">
              <Calendar className="w-4 h-4" /> In {daysLeft} days
            </p>
          </div>
          <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold backdrop-blur-md shadow-sm border border-white/10">
            {readiness}% Ready
          </div>
        </div>
        <Progress value={readiness} className="h-2 bg-black/20 [&>div]:bg-white" />
      </div>
      <CardContent className="p-6">
        <h4 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Recommended Actions</h4>
        <ul className="space-y-3">
          <li className="flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> {`Complete pending mocks`}
          </li>
          <li className="flex items-center gap-3 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> Review Graph Algorithms
          </li>
          <li className="flex items-center gap-3 text-sm text-muted-foreground opacity-60 font-medium">
            <div className="w-5 h-5 rounded-full border-2 border-muted shrink-0" /> Watch DP Tutorial
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}