'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getChartData, StockQuote } from '@/lib/stockMock';

interface MarketOverviewCardProps {
  quote: StockQuote;
}

export default function MarketOverviewCard({ quote }: MarketOverviewCardProps) {
  const isBullish = quote.changePercent >= 0;

  // Generate 1D sparkline data
  const sparklineData = useMemo(() => {
    try {
      const data = getChartData(quote.symbol, '1D');
      // Downsample to 15 points for visual performance
      const downsampled = [];
      const step = Math.max(1, Math.floor(data.length / 15));
      for (let i = 0; i < data.length; i += step) {
        downsampled.push({ value: data[i].close });
      }
      return downsampled;
    } catch {
      return Array.from({ length: 15 }, (_, i) => ({ value: quote.price + Math.sin(i) * 2 }));
    }
  }, [quote.symbol, quote.price]);

  return (
    <Link href={`/stock/${quote.symbol}`} className="block">
      <Card className="hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group bg-panel border-border/80 relative">
        {/* Glow effect on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none ${
          isBullish ? 'bg-orange-500' : 'bg-rose-500'
        }`} />

        <CardContent className="p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground tracking-wider font-mono">{quote.symbol}</p>
            <h4 className="text-sm font-bold truncate max-w-[120px] text-foreground">{quote.name}</h4>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold font-mono tracking-tight text-foreground">
                ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className={`flex items-center text-xs font-bold gap-0.5 ${
              isBullish ? 'text-[#F4511E]' : 'text-rose-500'
            }`}>
              {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isBullish ? '+' : ''}{quote.changePercent.toFixed(2)}%</span>
            </div>
          </div>

          {/* Sparkline chart */}
          <div className="w-24 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`grad-${quote.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="0%" 
                      stopColor={isBullish ? 'var(--bullish)' : 'var(--bearish)'} 
                      stopOpacity={0.2} 
                    />
                    <stop 
                      offset="100%" 
                      stopColor={isBullish ? 'var(--bullish)' : 'var(--bearish)'} 
                      stopOpacity={0.0} 
                    />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={isBullish ? 'var(--bullish)' : 'var(--bearish)'}
                  strokeWidth={1.5}
                  fill={`url(#grad-${quote.symbol})`}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
