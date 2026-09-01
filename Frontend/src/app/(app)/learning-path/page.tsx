"use client";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const path = [
  { title: "Arrays", status: "completed", desc: "Memory allocation, 1D/2D, basic operations." },
  { title: "Linked List", status: "completed", desc: "Singly, Doubly, fast/slow pointers." },
  { title: "Stack", status: "completed", desc: "LIFO, monotonic stacks, balanced parentheses." },
  { title: "Trees", status: "current", desc: "Binary Trees, traversals, depth, BFS/DFS." },
  { title: "BST", status: "next", desc: "Binary Search Tree properties, insertion, deletion." },
  { title: "AVL", status: "locked", desc: "Self-balancing trees, rotations." },
  { title: "Graphs", status: "locked", desc: "Adjacency matrix/list, Dijkstra, shortest path." },
];

export default function LearningPathPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Learning Path</h1>
        <p className="text-muted-foreground">Personalized progression based on your strengths and goals.</p>
      </div>

      <div className="relative border-l-2 border-muted ml-6 space-y-8 pb-8">
        {path.map((item, idx) => {
          const isCompleted = item.status === "completed";
          const isCurrent = item.status === "current";
          
          return (
            <div key={idx} className="relative pl-8">
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center bg-white ${isCompleted ? 'text-green-500' : isCurrent ? 'text-primary ring-4 ring-primary/20' : 'text-muted'}`}>
                {isCompleted ? <CheckCircle2 className="w-5 h-5 bg-white" /> : <Circle className={`w-5 h-5 bg-white ${isCurrent ? 'fill-primary' : 'fill-muted'}`} />}
              </div>
              
              <Card className={`transition-all ${isCurrent ? 'border-primary shadow-md scale-[1.02]' : 'opacity-80'}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        {isCurrent && <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Current Focus</span>}
                      </div>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </div>
                    {isCurrent && (
                      <Button size="sm">Resume <ArrowRight className="w-4 h-4 ml-1" /></Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}