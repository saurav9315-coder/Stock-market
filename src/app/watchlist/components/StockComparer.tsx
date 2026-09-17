'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scale, X, HelpCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  eps: number;
  dividendYield: number;
  volume: number;
}

interface StockComparerProps {
  comparisonData: ComparisonItem[];
  onRemove: (symbol: string) => void;
  onClear: () => void;
}

export default function StockComparer({
  comparisonData,
  onRemove,
  onClear
}: StockComparerProps) {
  if (comparisonData.length === 0) return null;

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm font-mono text-xs overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-primary" /> Multi-Stock Comparative Matrix
        </CardTitle>
        <button
          onClick={onClear}
          className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
        >
          Clear Comparison ({comparisonData.length})
        </button>
      </CardHeader>
      
      <CardContent className="pt-5 overflow-x-auto">
        <table className="min-w-[600px] w-full text-left table-fixed">
          <thead>
            <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase font-bold">
              <th className="py-2.5 px-3 w-40">Metric</th>
              {comparisonData.map((stock) => (
                <th key={stock.symbol} className="py-2.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5 font-bold text-foreground">
                    <span>{stock.symbol}</span>
                    <button 
                      onClick={() => onRemove(stock.symbol)}
                      className="text-muted-foreground hover:text-rose-500 shrink-0 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-[8px] text-muted-foreground block truncate max-w-[120px] font-normal normal-case font-sans">
                    {stock.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/25">
            {/* Price Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">Price</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right font-extrabold text-foreground">
                  ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              ))}
            </tr>

            {/* Daily Performance Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">Daily Change</td>
              {comparisonData.map((stock) => {
                const isGainer = stock.changePercent >= 0;
                return (
                  <td key={stock.symbol} className="py-3 px-3 text-right">
                    <span className={cn(
                      "font-bold px-1.5 py-0.5 rounded text-[10px] font-mono",
                      isGainer ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                    )}>
                      {isGainer ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Market Cap Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">Market Cap</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right font-bold text-foreground/80">
                  ${(stock.marketCap / 1e9).toFixed(1)}B
                </td>
              ))}
            </tr>

            {/* P/E Ratio Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">P/E Ratio</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right text-foreground/80">
                  {stock.peRatio > 0 ? stock.peRatio : 'N/A'}
                </td>
              ))}
            </tr>

            {/* EPS Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">EPS</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right text-foreground/80">
                  {stock.eps > 0 ? `$${stock.eps}` : 'N/A'}
                </td>
              ))}
            </tr>

            {/* Dividend Yield Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">Div. Yield</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right text-foreground/80 font-bold">
                  {stock.dividendYield > 0 ? `${stock.dividendYield}%` : '0.00%'}
                </td>
              ))}
            </tr>

            {/* Volume Row */}
            <tr className="hover:bg-secondary/20">
              <td className="py-3 px-3 font-semibold text-muted-foreground">Daily Volume</td>
              {comparisonData.map((stock) => (
                <td key={stock.symbol} className="py-3 px-3 text-right text-muted-foreground">
                  {stock.volume.toLocaleString()}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
