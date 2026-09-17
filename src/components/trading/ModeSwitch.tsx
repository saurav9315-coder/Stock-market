'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, RefreshCw, Lock, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TradingMode = 'demo' | 'live';

interface ModeSwitchProps {
  mode: TradingMode;
  onModeChange: (mode: TradingMode) => void;
  demoBalance: number;
  liveBalance: number;
  onResetDemoBalance?: () => void;
  className?: string;
}

export default function ModeSwitch({
  mode,
  onModeChange,
  demoBalance,
  liveBalance,
  onResetDemoBalance,
  className,
}: ModeSwitchProps) {
  const isDemo = mode === 'demo';

  return (
    <div className={cn("flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 rounded-[20px] bg-[#10161D] border border-[#1E293B] shadow-2xl select-none", className)}>
      {/* Mode Selector Toggle */}
      <div className="relative flex items-center bg-[#05070A] p-1.5 rounded-xl border border-[#1E293B] max-w-md w-full sm:w-auto overflow-hidden">
        {/* DEMO Button */}
        <button
          type="button"
          onClick={() => onModeChange('demo')}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-4 sm:px-5 text-xs font-mono font-extrabold rounded-lg transition-colors cursor-pointer",
            isDemo ? "text-[#FF7043] font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {isDemo && (
            <motion.div
              layoutId="activeModeSwitchPill"
              className="absolute inset-0 rounded-lg bg-[#F4511E]/15 border border-[#F4511E]/40 shadow-lg shadow-[#F4511E]/20"
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
          <span className={cn("relative z-10 w-2 h-2 rounded-full transition-all", isDemo ? "bg-[#F4511E] animate-pulse shadow-[0_0_8px_#F4511E]" : "bg-muted-foreground/40")} />
          <span className="relative z-10">DEMO TRADING</span>
          <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded bg-[#F4511E]/20 text-[#FF7043] border border-[#F4511E]/30 uppercase">
            Virtual
          </span>
        </button>

        {/* LIVE Button */}
        <button
          type="button"
          onClick={() => onModeChange('live')}
          className={cn(
            "relative z-10 flex-1 flex items-center justify-center gap-2 py-2 px-4 sm:px-5 text-xs font-mono font-extrabold rounded-lg transition-colors cursor-pointer",
            !isDemo ? "text-blue-400 font-bold" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {!isDemo && (
            <motion.div
              layoutId="activeModeSwitchPill"
              className="absolute inset-0 rounded-lg bg-blue-500/15 border border-blue-500/40 shadow-lg shadow-blue-500/20"
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
          )}
          <span className={cn("relative z-10 w-2 h-2 rounded-full transition-all", !isDemo ? "bg-blue-400 animate-pulse shadow-[0_0_8px_#3B82F6]" : "bg-muted-foreground/40")} />
          <span className="relative z-10">LIVE TRADING</span>
          <span className="relative z-10 text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            Real
          </span>
        </button>
      </div>

      {/* Active Mode Capital & Status Badge */}
      <div className="flex items-center justify-between sm:justify-end gap-3 font-mono">
        {/* Active Mode Status Badge */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all",
          isDemo 
            ? "bg-[#F4511E]/10 border-[#F4511E]/30 text-[#FF7043] shadow-[0_0_12px_rgba(244,81,30,0.15)]"
            : "bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
        )}>
          {isDemo ? <Zap className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}
          <span>{isDemo ? 'PRACTICE SANDBOX MODE' : 'REAL CAPITAL DESK'}</span>
        </div>

        {/* Balance Display */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#05070E] border border-border/70">
          <Wallet className={cn("w-4 h-4", isDemo ? "text-[#F4511E]" : "text-blue-400")} />
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase leading-none">
              {isDemo ? 'Virtual Balance' : 'Wallet Capital'}
            </span>
            <span className={cn("text-xs font-extrabold tracking-tight mt-0.5", isDemo ? "text-[#F4511E]" : "text-foreground")}>
              ${(isDemo ? demoBalance : liveBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Reset Demo Capital button */}
          {isDemo && onResetDemoBalance && (
            <button
              type="button"
              onClick={onResetDemoBalance}
              title="Reset Virtual Demo Capital to $100,000"
              className="ml-1 p-1 rounded hover:bg-[#F4511E]/20 text-[#F4511E] hover:text-[#FF7043] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
