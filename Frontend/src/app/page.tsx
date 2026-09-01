"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, PlayCircle, BookOpen, BrainCircuit, Activity, ArrowRight, Zap, Target, BookMarked, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden selection:bg-primary/20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Bot className="text-white w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              LearnTube<span className="text-primary">AI</span>
            </span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" className="hidden sm:flex font-medium">Features</Button>
            <Button variant="ghost" className="hidden sm:flex font-medium">How it works</Button>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 shadow-md shadow-slate-900/20">
              <Link href="/learn">Launch App</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-32 pb-24 px-6 text-center relative max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4 border border-primary/20 backdrop-blur-md">
              <Zap className="w-4 h-4" /> The future of video learning
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-tight">
              Adaptive Learning Companion <br className="hidden md:block"/> for <span className="text-red-500 relative">YouTube
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-red-500 opacity-30" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Overlay a powerful AI tutor on any YouTube educational video. We analyze the content in real-time, generate flashcards, and guide you to mastery.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button size="lg" asChild className="rounded-full px-8 h-12 text-base font-semibold shadow-[0_8px_30px_rgb(99,102,241,0.3)] hover:shadow-[0_8px_30px_rgb(99,102,241,0.5)] transition-all">
                <Link href="/learn">Install Extension (Demo) <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-semibold border-slate-300 hover:bg-slate-100">
                <PlayCircle className="mr-2 w-5 h-5" /> See it in action
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="py-20 bg-white/50 border-y border-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center">
              {[
                { title: "Watch", icon: Video, color: "text-red-500" },
                { title: "Understand", icon: BrainCircuit, color: "text-blue-500" },
                { title: "Assess", icon: Activity, color: "text-purple-500" },
                { title: "Adapt", icon: Target, color: "text-orange-500" },
                { title: "Master", icon: BookMarked, color: "text-green-500" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl bg-white shadow-glass border border-slate-100 flex items-center justify-center mb-4 ${step.color}`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800">{step.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}