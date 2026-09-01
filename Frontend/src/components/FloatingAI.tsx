"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, MessageSquare, BookOpen, Share2, HelpCircle, Send } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const tabs = [
  { id: "chat", icon: MessageSquare, label: "AI Chat" },
  { id: "notes", icon: BookOpen, label: "Notes" },
  { id: "flashcards", icon: Share2, label: "Flashcards" },
  { id: "quiz", icon: HelpCircle, label: "Quiz" },
];

export default function FloatingAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            drag
            dragMomentum={false}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-primary rounded-full shadow-2xl flex items-center justify-center text-white z-50 hover:shadow-primary/50 transition-shadow cursor-grab active:cursor-grabbing"
          >
            <Bot className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden z-50 cursor-move"
          >
            <div className="h-14 bg-gradient-primary flex items-center justify-between px-4 text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span className="font-semibold">LearnTube Companion</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex border-b">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 text-xs font-medium flex flex-col items-center gap-1 border-b-2 transition-colors ${
                    activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-muted/20">
              {activeTab === "chat" && (
                <div className="space-y-4">
                  <div className="bg-primary/10 text-primary-foreground p-3 rounded-lg rounded-tl-none w-5/6 text-sm">
                    Hi! I'm tracking your video progress. Ask me anything about Data Structures!
                  </div>
                </div>
              )}
              {activeTab === "notes" && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Generated Notes</h4>
                  <ul className="text-sm space-y-2 list-disc pl-4 text-muted-foreground">
                    <li>Arrays store elements in contiguous memory.</li>
                    <li>Time complexity for indexing is O(1).</li>
                    <li>Insertion/Deletion is O(N) due to shifting.</li>
                  </ul>
                </div>
              )}
              {activeTab === "flashcards" && (
                <div className="h-full flex items-center justify-center">
                  <div className="w-full h-48 bg-white border rounded-xl shadow-sm flex items-center justify-center p-6 text-center cursor-pointer hover:border-primary transition-colors">
                    <span className="font-medium text-lg">What is the time complexity of accessing an array element?</span>
                  </div>
                </div>
              )}
            </div>

            {activeTab === "chat" && (
              <div className="p-3 border-t bg-white flex gap-2">
                <Input placeholder="Ask a question..." className="flex-1" />
                <Button size="icon"><Send className="w-4 h-4" /></Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}