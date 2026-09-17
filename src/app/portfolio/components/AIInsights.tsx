'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  AlertTriangle, 
  RefreshCw, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RebalanceAdvice {
  asset: string;
  action: 'BUY' | 'SELL';
  currentWeight: number;
  targetWeight: number;
}

interface RecommendedStock {
  symbol: string;
  name: string;
  sector: string;
  reason: string;
}

interface AIInsightData {
  healthScore: number;
  warnings: string[];
  rebalancingAdvice: RebalanceAdvice[];
  diversificationAdvice: string;
  recommendedStocks: RecommendedStock[];
  sectorOpportunities: string[];
}

interface AIInsightsProps {
  isLoading?: boolean;
  aiInsights: AIInsightData;
  onQuickTrade: (symbol: string) => void;
}

export default function AIInsights({
  isLoading = false,
  aiInsights,
  onQuickTrade
}: AIInsightsProps) {
  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[350px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Color logic for health score
  const scoreColor = aiInsights.healthScore >= 75 
    ? "text-emerald-500 stroke-emerald-500" 
    : aiInsights.healthScore >= 50 
    ? "text-amber-500 stroke-amber-500" 
    : "text-rose-500 stroke-rose-500";

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 flex items-center justify-between">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" /> StockInside Trading AI Advisor
        </CardTitle>
        <span className="text-[9px] font-mono font-bold bg-violet-500/10 text-violet-500 border border-violet-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Active Agent</span>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Core Meter & Risk Warnings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Health Score Circular Dial */}
          <div className="flex flex-col items-center justify-center text-center bg-secondary/30 rounded-xl p-5 border border-border/40 font-mono">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-2 block">Portfolio Health Score</span>
            
            {/* Visual Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="56" 
                  cy="56" 
                  r="45" 
                  stroke="var(--border)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  className="opacity-40"
                />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="45" 
                  stroke="currentColor" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray={282}
                  strokeDashoffset={282 - (282 * aiInsights.healthScore) / 100}
                  className={cn("transition-all duration-1000 ease-out", scoreColor)}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-foreground tracking-tighter">{aiInsights.healthScore}</span>
                <span className="text-[8px] text-muted-foreground uppercase font-bold mt-[-2px]">Score</span>
              </div>
            </div>

            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full mt-4",
              aiInsights.healthScore >= 75 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
            )}>
              {aiInsights.healthScore >= 75 ? 'Healthy Asset Base' : 'Exposure Adjustments Advisable'}
            </span>
          </div>

          {/* Risk Alerts */}
          <div className="lg:col-span-2 space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> High-Priority Risk Analysis
            </h4>
            
            {aiInsights.warnings.length === 0 ? (
              <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 rounded-lg p-3 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Zero Exposure Alerts</p>
                  <p className="text-[10px] text-emerald-500/80 mt-0.5">Asset allocations, sector metrics, and volatility standard deviations align with balanced parameters.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {aiInsights.warnings.map((warn, i) => (
                  <div key={i} className="bg-rose-500/5 border border-rose-500/15 text-rose-500 rounded-lg p-3 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Allocation Warning</p>
                      <p className="text-[10px] text-rose-500/80 mt-0.5 leading-relaxed">{warn}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Suggested Rebalancing & Opportunities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-border/40 font-mono text-xs">
          {/* Rebalancing recommendations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-primary" /> Suggested Rebalancing Adjustments
            </h4>
            
            <div className="bg-secondary/20 border border-border/30 rounded-xl p-4 space-y-3">
              <p className="text-muted-foreground text-[11px] leading-relaxed">{aiInsights.diversificationAdvice}</p>
              
              {aiInsights.rebalancingAdvice.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border/20">
                  {aiInsights.rebalancingAdvice.map((reb, i) => (
                    <div key={i} className="flex items-center justify-between bg-panel border border-border/50 rounded-lg p-2">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold",
                          reb.action === 'BUY' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                        )}>
                          {reb.action}
                        </span>
                        <span className="font-bold text-foreground">{reb.asset}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{reb.currentWeight}%</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span className="font-bold text-foreground">{reb.targetWeight}% Target</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recommended stocks & buy suggestions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-primary" /> Sector Allocation Opportunities
            </h4>
            <div className="space-y-2.5">
              {aiInsights.recommendedStocks.map((stock) => (
                <div key={stock.symbol} className="bg-secondary/25 border border-border/40 hover:border-primary/30 transition-colors rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-foreground">{stock.symbol}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({stock.name})</span>
                    </div>
                    <button
                      onClick={() => onQuickTrade(stock.symbol)}
                      className="px-2 py-1 text-[10px] font-bold rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                    >
                      <DollarSign className="w-2.5 h-2.5" /> Buy
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">{stock.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
