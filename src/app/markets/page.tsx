'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Search, 
  Clock, 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Custom Hooks & Subcomponents
import { useRealTimeMarket } from './hooks/useRealTimeMarket';
import MarketTickerTape from './components/MarketTickerTape';
import RealTimeChartPanel from './components/RealTimeChartPanel';
import OrderBookTrades from './components/OrderBookTrades';
import LiveWatchListPortfolio from './components/LiveWatchListPortfolio';
import MarketNewsAlerts from './components/MarketNewsAlerts';

export default function MarketsPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Initialize Real-time Feed Hook
  const {
    status,
    latency,
    quotes,
    activeSymbolPrice,
    priceFlash,
    orderBook,
    trades,
    news,
    notifications,
    retryConnection,
    disconnect,
    simulateOffline
  } = useRealTimeMarket(selectedSymbol);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Filter autocomplete stock quotes
  const autocompleteResults = useMemo(() => {
    if (!searchQuery) return [];
    return quotes.filter(
      (q) => 
        q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery, quotes]);

  // Compute countdown to market change
  const [countdown, setCountdown] = useState('02h 45m 12s');
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const target = new Date();
      target.setHours(15, 30, 0, 0); // NSE market close at 3:30 PM
      if (now > target) {
        target.setDate(target.getDate() + 1);
        target.setHours(9, 15, 0, 0); // NSE market open next day at 9:15 AM
      }
      
      const diff = target.getTime() - now.getTime();
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      setCountdown(`${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6 pb-24 font-mono text-xs animate-pulse text-foreground">
        <div className="h-12 bg-panel border border-border/40 rounded-xl" />
        <div className="h-24 bg-panel border border-border/40 rounded-xl" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-96 bg-panel border border-border/40 rounded-2xl" />
          <div className="h-96 bg-panel border border-border/40 rounded-2xl" />
        </div>
      </div>
    );
  }

  const isMarketOpen = new Date().getHours() >= 9 && new Date().getHours() < 16;

  return (
    <div className="space-y-6 pb-24 font-mono text-xs text-foreground select-none">
      
      {/* 1. Global Live Ticker Tape */}
      <MarketTickerTape />

      {/* 2. Page Header Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-border/40 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-sm">
              <Globe className="w-5 h-5" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-sans">
              Real-Time Trading Hub
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-9">
            Bloomberg-style command workspace driven by sub-second WebSocket server telemetry.
          </p>
        </div>

        {/* Global Search Bar Command Input */}
        <div className="relative w-full xl:w-80">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Select Ticker (e.g. MSFT, NVDA, BTC)..."
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/80 border border-border rounded-xl text-foreground focus:outline-none focus:border-primary font-mono text-xs shadow-inner"
            />
          </div>

          {/* Autocomplete Panel */}
          {isSearchFocused && (
            <div className="absolute left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-50 p-3.5 space-y-3">
              {searchQuery ? (
                <>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground block border-b border-border/40 pb-1.5">Matching Symbols</span>
                  {autocompleteResults.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground py-2 text-center">No symbols locate match.</p>
                  ) : (
                    <div className="space-y-1">
                      {autocompleteResults.map((stock) => (
                        <div 
                          key={stock.symbol} 
                          onClick={() => {
                            setSelectedSymbol(stock.symbol);
                            setSearchQuery('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <span className="font-bold text-foreground block">{stock.symbol}</span>
                            <span className="text-[9px] text-muted-foreground font-sans block truncate max-w-[150px]">{stock.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-foreground">${stock.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  {/* Recent / Trending searches */}
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block border-b border-border/40 pb-1.5 mb-1.5">Popular Symbols</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC-USD'].map((sym) => (
                        <span 
                          key={sym} 
                          onClick={() => {
                            setSelectedSymbol(sym);
                          }}
                          className="px-2 py-1 rounded bg-secondary hover:bg-muted font-bold text-[10px] transition-colors cursor-pointer text-primary border border-border/30"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Diagnostics & Telemetry strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-panel border border-border/80 rounded-xl p-4 shadow-sm select-none items-center text-xs">
        {/* Market Status */}
        <div className="flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">Market Status</span>
            <p className="font-bold text-foreground block flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isMarketOpen ? 'OPEN (NSE/BSE)' : 'CLOSED (Pre-Market)'}
            </p>
          </div>
        </div>

        {/* Count Down */}
        <div className="flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4">
          <Activity className="w-4 h-4 text-muted-foreground" />
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">
              {isMarketOpen ? 'Time to market close' : 'Time to market open'}
            </span>
            <p className="font-bold text-foreground text-sm font-mono mt-0.5">{countdown}</p>
          </div>
        </div>

        {/* WebSocket Connection status */}
        <div className="flex items-center gap-2.5 border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4">
          {status === 'Connected' ? (
            <Wifi className="w-4 h-4 text-bullish animate-pulse" />
          ) : (
            <WifiOff className="w-4 h-4 text-bearish" />
          )}
          <div>
            <span className="text-[9px] uppercase font-bold text-muted-foreground block">WebSocket Telemetry</span>
            <p className="font-bold text-foreground flex items-center gap-1.5 mt-0.5 uppercase">
              <span className={`w-2 h-2 rounded-full ${
                status === 'Connected' ? 'bg-bullish' : 
                status === 'Reconnecting' ? 'bg-amber-500 animate-bounce' : 'bg-bearish'
              }`} />
              {status} {status === 'Connected' ? `(${latency}ms)` : ''}
            </p>
          </div>
        </div>

        {/* Connection overrides */}
        <div className="flex items-center gap-1.5 justify-end border-t md:border-t-0 md:border-l border-border/40 pt-3 md:pt-0 md:pl-4 w-full">
          {status !== 'Connected' ? (
            <Button 
              size="xs" 
              onClick={retryConnection}
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-1 cursor-pointer w-full text-[10px]"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Retry Connection
            </Button>
          ) : (
            <div className="flex gap-1.5 w-full">
              <Button 
                variant="outline" 
                size="xs" 
                onClick={disconnect}
                className="border-bearish/30 text-bearish hover:bg-bearish/10 font-bold text-[9px] w-1/2 cursor-pointer"
              >
                Disconnect
              </Button>
              <Button 
                variant="outline" 
                size="xs" 
                onClick={simulateOffline}
                className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 font-bold text-[9px] w-1/2 cursor-pointer"
              >
                Go Offline
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Failure Banner Alert */}
      {status !== 'Connected' && (
        <Card className="bg-bearish/5 border border-bearish/25 p-3.5 rounded-xl flex items-center justify-between text-bearish">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-extrabold text-[11px] uppercase tracking-wider block">Telemetry stream offline</span>
              <p className="text-[10px] text-muted-foreground leading-normal font-sans">
                Exchange WebSocket client disconnected. Prices and order book wicks are currently frozen.
              </p>
            </div>
          </div>
          <Button 
            size="xs" 
            onClick={retryConnection} 
            className="bg-bearish text-white hover:bg-bearish/90 font-bold cursor-pointer shrink-0 text-[10px]"
          >
            Reconnect Nodes
          </Button>
        </Card>
      )}

      {/* 4. Center Charts & Portfolio grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <RealTimeChartPanel symbol={selectedSymbol} currentPrice={activeSymbolPrice} />
        </div>
        <div>
          <Card className="bg-panel border border-border/80 h-full p-4 flex flex-col justify-between items-center text-center">
            <div className="space-y-4 py-8">
              <div className="p-4 bg-primary/10 rounded-full text-primary border border-primary/20 shadow-inner w-16 h-16 flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">Dynamic Workspace selection</span>
                <h3 className="text-xl font-extrabold text-foreground font-sans">Currently Auditing: {selectedSymbol}</h3>
                <p className="text-[10px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                  Toggle watchlists below or execute transactions to dynamically track telemetry changes across all matching charts.
                </p>
              </div>
            </div>
            <Link href={`/stock/${selectedSymbol}`} className="w-full">
              <Button variant="outline" className="w-full text-[10px] font-bold cursor-pointer gap-1.5">
                Inspect Detailed Symbol Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* 5. Watchlist & Portfolio metrics grid */}
      <LiveWatchListPortfolio 
        quotes={quotes}
        priceFlash={priceFlash}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
        connectionStatus={status}
      />

      {/* 6. L2 Depth book & Matches Log */}
      <OrderBookTrades 
        bids={orderBook.bids}
        asks={orderBook.asks}
        spread={orderBook.spread}
        trades={trades}
        currentPrice={activeSymbolPrice}
      />

      {/* 7. Breaking News, AI Gauges, and Alerts */}
      <MarketNewsAlerts 
        news={news}
        notifications={notifications}
      />

    </div>
  );
}
