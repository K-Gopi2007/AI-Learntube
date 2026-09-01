"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const defaultData = [
  { subject: 'Arrays', A: 90, fullMark: 100 },
  { subject: 'Trees', A: 75, fullMark: 100 },
  { subject: 'Graphs', A: 60, fullMark: 100 },
  { subject: 'DP', A: 45, fullMark: 100 },
  { subject: 'Sorting', A: 85, fullMark: 100 },
  { subject: 'Design', A: 65, fullMark: 100 },
];

export default function TopicRadarChart({ data = defaultData }: { data?: any[] }) {
  return (
    <Card className="bg-white/40 backdrop-blur-md shadow-glass border-white/50">
      <CardHeader>
        <CardTitle>Skill Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip />
              <Radar name="Mastery" dataKey="A" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}