"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Share2, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function VideoLearningPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player Mock */}
          <div className="w-full aspect-video bg-black rounded-xl relative overflow-hidden group shadow-lg flex items-center justify-center">
            <h2 className="text-white/30 text-2xl font-bold">YouTube Player</h2>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div className="h-full bg-red-600 w-1/3"></div>
            </div>
          </div>

          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">Introduction to Binary Search Trees (BST)</h1>
              <Badge variant="secondary">In Progress</Badge>
            </div>
            <p className="text-muted-foreground">Learn the fundamentals of BST, how insertion works, and the time complexity of various operations.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline"><BookOpen className="w-4 h-4 mr-2" /> Generate Notes</Button>
            <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Generate Flashcards</Button>
            <Button className="ml-auto">Take Mock Test <HelpCircle className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Topic Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { time: "00:00", title: "Introduction", active: false },
                  { time: "02:15", title: "What is a Tree?", active: false },
                  { time: "05:30", title: "BST Properties", active: true },
                  { time: "10:45", title: "Insertion Algorithm", active: false },
                  { time: "15:20", title: "Time Complexity", active: false },
                ].map((item, i) => (
                  <div key={i} className={`flex gap-3 text-sm cursor-pointer hover:text-primary transition-colors ${item.active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{item.time}</span>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-primary">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Ready to test?</h4>
                <p className="text-sm text-muted-foreground mb-4">You've covered enough material to take a quick knowledge check.</p>
                <Button className="w-full">Start Quick Quiz</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}