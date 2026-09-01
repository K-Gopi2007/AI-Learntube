import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white/40 backdrop-blur-md"><CardContent className="p-6 h-40"><Skeleton className="w-full h-full" /></CardContent></Card>
        <Card className="bg-white/40 backdrop-blur-md"><CardContent className="p-6 h-40"><Skeleton className="w-full h-full" /></CardContent></Card>
        <Card className="bg-white/40 backdrop-blur-md"><CardContent className="p-6 h-40"><Skeleton className="w-full h-full" /></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/40 backdrop-blur-md"><CardContent className="p-6 h-80"><Skeleton className="w-full h-full" /></CardContent></Card>
        <Card className="bg-white/40 backdrop-blur-md"><CardContent className="p-6 h-80"><Skeleton className="w-full h-full" /></CardContent></Card>
      </div>
    </div>
  );
}