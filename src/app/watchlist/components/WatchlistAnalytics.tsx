'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { Activity, ShieldAlert, Award, Grid, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];

interface Performer {
  symbol: string;
  name: string;
  change: number;
}

interface WatchlistAnalyticsProps {
  isLoading?: boolean;
  analytics: {
    avgGain: number;
    avgLoss: number;
    bestPerformer: Performer | null;
    worstPerformer: Performer | null;
    volatilityScore: number;
  };
  quotes: any[];
}

export default function WatchlistAnalytics({
  isLoading = false,
  analytics,
  quotes
}: WatchlistAnalyticsProps) {
  // Sector allocation calculation
  const sectorData = React.useMemo(() => {
    const sectors: Record<string, number> = {};
    quotes.forEach((q) => {
      sectors[q.sector || 'Technology'] = (sectors[q.sector || 'Technology'] || 0) + 1;
    });

    return Object.keys(sectors).map((name) => ({
      name,
      value: Number(((sectors[name] / quotes.length) * 100).toFixed(1)),
      count: sectors[name]
    }));
  }, [quotes]);

  // Market cap distribution calculation
  const capData = React.useMemo(() => {
    let mega = 0;
    let large = 0;
    let mid = 0;

    quotes.forEach((q) => {
      if (q.marketCap >= 200e9) mega++;
      else if (q.marketCap >= 10e9) large++;
      else mid++;
    });

    return [
      { name: 'Mega Cap (>200B)', value: mega },
      { name: 'Large Cap (10B-200B)', value: large },
      { name: 'Mid/Small Cap (<10B)', value: mid }
    ].filter(d => d.value > 0);
  }, [quotes]);

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[300px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Activity className="w-4 h-4 text-primary" /> Active Watchlist Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
          
          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Avg Daily Gain</span>
            <p className="text-base font-extrabold text-emerald-500">+{analytics.avgGain}%</p>
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Avg Daily Loss</span>
            <p className="text-base font-extrabold text-rose-500">{analytics.avgLoss}%</p>
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 truncate">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Top Leader</span>
            {analytics.bestPerformer ? (
              <div className="flex flex-col gap-0.5 mt-0.5">
                <span className="font-extrabold text-foreground">{analytics.bestPerformer.symbol}</span>
                <span className="text-[9px] text-emerald-500 font-bold">+{analytics.bestPerformer.change.toFixed(1)}%</span>
              </div>
            ) : <span className="text-muted-foreground block mt-1">—</span>}
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 truncate">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Top Laggard</span>
            {analytics.worstPerformer ? (
              <div className="flex flex-col gap-0.5 mt-0.5">
                <span className="font-extrabold text-foreground">{analytics.worstPerformer.symbol}</span>
                <span className="text-[9px] text-rose-500 font-bold">{analytics.worstPerformer.change.toFixed(1)}%</span>
              </div>
            ) : <span className="text-muted-foreground block mt-1">—</span>}
          </div>

          <div className="bg-secondary/30 border border-border/50 rounded-xl p-3 col-span-2 md:col-span-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Volatility Score</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-base font-black text-foreground">{analytics.volatilityScore}</span>
              <span className={cn(
                "text-[8px] px-1 rounded font-bold uppercase",
                analytics.volatilityScore > 65 ? "bg-rose-500/10 text-rose-500" : analytics.volatilityScore > 35 ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
              )}>
                {analytics.volatilityScore > 65 ? 'High' : analytics.volatilityScore > 35 ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>
          
        </div>

        {/* Charts: Sector and Cap allocations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-border/30">
          
          {/* Sector Allocation */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
              <Grid className="w-3.5 h-3.5 text-primary" /> Sector Allocation (%)
            </h4>
            <div className="h-44 w-full bg-secondary/15 rounded-xl border border-border/30 p-2 flex items-center justify-around">
              {sectorData.length === 0 ? (
                <span className="text-muted-foreground">No assets tracking</span>
              ) : (
                <>
                  <div className="w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sectorData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {sectorData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => `${v}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-1/2 space-y-1 max-h-36 overflow-y-auto pr-1 scrollbar-thin text-[10px]">
                    {sectorData.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between border-b border-border/10 pb-0.5">
                        <div className="flex items-center gap-1 min-w-0">
                          <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="truncate max-w-[80px]">{item.name}</span>
                        </div>
                        <span className="font-bold text-primary">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Market Cap allocation */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-primary" /> Cap Size Distributions
            </h4>
            <div className="h-44 w-full bg-secondary/15 rounded-xl border border-border/30 p-2">
              {capData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">No assets tracking</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={8} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={8} tickLine={false} axisLine={false} width={80} />
                    <Tooltip formatter={(value) => [`${value} Ticker(s)`, 'Count']} />
                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 3, 3, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
