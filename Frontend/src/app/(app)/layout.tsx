"use client";
import React from "react";
import PageTransition from "@/components/PageTransition";
import Link from "next/link";
import { Bot, LineChart, Network, Route, Mic2 } from "lucide-react";
import { usePathname } from "next/navigation";
import FloatingCompanionWidget from "@/components/FloatingCompanionWidget";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/learn", label: "Learn", icon: Bot },
    { href: "/analytics", label: "Analytics", icon: LineChart },
    { href: "/knowledge-map", label: "Knowledge Map", icon: Network },
    { href: "/learning-path", label: "Learning Path", icon: Route },
    { href: "/teach-topic", label: "Teach Topic", icon: Mic2 },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-900 overflow-hidden">
      <header className="h-14 bg-black/50 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6 z-40 relative">
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center shadow-lg">
            <Bot className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">LearnTube<span className="text-primary">AI</span></span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${pathname === item.href ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1 relative overflow-y-auto bg-slate-50/50 custom-scrollbar">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      <FloatingCompanionWidget />
    </div>
  );
}