'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function OfflinePage() {
  const handleCheckConnection = () => {
    if (typeof window !== 'undefined') {
      if (navigator.onLine) {
        window.location.reload();
      } else {
        // Show indicator
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2 rounded-lg font-mono shadow-md z-50';
        notification.innerText = 'Offline Mode Active: Local sockets closed.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2500);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-6 text-center select-none font-mono text-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-panel border border-border/60 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600" />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <WifiOff className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
            CONNECTION OFFLINE
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">Platform Sockets Closed</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your client has disconnected from remote high-frequency pricing servers. Running in cached database sandbox mode.
          </p>
        </div>

        <button
          onClick={handleCheckConnection}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          RETRY CONNECTION
        </button>
      </motion.div>
    </div>
  );
}
