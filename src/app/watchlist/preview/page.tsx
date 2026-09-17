'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Import, 
  ArrowLeft,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { getStockQuote, StockQuote } from '@/lib/stockMock';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { Suspense } from 'react';

function PreviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hash = searchParams.get('hash');

  const { decodedData, error } = useMemo(() => {
    if (!hash) {
      return { decodedData: null, error: 'Missing shared watchlist link parameter.' };
    }
    try {
      const decoded = atob(hash);
      const parsed = JSON.parse(decoded);
      const name = parsed.n || parsed.name || 'Shared List';
      const symbols = parsed.s || parsed.symbols || [];

      if (!Array.isArray(symbols)) {
        throw new Error('Symbols must be an array');
      }
      return { decodedData: { name, symbols }, error: null };
    } catch {
      return { decodedData: null, error: 'The shared watchlist link is invalid or corrupted.' };
    }
  }, [hash]);

  const quotes = useMemo(() => {
    if (!decodedData) return [];
    return decodedData.symbols.map(getStockQuote);
  }, [decodedData]);

  const analytics = useMemo(() => {
    if (quotes.length === 0) return null;
    let sumGain = 0, countGain = 0, sumLoss = 0, countLoss = 0;
    let best = quotes[0], worst = quotes[0];

    quotes.forEach((q) => {
      if (q.changePercent >= 0) {
        sumGain += q.changePercent;
        countGain++;
      } else {
        sumLoss += q.changePercent;
        countLoss++;
      }
      if (q.changePercent > best.changePercent) best = q;
      if (q.changePercent < worst.changePercent) worst = q;
    });

    return {
      avgGain: countGain > 0 ? (sumGain / countGain).toFixed(2) : '0.00',
      avgLoss: countLoss > 0 ? (sumLoss / countLoss).toFixed(2) : '0.00',
      best,
      worst
    };
  }, [quotes]);

  const handleImport = () => {
    if (!decodedData) return;
    try {
      const existing = localStorage.getItem('antigravity_watchlists');
      const watchlists = existing ? JSON.parse(existing) : [];
      const newId = `wl-imported-${Date.now()}`;
      watchlists.push({
        id: newId,
        name: `Imported: ${decodedData.name}`,
        color: 'bg-indigo-500',
        symbols: decodedData.symbols
      });
      localStorage.setItem('antigravity_watchlists', JSON.stringify(watchlists));
      toast.success(`Successfully imported "${decodedData.name}" with ${decodedData.symbols.length} symbols!`);
      
      // Navigate after toast
      setTimeout(() => {
        router.push('/watchlist');
      }, 500);
    } catch {
      toast.success(`Watchlist "${decodedData.name}" parsed! Redirecting to setup...`);
      router.push('/watchlist');
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-panel border border-border rounded-2xl text-center space-y-4 shadow-xl font-mono text-xs text-foreground">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Invalid Share Link</h2>
        <p className="text-muted-foreground leading-relaxed">
          {error}
        </p>
        <Link href="/watchlist" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Watchlists
        </Link>
      </div>
    );
  }

  if (!decodedData) {
    return (
      <div className="max-w-xl mx-auto my-24 text-center font-mono text-xs text-muted-foreground animate-pulse space-y-2">
        <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary" />
        <p>Decoding shared snapshot matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-mono text-xs text-foreground">
      {/* Back button & Action bar */}
      <div className="flex items-center justify-between">
        <Link href="/watchlist" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-mono transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Watchlists
        </Link>
        <button
          onClick={handleImport}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-95 shadow transition-all cursor-pointer font-mono"
        >
          <Import className="w-3.5 h-3.5" /> Import to Collections
        </button>
      </div>

      {/* Snapshot Header */}
      <div className="bg-panel border border-panel-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 border border-indigo-500/20 shadow-sm shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-500 tracking-wider uppercase font-mono">Shared Watchlist Snapshot</span>
            <h1 className="text-2xl font-black text-foreground tracking-tight leading-none mt-1">{decodedData.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-secondary/35 border border-border/40 p-3.5 rounded-xl shrink-0">
          <div>
            <span className="text-muted-foreground uppercase text-[9px] font-bold block">Total Stocks</span>
            <p className="text-base font-extrabold text-foreground">{quotes.length} Tickers</p>
          </div>
          <div>
            <span className="text-muted-foreground uppercase text-[9px] font-bold block">Status</span>
            <p className="text-base font-extrabold text-emerald-500">Live Quotes</p>
          </div>
        </div>
      </div>

      {/* Grid of basic analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-panel border border-panel-border p-4 rounded-xl shadow-sm">
            <span className="text-muted-foreground text-[9px] font-bold uppercase block">Avg Daily Gain</span>
            <p className="text-lg font-extrabold text-emerald-500 mt-1">+{analytics.avgGain}%</p>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded-xl shadow-sm">
            <span className="text-muted-foreground text-[9px] font-bold uppercase block">Avg Daily Loss</span>
            <p className="text-lg font-extrabold text-rose-500 mt-1">{analytics.avgLoss}%</p>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded-xl shadow-sm truncate">
            <span className="text-muted-foreground text-[9px] font-bold uppercase block">Best Performer</span>
            <p className="text-sm font-extrabold text-foreground mt-1 truncate">{analytics.best.symbol}</p>
            <span className="text-[9px] text-emerald-500 font-bold block mt-0.5">+{analytics.best.changePercent.toFixed(2)}%</span>
          </div>
          <div className="bg-panel border border-panel-border p-4 rounded-xl shadow-sm truncate">
            <span className="text-muted-foreground text-[9px] font-bold uppercase block">Worst Performer</span>
            <p className="text-sm font-extrabold text-foreground mt-1 truncate">{analytics.worst.symbol}</p>
            <span className="text-[9px] text-rose-500 font-bold block mt-0.5">{analytics.worst.changePercent.toFixed(2)}%</span>
          </div>
        </div>
      )}

      {/* Simplified Read-Only Data Grid */}
      <Card className="bg-panel border border-border/85 shadow-sm overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed min-w-[700px] border-collapse">
            <thead>
              <tr className="border-b border-border/40 text-[10px] text-muted-foreground uppercase font-bold bg-secondary/20">
                <th className="py-3 px-4 w-40">Company</th>
                <th className="py-3 px-4 w-28">Symbol</th>
                <th className="py-3 px-4 text-right w-32">Price</th>
                <th className="py-3 px-4 text-right w-36">Change</th>
                <th className="py-3 px-4 text-right w-36">Market Cap</th>
                <th className="py-3 px-4 w-40">Sector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    This shared watchlist has no symbols.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => {
                  const isGainer = q.changePercent >= 0;
                  return (
                    <tr key={q.symbol} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-foreground truncate">{q.name}</td>
                      <td className="py-3 px-4 font-extrabold text-primary">{q.symbol}</td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={isGainer ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                            {isGainer ? '+' : ''}{q.changePercent.toFixed(2)}%
                          </span>
                          <span className="text-[9px] text-muted-foreground mt-0.5">
                            {isGainer ? '+' : ''}${q.change.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-foreground/80 font-bold">
                        ${(q.marketCap / 1e9).toFixed(1)}B
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{q.sector || 'Technology'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function SharedWatchlistPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto my-24 text-center font-mono text-xs text-muted-foreground animate-pulse space-y-2">
        <RotateCw className="w-6 h-6 animate-spin mx-auto text-primary" />
        <p>Loading shared watchlist module...</p>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
