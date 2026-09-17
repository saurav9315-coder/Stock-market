'use client';

import React from 'react';
import { Sparkles, BrainCircuit, ShieldAlert, ArrowUpRight, TrendingUp } from 'lucide-react';

interface AiAnalysisWidgetProps {
  onSymbolClick?: (symbol: string) => void;
}

export default function AiAnalysisWidget({ onSymbolClick }: AiAnalysisWidgetProps) {
  const sentimentScore = 74; // 74% Bullish
  const sentimentLabel = "MODERATELY BULLISH";

  const summaries = [
    "Semiconductor allocations remain heavily favored as NVIDIA releases its high-density Blackwell B200 systems, lifting sector demand.",
    "Federal Reserve CPI inflation results suggest interest rates will stay higher-for-longer, capping broad index valuation upside.",
    "Strategic cloud integrations (Apple-Google licensing partnerships) represent high-priority distribution drivers for search ecosystems."
  ];

  const bullishCatalysts = [
    "High institutional inflows in spot ETH exchange traded funds.",
    "Central bank purchasing indices sustaining spot Gold pricing.",
    "Earnings rebalancing vectors pushing net buying orders on chip makers."
  ];

  const suggestedStocks = [
    { symbol: 'NVDA', strength: 'Strong Bullish', impact: '+3.2%' },
    { symbol: 'AAPL', strength: 'Bullish Catalyst', impact: '+1.5%' },
    { symbol: 'GOOGL', strength: 'Strategic Partner', impact: '+1.8%' },
    { symbol: 'HDFCBANK', strength: 'Stable Deposit Outflows', impact: '+1.1%' }
  ];

  return (
    <div className="rounded-xl border border-border/80 bg-panel flex flex-col overflow-hidden h-[520px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0 bg-primary/5">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-bold text-foreground font-sans tracking-tight">
            AI Quant Intelligence
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] font-mono text-primary font-bold">
          <Sparkles className="w-3 h-3" />
          <span>QUANT INSIGHTS</span>
        </div>
      </div>

      {/* Main scrolling wrapper */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin">
        {/* Sentiment Gauge */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-mono font-bold text-muted-foreground">
            <span>Market Sentiment Index</span>
            <span className="text-emerald-500 font-bold">{sentimentScore}% Bullish</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full" style={{ width: `${sentimentScore}%` }} />
            <div className="bg-rose-500 h-full" style={{ width: `${100 - sentimentScore}%` }} />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-muted-foreground/80">
            <span>BEARISH</span>
            <span className="text-foreground font-bold bg-secondary/80 border border-border px-1.5 py-0.1 rounded">
              {sentimentLabel}
            </span>
            <span>BULLISH</span>
          </div>
        </div>

        {/* AI Synthesized Summary */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Synthesized Takeaways
          </h4>
          <div className="space-y-2">
            {summaries.map((summary, idx) => (
              <div key={idx} className="p-2.5 rounded bg-secondary/40 border border-border/60 text-[11px] leading-relaxed text-foreground">
                {summary}
              </div>
            ))}
          </div>
        </div>

        {/* Catalysts & Risk warning */}
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 rounded bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <h4 className="text-[9px] font-bold text-emerald-500 uppercase font-mono flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Bullish Anchors
            </h4>
            <ul className="list-disc pl-3 text-[10px] text-muted-foreground space-y-1 leading-relaxed">
              {bullishCatalysts.map((cat, i) => (
                <li key={i}>{cat}</li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded bg-rose-500/5 border border-rose-500/20 space-y-1.5">
            <h4 className="text-[9px] font-bold text-rose-500 uppercase font-mono flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              Risk Flags
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Fed rate cuts remain deferred. Tighter liquidity might penalize high-multiple growth equities if Q2 revisions disappoint.
            </p>
          </div>
        </div>

        {/* Suggested Stocks List */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">
            Correlated AI Playbook
          </h4>
          <div className="divide-y divide-border/40 border border-border/60 rounded bg-secondary/15 overflow-hidden">
            {suggestedStocks.map((stock) => (
              <div 
                key={stock.symbol} 
                className="flex items-center justify-between px-3 py-2 text-xs hover:bg-secondary/40 transition-colors"
              >
                <button
                  onClick={() => onSymbolClick?.(stock.symbol)}
                  className="font-bold font-mono text-foreground hover:underline cursor-pointer flex items-center gap-1"
                >
                  {stock.symbol}
                  <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                </button>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-mono">{stock.strength}</span>
                  <span className="text-[10px] font-bold font-mono text-emerald-500">{stock.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
