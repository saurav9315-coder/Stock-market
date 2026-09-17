'use client';

import React from 'react';
import { Bell, AlertTriangle, AlertCircle, TrendingUp, CheckCircle, EyeOff } from 'lucide-react';

interface StatsProps {
  activeCount: number;
  triggeredCount: number;
  expiredCount: number;
}

export default function AlertDashboardStats({ activeCount, triggeredCount, expiredCount }: StatsProps) {
  // Sparkline data helpers
  const svgSparklineUp = "M 0 15 Q 10 5, 20 18 T 40 3 T 60 12 T 80 2 T 100 8";
  const svgSparklineDown = "M 0 5 Q 10 15, 20 8 T 40 18 T 60 8 T 80 16 T 100 12";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Active Alerts Card */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary/40 group-hover:bg-primary transition-colors" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">
            Active Alerts
          </span>
          <div className="w-6 h-6 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              {activeCount}
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-semibold block mt-0.5">
              Live updates
            </span>
          </div>
          <svg className="w-16 h-8 text-emerald-500 stroke-2 fill-none" viewBox="0 0 100 20">
            <path d={svgSparklineUp} />
          </svg>
        </div>
      </div>

      {/* 2. Triggered Today */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">
            Triggered Today
          </span>
          <div className="w-6 h-6 rounded bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              {triggeredCount}
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-semibold block mt-0.5">
              +14% vs yesterday
            </span>
          </div>
          <svg className="w-16 h-8 text-emerald-500 stroke-2 fill-none" viewBox="0 0 100 20">
            <path d={svgSparklineUp} />
          </svg>
        </div>
      </div>

      {/* 3. Expired Alerts */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-rose-500/40 group-hover:bg-rose-500 transition-colors" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">
            Expired Alarms
          </span>
          <div className="w-6 h-6 rounded bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <EyeOff className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              {expiredCount}
            </span>
            <span className="text-[9px] font-mono text-rose-500 font-semibold block mt-0.5">
              Expired naturally
            </span>
          </div>
          <svg className="w-16 h-8 text-rose-500 stroke-2 fill-none" viewBox="0 0 100 20">
            <path d={svgSparklineDown} />
          </svg>
        </div>
      </div>

      {/* 4. Alert Success Rate */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 flex flex-col justify-between h-28 relative overflow-hidden group">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-muted-foreground">
            Precision Accuracy
          </span>
          <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <CheckCircle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-end justify-between mt-2">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-foreground leading-none">
              99.2%
            </span>
            <span className="text-[9px] font-mono text-emerald-500 font-semibold block mt-0.5">
              Latencies &lt; 8ms
            </span>
          </div>
          <svg className="w-16 h-8 text-emerald-500 stroke-2 fill-none" viewBox="0 0 100 20">
            <path d={svgSparklineUp} />
          </svg>
        </div>
      </div>
    </div>
  );
}
