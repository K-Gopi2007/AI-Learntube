"use client";
import React from 'react';
import MasteryScoreCard from '@/components/MasteryScoreCard';
import LearningProgressChart from '@/components/LearningProgressChart';
import TopicRadarChart from '@/components/TopicRadarChart';
import AdaptivePathCard from '@/components/AdaptivePathCard';
import StudentComparisonCard from '@/components/StudentComparisonCard';
import WeaknessDetectionCard from '@/components/WeaknessDetectionCard';
import KnowledgeGapAlert from '@/components/KnowledgeGapAlert';
import ExamPreparationCard from '@/components/ExamPreparationCard';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, JD!</h1>
          <p className="text-muted-foreground">Here is your learning overview for today.</p>
        </div>
      </div>
      
      <KnowledgeGapAlert gap="Dynamic Programming Patterns" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MasteryScoreCard score={8450} maxScore={10000} />
        <StudentComparisonCard percentile={85} peerAvg={6500} score={8450} />
        <ExamPreparationCard examName="Data Structures Midterm" readiness={78} daysLeft={5} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LearningProgressChart />
        <TopicRadarChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdaptivePathCard topic="Dynamic Programming (Knapsack)" reason="Based on your recent struggle with optimization algorithms." />
        <WeaknessDetectionCard weaknesses={["Dynamic Programming", "Dijkstra's Algorithm", "AVL Rotations"]} />
      </div>
    </div>
  );
}