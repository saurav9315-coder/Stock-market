'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Award, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformerItem {
  symbol: string;
  name: string;
  gain: number;
  gainPct: number;
}

interface TopPerformersProps {
  isLoading?: boolean;
  performers: {
    best: PerformerItem[];
    worst: PerformerItem[];
  };
}

export default function TopPerformers({
  isLoading = false,
  performers
}: TopPerformersProps) {
  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[250px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  const renderList = (list: PerformerItem[], isBest: boolean) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground text-xs font-mono">
          No holdings positions active.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((item) => {
          const gainVal = item.gain;
          const pctVal = item.gainPct;
          const isPositive = gainVal >= 0;

          return (
            <div 
              key={item.symbol} 
              className={cn(
                "flex items-center justify-between p-2.5 rounded-lg border font-mono text-xs transition-colors",
                isBest 
                  ? "bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/20" 
                  : "bg-rose-500/5 border-rose-500/10 hover:border-rose-500/20"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground">{item.symbol}</span>
                <span className="text-[10px] text-muted-foreground font-sans truncate max-w-[120px]">{item.name}</span>
              </div>

              <div className="text-right flex flex-col items-end gap-0.5">
                <span className={cn(
                  "font-bold",
                  isPositive ? "text-emerald-500" : "text-rose-500"
                )}>
                  {isPositive ? '+' : ''}${gainVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={cn(
                  "text-[9px] font-bold px-1 rounded flex items-center gap-0.5",
                  isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {isPositive ? '+' : ''}{pctVal.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Award className="w-4 h-4 text-primary" /> Holding Outperformers & Underperformers
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Best Performers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-emerald-500 flex items-center gap-1 font-mono">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> TOP LEADERS (ROI)
            </h4>
            {renderList(performers.best, true)}
          </div>

          {/* Worst Performers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-rose-500 flex items-center gap-1 font-mono">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> LEADERBOARD LAGGARDS
            </h4>
            {renderList(performers.worst, false)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
