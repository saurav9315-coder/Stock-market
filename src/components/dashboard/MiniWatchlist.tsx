'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getStockQuote, StockQuote } from '@/lib/stockMock';

const watchlistSymbols = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC-USD'];

const getWatchlistQuotes = (): StockQuote[] => watchlistSymbols.map(getStockQuote);

export default function MiniWatchlist() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<StockQuote[]>(getWatchlistQuotes);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuotes(getWatchlistQuotes());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-panel border-border/80 h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 border-b border-border/40">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          Watchlist Spotlight
        </CardTitle>
        <Link href="/watchlist" className="text-xs text-primary hover:underline flex items-center gap-0.5">
          View Watchlist <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>
      
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="font-semibold text-xs py-2 px-4">Symbol</TableHead>
              <TableHead className="font-semibold text-xs py-2 px-4 text-right">Price</TableHead>
              <TableHead className="font-semibold text-xs py-2 px-4 text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => {
              const isBullish = quote.changePercent >= 0;
              return (
                <TableRow
                  key={quote.symbol}
                  onClick={() => router.push(`/stock/${quote.symbol}`)}
                  className="hover:bg-secondary/45 transition-colors cursor-pointer border-border/40 group"
                >
                  <TableCell className="py-2.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground font-mono group-hover:text-primary transition-colors text-sm">
                        {quote.symbol}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                        {quote.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-2.5 px-4 text-right font-mono text-sm font-semibold text-foreground">
                    ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  
                  <TableCell className="py-2.5 px-4 text-right">
                    <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                      isBullish ? 'bg-[#F4511E]/10 text-[#F4511E]' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {isBullish ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
