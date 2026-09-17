'use client';

import React, { useEffect } from 'react';
import { monitor } from '@/lib/monitor';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error through our telemetry infrastructure
    monitor.logError({
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] w-full px-6 text-center select-none font-mono text-foreground">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-panel border border-border/60 rounded-2xl p-8 space-y-6 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-indigo-500 to-emerald-500" />
        
        <div className="flex flex-col items-center space-y-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertCircle className="w-10 h-10 text-rose-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
            HTTP STATUS CODE 500
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">BFF System Interruption</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            An unexpected error occurred in the quantitative execution pipeline. The event has been audited by telemetry.
          </p>
        </div>

        {error.message && (
          <pre className="text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 p-3 rounded text-left overflow-x-auto max-h-32 font-mono leading-relaxed">
            {error.message}
          </pre>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 py-2.5 bg-secondary border border-border hover:bg-secondary/80 text-foreground font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            RETRY PIPELINE
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Home className="w-4 h-4" />
            WORKSPACE HOME
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
