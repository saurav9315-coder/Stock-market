'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OrderBookEntry, LiveTrade } from '../hooks/useRealTimeMarket';

interface OrderBookTradesProps {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  trades: LiveTrade[];
  currentPrice: number;
}

export default function OrderBookTrades({ bids, asks, spread, trades, currentPrice }: OrderBookTradesProps) {
  // Compute total sizes
  const totalBidsQty = bids.reduce((acc, curr) => acc + curr.qty, 0);
  const totalAsksQty = asks.reduce((acc, curr) => acc + curr.qty, 0);
  const bidRatio = totalBidsQty + totalAsksQty > 0 
    ? (totalBidsQty / (totalBidsQty + totalAsksQty)) * 100 
    : 50;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {/* 1. L2 Depth Order Book */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-2 p-4 sm:p-5 flex flex-row items-center justify-between border-b border-border/40">
          <div>
            <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
              ⚖️ L2 Order Book Depth
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Market depth & bid-ask spreads</p>
          </div>
          <Badge variant="outline" className="font-mono text-[9px] bg-secondary/80 text-foreground">
            Spread: ${spread.toFixed(2)}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-3 space-y-3 font-mono text-[10px]">
          {/* Sell Orders (Asks) - Top */}
          <div className="space-y-0.5">
            <div className="grid grid-cols-3 text-muted-foreground font-semibold pb-1.5 border-b border-border/20 uppercase tracking-wider text-[9px]">
              <span>Ask Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Depth %</span>
            </div>
            
            {asks.slice(0, 6).map((ask, idx) => (
              <div key={`ask-${idx}`} className="relative grid grid-cols-3 py-1 items-center hover:bg-card/25 transition-colors">
                {/* Visual Depth Bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-bearish/10 transition-all duration-500" 
                  style={{ width: `${ask.depth}%` }}
                />
                <span className="text-bearish font-bold">${ask.price.toFixed(2)}</span>
                <span className="text-right text-foreground font-medium">{ask.qty.toLocaleString()}</span>
                <span className="text-right text-muted-foreground">{ask.depth.toFixed(0)}%</span>
              </div>
            ))}
          </div>

          {/* Current Mid Price Indicator */}
          <div className="py-2.5 border-y border-border/40 bg-muted/15 flex items-center justify-between px-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider">Mid price:</span>
              <span className="text-sm font-extrabold text-foreground">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span className="text-[9px] text-muted-foreground">Live Telemetry</span>
            </div>
          </div>

          {/* Buy Orders (Bids) - Bottom */}
          <div className="space-y-0.5">
            {bids.slice(0, 6).map((bid, idx) => (
              <div key={`bid-${idx}`} className="relative grid grid-cols-3 py-1 items-center hover:bg-card/25 transition-colors">
                {/* Visual Depth Bar */}
                <div 
                  className="absolute right-0 top-0 bottom-0 bg-bullish/10 transition-all duration-500" 
                  style={{ width: `${bid.depth}%` }}
                />
                <span className="text-bullish font-bold">${bid.price.toFixed(2)}</span>
                <span className="text-right text-foreground font-medium">{bid.qty.toLocaleString()}</span>
                <span className="text-right text-muted-foreground">{bid.depth.toFixed(0)}%</span>
              </div>
            ))}
            <div className="grid grid-cols-3 text-muted-foreground font-semibold pt-1.5 border-t border-border/20 uppercase tracking-wider text-[9px] mt-1.5">
              <span>Bid Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Depth %</span>
            </div>
          </div>

          {/* Bid/Ask Volume Ratio Indicator */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[9px] text-muted-foreground font-semibold">
              <span className="text-bullish flex items-center gap-1">BIDS: {bidRatio.toFixed(0)}%</span>
              <span className="text-bearish flex items-center gap-1">ASKS: {(100 - bidRatio).toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-bearish/30 rounded-full overflow-hidden flex">
              <div className="bg-bullish h-full transition-all duration-500" style={{ width: `${bidRatio}%` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Real-Time Executed Trades Log */}
      <Card className="bg-panel border-border/80">
        <CardHeader className="pb-2 p-4 sm:p-5 border-b border-border/40">
          <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
            📜 Live Trades Log
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Real-time order execution matching stream</p>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px] space-y-1">
          <div className="grid grid-cols-4 text-muted-foreground font-semibold pb-1.5 border-b border-border/20 uppercase tracking-wider text-[9px] mb-1">
            <span>Time</span>
            <span className="text-right">Price</span>
            <span className="text-right">Size</span>
            <span className="text-right">Direction</span>
          </div>

          <div className="max-h-[265px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {trades.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Waiting for executed trade matches...</div>
            ) : (
              trades.map((trade) => {
                const isBuy = trade.side === 'Buy';
                return (
                  <div key={trade.id} className="grid grid-cols-4 py-1 border-b border-border/10 hover:bg-card/25 transition-colors">
                    <span className="text-muted-foreground">{trade.time}</span>
                    <span className="text-right text-foreground font-bold">${trade.price.toFixed(2)}</span>
                    <span className="text-right text-foreground font-medium">{trade.qty}</span>
                    <span className="text-right">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                        isBuy ? 'bg-bullish/15 text-bullish' : 'bg-bearish/15 text-bearish'
                      }`}>
                        {trade.side}
                      </span>
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
