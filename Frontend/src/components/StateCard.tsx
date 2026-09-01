"use client";
import React from 'react';
import { Card, CardContent } from './ui/card';
import { CheckCircle2, AlertTriangle, Inbox, LucideIcon } from 'lucide-react';
import { Button } from './ui/button';

type StateType = 'empty' | 'success' | 'error';

export default function StateCard({
  type,
  title,
  description,
  actionText,
  onAction
}: {
  type: StateType;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  const config = {
    empty: { icon: Inbox, color: "text-slate-500", bg: "bg-slate-100/50" },
    success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100/50" },
    error: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100/50" }
  };
  
  const Icon = config[type].icon;

  return (
    <Card className="w-full h-full flex flex-col items-center justify-center border-dashed border-2 bg-white/40 backdrop-blur-md min-h-[300px] shadow-glass hover:shadow-lg transition-shadow">
      <CardContent className="flex flex-col items-center text-center p-8">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border border-white/50 ${config[type].bg}`}>
          <Icon className={`w-10 h-10 ${config[type].color}`} />
        </div>
        <h3 className="font-bold text-2xl mb-3 tracking-tight">{title}</h3>
        <p className="text-muted-foreground mb-8 max-w-sm text-base leading-relaxed">{description}</p>
        {actionText && (
          <Button onClick={onAction} variant={type === 'error' ? 'destructive' : 'default'} size="lg" className="rounded-full px-8 shadow-md">
            {actionText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}