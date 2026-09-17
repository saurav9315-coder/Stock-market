'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LiveNewsItem, 
  LiveNotification 
} from '../hooks/useRealTimeMarket';
import { 
  Sparkles, 
  Bell, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Layers 
} from 'lucide-react';
import { SECTORS_PERFORMANCE } from '@/lib/marketsMock';

interface MarketNewsAlertsProps {
  news: LiveNewsItem[];
  notifications: LiveNotification[];
}

export default function MarketNewsAlerts({ news, notifications }: MarketNewsAlertsProps) {
  // Sort sectors by performance
  const topSectors = [...SECTORS_PERFORMANCE].sort((a, b) => b.avgReturn - a.avgReturn);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* 1. AI Live Insights & Sentiment */}
      <Card className="bg-panel border-border/80 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2 p-4 sm:p-5 border-b border-border/40">
            <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> AI Live Diagnostics
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Dynamic sentiment & momentum gauges</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px] space-y-3.5">
            {/* Sentiment Gauge */}
            <div className="space-y-1.5 border-b border-border/20 pb-3">
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground uppercase tracking-wider text-[9px]">Market Sentiment</span>
                <span className="text-primary font-bold">Greedy (72/100)</span>
              </div>
              <div className="w-full h-2 bg-secondary/80 rounded-full overflow-hidden relative">
                {/* Pointer indicator */}
                <div className="absolute left-[72%] top-0 bottom-0 w-1.5 bg-primary border border-white rounded shadow" />
                <div className="w-full h-full bg-gradient-to-r from-bearish via-amber-500 to-bullish opacity-70" />
              </div>
            </div>

            {/* Core Diagnostics Grid */}
            <div className="grid grid-cols-2 gap-3.5 border-b border-border/20 pb-3">
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[8px] uppercase tracking-wider block">Market Momentum</span>
                <span className="text-bullish font-bold text-[11px] flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5" /> High Bullish
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-muted-foreground text-[8px] uppercase tracking-wider block">Volatility Index</span>
                <span className="text-amber-500 font-bold text-[11px] flex items-center gap-0.5">
                  <Activity className="w-3.5 h-3.5" /> 24.6% (Moderate)
                </span>
              </div>
              <div className="space-y-0.5 col-span-2">
                <span className="text-muted-foreground text-[8px] uppercase tracking-wider block">Systemic Risk Alert</span>
                <span className="text-foreground font-semibold text-[10px] leading-tight block mt-0.5">
                  No critical sector correlations flagged. Capital distributions balanced.
                </span>
              </div>
            </div>

            {/* Sector performance overview */}
            <div className="space-y-2">
              <span className="text-muted-foreground font-semibold text-[9px] uppercase tracking-wider block flex items-center gap-1">
                <Layers className="w-3 h-3 text-muted-foreground" /> Sector Strengths
              </span>
              <div className="grid grid-cols-2 gap-2">
                {topSectors.slice(0, 4).map((s) => {
                  const isUp = s.avgReturn >= 0;
                  return (
                    <div key={s.name} className="p-2 bg-card/45 border border-border/60 rounded-lg space-y-0.5 flex flex-col justify-between">
                      <span className="text-foreground font-bold text-[9px] block truncate">{s.name}</span>
                      <span className={`text-[10px] font-extrabold block ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                        {isUp ? '+' : ''}{s.avgReturn.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* 2. Live Breaking News */}
      <Card className="bg-panel border-border/80 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2 p-4 sm:p-5 border-b border-border/40">
            <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
              📰 Live Breaking News
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Sub-second news feed streams</p>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px]">
            <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
              {news.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">Monitoring breaking market news logs...</div>
              ) : (
                news.map((n) => {
                  const isPositive = n.sentiment === 'positive';
                  const isNegative = n.sentiment === 'negative';
                  
                  return (
                    <div key={n.id} className="space-y-1.5 border-b border-border/10 pb-2.5 last:border-b-0 hover:bg-card/15 p-1 rounded transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-bearish text-white px-1.5 py-0.5 rounded font-extrabold uppercase animate-pulse">BREAKING</span>
                          <span className="text-[8px] bg-secondary text-foreground px-1.5 py-0.5 rounded font-bold border border-border">{n.symbol}</span>
                        </div>
                        <span className="text-muted-foreground text-[8px]">{n.time}</span>
                      </div>
                      <p className="text-foreground font-semibold leading-relaxed text-[10px]">{n.headline}</p>
                      <div className="flex justify-between items-center text-[8px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          Impact: 
                          <span className={`font-bold ${n.impact === 'High' ? 'text-bearish' : 'text-foreground'}`}>
                            {n.impact}
                          </span>
                        </span>
                        <span className={`font-bold flex items-center gap-0.5 uppercase ${
                          isPositive ? 'text-bullish' : isNegative ? 'text-bearish' : 'text-muted-foreground'
                        }`}>
                          {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : isNegative ? <TrendingDown className="w-2.5 h-2.5" /> : null}
                          {n.sentiment}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* 3. Real-Time Notifications Log */}
      <Card className="bg-panel border-border/80 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2 p-4 sm:p-5 border-b border-border/40">
            <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-primary" /> Real-Time Notifications
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Triggered parameters alert history</p>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px]">
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">Listening for price alerts and system warnings...</div>
              ) : (
                notifications.map((n) => {
                  return (
                    <div 
                      key={n.id} 
                      className={`p-2.5 rounded-lg border border-border/60 flex items-start gap-2.5 hover:bg-card/25 transition-colors ${
                        n.type === 'AI' ? 'bg-primary/5 border-primary/20' : 
                        n.type === 'Alert' ? 'bg-amber-500/5 border-amber-500/20' : 
                        'bg-card/50'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'Alert' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        ) : n.type === 'AI' ? (
                          <Sparkles className="w-4 h-4 text-primary" />
                        ) : (
                          <Bell className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-extrabold text-foreground text-[9px] uppercase tracking-wider">{n.title}</span>
                          <span className="text-[8px] text-muted-foreground">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal">{n.description}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
