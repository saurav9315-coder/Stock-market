'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ExecutedTrade {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  mode: 'demo' | 'live';
  amount: number;
  executionPrice: number;
  pnl: number;
  timestamp: string;
  status: 'SETTLED' | 'WIN' | 'LOSS';
}

interface RecentTradesTableProps {
  trades: ExecutedTrade[];
  className?: string;
}

export default function RecentTradesTable({ trades, className }: RecentTradesTableProps) {
  return (
    <div className={cn("bg-[#070912]/95 rounded-2xl border border-border/80 p-4 shadow-2xl backdrop-blur-md font-mono select-none space-y-3", className)}>
      {/* Table Header Title */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <h3 className="font-extrabold text-xs text-foreground tracking-wider uppercase">EXECUTED ORDER HISTORY ({trades.length})</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">AUDITED LEDGER</span>
      </div>

      {/* Trades Table List */}
      {trades.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground/70">
          No executed trades recorded yet. Place orders using the Trade Panel.
        </div>
      ) : (
        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs">
          <div className="grid grid-cols-12 text-[10px] font-bold text-muted-foreground uppercase pb-1 border-b border-border/20 px-1">
            <span className="col-span-3">Time / Mode</span>
            <span className="col-span-3">Asset / Type</span>
            <span className="col-span-3 text-right">Exec Price</span>
            <span className="col-span-3 text-right">Settled P&L</span>
          </div>

          {trades.map((trade) => {
            const isBuy = trade.type === 'BUY';
            const isWin = trade.pnl >= 0;

            return (
              <div
                key={trade.id}
                className="grid grid-cols-12 items-center py-2 px-1.5 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border/30 transition-colors"
              >
                {/* Time & Mode */}
                <div className="col-span-3">
                  <div className="text-[10px] text-foreground font-bold">{trade.timestamp}</div>
                  <span className={cn(
                    "text-[8px] font-bold px-1 py-0.2 rounded uppercase border inline-block mt-0.5",
                    trade.mode === 'demo' ? "bg-[#F4511E]/10 text-[#F4511E] border-[#F4511E]/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  )}>
                    {trade.mode}
                  </span>
                </div>

                {/* Symbol & Order Type */}
                <div className="col-span-3">
                  <div className="font-bold text-foreground">{trade.symbol}</div>
                  <span className={cn(
                    "text-[9px] font-bold",
                    isBuy ? "text-[#F4511E]" : "text-rose-400"
                  )}>
                    {trade.type} (${trade.amount})
                  </span>
                </div>

                {/* Executed Price */}
                <div className="col-span-3 text-right">
                  <div className="font-bold text-foreground">${trade.executionPrice.toFixed(2)}</div>
                  <div className="text-[9px] text-muted-foreground">Market Fill</div>
                </div>

                {/* Settled P&L */}
                <div className="col-span-3 text-right font-bold">
                  <div className={cn("flex items-center justify-end gap-0.5", isWin ? "text-[#F4511E]" : "text-rose-400")}>
                    {isWin ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    <span>{isWin ? '+' : ''}${trade.pnl.toFixed(2)}</span>
                  </div>
                  <span className={cn(
                    "text-[8px] px-1 py-0.2 rounded uppercase font-bold inline-block",
                    isWin ? "bg-[#F4511E]/10 text-[#F4511E]" : "bg-rose-500/10 text-rose-400"
                  )}>
                    {trade.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
