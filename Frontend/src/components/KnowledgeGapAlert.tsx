"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function KnowledgeGapAlert({ gap = "Recursion Base Cases" }: { gap?: string }) {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm flex gap-4 items-start w-full max-w-md"
        >
          <div className="p-2 bg-orange-100 rounded-full text-orange-600 shrink-0 shadow-sm">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-6">
            <h4 className="font-semibold text-orange-900 mb-1">Insight Detected</h4>
            <p className="text-sm text-orange-800/80 mb-3 leading-relaxed">
              You tend to struggle with <strong className="text-orange-900">{gap}</strong> when solving Tree problems.
            </p>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
              Review Concept
            </Button>
          </div>
          <button 
            onClick={() => setVisible(false)} 
            className="absolute top-2 right-2 p-1.5 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}