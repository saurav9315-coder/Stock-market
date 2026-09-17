'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Volume2, 
  Flame,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockQuote } from '@/lib/stockMock';

interface RealTimeMarketPanelProps {
  isLoading?: boolean;
  feeds: {
    trending: StockQuote[];
    mostActive: StockQuote[];
    movers: {
      gainers: StockQuote[];
      losers: StockQuote[];
    };
  };
  onSelectStock: (symbol: string) => void;
}

export default function RealTimeMarketPanel({
  isLoading = false,
  feeds,
  onSelectStock
}: RealTimeMarketPanelProps) {
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers'>('gainers');

  if (isLoading) {
    return (
      <div className="w-full space-y-4 animate-pulse font-mono text-xs">
        <div className="h-6 w-32 bg-muted rounded mb-3" />
        <div className="h-20 bg-muted rounded-xl w-full" />
        <div className="h-28 bg-muted rounded-xl w-full" />
      </div>
    );
  }

  const renderMoversList = () => {
    const list = moversTab === 'gainers' ? feeds.movers.gainers : feeds.movers.losers;
    return (
      <div className="space-y-2 mt-2">
        {list.map((stock) => {
          const isGainer = stock.changePercent >= 0;
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="flex items-center justify-between p-2 rounded hover:bg-secondary/45 border border-transparent hover:border-border/30 transition-all cursor-pointer font-mono text-[10px]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground">{stock.symbol}</span>
                <span className="text-[8px] text-muted-foreground truncate max-w-[80px] font-sans">{stock.name}</span>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="font-extrabold text-foreground">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className={cn(
                  "font-bold px-1 rounded text-[8px]",
                  isGainer ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                )}>
                  {isGainer ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 w-full select-none">
      
      {/* Live Market Status */}
      <div className="bg-panel/40 border border-border/50 rounded-xl p-3.5 space-y-2 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
          <span className="font-bold text-muted-foreground uppercase tracking-wider">Market Status</span>
          <div className="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>NYSE OPEN</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Active connections:</span>
          <span className="font-bold text-foreground flex items-center gap-0.5"><Zap className="w-3 h-3 text-amber-500 animate-pulse" /> 1 WebSocket</span>
        </div>
      </div>

      {/* Trending Section */}
      <div className="space-y-2 font-mono text-xs">
        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 border-b border-border/20 pb-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-500" /> Trending Assets
        </h4>
        <div className="space-y-1.5">
          {feeds.trending.map((stock) => {
            const isGainer = stock.changePercent >= 0;
            return (
              <div
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between p-2 rounded-lg bg-panel/30 border border-border/40 hover:bg-secondary/40 transition-colors cursor-pointer"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground text-[11px]">{stock.symbol}</span>
                  <span className="text-[9px] text-muted-foreground truncate max-w-[90px] font-sans">{stock.name}</span>
                </div>
                <div className="text-right flex flex-col items-end gap-0.5">
                  <span className="font-extrabold text-foreground">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className={cn(
                    "text-[8px] font-bold px-1 rounded",
                    isGainer ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                  )}>
                    {isGainer ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Movers Tabs */}
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
          <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-primary" /> Daily Movers
          </h4>
          <div className="flex bg-secondary/80 p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setMoversTab('gainers')}
              className={cn(
                "px-2 py-0.5 text-[8px] font-bold rounded cursor-pointer transition-colors",
                moversTab === 'gainers' ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Gainers
            </button>
            <button
              onClick={() => setMoversTab('losers')}
              className={cn(
                "px-2 py-0.5 text-[8px] font-bold rounded cursor-pointer transition-colors",
                moversTab === 'losers' ? "bg-rose-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Losers
            </button>
          </div>
        </div>
        {renderMoversList()}
      </div>

      {/* Volume Leaders */}
      <div className="space-y-2 font-mono text-xs">
        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 border-b border-border/20 pb-1.5">
          <Volume2 className="w-3.5 h-3.5 text-primary" /> Volume Leaders
        </h4>
        <div className="space-y-1.5">
          {feeds.mostActive.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock.symbol)}
              className="flex items-center justify-between p-2 rounded-lg bg-panel/30 border border-border/40 hover:bg-secondary/40 transition-colors cursor-pointer text-[10px]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-foreground">{stock.symbol}</span>
                <span className="text-[8px] text-muted-foreground truncate max-w-[90px] font-sans">{stock.name}</span>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5">
                <span className="font-extrabold text-foreground">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-[8px] text-muted-foreground font-sans">Vol: {(stock.volume / 1e6).toFixed(1)}M</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
