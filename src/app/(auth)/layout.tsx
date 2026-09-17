'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { TrendingUp, Cpu, Activity, ShieldCheck } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-screen bg-[#07090F] flex flex-col md:flex-row relative select-none font-sans">
      {/* Background glowing dots/patterns */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Left Column: Form Wrapper */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 md:p-12 relative z-10 min-h-screen max-w-full md:max-w-xl lg:max-w-2xl mx-auto w-full">
        {/* Header Branding */}
        <div className="flex items-center gap-3 pt-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 text-primary glow-bullish group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold tracking-tight text-base text-foreground group-hover:text-primary transition-colors">
              STOCKINSIDE <span className="text-xs text-primary font-mono ml-0.5">TRADING</span>
            </span>
          </Link>
        </div>

        {/* Dynamic Auth Views */}
        <div className="my-auto py-6 w-full">
          <div className="w-full max-w-md mx-auto animate-in fade-in duration-300">
            {children}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 pb-2 border-t border-border/20 font-mono">
          <span>SEC Sandbox A-412 compliance active</span>
          <span>© 2026 StockInside Trading, Inc.</span>
        </div>
      </div>

      {/* Right Column: Premium Fintech visual showcase (Desktop only) */}
      <div className="hidden md:flex flex-1 bg-gradient-to-br from-[#0c0f1d] to-[#07090f] border-l border-border/30 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[80px]" />
        
        {/* Decorative corner lines */}
        <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-primary/10 m-4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-emerald-500/5 m-4" />

        {/* Graphic Top branding */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full self-start">
          <Cpu className="w-3.5 h-3.5" />
          <span>CONNECTED TO SIMULATION TELEMETRY NODE</span>
        </div>

        {/* Quant Visualization display block */}
        <div className="space-y-6 max-w-lg mx-auto w-full my-auto">
          <div className="relative p-6 rounded-xl bg-[#101424]/80 border border-panel-border/80 shadow-2xl overflow-hidden glow-bullish">
            {/* Glossy top border light */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />

            <div className="flex justify-between items-center border-b border-border/30 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground block">PORTFOLIO ALIGNMENT ENGINE</span>
                <h3 className="text-base font-bold text-foreground mt-0.5">Asset Weighting Simulation</h3>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                <Activity className="w-3 h-3" />
                <span>SYNC ACTIVE</span>
              </div>
            </div>

            {/* Metrics data list */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">AAPL (Technology)</span>
                <span className="text-foreground font-bold">35.00%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">NVDA (Semiconductors)</span>
                <span className="text-foreground font-bold">25.00%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/10">
                <span className="text-muted-foreground">BTC-USD (Cryptocurrency)</span>
                <span className="text-foreground font-bold">20.00%</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Cash Reserve</span>
                <span className="text-foreground font-bold">20.00%</span>
              </div>
            </div>

            {/* Glowing footer badge */}
            <div className="mt-6 flex items-center justify-center gap-2 p-3 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs font-bold font-sans">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>ESTIMATED ANNUAL SIMULATED RETURN: +24.8%</span>
            </div>
          </div>

          <div className="text-center space-y-2 max-w-sm mx-auto">
            <h4 className="text-sm font-bold text-foreground leading-snug">The Ultimate Environment for Quantitative Analytics</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Leverage high-fidelity stochastic Walks, historical indicator analysis, and margin executions inside our isolated sandbox console.
            </p>
          </div>
        </div>

        {/* Small disclosure */}
        <p className="text-[9px] text-muted-foreground leading-normal max-w-md self-end text-right font-mono">
          Simulated trading tools are for research modelling metrics targets. No real exchange funds or registrations are impacted.
        </p>
      </div>
    </div>
  );
}
