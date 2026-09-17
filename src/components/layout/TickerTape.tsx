'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getStockQuote } from '@/lib/stockMock';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

const initialIndices = [
  { symbol: 'SPY', name: 'S&P 500' },
  { symbol: 'BTC-USD', name: 'Bitcoin' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'GOOGL', name: 'Google' },
];

export default function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);

  useEffect(() => {
    const fetchTickers = () => {
      const updated = initialIndices.map((ind) => {
        const quote = getStockQuote(ind.symbol);
        return {
          symbol: ind.symbol,
          name: ind.name,
          price: quote.price,
          changePercent: quote.changePercent,
        };
      });
      setTickers(updated);
    };

    fetchTickers();
    const interval = setInterval(fetchTickers, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-9 bg-[#060913] border-b border-border/70 flex items-center overflow-hidden z-10 select-none text-xs">
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border-r border-border/70 text-[10px] font-mono font-bold text-blue-400 shrink-0 uppercase tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#3B82F6] animate-pulse" />
        Live Feed
      </div>
      <div className="ticker-marquee">
        {/* Render twice for seamless loop */}
        <div className="ticker-marquee-inner font-mono text-xs">
          {tickers.map((ticker) => {
            const isBullish = ticker.changePercent >= 0;
            return (
              <div 
                key={ticker.symbol} 
                className="flex items-center gap-2 px-5 py-1 border-r border-border/30 shrink-0 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-foreground">{ticker.name}</span>
                <span className="text-[11px] text-muted-foreground font-medium">{ticker.symbol}</span>
                <span className="text-foreground font-bold tabular-nums">${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.2 rounded ${
                  isBullish ? 'bg-[#F4511E]/15 text-[#F4511E] border border-[#F4511E]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                }`}>
                  {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isBullish ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Second identical marquee copy for wrapping */}
        <div className="ticker-marquee-inner font-mono text-xs" aria-hidden="true">
          {tickers.map((ticker) => {
            const isBullish = ticker.changePercent >= 0;
            return (
              <div 
                key={`${ticker.symbol}-dup`} 
                className="flex items-center gap-2 px-5 py-1 border-r border-border/30 shrink-0 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-foreground">{ticker.name}</span>
                <span className="text-[11px] text-muted-foreground font-medium">{ticker.symbol}</span>
                <span className="text-foreground font-bold tabular-nums">${ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className={`flex items-center gap-0.5 font-bold text-[11px] px-1.5 py-0.2 rounded ${
                  isBullish ? 'bg-[#F4511E]/15 text-[#F4511E] border border-[#F4511E]/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                }`}>
                  {isBullish ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isBullish ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
