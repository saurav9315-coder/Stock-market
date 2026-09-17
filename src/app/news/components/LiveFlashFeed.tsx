'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LiveFlashNews, MOCK_LIVE_FLASH_NEWS, generateNextLiveNews, COMPANY_PROFILES } from '@/lib/newsMock';

interface LiveFlashFeedProps {
  onSymbolClick?: (symbol: string) => void;
}

export default function LiveFlashFeed({ onSymbolClick }: LiveFlashFeedProps) {
  const [newsList, setNewsList] = useState<LiveFlashNews[]>([]);
  const [pulseActive, setPulseActive] = useState(true);
  const [dynamicIndex, setDynamicIndex] = useState(0);

  // Initialize and simulate live feeds
  useEffect(() => {
    setNewsList(MOCK_LIVE_FLASH_NEWS);

    // Live update interval simulation
    const interval = setInterval(() => {
      setNewsList((prev) => {
        const nextItem = generateNextLiveNews(dynamicIndex);
        setDynamicIndex((idx) => idx + 1);
        // Prepend new flash and keep max 12 items
        return [nextItem, ...prev.slice(0, 11)];
      });
      
      // Flash connection dot
      setPulseActive(false);
      setTimeout(() => setPulseActive(true), 200);
    }, 18000); // New item every 18 seconds

    return () => clearInterval(interval);
  }, [dynamicIndex]);

  return (
    <div className="rounded-xl border border-border/80 bg-panel flex flex-col h-[520px] overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            {pulseActive && (
              <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
            )}
          </div>
          <span className="text-xs font-bold text-foreground font-sans tracking-tight">
            Live Intelligence Stream
          </span>
        </div>
        <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.2 rounded-full uppercase">
          Feed Connected
        </span>
      </div>

      {/* Vertical Feed Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {newsList.map((item) => {
            const isBreaking = item.isBreaking;
            const profile = item.symbol ? COMPANY_PROFILES[item.symbol] : null;
            const impactVal = item.impactPercent || 0;
            const impactIsPositive = impactVal >= 0;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 50, height: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`p-3 rounded-lg border text-xs relative overflow-hidden transition-all duration-200 ${
                  isBreaking 
                    ? 'bg-rose-500/5 border-rose-500/25 shadow-sm shadow-rose-500/5' 
                    : 'bg-secondary/25 border-border/60 hover:bg-secondary/40 hover:border-border/90'
                }`}
              >
                {/* Visual marker */}
                <div className={`absolute left-0 top-0 bottom-0 w-[2.5px] ${
                  isBreaking 
                    ? 'bg-rose-500' 
                    : impactVal > 0 
                      ? 'bg-emerald-500' 
                      : impactVal < 0 
                        ? 'bg-rose-500' 
                        : 'bg-muted-foreground/30'
                }`} />

                <div className="flex items-center justify-between gap-2 mb-1 pl-1">
                  <div className="flex items-center gap-1.5">
                    {isBreaking && (
                      <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-white bg-rose-600 px-1 py-0.2 rounded font-mono uppercase animate-pulse">
                        <AlertCircle className="w-2.5 h-2.5" />
                        Breaking
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground font-mono">{item.source}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground/60 font-mono">{item.time}</span>
                </div>

                <p className="text-foreground leading-snug font-sans pl-1 font-semibold">
                  {item.title}
                </p>

                {/* Attached stocks and indicators */}
                {item.symbol && (
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/30 pl-1">
                    <button
                      onClick={() => onSymbolClick?.(item.symbol!)}
                      className="flex items-center gap-1 cursor-pointer hover:opacity-85"
                    >
                      {profile && (
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[8px] font-bold text-white bg-gradient-to-br ${profile.color}`}>
                          {profile.logoText}
                        </div>
                      )}
                      <span className="font-mono text-[9px] text-foreground font-bold hover:underline">
                        {item.symbol}
                      </span>
                    </button>

                    {item.impactPercent !== undefined && (
                      <div className={`flex items-center gap-0.5 text-[9px] font-mono font-bold ${
                        impactIsPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {impactIsPositive ? (
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-rose-500" />
                        )}
                        <span>{impactIsPositive ? '+' : ''}{item.impactPercent}%</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
