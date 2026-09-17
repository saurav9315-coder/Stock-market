'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { Activity, Percent, TrendingUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioPerformanceProps {
  isLoading?: boolean;
  getHistoricalPerformance: (range: string) => { name: string; Portfolio: number; Benchmark: number }[];
}

const RANGES = ['1D', '1W', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

export default function PortfolioPerformance({
  isLoading = false,
  getHistoricalPerformance
}: PortfolioPerformanceProps) {
  const [selectedRange, setSelectedRange] = useState('1M');

  // Fetch chart data based on active range selection
  const chartData = useMemo(() => {
    return getHistoricalPerformance(selectedRange);
  }, [selectedRange, getHistoricalPerformance]);

  // Compute stats for range
  const performanceStats = useMemo(() => {
    if (chartData.length < 2) return { returnPort: 0, returnBench: 0, difference: 0 };
    const firstPort = chartData[0].Portfolio;
    const lastPort = chartData[chartData.length - 1].Portfolio;
    const firstBench = chartData[0].Benchmark;
    const lastBench = chartData[chartData.length - 1].Benchmark;

    const returnPort = ((lastPort - firstPort) / firstPort) * 100;
    const returnBench = ((lastBench - firstBench) / firstBench) * 100;

    return {
      returnPort,
      returnBench,
      difference: returnPort - returnBench,
    };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[400px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="space-y-4 text-center">
            <Activity className="w-10 h-10 mx-auto text-muted animate-spin" />
            <div className="h-4 w-40 bg-muted rounded mx-auto" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm">
      <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" /> Net Valuations vs S&P 500 Benchmark
          </CardTitle>
          <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
            <span>Portfolio: 
              <span className={cn("ml-1 font-bold", performanceStats.returnPort >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {performanceStats.returnPort >= 0 ? '+' : ''}{performanceStats.returnPort.toFixed(2)}%
              </span>
            </span>
            <span>Benchmark: 
              <span className={cn("ml-1 font-bold", performanceStats.returnBench >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {performanceStats.returnBench >= 0 ? '+' : ''}{performanceStats.returnBench.toFixed(2)}%
              </span>
            </span>
            <span>Alpha Spread: 
              <span className={cn("ml-1 font-bold", performanceStats.difference >= 0 ? "text-emerald-500" : "text-rose-500")}>
                {performanceStats.difference >= 0 ? '+' : ''}{performanceStats.difference.toFixed(2)}%
              </span>
            </span>
          </div>
        </div>

        {/* Range Selector Filter */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-lg border border-border">
          {RANGES.map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-colors",
                selectedRange === range 
                  ? "bg-primary text-primary-foreground shadow" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--muted-foreground)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="var(--muted-foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.35} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `$${Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--popover)', 
                  borderColor: 'var(--border)', 
                  borderRadius: '10px',
                  color: 'var(--foreground)',
                  fontFamily: 'var(--font-geist-mono)',
                  fontSize: '11px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(value, name) => [`$${Number(value).toLocaleString()}`, name]}
              />
              <Legend 
                verticalAlign="top" 
                height={32} 
                iconType="circle"
                wrapperStyle={{ 
                  fontSize: '11px', 
                  fontFamily: 'var(--font-geist-mono)',
                  paddingBottom: '10px'
                }} 
              />
              <Area 
                type="monotone" 
                name="My Portfolio" 
                dataKey="Portfolio" 
                stroke="var(--primary)" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPortfolio)" 
                activeDot={{ r: 6 }}
              />
              <Area 
                type="monotone" 
                name="S&P 500 (SPY)" 
                dataKey="Benchmark" 
                stroke="var(--muted-foreground)" 
                strokeDasharray="4 4"
                strokeWidth={1.5} 
                fillOpacity={0.5} 
                fill="url(#colorBenchmark)" 
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1.5 justify-end text-[10px] text-muted-foreground font-mono mt-4">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Interactive timeline values simulated based on asset pricing walks. Zoom & scroll via ranges.</span>
        </div>
      </CardContent>
    </Card>
  );
}
