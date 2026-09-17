'use client';

import { useState, useMemo, useCallback } from 'react';
import { getStockQuote, getAllQuotes, StockQuote } from '@/lib/stockMock';
import { toast } from 'sonner';
import {
  useWatchlists,
  useCreateWatchlist,
  useDeleteWatchlist,
  useAddStockToWatchlist,
  useRemoveStockFromWatchlist,
} from '@/lib/queryHooks';

export interface Watchlist {
  id: string;
  name: string;
  color: string;
  symbols: string[];
}

export interface ComparisonMetrics {
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

export function useWatchlist() {
  // Query Watchlists from API BFF
  const { data: apiWatchlists = [], isLoading, error: queryError, refetch } = useWatchlists();

  // Mutation hooks
  const createMutation = useCreateWatchlist();
  const deleteMutation = useDeleteWatchlist();
  const addStockMutation = useAddStockToWatchlist();
  const removeStockMutation = useRemoveStockFromWatchlist();

  // Active list state
  const [activeWatchlistId, setActiveWatchlistId] = useState<string>('favs');
  const [comparisonSymbols, setComparisonSymbols] = useState<string[]>(['AAPL', 'MSFT']);

  // Compatibility simulator flags (unused now but preserved for type safety)
  const [simulateLoading, setSimulateLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);
  const [simulateOffline, setSimulateOffline] = useState(false);

  // Parse error
  const error = queryError ? (queryError as any).message : null;

  // Resolve watchlists safely
  const watchlists = useMemo(() => {
    if (apiWatchlists.length > 0) return apiWatchlists;
    // Fallback if query loading or empty
    return [
      { id: 'favs', name: 'My Favorites', color: 'bg-rose-500', symbols: ['AAPL', 'MSFT', 'NVDA', 'SPY'] },
    ];
  }, [apiWatchlists]);

  // Resolve active list
  const activeWatchlist = useMemo(() => {
    const list = watchlists.find(w => w.id === activeWatchlistId);
    if (!list) return watchlists[0];
    return list;
  }, [watchlists, activeWatchlistId]);

  // Sync quotes
  const activeQuotes = useMemo(() => {
    return activeWatchlist.symbols.map(getStockQuote).filter(Boolean) as StockQuote[];
  }, [activeWatchlist]);

  const allQuotes = useMemo(() => {
    return getAllQuotes();
  }, []);

  const comparisonData = useMemo(() => {
    return comparisonSymbols.map((sym) => {
      const q = getStockQuote(sym);
      return {
        symbol: q.symbol,
        name: q.name,
        price: q.price,
        changePercent: q.changePercent,
        marketCap: q.marketCap,
        peRatio: q.peRatio,
        eps: q.eps,
        dividendYield: q.dividendYield,
        volume: q.volume
      };
    });
  }, [comparisonSymbols]);

  // Sidebar performance indexes
  const watchlistsPerformance = useMemo(() => {
    const performances: Record<string, { count: number; change: number }> = {};
    watchlists.forEach((wl) => {
      if (wl.symbols.length === 0) {
        performances[wl.id] = { count: 0, change: 0 };
        return;
      }
      let sumChange = 0;
      wl.symbols.forEach((sym) => {
        const q = getStockQuote(sym);
        sumChange += q ? q.changePercent : 0;
      });
      performances[wl.id] = {
        count: wl.symbols.length,
        change: Number((sumChange / wl.symbols.length).toFixed(2))
      };
    });
    return performances;
  }, [watchlists]);

  // Watchlist Analytics
  const analytics = useMemo(() => {
    if (activeQuotes.length === 0) {
      return { avgGain: 0, avgLoss: 0, bestPerformer: null, worstPerformer: null, volatilityScore: 0 };
    }

    let sumGain = 0;
    let countGain = 0;
    let sumLoss = 0;
    let countLoss = 0;
    let best = activeQuotes[0];
    let worst = activeQuotes[0];
    let weightedBeta = 0;

    activeQuotes.forEach((q) => {
      if (q.changePercent >= 0) {
        sumGain += q.changePercent;
        countGain++;
      } else {
        sumLoss += q.changePercent;
        countLoss++;
      }

      if (q.changePercent > best.changePercent) best = q;
      if (q.changePercent < worst.changePercent) worst = q;

      weightedBeta += q.beta || 1;
    });

    const avgGain = countGain > 0 ? Number((sumGain / countGain).toFixed(2)) : 0;
    const avgLoss = countLoss > 0 ? Number((sumLoss / countLoss).toFixed(2)) : 0;
    const volatilityScore = Math.min(100, Math.max(1, Math.round((weightedBeta / activeQuotes.length) * 45)));

    return {
      avgGain,
      avgLoss,
      bestPerformer: { symbol: best.symbol, name: best.name, change: best.changePercent },
      worstPerformer: { symbol: worst.symbol, name: worst.name, change: worst.changePercent },
      volatilityScore
    };
  }, [activeQuotes]);

  // AI Signals
  const aiInsights = useMemo(() => {
    const bullish: string[] = [];
    const bearish: string[] = [];
    const warnings: string[] = [];

    activeQuotes.forEach((q) => {
      if (q.changePercent > 1.5) {
        bullish.push(`${q.symbol}: High momentum buy indicators triggered on daily volume spike.`);
      } else if (q.changePercent < -1.5) {
        bearish.push(`${q.symbol}: Support channel break. MACD curves signal oversold pressure.`);
      }

      if ((q.beta || 1) > 1.6) {
        warnings.push(`${q.symbol} beta of ${q.beta} represents high correlation to volatile swings.`);
      }
    });

    const buyOpps = activeQuotes.filter(q => q.changePercent < -0.5).map(q => q.symbol);
    const sellOpps = activeQuotes.filter(q => q.changePercent > 1.0).map(q => q.symbol);

    return {
      bullishSignals: bullish.slice(0, 3),
      bearishSignals: bearish.slice(0, 3),
      volatilityWarnings: warnings.slice(0, 2),
      buyOpportunities: buyOpps.slice(0, 2),
      sellOpportunities: sellOpps.slice(0, 2),
      riskSummary: activeQuotes.length > 3 && analytics.volatilityScore > 60
        ? 'High Risk: Portfolio concentrations skew tech heavy with significant systemic betas.'
        : 'Adequate: Balanced volatility indexes matching conservative index levels.'
    };
  }, [activeQuotes, analytics]);

  // Tickers Movers
  const realTimeFeeds = useMemo(() => {
    const trending = ['AAPL', 'NVDA', 'MSFT'].map(getStockQuote).filter(Boolean) as StockQuote[];
    const active = ['AAPL', 'TSLA', 'MSFT'].map(getStockQuote).filter(Boolean) as StockQuote[];
    const gainers = allQuotes.filter(q => q.changePercent > 0).sort((a,b) => b.changePercent - a.changePercent).slice(0, 3);
    const losers = allQuotes.filter(q => q.changePercent < 0).sort((a,b) => a.changePercent - b.changePercent).slice(0, 3);

    return {
      trending,
      mostActive: active,
      movers: { gainers, losers }
    };
  }, [allQuotes]);

  // Watchlist Actions utilizing TanStack mutations
  const createWatchlist = useCallback((name: string, color: string) => {
    createMutation.mutate({ name, color });
  }, [createMutation]);

  const renameWatchlist = useCallback((id: string, newName: string) => {
    // Note: for simplicity of UI triggers, we just dispatch a toast, and can support it via general update mutations
    toast.info('Watchlist rename API request triggered.');
  }, []);

  const duplicateWatchlist = useCallback((id: string) => {
    toast.info('Watchlist duplicate operation is simulated.');
  }, []);

  const deleteWatchlist = useCallback((id: string) => {
    if (watchlists.length <= 1) {
      toast.error('At least one active watchlist ledger is mandatory.');
      return;
    }
    deleteMutation.mutate(id);
    if (activeWatchlistId === id) {
      const remaining = watchlists.filter(w => w.id !== id);
      setActiveWatchlistId(remaining[0].id);
    }
  }, [deleteMutation, watchlists, activeWatchlistId]);

  const addStockToWatchlist = useCallback((symbol: string) => {
    addStockMutation.mutate({ watchlistId: activeWatchlistId, symbol });
  }, [addStockMutation, activeWatchlistId]);

  const removeStockFromWatchlist = useCallback((symbol: string) => {
    removeStockMutation.mutate({ watchlistId: activeWatchlistId, symbol });
  }, [removeStockMutation, activeWatchlistId]);

  const toggleComparisonSymbol = useCallback((symbol: string) => {
    setComparisonSymbols((prev) => {
      if (prev.includes(symbol)) {
        toast.info(`Removed ${symbol} from comparison matrix.`);
        return prev.filter(sym => sym !== symbol);
      }
      if (prev.length >= 4) {
        toast.error('Limit reached: Select up to 4 assets to compare side-by-side.');
        return prev;
      }
      toast.info(`Added ${symbol} to comparison matrix.`);
      return [...prev, symbol];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonSymbols([]);
  }, []);

  const setStockAlert = useCallback((symbol: string) => {
    toast.success(`Alert Configured: Notification set for ${symbol} when condition met.`);
  }, []);

  const exportWatchlist = useCallback(() => {
    const dataStr = JSON.stringify(watchlists, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `Watchlists_${Date.now()}.json`);
    linkElement.click();
    toast.success('Watchlist configuration exported.');
  }, [watchlists]);

  const importWatchlist = useCallback((jsonContent: string) => {
    toast.info('Import action simulated via clearing terminal.');
  }, []);

  const shareWatchlist = useCallback(() => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/watchlist/preview?hash=${btoa(JSON.stringify(activeWatchlist))}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Snapshot share URL copied to clipboard.');
      });
    }
  }, [activeWatchlist]);

  return {
    simulateLoading,
    setSimulateLoading,
    simulateError,
    setSimulateError,
    simulateEmpty,
    setSimulateEmpty,
    simulateOffline,
    setSimulateOffline,

    isLoading,
    error,

    watchlists,
    activeWatchlistId,
    setActiveWatchlistId,
    activeWatchlist,
    activeQuotes,
    allQuotes,
    watchlistsPerformance,
    
    comparisonSymbols,
    comparisonData,
    toggleComparisonSymbol,
    clearComparison,

    analytics,
    aiInsights,
    realTimeFeeds,

    createWatchlist,
    renameWatchlist,
    duplicateWatchlist,
    deleteWatchlist,
    addStockToWatchlist,
    removeStockFromWatchlist,
    setStockAlert,
    exportWatchlist,
    importWatchlist,
    shareWatchlist
  };
}
