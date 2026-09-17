'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAllQuotes, getStockQuote, StockQuote } from '@/lib/stockMock';
import { toast } from 'sonner';

export type ConnectionStatus = 'Connected' | 'Disconnected' | 'Reconnecting' | 'Offline';

export interface OrderBookEntry {
  price: number;
  qty: number;
  depth: number;
}

export interface LiveTrade {
  id: string;
  time: string;
  price: number;
  qty: number;
  side: 'Buy' | 'Sell';
}

export interface LiveNewsItem {
  id: string;
  time: string;
  headline: string;
  symbol: string;
  impact: 'High' | 'Moderate' | 'Low';
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface LiveNotification {
  id: string;
  time: string;
  title: string;
  description: string;
  type: 'Alert' | 'System' | 'AI';
}

export function useRealTimeMarket(selectedSymbol: string = 'AAPL') {
  const [status, setStatus] = useState<ConnectionStatus>('Connected');
  const [latency, setLatency] = useState<number>(12);
  const [quotes, setQuotes] = useState<StockQuote[]>(() => getAllQuotes());
  const [activeSymbolPrice, setActiveSymbolPrice] = useState<number>(() => getStockQuote(selectedSymbol)?.price || 180.50);
  const [priceFlash, setPriceFlash] = useState<Record<string, 'up' | 'down' | null>>({});

  // Generate dynamic order book based on current price
  const generateOrderBook = (price: number) => {
    const spread = 0.02 + Math.random() * 0.08;
    const mid = price;
    
    // Asks (Sells, above mid)
    const asks: OrderBookEntry[] = Array.from({ length: 8 }, (_, i) => {
      const askPrice = mid + (spread / 2) + i * 0.05;
      return {
        price: Number(askPrice.toFixed(2)),
        qty: Math.floor(Math.random() * 800) + 50,
        depth: 0
      };
    }).reverse();

    // Bids (Buys, below mid)
    const bids: OrderBookEntry[] = Array.from({ length: 8 }, (_, i) => {
      const bidPrice = mid - (spread / 2) - i * 0.05;
      return {
        price: Number(bidPrice.toFixed(2)),
        qty: Math.floor(Math.random() * 850) + 60,
        depth: 0
      };
    });

    // Calculate depths
    let maxQty = 1;
    [...bids, ...asks].forEach(x => { if (x.qty > maxQty) maxQty = x.qty; });
    bids.forEach(x => x.depth = (x.qty / maxQty) * 100);
    asks.forEach(x => x.depth = (x.qty / maxQty) * 100);

    return { bids, asks, spread: Number(spread.toFixed(2)) };
  };

  // L2 Order Book
  const [orderBook, setOrderBook] = useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[]; spread: number }>(() => 
    generateOrderBook(getStockQuote(selectedSymbol)?.price || 180.50)
  );

  // executed trades list
  const [trades, setTrades] = useState<LiveTrade[]>(() => {
    const price = getStockQuote(selectedSymbol)?.price || 180.50;
    return Array.from({ length: 15 }, (_, i) => {
      const offset = (Math.random() - 0.5) * 0.4;
      const tPrice = price + offset;
      const now = new Date();
      now.setSeconds(now.getSeconds() - i * 4);
      return {
        id: `t-${Date.now()}-${i}`,
        time: now.toLocaleTimeString(),
        price: Number(tPrice.toFixed(2)),
        qty: Math.floor(Math.random() * 500) + 10,
        side: Math.random() > 0.5 ? 'Buy' as const : 'Sell' as const
      };
    });
  });

  // feeds
  const [news, setNews] = useState<LiveNewsItem[]>(() => [
    { id: 'n-1', time: new Date().toLocaleTimeString(), headline: 'US Federal Reserve Hints at Soft Rate Cut Framework', symbol: 'SPY', impact: 'High', sentiment: 'positive' },
    { id: 'n-2', time: new Date().toLocaleTimeString(), headline: 'Apple Dispatches AI Developer Hub Packages to Beta Clusters', symbol: 'AAPL', impact: 'Moderate', sentiment: 'positive' },
    { id: 'n-3', time: new Date().toLocaleTimeString(), headline: 'Nvidia GPU Shipments Face Temporary Cargo Customs Audits', symbol: 'NVDA', impact: 'High', sentiment: 'negative' }
  ]);
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);

  // connection retry ref
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Seeding & Ticker switching sync
  useEffect(() => {
    const quote = getStockQuote(selectedSymbol);
    const price = quote?.price || 180.50;

    // Wrap in setTimeout to shift executions to next event loop tick
    const timer = setTimeout(() => {
      setQuotes(getAllQuotes());
      setActiveSymbolPrice(price);
      setOrderBook(generateOrderBook(price));
      
      const newTrades: LiveTrade[] = Array.from({ length: 15 }, (_, i) => {
        const offset = (Math.random() - 0.5) * 0.4;
        const tPrice = price + offset;
        const now = new Date();
        now.setSeconds(now.getSeconds() - i * 4);
        return {
          id: `t-${Date.now()}-${i}`,
          time: now.toLocaleTimeString(),
          price: Number(tPrice.toFixed(2)),
          qty: Math.floor(Math.random() * 500) + 10,
          side: Math.random() > 0.5 ? 'Buy' as const : 'Sell' as const
        };
      });
      setTrades(newTrades);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedSymbol]);

  // High Frequency Live Ticks Simulation
  useEffect(() => {
    if (status !== 'Connected') return;

    const interval = setInterval(() => {
      // 1. Latency fluctuation
      setLatency(Math.floor(8 + Math.random() * 15));

      // 2. Random price ticks for stock quotes
      setQuotes((prev) => {
        const flashes: Record<string, 'up' | 'down' | null> = {};
        const next = prev.map((q) => {
          // Fluctuate quotes
          const drift = (Math.random() - 0.495) * (q.price * 0.0015);
          if (Math.abs(drift) < 0.01) return q; // no update this tick

          const newPrice = q.price + drift;
          const direction = drift > 0 ? ('up' as const) : ('down' as const);
          flashes[q.symbol] = direction;

          const change = q.change + drift;
          const changePercent = (change / (newPrice - change)) * 100;
          const high = newPrice > q.high ? newPrice : q.high;
          const low = newPrice < q.low ? newPrice : q.low;

          if (q.symbol === selectedSymbol) {
            setActiveSymbolPrice(Number(newPrice.toFixed(2)));
          }

          return {
            ...q,
            price: Number(newPrice.toFixed(2)),
            change: Number(change.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            high: Number(high.toFixed(2)),
            low: Number(low.toFixed(2)),
            volume: q.volume + Math.floor(Math.random() * 200)
          };
        });

        setPriceFlash(flashes);
        setTimeout(() => setPriceFlash({}), 500); // clear flashes

        return next;
      });

      // 3. Update Order Book Depth
      setOrderBook((prev) => {
        const spread = prev.spread;
        
        const nextAsks = prev.asks.map(a => {
          const deltaQty = Math.floor((Math.random() - 0.5) * 120);
          const nextQty = Math.max(10, a.qty + deltaQty);
          return { ...a, qty: nextQty };
        });

        const nextBids = prev.bids.map(b => {
          const deltaQty = Math.floor((Math.random() - 0.5) * 120);
          const nextQty = Math.max(10, b.qty + deltaQty);
          return { ...b, qty: nextQty };
        });

        let maxQty = 1;
        [...nextBids, ...nextAsks].forEach(x => { if (x.qty > maxQty) maxQty = x.qty; });
        nextBids.forEach(x => x.depth = (x.qty / maxQty) * 100);
        nextAsks.forEach(x => x.depth = (x.qty / maxQty) * 100);

        return { bids: nextBids, asks: nextAsks, spread };
      });

      // 4. Executed Matches Log Ticks
      if (Math.random() > 0.4) {
        const tradePrice = activeSymbolPrice + (Math.random() - 0.5) * 0.1;
        const newTrade: LiveTrade = {
          id: `t-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          price: Number(tradePrice.toFixed(2)),
          qty: Math.floor(Math.random() * 300) + 5,
          side: Math.random() > 0.45 ? 'Buy' as const : 'Sell' as const
        };
        setTrades(prev => [newTrade, ...prev.slice(0, 24)]);
      }

      // 5. Macro news notifications
      if (Math.random() > 0.94) {
        const sampleNews = [
          { headline: 'Securities Commission Audits Automated Sandbox Clearance Nodes', symbol: 'BTC-USD', impact: 'Moderate' as const, sentiment: 'neutral' as const },
          { headline: 'Microsoft Launches Custom Cobalt Silicon Chips on Azure Core', symbol: 'MSFT', impact: 'High' as const, sentiment: 'positive' as const },
          { headline: 'Short Squeezes Triggers Trading Latencies on Meme Speculations', symbol: 'GME', impact: 'High' as const, sentiment: 'negative' as const }
        ];
        const picked = sampleNews[Math.floor(Math.random() * sampleNews.length)];
        const newNews: LiveNewsItem = {
          id: `n-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          headline: picked.headline,
          symbol: picked.symbol,
          impact: picked.impact,
          sentiment: picked.sentiment
        };
        setNews(prev => [newNews, ...prev.slice(0, 9)]);

        // Notify Alert triggers
        const newAlert: LiveNotification = {
          id: `notif-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          title: 'Live Breaking News Alert',
          description: picked.headline,
          type: picked.impact === 'High' ? 'AI' : 'System'
        };
        setNotifications(prev => [newAlert, ...prev.slice(0, 9)]);
      }

      // 6. Volatility Price Alert trigger
      if (Math.random() > 0.96) {
        const symbolsList = ['AAPL', 'MSFT', 'NVDA', 'BTC-USD'];
        const sym = symbolsList[Math.floor(Math.random() * symbolsList.length)];
        const alertsList = [
          { title: 'Volatility Alert', desc: `${sym} crossed key support boundary.` },
          { title: 'AI Advisory Signal', desc: `Algorithmic indicators flag bullish crossover on ${sym}.` },
          { title: 'Target Triggered', desc: `Trailing stop-loss successfully updated for ${sym} holding.` }
        ];
        const pickedAlert = alertsList[Math.floor(Math.random() * alertsList.length)];
        const newAlert: LiveNotification = {
          id: `notif-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          title: pickedAlert.title,
          description: pickedAlert.desc,
          type: pickedAlert.title.includes('AI') ? 'AI' : 'Alert'
        };
        setNotifications(prev => [newAlert, ...prev.slice(0, 9)]);
      }

    }, 800);

    return () => clearInterval(interval);
  }, [status, activeSymbolPrice, selectedSymbol]);

  // Simulate manual connection resets
  const retryConnection = useCallback(() => {
    if (status === 'Connected') return;
    setStatus('Reconnecting');
    setLatency(0);

    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);

    reconnectTimeoutRef.current = setTimeout(() => {
      setStatus('Connected');
      setLatency(12);
      setQuotes(getAllQuotes());
      toast.success('WebSocket Market data telemetry connection established.');
    }, 1500);
  }, [status]);

  const disconnect = useCallback(() => {
    setStatus('Disconnected');
    setLatency(0);
  }, []);

  const simulateOffline = useCallback(() => {
    setStatus('Offline');
    setLatency(0);
  }, []);

  return {
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
  };
}
