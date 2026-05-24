'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function SplashOverlay() {
  const [showSplash, setShowSplash] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!showSplash) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#F4F4F5]">
      {/* Main Content */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        
        {/* Logo */}
        <div className="relative mb-6">
          <img 
            src="/vedaai-logo.png" 
            alt="VedaAI Logo" 
            className="w-24 h-24 object-contain rounded-[22px]"
          />
        </div>

        {/* Brand Text */}
        <h1 className="text-4xl md:text-5xl font-bricolage font-bold text-slate-800 mb-3 tracking-tight flex items-center gap-3">
          VedaAI
        </h1>
        
        <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 text-center max-w-sm px-6 leading-relaxed">
          The intelligent copilot for modern educators.
        </p>

        {/* Loader */}
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
        </div>
      </div>
    </div>
  );
}
