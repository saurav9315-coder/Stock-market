'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Activity, 
  Clock, 
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TradingMetric {
  title: string;
  value: string;
  subtitle: string;
  change?: string;
  isPositive?: boolean;
  type: 'payout' | 'streak' | 'itm' | 'orders' | 'market';
}

interface StatusCardProps {
  metrics: TradingMetric[];
  className?: string;
}

export default function StatusCard({ metrics, className }: StatusCardProps) {
  const getIcon = (type: TradingMetric['type']) => {
    switch (type) {
      case 'payout':
        return TrendingUp;
      case 'streak':
        return Award;
      case 'itm':
        return Target;
      case 'orders':
        return Activity;
      case 'market':
        return Clock;
      default:
        return Zap;
    }
  };

  const getAccentColor = (type: TradingMetric['type']) => {
    switch (type) {
      case 'payout':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'streak':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'itm':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'orders':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'market':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 select-none", className)}>
      {metrics.map((metric, idx) => {
        const Icon = getIcon(metric.type);
        const accentClass = getAccentColor(metric.type);

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative rounded-[16px] bg-[#10161D] border border-[#1E293B] p-3.5 shadow-lg hover:border-[#9FEF00]/40 transition-all cursor-default"
          >
            {/* Subtle glow accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#9FEF00]/5 rounded-full blur-xl pointer-events-none group-hover:bg-[#9FEF00]/10 transition-colors" />

            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider truncate">
                {metric.title}
              </span>
              <div className={cn("p-1.5 rounded-lg border shrink-0 transition-transform group-hover:scale-110", accentClass)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-1">
              <span className="text-lg font-black font-mono tracking-tight text-[#F8FAFC] group-hover:text-[#9FEF00] transition-colors">
                {metric.value}
              </span>
              {metric.change && (
                <span className={cn(
                  "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 shrink-0",
                  metric.isPositive 
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                    : "text-rose-400 bg-rose-500/10 border border-rose-500/20"
                )}>
                  {metric.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {metric.change}
                </span>
              )}
            </div>

            <p className="text-[10px] font-mono text-muted-foreground/70 mt-1 truncate">
              {metric.subtitle}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
