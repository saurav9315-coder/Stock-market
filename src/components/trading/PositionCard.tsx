'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, X, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface OpenPosition {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
  time: string;
}

interface PositionCardProps {
  positions: OpenPosition[];
  onClosePosition: (id: string) => void;
  className?: string;
}

export default function PositionCard({ positions, onClosePosition, className }: PositionCardProps) {
  return (
    <div className={cn("bg-[#070912]/95 rounded-2xl border border-border/80 p-4 shadow-2xl backdrop-blur-md font-mono select-none space-y-3", className)}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F4511E] animate-pulse shadow-[0_0_6px_#F4511E]" />
          <h3 className="font-extrabold text-xs text-foreground tracking-wider uppercase">ACTIVE OPEN POSITIONS ({positions.length})</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">REAL-TIME P&L SYNC</span>
      </div>

      {/* Positions List */}
      {positions.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground/70">
          No open positions active. Use the Trade Panel to open a Demo or Live position.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          <AnimatePresence>
            {positions.map((pos) => {
              const isBuy = pos.type === 'BUY';
              const isProfit = pos.pnl >= 0;

              return (
                <motion.div
                  key={pos.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-12 items-center p-2.5 rounded-xl bg-[#05070E] border border-border/60 hover:border-blue-500/30 transition-all text-xs"
                >
                  {/* Asset & Type */}
                  <div className="col-span-4 flex items-center gap-2">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded font-extrabold text-[10px]",
                      isBuy ? "bg-[#F4511E]/20 text-[#F4511E] border border-[#F4511E]/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    )}>
                      {pos.type}
                    </span>
                    <div>
                      <div className="font-bold text-foreground">{pos.symbol}</div>
                      <div className="text-[9px] text-muted-foreground">{pos.leverage}x • ${pos.amount}</div>
                    </div>
                  </div>

                  {/* Prices */}
                  <div className="col-span-3 text-right text-[11px]">
                    <div className="text-muted-foreground">Entry: ${pos.entryPrice.toFixed(2)}</div>
                    <div className="font-bold text-foreground">Cur: ${pos.currentPrice.toFixed(2)}</div>
                  </div>

                  {/* P&L */}
                  <div className="col-span-3 text-right">
                    <div className={cn("font-extrabold text-xs flex items-center justify-end gap-0.5", isProfit ? "text-[#F4511E]" : "text-rose-400")}>
                      {isProfit ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{isProfit ? '+' : ''}${pos.pnl.toFixed(2)}</span>
                    </div>
                    <div className={cn("text-[9px] font-bold", isProfit ? "text-[#F4511E]" : "text-rose-500")}>
                      {isProfit ? '+' : ''}{pos.pnlPercent.toFixed(2)}%
                    </div>
                  </div>

                  {/* Close Action */}
                  <div className="col-span-2 text-right">
                    <button
                      type="button"
                      onClick={() => onClosePosition(pos.id)}
                      className="px-2 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
