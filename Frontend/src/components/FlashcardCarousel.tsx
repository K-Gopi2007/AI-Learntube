"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const defaultCards = [
  { q: "What is the Time Complexity of Array Indexing?", a: "O(1)" },
  { q: "What is a Binary Search Tree?", a: "A tree where left child < parent and right child > parent." },
  { q: "What is the purpose of Dijkstra's algorithm?", a: "Finding the shortest paths between nodes in a graph." }
];

export default function FlashcardCarousel({ cards = defaultCards }: { cards?: {q: string, a: string}[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const next = () => { setIndex((i) => (i + 1) % cards.length); setFlipped(false); };
  const prev = () => { setIndex((i) => (i - 1 + cards.length) % cards.length); setFlipped(false); };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4">
      <div className="relative w-full h-64 perspective-1000" onClick={() => setFlipped(!flipped)}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={index + (flipped ? '-flipped' : '')}
            initial={{ opacity: 0, rotateY: flipped ? -180 : 180, scale: 0.95 }}
            animate={{ opacity: 1, rotateY: 0, scale: 1 }}
            exit={{ opacity: 0, rotateY: flipped ? 180 : -180, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
            className="absolute inset-0 w-full h-full cursor-pointer"
          >
            <div className={`w-full h-full rounded-2xl border-2 shadow-lg p-6 flex flex-col items-center justify-center text-center bg-white transition-colors ${flipped ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
              <span className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                {flipped ? "Answer" : "Question"}
              </span>
              <p className={`text-xl font-medium ${flipped ? 'text-primary' : 'text-foreground'}`}>
                {flipped ? cards[index].a : cards[index].q}
              </p>
              <div className="absolute bottom-4 right-4 text-muted-foreground/50 hover:text-primary transition-colors">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="flex items-center gap-6">
        <Button variant="outline" size="icon" onClick={prev}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm font-medium text-muted-foreground">{index + 1} / {cards.length}</span>
        <Button variant="outline" size="icon" onClick={next}><ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}