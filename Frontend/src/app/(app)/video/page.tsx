"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Share2, HelpCircle, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/services/api";

export default function VideoLearningPage() {
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
  if (!video) return <div className="text-center p-12 text-slate-500">Video not found in database.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="w-full aspect-video bg-black rounded-xl relative overflow-hidden group shadow-lg flex items-center justify-center">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-2xl font-bold">{video.title || 'Untitled Video'}</h1>
              <Badge variant="secondary">Playing</Badge>
            </div>
            <p className="text-muted-foreground">Watch the video and generate notes when you are ready to study.</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.href = `/notes?v=${videoId}`}><BookOpen className="w-4 h-4 mr-2" /> View Notes</Button>
            <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Generate Flashcards</Button>
            <Button className="ml-auto" onClick={() => window.location.href = `/mock-test?v=${videoId}`}>Take Mock Test <HelpCircle className="w-4 h-4 ml-2" /></Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Real-time Activity
              </h3>
              <p className="text-sm text-muted-foreground">Interact with the video to capture learning history securely into the database.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-indigo-500">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Teach it back?</h4>
                <p className="text-sm text-muted-foreground mb-4">Validate your understanding via the Teach-Back framework.</p>
                <Button className="w-full" onClick={() => window.location.href = `/teach-back?v=${videoId}`}>Start Teach-Back</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
