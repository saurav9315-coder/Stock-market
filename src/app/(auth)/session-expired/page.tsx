'use client';

import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SessionExpiredPage() {
  const { logout } = useAuth();

  const handleReturn = () => {
    // Clear credentials and force redirect to login
    logout();
  };

  return (
    <div className="space-y-6 font-sans text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center glow-bearish animate-pulse">
          <Clock className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Session Expired</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Your JWT credentials or token lifetime boundaries have expired. To secure your simulated assets, security keys have been flushed.
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleReturn}
        className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <span>RE-AUTHENTICATE SECURELY</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
