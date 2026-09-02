"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { Activity } from 'lucide-react';

export default function LearnPage() {
  const searchParams = useSearchParams();
  const videoId = searchParams.get('v') || 'O5nskjZ_GoI';
  
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await api.getVideo(videoId);
      setVideo(data);
      setLoading(false);
    };
    load();
  }, [videoId]);

  if (loading) return <div className="flex justify-center items-center h-64"><Activity className="animate-spin" size={32} /></div>;

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <div className="w-full h-full relative group flex flex-col items-center justify-center">
         <iframe
            width="80%"
            height="80%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between text-white pointer-events-none">
          <h1 className="text-2xl font-bold text-shadow-md">{video?.title}</h1>
        </div>
      </div>
    </div>
  );
}
