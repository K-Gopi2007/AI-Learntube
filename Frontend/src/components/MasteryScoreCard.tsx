"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export default function MasteryScoreCard({ score = 8450, maxScore = 10000 }: { score?: number, maxScore?: number }) {
  const percentage = Math.round((score / maxScore) * 100);
  return (
    <Card className="relative overflow-hidden group bg-white/40 backdrop-blur-md shadow-glass border-white/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Total Mastery</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-extrabold tracking-tighter text-primary">
              <AnimatedCounter value={score} />
            </h3>
            <span className="text-sm font-medium text-muted-foreground">/ {maxScore.toLocaleString()}</span>
          </div>
        </div>
        <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center relative shadow-inner">
          <motion.svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 36 36">
            <path strokeDasharray="100, 100" className="text-slate-200 stroke-current" strokeWidth="2.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <motion.path 
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${percentage}, 100` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              className="text-primary stroke-current" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              fill="none" 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
            />
          </motion.svg>
          <Award className="w-8 h-8 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}