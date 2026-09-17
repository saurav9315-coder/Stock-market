'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TickerItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'Index' | 'Commodity' | 'Forex' | 'Crypto';
}

const INITIAL_TICKERS: TickerItem[] = [
  { symbol: 'NIFTY50', name: 'Nifty 50', price: 22450.60, change: 110.45, changePercent: 0.49, type: 'Index' },
  { symbol: 'SENSEX', name: 'Sensex', price: 73900.20, change: 350.15, changePercent: 0.48, type: 'Index' },
  { symbol: 'NASDAQ', name: 'NASDAQ Composite', price: 16180.50, change: 180.45, changePercent: 1.13, type: 'Index' },
  { symbol: 'DOWJONES', name: 'Dow Jones', price: 38920.10, change: -45.60, changePercent: -0.12, type: 'Index' },
  { symbol: 'SPX', name: 'S&P 500', price: 5120.30, change: 35.20, changePercent: 0.69, type: 'Index' },
  { symbol: 'GOLD', name: 'Gold Spot', price: 2330.40, change: 14.50, changePercent: 0.62, type: 'Commodity' },
  { symbol: 'SILVER', name: 'Silver Spot', price: 29.15, change: 0.45, changePercent: 1.57, type: 'Commodity' },
  { symbol: 'CRUDE', name: 'Crude Oil WTI', price: 81.50, change: -0.85, changePercent: -1.03, type: 'Commodity' },
  { symbol: 'USDINR', name: 'USD/INR', price: 83.45, change: 0.05, changePercent: 0.06, type: 'Forex' },
  { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0852, change: -0.0015, changePercent: -0.14, type: 'Forex' },
  { symbol: 'BTC', name: 'Bitcoin', price: 64820.00, change: 1250.00, changePercent: 1.97, type: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', price: 3420.50, change: -65.20, changePercent: -1.87, type: 'Crypto' }
];

export default function MarketTickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>(INITIAL_TICKERS);
  const [tickerFlash, setTickerFlash] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) => {
        const flashes: Record<string, 'up' | 'down' | null> = {};
        const next = prev.map((item) => {
          if (Math.random() > 0.4) return item; // only update some elements

          const scale = item.type === 'Crypto' ? 12.0 : item.type === 'Index' ? 8.0 : 0.08;
          const drift = (Math.random() - 0.5) * scale;
          const newPrice = Math.max(0.0001, item.price + drift);
          flashes[item.symbol] = drift > 0 ? 'up' : 'down';

          const newChange = item.change + drift;
          const newPct = (newChange / (newPrice - newChange)) * 100;

          return {
            ...item,
            price: Number(newPrice.toFixed(item.type === 'Forex' ? 4 : 2)),
            change: Number(newChange.toFixed(item.type === 'Forex' ? 4 : 2)),
            changePercent: Number(newPct.toFixed(2))
          };
        });

        setTickerFlash(flashes);
        setTimeout(() => setTickerFlash({}), 500);
        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Concatenate tickers list to create a seamless infinite marquee scroll
  const scrollableItems = [...tickers, ...tickers];

  return (
    <div className="w-full bg-[#0B0F14] border-y border-[#1E293B] py-2.5 overflow-hidden flex items-center select-none">
      {/* Infinite Scrolling Container */}
      <div className="flex animate-[marquee_50s_linear_infinite] whitespace-nowrap gap-8 min-w-full">
        {scrollableItems.map((item, idx) => {
          const flash = tickerFlash[item.symbol];
          const isUp = item.changePercent >= 0;
          
          return (
            <div 
              key={`${item.symbol}-${idx}`} 
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border border-transparent font-mono transition-all duration-300 ${
                flash === 'up' 
                  ? 'bg-bullish/10 border-bullish/25 scale-[1.02]' 
                  : flash === 'down' 
                  ? 'bg-bearish/10 border-bearish/25 scale-[1.02]' 
                  : ''
              }`}
            >
              {/* Type Badge */}
              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                item.type === 'Crypto' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                item.type === 'Forex' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                item.type === 'Commodity' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                'bg-muted/40 text-muted-foreground'
              }`}>
                {item.type}
              </span>

              {/* Title */}
              <span className="font-bold text-foreground">{item.name}</span>
              
              {/* Price */}
              <span className="font-bold font-mono">
                {item.type === 'Forex' ? '' : item.type === 'Crypto' || item.type === 'Commodity' ? '$' : ''}
                {item.price.toLocaleString(undefined, { minimumFractionDigits: item.type === 'Forex' ? 4 : 2 })}
              </span>

              {/* Change Indicator */}
              <span className={`flex items-center gap-0.5 font-bold font-mono text-[10px] ${
                isUp ? 'text-bullish' : 'text-bearish'
              }`}>
                {isUp ? <TrendingUp className="w-3 h-3 shrink-0" /> : <TrendingDown className="w-3 h-3 shrink-0" />}
                {isUp ? '+' : ''}{item.changePercent.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
