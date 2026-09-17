'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertTriangle, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIWatchlistInsightsProps {
  isLoading?: boolean;
  insights: {
    bullishSignals: string[];
    bearishSignals: string[];
    volatilityWarnings: string[];
    buyOpportunities: string[];
    sellOpportunities: string[];
    riskSummary: string;
  };
}

export default function AIWatchlistInsights({
  isLoading = false,
  insights
}: AIWatchlistInsightsProps) {
  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[280px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden font-mono text-xs">
      <CardHeader className="border-b border-border/40 pb-3 flex items-center justify-between">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" /> StockInside Trading AI Stock Signals
        </CardTitle>
        <span className="text-[9px] font-bold bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Analysis</span>
      </CardHeader>
      <CardContent className="pt-5 space-y-5">
        
        {/* Core Risk Summary */}
        <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-foreground">Watchlist Risk Diagnostics</span>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{insights.riskSummary}</p>
          </div>
        </div>

        {/* Signals lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          {/* Bullish */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> BULLISH INDICATORS
            </h4>
            {insights.bullishSignals.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No active bullish daily indicators.</p>
            ) : (
              <div className="space-y-1.5">
                {insights.bullishSignals.map((sig, i) => (
                  <div key={i} className="p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-foreground/80 leading-relaxed">
                    {sig}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bearish */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase font-bold text-rose-500 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" /> BEARISH INDICATORS
            </h4>
            {insights.bearishSignals.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">No active bearish daily indicators.</p>
            ) : (
              <div className="space-y-1.5">
                {insights.bearishSignals.map((sig, i) => (
                  <div key={i} className="p-2 rounded bg-rose-500/5 border border-rose-500/10 text-[10px] text-foreground/80 leading-relaxed">
                    {sig}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings & Opportunities */}
          <div className="space-y-3">
            {/* Volatility */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> VOLATILITY WARNINGS
              </h4>
              {insights.volatilityWarnings.length === 0 ? (
                <p className="text-[10px] text-muted-foreground">No high volatility alerts.</p>
              ) : (
                <div className="space-y-1.5">
                  {insights.volatilityWarnings.map((sig, i) => (
                    <div key={i} className="p-2 rounded bg-amber-500/5 border border-amber-500/10 text-[10px] text-foreground/80 leading-relaxed">
                      {sig}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Opportunities */}
            <div className="space-y-1 bg-secondary/20 rounded-lg p-2.5 border border-border/30">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">AI Opportunities</span>
              <div className="text-[10px] space-y-0.5 pt-1">
                {insights.buyOpportunities.length > 0 && (
                  <div>
                    <span className="font-bold text-emerald-500">Buy: </span>
                    <span className="text-foreground">{insights.buyOpportunities.join(', ')} (oversold)</span>
                  </div>
                )}
                {insights.sellOpportunities.length > 0 && (
                  <div>
                    <span className="font-bold text-rose-500">Take Profit: </span>
                    <span className="text-foreground">{insights.sellOpportunities.join(', ')} (overbought)</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </CardContent>
    </Card>
  );
}
