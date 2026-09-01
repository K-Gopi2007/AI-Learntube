"use client";
import React from 'react';

export default function LearnPage() {
  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {/* Mock YouTube Video Player */}
      <div className="w-full h-full relative group">
        <img 
          src="https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop" 
          alt="Video Thumbnail" 
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Mock YouTube UI Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        
        <div className="absolute top-6 left-6 right-6 flex justify-between text-white pointer-events-none">
          <h1 className="text-2xl font-bold text-shadow-md">Advanced Dynamic Programming - Fibonacci and Coin Change</h1>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md" />
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md" />
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-white/30 rounded-full mb-4 overflow-hidden relative cursor-pointer pointer-events-auto hover:h-2 transition-all">
            <div className="absolute top-0 left-0 h-full bg-red-600 w-1/3" />
            <div className="absolute top-0 left-1/3 w-3 h-3 bg-red-600 rounded-full -mt-[3px] shadow" />
          </div>
          
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex gap-6 items-center">
              <div className="w-5 h-5 bg-white/80 rounded-sm" />
              <div className="w-5 h-5 bg-white/80 rounded-sm" />
              <div className="w-5 h-5 bg-white/80 rounded-sm" />
              <span>12:45 / 45:00</span>
            </div>
            <div className="flex gap-6 items-center">
              <div className="w-5 h-5 bg-white/80 rounded-sm" />
              <div className="w-5 h-5 bg-white/80 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Widget will naturally render on top due to Layout */}
    </div>
  );
}