'use client';

import React, { useState, useEffect } from 'react';
import { getStockQuote } from '@/lib/stockMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectorPerformance {
  name: string;
  change: number;
  weight: string;
  leadingTicker: string;
}

const getSectorData = (): SectorPerformance[] => {
  const aapl = getStockQuote('AAPL');
  const msft = getStockQuote('MSFT');
  const nvda = getStockQuote('NVDA');
  const tsla = getStockQuote('TSLA');
  const amzn = getStockQuote('AMZN');
  const googl = getStockQuote('GOOGL');

  const techAvg = (aapl.changePercent + msft.changePercent) / 2;

  return [
    { name: 'Technology', change: techAvg, weight: '28.2%', leadingTicker: 'MSFT' },
    { name: 'Semiconductors', change: nvda.changePercent, weight: '10.5%', leadingTicker: 'NVDA' },
    { name: 'E-Commerce / Consumer', change: amzn.changePercent, weight: '12.4%', leadingTicker: 'AMZN' },
    { name: 'Automotive / EV', change: tsla.changePercent, weight: '4.8%', leadingTicker: 'TSLA' },
    { name: 'Communications / Ads', change: googl.changePercent, weight: '8.9%', leadingTicker: 'GOOGL' },
    { name: 'Financials / Real Estate', change: (Math.random() - 0.45) * 1.5, weight: '13.1%', leadingTicker: 'V' },
    { name: 'Energy / Utilities', change: (Math.random() - 0.52) * 1.8, weight: '6.2%', leadingTicker: 'XOM' },
    { name: 'Healthcare / Bio', change: (Math.random() - 0.48) * 0.9, weight: '15.9%', leadingTicker: 'LLY' },
  ];
};

export default function SectorHeatmap() {
  const [sectors, setSectors] = useState<SectorPerformance[]>(getSectorData);

  useEffect(() => {
    const interval = setInterval(() => {
      setSectors(getSectorData());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-panel border-border/80 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          Sector Performance Heatmap
        </CardTitle>
        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
          <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" /> Real-time weights
        </span>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sectors.map((sector) => {
            const isBullish = sector.change >= 0;
            const absVal = Math.min(Math.abs(sector.change), 3);
            const intensity = 0.05 + (absVal / 3) * 0.18;
            
            const bgColor = isBullish 
              ? `oklch(var(--bullish) / ${intensity})` 
              : `oklch(var(--bearish) / ${intensity})`;
            const borderColor = isBullish
              ? `oklch(var(--bullish) / 0.3)`
              : `oklch(var(--bearish) / 0.3)`;
            const textColor = isBullish ? 'text-[#FF7043]' : 'text-rose-400';

            return (
              <motion.div
                key={sector.name}
                layout
                style={{ backgroundColor: bgColor, borderColor: borderColor }}
                className="p-3 rounded-lg border flex flex-col justify-between h-24 transition-all duration-300 relative group overflow-hidden"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                      {sector.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {sector.weight}
                    </span>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-foreground/5 border border-border/40 font-mono font-medium text-muted-foreground mt-1 inline-block">
                    Lead: {sector.leadingTicker}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2">
                  <span className={`text-sm font-bold font-mono ${textColor}`}>
                    {isBullish ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                  {isBullish ? (
                    <TrendingUp className="w-3.5 h-3.5 text-[#F4511E]" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-500/80" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
