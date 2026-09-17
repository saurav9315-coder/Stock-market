'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
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
            <ShieldAlert className="w-10 h-10 text-rose-500" />
          </div>
          <span className="text-[10px] font-bold font-mono tracking-widest text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
            HTTP STATUS CODE 404
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">Asset Portal Not Found</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The quantitative routing target you requested does not exist or has been cleared from local sandbox nodes.
          </p>
        </div>

        <div className="border border-border/30 bg-secondary/20 p-3 rounded-lg text-left text-[10px] text-muted-foreground space-y-1 font-mono">
          <div><span className="text-rose-400">ROUTE_MATCH:</span> FAILED</div>
          <div><span className="text-indigo-400">RESOLVER:</span> NULL</div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-lg transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          RETURN TO PLATFORM WORKSPACE
        </Link>
      </motion.div>
    </div>
  );
}
