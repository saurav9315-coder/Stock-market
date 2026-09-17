'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Plus, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { getStockQuote } from '@/lib/stockMock';
import { cn } from '@/lib/utils';

interface WatchlistPreviewProps {
  isLoading?: boolean;
  onAddStock: (symbol: string) => void;
}

const WATCHLIST_SYMBOLS = ['AMZN', 'GOOGL', 'TSLA', 'SPY'];

export default function WatchlistPreview({
  isLoading = false,
  onAddStock
}: WatchlistPreviewProps) {
  const watchlistedStocks = React.useMemo(() => {
    return WATCHLIST_SYMBOLS.map((sym) => getStockQuote(sym));
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[250px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Eye className="w-4 h-4 text-primary" /> Active Watchlist Preview
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 font-mono text-xs">
        <div className="divide-y divide-border/30">
          {watchlistedStocks.map((stock) => {
            const isChangePositive = stock.change >= 0;
            return (
              <div key={stock.symbol} className="flex items-center justify-between py-3 group first:pt-1 last:pb-1">
                {/* Symbol & Name */}
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                    {stock.symbol}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[120px] font-sans">
                    {stock.name}
                  </span>
                </div>

                {/* Price and daily change */}
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-extrabold text-foreground">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={cn(
                      "text-[9px] font-bold px-1 rounded flex items-center gap-0.5",
                      isChangePositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isChangePositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                      {isChangePositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* Add to portfolio action */}
                  <button
                    onClick={() => onAddStock(stock.symbol)}
                    title="Add shares to active portfolio"
                    className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground border border-border transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Link out to full Watchlist */}
        <div className="border-t border-border/30 pt-3 mt-1 flex items-center justify-end">
          <a
            href="/watchlist"
            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            Manage full watchlists <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
