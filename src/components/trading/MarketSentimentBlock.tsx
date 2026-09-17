'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, Activity, Zap, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockQuote } from '@/lib/stockMock';

interface MarketSentimentBlockProps {
  asset: StockQuote;
  className?: string;
}

export default function MarketSentimentBlock({ asset, className }: MarketSentimentBlockProps) {
  // Calculated sentiment metrics based on asset metrics
  const bullishPct = Math.min(92, Math.max(35, Math.round(asset.roe * 2.5 + asset.beta * 15 + 20)));
  const bearishPct = 100 - bullishPct;
  const isStronglyBullish = bullishPct >= 65;

  return (
    <div className={cn("bg-[#070912]/95 rounded-2xl border border-border/80 p-4 shadow-2xl backdrop-blur-md font-mono select-none space-y-3.5", className)}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <h3 className="font-extrabold text-xs text-foreground tracking-wider uppercase">AI MARKET SENTIMENT ({asset.symbol})</h3>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30">
          NEURAL SIGNAL
        </span>
      </div>

      {/* Bullish vs Bearish Sentiment Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Bullish {bullishPct}%
          </span>
          <span className="text-rose-400">
            Bearish {bearishPct}%
          </span>
        </div>

        {/* Sentiment Progress Bar */}
        <div className="h-2.5 w-full bg-[#05070E] rounded-full overflow-hidden flex border border-border/40">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_#10B981]"
            initial={{ width: 0 }}
            animate={{ width: `${bullishPct}%` }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="h-full bg-gradient-to-r from-rose-500 to-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${bearishPct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* AI Pattern Signal Box */}
      <div className="bg-[#05070E] border border-border/60 rounded-xl p-3 flex items-start gap-3">
        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-foreground flex items-center gap-1.5">
            <span>{isStronglyBullish ? 'Bullish Accumulation Breakout' : 'Neutral Range Consolidation'}</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-secondary text-muted-foreground">94.2% Conf</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Stochastic indicator sweeps trace positive order flow momentum on {asset.symbol}. Resistance ceiling predicted near ${(asset.price * 1.045).toFixed(2)}.
          </p>
        </div>
      </div>
    </div>
  );
}
