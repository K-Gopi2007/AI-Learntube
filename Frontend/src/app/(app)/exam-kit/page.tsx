"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, Clock, AlertTriangle } from "lucide-react";

const topicData = [
  { name: 'Arrays', value: 30 },
  { name: 'Trees', value: 20 },
  { name: 'Graphs', value: 10 },
  { name: 'Dynamic Programming', value: 40 },
];
const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'];

export default function ExamKitPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Exam Preparation Kit</h1>
          <p className="text-muted-foreground">Your personalized revision plan based on historical performance.</p>
        </div>
        <Button size="lg">Generate Mock Exam</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Syllabus Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {topicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" /> Weak Topics to Revise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { topic: "Dynamic Programming (Knapsack)", priority: "High", time: "2 hrs" },
              { topic: "Graph Traversal (Dijkstra)", priority: "High", time: "1.5 hrs" },
              { topic: "Tree Rotations (AVL)", priority: "Medium", time: "1 hr" }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                <div>
                  <h4 className="font-semibold">{item.topic}</h4>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Priority: {item.priority}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Est. Time: {item.time}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Start Revision</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}