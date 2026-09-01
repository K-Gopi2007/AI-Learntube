"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, TrendingUp } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export default function StudentComparisonCard({ 
  percentile = 85, 
  peerAvg = 6500, 
  score = 8450 
}: { 
  percentile?: number, 
  peerAvg?: number, 
  score?: number 
}) {
  return (
    <Card className="bg-white/40 backdrop-blur-md shadow-glass border-white/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Users className="w-5 h-5 text-primary" /> Peer Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-6">
          <h3 className="text-4xl font-extrabold text-primary">Top <AnimatedCounter value={100 - percentile} duration={1} />%</h3>
          <p className="text-sm font-medium text-muted-foreground">of your cohort</p>
        </div>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-1.5 font-medium">
              <span className="text-foreground">Your Score</span>
              <span className="text-primary font-bold"><AnimatedCounter value={score} /></span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((score / 10000) * 100, 100)}%` }} 
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                className="h-full bg-gradient-primary"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1.5 text-muted-foreground font-medium">
              <span>Class Average</span>
              <span><AnimatedCounter value={peerAvg} /></span>
            </div>
            <div className="h-2.5 w-full bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((peerAvg / 10000) * 100, 100)}%` }} 
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-green-500/10 text-green-800 rounded-xl text-sm flex items-start gap-3 border border-green-500/20 backdrop-blur-sm">
          <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
          <p className="leading-relaxed">You are learning <strong className="font-bold text-green-900">1.5x faster</strong> than average!</p>
        </div>
      </CardContent>
    </Card>
  );
}