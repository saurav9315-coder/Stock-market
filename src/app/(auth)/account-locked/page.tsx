'use client';

import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccountLockedPage() {
  const { unlockAccount } = useAuth();

  return (
    <div className="space-y-6 font-sans text-center">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center glow-bearish animate-bounce">
          <ShieldAlert className="w-7 h-7" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Sandbox Locked</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            This workspace sandbox has been locked due to excessive authentication failures or specific override flags (e.g. testing `locked@quant.com`).
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={unlockAccount}
        className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
      >
        <RefreshCw className="w-4 h-4 animate-spin-slow" />
        <span>RESTORE SANDBOX ACCESS</span>
      </button>
    </div>
  );
}
