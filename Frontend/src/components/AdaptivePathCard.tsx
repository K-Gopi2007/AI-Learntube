"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Route, ArrowRight, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdaptivePathCard({ topic = "Graph Traversal (BFS)", reason = "Based on your recent struggle with tree algorithms." }: { topic?: string, reason?: string }) {
  return (
    <Card className="border-white/50 shadow-glass bg-white/40 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <BrainCircuit className="w-24 h-24 text-primary" />
      </div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <Route className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-lg text-primary">AI Recommended Path</h3>
        </div>
        <h4 className="text-2xl font-bold mb-2">{topic}</h4>
        <p className="text-sm text-muted-foreground mb-6">{reason}</p>
        <Button className="w-full sm:w-auto" asChild>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Start Lesson <ArrowRight className="w-4 h-4 ml-2" />
          </motion.button>
        </Button>
      </CardContent>
    </Card>
  );
}