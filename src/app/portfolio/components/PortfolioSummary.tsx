'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  Percent, 
  Grid, 
  Calendar,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn } from '@/lib/utils';

// Helper for skeleton placeholder
function KPICardSkeleton() {
  return (
    <Card className="bg-panel border-border/80 animate-pulse">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 bg-muted rounded" />
          <div className="h-6 w-6 bg-muted rounded-full" />
        </div>
        <div className="h-6 w-32 bg-muted rounded" />
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-muted rounded" />
          <div className="h-5 w-16 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

interface PortfolioSummaryProps {
  isLoading?: boolean;
  metrics: {
    netAssetValue: number;
    unrealizedPnL: number;
    realizedPnL: number;
    dailyChangeValue: number;
    dailyChangePercent: number;
    totalReturnPercent: number;
  };
  analytics: {
    riskScore: number;
    diversificationScore: number;
  };
}

export default function PortfolioSummary({ isLoading = false, metrics, analytics }: PortfolioSummaryProps) {
  // Sparkline data generators
  const generateSparklineData = (trend: 'up' | 'down' | 'flat', baseValue: number) => {
    const data = [];
    let val = baseValue * 0.95;
    for (let i = 0; i < 8; i++) {
      // Deterministic factor between 0 and 1 based on sine wave
      const factor = Math.abs(Math.sin((i + 1) * 357.2 + baseValue));
      const step = trend === 'up' 
        ? (factor - 0.3) * 0.015 * val
        : trend === 'down'
        ? (factor - 0.7) * 0.015 * val
        : (factor - 0.5) * 0.01 * val;
      val += step;
      data.push({ val });
    }
    return data;
  };

  const navSparkline = React.useMemo(() => generateSparklineData('up', metrics.netAssetValue), [metrics.netAssetValue]);
  const unrealizedSparkline = React.useMemo(() => generateSparklineData(metrics.unrealizedPnL >= 0 ? 'up' : 'down', Math.abs(metrics.unrealizedPnL)), [metrics.unrealizedPnL]);
  const realizedSparkline = React.useMemo(() => generateSparklineData('up', metrics.realizedPnL), [metrics.realizedPnL]);
  const dailySparkline = React.useMemo(() => generateSparklineData(metrics.dailyChangeValue >= 0 ? 'up' : 'down', Math.abs(metrics.dailyChangeValue)), [metrics.dailyChangeValue]);
  const monthlySparkline = React.useMemo(() => generateSparklineData('up', 1420), []);
  const annualSparkline = React.useMemo(() => generateSparklineData('up', 8400), []);
  const riskSparkline = React.useMemo(() => generateSparklineData('flat', analytics.riskScore), [analytics.riskScore]);
  const divSparkline = React.useMemo(() => generateSparklineData('flat', analytics.diversificationScore), [analytics.diversificationScore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <KPICardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: 'Net Asset Value',
      value: `$${metrics.netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-primary',
      badgeText: `+${metrics.totalReturnPercent.toFixed(1)}% Tot.`,
      badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      sparkData: navSparkline,
      sparkColor: 'var(--primary)',
    },
    {
      title: 'Unrealized P&L',
      value: `${metrics.unrealizedPnL >= 0 ? '+' : ''}$${metrics.unrealizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Activity,
      color: metrics.unrealizedPnL >= 0 ? 'text-emerald-500' : 'text-rose-500',
      badgeText: metrics.unrealizedPnL >= 0 ? 'Profitable' : 'Loss',
      badgeColor: metrics.unrealizedPnL >= 0 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      sparkData: unrealizedSparkline,
      sparkColor: metrics.unrealizedPnL >= 0 ? '#10B981' : '#EF4444',
    },
    {
      title: 'Realized Profit/Loss',
      value: `$${metrics.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: ShieldCheck,
      color: 'text-blue-500',
      badgeText: 'Closed positions',
      badgeColor: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
      sparkData: realizedSparkline,
      sparkColor: '#3B82F6',
    },
    {
      title: 'Daily Change',
      value: `${metrics.dailyChangeValue >= 0 ? '+' : ''}$${metrics.dailyChangeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Percent,
      color: metrics.dailyChangeValue >= 0 ? 'text-emerald-500' : 'text-rose-500',
      badgeText: `${metrics.dailyChangeValue >= 0 ? '+' : ''}${metrics.dailyChangePercent.toFixed(2)}%`,
      badgeColor: metrics.dailyChangeValue >= 0 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      sparkData: dailySparkline,
      sparkColor: metrics.dailyChangeValue >= 0 ? '#10B981' : '#EF4444',
    },
    {
      title: 'Monthly Return',
      value: '+5.42%',
      icon: Calendar,
      color: 'text-indigo-500',
      badgeText: 'vs SPY (+4.1%)',
      badgeColor: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
      sparkData: monthlySparkline,
      sparkColor: '#6366F1',
    },
    {
      title: 'Annual Return',
      value: '+18.75%',
      icon: Calendar,
      color: 'text-violet-500',
      badgeText: 'Outperforming',
      badgeColor: 'bg-violet-500/10 text-violet-500 border border-violet-500/20',
      sparkData: annualSparkline,
      sparkColor: '#8B5CF6',
    },
    {
      title: 'Volatility Risk Score',
      value: `${analytics.riskScore} / 100`,
      icon: Layers,
      color: analytics.riskScore > 65 ? 'text-rose-500' : analytics.riskScore > 35 ? 'text-amber-500' : 'text-emerald-500',
      badgeText: analytics.riskScore > 65 ? 'High Risk' : analytics.riskScore > 35 ? 'Moderate' : 'Low Risk',
      badgeColor: analytics.riskScore > 65 
        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
        : analytics.riskScore > 35 
        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      sparkData: riskSparkline,
      sparkColor: analytics.riskScore > 65 ? '#EF4444' : analytics.riskScore > 35 ? '#F59E0B' : '#10B981',
    },
    {
      title: 'Diversification HHI',
      value: `${analytics.diversificationScore} / 100`,
      icon: Grid,
      color: analytics.diversificationScore >= 70 ? 'text-emerald-500' : analytics.diversificationScore >= 45 ? 'text-amber-500' : 'text-rose-500',
      badgeText: analytics.diversificationScore >= 70 ? 'Optimized' : analytics.diversificationScore >= 45 ? 'Adequate' : 'Concentrated',
      badgeColor: analytics.diversificationScore >= 70 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
        : analytics.diversificationScore >= 45 
        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
      sparkData: divSparkline,
      sparkColor: analytics.diversificationScore >= 70 ? '#10B981' : analytics.diversificationScore >= 45 ? '#F59E0B' : '#EF4444',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-mono">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.title} className="bg-panel border-border/85 hover:border-primary/45 transition-colors overflow-hidden group shadow-sm">
            <CardContent className="p-3 sm:p-4 flex flex-col justify-between h-full space-y-2 sm:space-y-3 relative">
              {/* Header block */}
              <div className="flex items-center justify-between">
                <span className="text-[8px] sm:text-[10px] uppercase font-bold text-muted-foreground tracking-wider truncate mr-2">
                  {kpi.title}
                </span>
                <div className={cn("p-1 sm:p-1.5 rounded-lg bg-secondary/80 border border-border group-hover:bg-secondary transition-colors hidden sm:block", kpi.color)}>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
              </div>

              {/* Value and Sparkline block */}
              <div className="flex items-end justify-between gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground tracking-tight select-all truncate">
                  {kpi.value}
                </h3>
                {/* Recharts Sparkline */}
                <div className="h-6 sm:h-8 w-12 sm:w-20 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.sparkData}>
                      <Line 
                        type="monotone" 
                        dataKey="val" 
                        stroke={kpi.sparkColor} 
                        strokeWidth={1.8} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Footer status badge */}
              <div className="flex items-center justify-start">
                <span className={cn(
                  "text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full",
                  kpi.badgeColor
                )}>
                  {kpi.badgeText}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
