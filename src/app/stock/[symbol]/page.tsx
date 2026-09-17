'use client';

import React, { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart
} from 'recharts';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Share2,
  Plus,
  Sparkles,
  ArrowUpRight,
  Clock,
  Sliders,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getStockQuote, getChartData } from '@/lib/stockMock';
import { useStockDetail, useStockHistorical, useExecuteTrade } from '@/lib/queryHooks';
import { RetryComponent } from '@/components/ui/CommonUi';

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

// 52-Week range helper calculation
const calculateRangePosition = (current: number, low: number, high: number) => {
  if (high === low) return 50;
  return Math.min(100, Math.max(0, ((current - low) / (high - low)) * 100));
};

interface TooltipPayloadItem {
  payload: {
    close: number;
    sma20?: number;
    ema12?: number;
    volume: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

// Custom crosshair tooltip component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 text-[10px] font-mono shadow-xl space-y-1 text-foreground min-w-[120px]">
        <div className="border-b border-border pb-1 font-bold text-[11px]">{label}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-bold">${data.close.toFixed(2)}</span>
        </div>
        {data.sma20 !== undefined && (
          <div className="flex justify-between gap-4 text-orange-400">
            <span>SMA (20):</span>
            <span className="font-bold">${data.sma20.toFixed(2)}</span>
          </div>
        )}
        {data.ema12 !== undefined && (
          <div className="flex justify-between gap-4 text-cyan-400">
            <span>EMA (12):</span>
            <span className="font-bold">${data.ema12.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between gap-4 text-muted-foreground">
          <span>Volume:</span>
          <span className="font-bold">{(data.volume / 1e6).toFixed(2)}M</span>
        </div>
      </div>
    );
  }
  return null;
};

// Premium loading skeleton matching terminal components layout
function StockDetailSkeleton() {
  return (
    <div className="space-y-6 select-none animate-pulse text-foreground font-mono">
      <div className="h-4 w-36 bg-secondary/80 rounded" />
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-border/40 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/80" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-secondary/80 rounded" />
            <div className="h-4 w-64 bg-secondary/80 rounded animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="space-y-2">
            <div className="h-8 w-28 bg-secondary/80 rounded" />
            <div className="h-4 w-32 bg-secondary/80 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-8 bg-secondary/80 rounded-lg" />
            <div className="w-20 h-8 bg-secondary/80 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="border border-border/60 rounded-xl bg-panel p-4 h-96 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-6 w-48 bg-secondary/80 rounded animate-pulse" />
              <div className="h-6 w-36 bg-secondary/80 rounded" />
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full space-y-8 px-4 opacity-20">
                <div className="h-px bg-muted-foreground w-full" />
                <div className="h-px bg-muted-foreground w-full" />
                <div className="h-px bg-muted-foreground w-full" />
              </div>
            </div>
            <div className="h-4 w-full bg-secondary/80 rounded" />
          </div>
          <div className="flex gap-2 border-b border-border/40 pb-px">
            <div className="w-24 h-8 bg-secondary/80 rounded-t" />
            <div className="w-24 h-8 bg-secondary/80 rounded-t opacity-60" />
            <div className="w-24 h-8 bg-secondary/80 rounded-t opacity-60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-panel border border-border/60 rounded-xl" />
            <div className="md:col-span-1 h-64 bg-panel border border-border/60 rounded-xl" />
          </div>
        </div>
        <div className="xl:col-span-1 space-y-6">
          <div className="h-96 bg-panel border border-border/60 rounded-xl p-4 space-y-4">
            <div className="h-8 bg-secondary/80 rounded" />
            <div className="h-10 bg-secondary/80 rounded" />
            <div className="h-10 bg-secondary/80 rounded" />
            <div className="h-24 bg-secondary/80 rounded" />
          </div>
          <div className="h-48 bg-panel border border-border/60 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function StockDetailPage({ params }: StockPageProps) {
  // Await page params
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();

  // Component States & Dynamic Query Data
  const [timeRange, setTimeRange] = useState<string>('1M');
  const [tick, setTick] = useState(0);
  
  const { data: stockData, isLoading: stockLoading, error: stockError, refetch: refetchStock } = useStockDetail(upperSymbol);
  const { data: rawChartData = [], isLoading: chartLoading } = useStockHistorical(upperSymbol, timeRange);
  const tradeMutation = useExecuteTrade();

  const loading = stockLoading || chartLoading;

  const [activeTab, setActiveTab] = useState<'Overview' | 'Financials' | 'Technical' | 'News' | 'AI' | 'Analysts'>('Overview');
  const [financialTimeframe, setFinancialTimeframe] = useState<'Yearly' | 'Quarterly'>('Yearly');
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  // Indicators State
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showMACD, setShowMACD] = useState(false);
  const [showBB, setShowBB] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Order Panel State
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT'>('MARKET');
  const [tradeQuantity, setTradeQuantity] = useState<number>(10);
  const [limitPrice, setLimitPrice] = useState<number | null>(null);
  const [stopPrice, setStopPrice] = useState<number | null>(null);
  const [takeProfitPrice, setTakeProfitPrice] = useState<number | null>(null);
  const [buyingPower, setBuyingPower] = useState<number>(25000);

  // Dynamic Stochastic Tick Loop for live telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Fetch dynamic mock quotes
  const quote = useMemo(() => {
    if (!stockData) return null;

    // Simulate minor live ticking spreads
    const sinOffset = Math.sin(tick * 0.15) * (stockData.price * 0.002);
    const price = stockData.price + sinOffset;
    const change = price - stockData.prevClose;
    const changePercent = (change / stockData.prevClose) * 100;

    return {
      ...stockData,
      price,
      change,
      changePercent,
    };
  }, [stockData, tick]);

  const lastUpdatedText = useMemo(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' EST';
  }, [tick]);

  // Set default target trigger prices dynamically during render
  const activeLimitPrice = limitPrice !== null ? limitPrice : (quote ? Number(quote.price.toFixed(2)) : 0);
  const activeStopPrice = stopPrice !== null ? stopPrice : (quote ? Number((quote.price * 0.95).toFixed(2)) : 0);
  const activeTakeProfitPrice = takeProfitPrice !== null ? takeProfitPrice : (quote ? Number((quote.price * 1.15).toFixed(2)) : 0);

  // Fetch historic chart data points
  const chartPoints = useMemo(() => {
    // Supplement RSI / MACD indicators inside datasets
    return rawChartData.map((d, index) => {
      const rsi = 40 + Math.sin(index * 0.3 + tick * 0.05) * 25 + Math.cos(index * 0.1) * 5;
      const macdLine = Math.sin(index * 0.2 + tick * 0.04) * 2.5;
      const signalLine = Math.sin(index * 0.2 - 0.2 + tick * 0.04) * 2.2;
      return {
        ...d,
        rsi: Math.max(10, Math.min(90, rsi)),
        macd: macdLine,
        macdSignal: signalLine,
        macdHist: macdLine - signalLine
      };
    });
  }, [rawChartData, tick]);

  // Static Details Mock Database matching specific tickers
  const companyProfile = useMemo(() => {
    interface ProfileDetail { ceo: string; hq: string; founded: string; employees: string; website: string; summary: string; }
    const profiles: Record<string, ProfileDetail> = {
      AAPL: {
        ceo: 'Tim Cook',
        hq: 'Cupertino, California, US',
        founded: '1976',
        employees: '164,000',
        website: 'https://apple.com',
        summary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company also offers Apple Pay, Apple Music, iCloud, and App Store desks.',
      },
      MSFT: {
        ceo: 'Satya Nadella',
        hq: 'Redmond, Washington, US',
        founded: '1975',
        employees: '221,000',
        website: 'https://microsoft.com',
        summary: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. Its Productivity and Business Processes segment offers Office, Exchange, SharePoint, Microsoft Teams, and LinkedIn.',
      },
      NVDA: {
        ceo: 'Jensen Huang',
        hq: 'Santa Clara, California, US',
        founded: '1993',
        employees: '29,600',
        website: 'https://nvidia.com',
        summary: 'NVIDIA Corporation focuses on personal computer graphics, graphics processing units, and also artificial intelligence solutions. It operates through two segments, Graphics and Compute & Networking.',
      },
      TSLA: {
        ceo: 'Elon Musk',
        hq: 'Austin, Texas, US',
        founded: '2003',
        employees: '140,400',
        website: 'https://tesla.com',
        summary: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
      }
    };
    return profiles[upperSymbol] || {
      ceo: 'Corporate Administrator',
      hq: 'Financial District, New York',
      founded: '2010',
      employees: '12,500',
      website: 'https://quant.platform',
      summary: 'Aggregated simulated corporate entity providing assets telemetry, quantitative analysis algorithms, and high-frequency execution sandbox nodes.',
    };
  }, [upperSymbol]);

  // Financial summary databases (Yearly vs Quarterly)
  const financialSummary = useMemo(() => {
    if (financialTimeframe === 'Yearly') {
      return [
        { period: '2022', Revenue: 394.3, NetProfit: 99.8, EBITDA: 130.5 },
        { period: '2023', Revenue: 383.2, NetProfit: 96.9, EBITDA: 125.8 },
        { period: '2024', Revenue: 402.1, NetProfit: 104.5, EBITDA: 138.2 },
        { period: '2025 (Proj)', Revenue: 428.6, NetProfit: 112.4, EBITDA: 148.5 },
      ];
    } else {
      return [
        { period: 'Q3 24', Revenue: 90.1, NetProfit: 22.4, EBITDA: 30.2 },
        { period: 'Q4 24', Revenue: 119.5, NetProfit: 33.9, EBITDA: 43.1 },
        { period: 'Q1 25', Revenue: 96.2, NetProfit: 25.1, EBITDA: 32.5 },
        { period: 'Q2 25', Revenue: 101.4, NetProfit: 28.6, EBITDA: 35.8 },
      ];
    }
  }, [financialTimeframe]);

  // Analyst consensus recommendation metrics
  const analystConsensus = useMemo(() => {
    if (!quote) return { buyPct: 0, holdPct: 0, sellPct: 0, total: 0, upside: 0 };
    const buy = quote.recommendations.buy;
    const hold = quote.recommendations.hold;
    const sell = quote.recommendations.sell;
    const total = buy + hold + sell;
    const upside = ((quote.targetPrice - quote.price) / quote.price) * 100;
    return {
      buyPct: Math.round((buy / total) * 100),
      holdPct: Math.round((hold / total) * 100),
      sellPct: Math.round((sell / total) * 100),
      total,
      upside
    };
  }, [quote]);

  // Related Assets Peer Group List
  const relatedAssets = useMemo(() => {
    const peers = [
      { name: 'Apple Inc.', symbol: 'AAPL', price: 182.52, changePercent: 2.14 },
      { name: 'NVIDIA Corp.', symbol: 'NVDA', price: 875.12, changePercent: 4.28 },
      { name: 'Microsoft Corp.', symbol: 'MSFT', price: 415.50, changePercent: 1.32 },
      { name: 'Tesla, Inc.', symbol: 'TSLA', price: 175.34, changePercent: -3.12 },
    ];
    return peers.filter(p => p.symbol !== upperSymbol);
  }, [upperSymbol]);

  // Specific news feed logic
  const newsList = useMemo(() => {
    return [
      {
        title: `Strategic Re-allocation Nodes Target ${upperSymbol} Growth Segments`,
        source: 'Capital Market Wire',
        time: '45 mins ago',
        category: 'Corporate Growth',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=150&h=100'
      },
      {
        title: `${upperSymbol} Options Volume Surges as Volatility Band Width Compresses`,
        source: 'Derivatives Journal',
        time: '3 hours ago',
        category: 'Options Analysis',
        image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=150&h=100'
      },
      {
        title: `${upperSymbol} Outlines AI-powered Telemetry Nodes for Cloud Enterprise Services`,
        source: 'Global Tech Report',
        time: '6 hours ago',
        category: 'AI Expansion',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&h=100'
      }
    ];
  }, [upperSymbol]);

  // AI Sentiment analysis metrics
  const aiInsight = useMemo(() => {
    const score = 74 + Math.sin(tick * 0.1) * 3;
    const finalScore = Math.min(99, Math.max(10, Math.round(score)));
    return {
      score: finalScore,
      sentiment: finalScore >= 75 ? 'Strong Buy' : finalScore >= 55 ? 'Accumulate' : finalScore >= 45 ? 'Hold' : 'Underperform',
      risk: finalScore >= 75 ? 'Low (15%)' : finalScore >= 50 ? 'Moderate (42%)' : 'High (78%)',
      volatility: 'Low compression bands indicate breakout potential.',
      fundamentals: `${upperSymbol} exhibits ROE of ${(quote ? quote.roe : 35).toFixed(1)}% backed by exceptional cash flow metrics.`,
      technicals: 'Moving averages confirm strong support floors with RSI compression in neutral zones.'
    };
  }, [tick, quote, upperSymbol]);

  // Handle Sandbox trades
  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    if (tradeQuantity <= 0) {
      toast.error('Invalid order quantity', { description: 'Please choose positive volume.' });
      return;
    }

    let executionCost = tradeQuantity * quote.price;
    if (orderType === 'LIMIT') executionCost = tradeQuantity * activeLimitPrice;

    if (tradeType === 'BUY' && executionCost > buyingPower) {
      toast.error('Order rejected: Insufficient margin', {
        description: `Estimated cost of $${executionCost.toLocaleString(undefined, { maximumFractionDigits: 2 })} exceeds buying power.`
      });
      return;
    }

    tradeMutation.mutate({
      symbol: upperSymbol,
      type: tradeType,
      quantity: tradeQuantity,
      orderType,
      limitPrice: orderType === 'LIMIT' ? activeLimitPrice : undefined,
      stopPrice: orderType === 'STOP_LOSS' ? activeStopPrice : undefined,
    }, {
      onSuccess: () => {
        if (tradeType === 'BUY') {
          setBuyingPower((prev) => prev - executionCost);
        } else {
          setBuyingPower((prev) => prev + executionCost);
        }
      }
    });
  };

  const toggleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    toast.success(isWatchlisted ? 'Asset removed' : 'Asset watchlisted', {
      description: `${upperSymbol} details ${isWatchlisted ? 'detached from' : 'synced to'} watchlists.`
    });
  };

  const handleShare = () => {
    toast.info('Share coordinates exported', {
      description: `Market telemetry link for ${upperSymbol} copied to clipboard.`
    });
  };

  if (stockError) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <RetryComponent message={(stockError as any).message} onRetry={refetchStock} />
      </div>
    );
  }

  if (loading || !quote) {
    return <StockDetailSkeleton />;
  }

  const isBullish = quote.changePercent >= 0;
  const estimatedCost = tradeQuantity * (
    orderType === 'LIMIT' 
      ? activeLimitPrice 
      : orderType === 'STOP_LOSS' 
      ? activeStopPrice 
      : orderType === 'TAKE_PROFIT' 
      ? activeTakeProfitPrice 
      : quote.price
  );

  return (
    <div className="space-y-6 select-none font-mono text-foreground">
      {/* Return link */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> RETURN TO WORKSPACE TERMINAL
      </Link>

      {/* ==================================== PAGE HEADER ==================================== */}
      <div className="bg-card/90 border border-border/80 rounded-xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-primary/20 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-lg text-amber-400 shadow-inner shrink-0">
              {upperSymbol.slice(0, 2)}
            </div>
            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono flex items-center gap-2">
                {quote.symbol}
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {quote.sector}
                </span>
              </h1>
              <p className="text-xs text-muted-foreground font-sans">
                {quote.name} • {quote.marketCap} Cap • Beta {quote.beta.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Price telemetry */}
          <div className="flex flex-col md:items-end font-mono">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
              ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-bold mt-1 ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isBullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span className="tabular-nums">{isBullish ? '+' : ''}{quote.change.toFixed(2)} ({isBullish ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
              <span className="text-[9px] text-muted-foreground bg-secondary/80 px-1.5 py-0.5 rounded border border-border/40 flex items-center gap-1 ml-1.5 font-mono">
                <Clock className="w-2.5 h-2.5 text-amber-400 animate-pulse" /> {lastUpdatedText}
              </span>
            </div>
          </div>

          {/* Action buttons list */}
          <div className="flex flex-wrap gap-2 font-mono">
            <button
              onClick={toggleWatchlist}
              className={`px-3.5 py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isWatchlisted
                  ? 'bg-amber-500 text-black border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-secondary/60 border-border/80 text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
            >
              <Plus className="w-3.5 h-3.5" /> {isWatchlisted ? 'WATCHLISTED' : 'ADD WATCHLIST'}
            </button>
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-xl border border-border/80 bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> SHARE
            </button>
            <button
              onClick={() => {
                document.getElementById('trading-panel')?.scrollIntoView({ behavior: 'smooth' });
                setTradeType('BUY');
                toast.info('Trading panel focus active (BUY)');
              }}
              className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <Check className="w-3.5 h-3.5" /> BUY
            </button>
            <button
              onClick={() => {
                document.getElementById('trading-panel')?.scrollIntoView({ behavior: 'smooth' });
                setTradeType('SELL');
                toast.info('Trading panel focus active (SELL)');
              }}
              className="px-3.5 py-2 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.1)]"
            >
              <X className="w-3.5 h-3.5" /> SELL
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid View split */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        
        {/* Left Side (3 Columns): Interactive charts, fundamentals, tabs */}
        <div className="xl:col-span-3 space-y-6">

          {/* ==================================== PRICE CHART & INDICATORS ==================================== */}
          <Card className="bg-panel border-border/80 shadow-xl overflow-hidden">
            <CardHeader className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-border/30 bg-secondary/10">
              
              {/* Technical indicators checklists */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5 text-primary" /> Indicators:
                </span>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showSMA}
                    onChange={(e) => setShowSMA(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-orange-400 font-bold">SMA (20)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showEMA}
                    onChange={(e) => setShowEMA(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-cyan-400 font-bold">EMA (12)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showBB}
                    onChange={(e) => setShowBB(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-purple-400 font-bold">B-Bands</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showRSI}
                    onChange={(e) => setShowRSI(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-yellow-500 font-bold">RSI (14)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showMACD}
                    onChange={(e) => setShowMACD(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-violet-400 font-bold">MACD</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-foreground cursor-pointer font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showVolume}
                    onChange={(e) => setShowVolume(e.target.checked)}
                    className="accent-primary rounded"
                  />
                  <span className="text-gray-400 font-bold">Volume</span>
                </label>
              </div>

              {/* Timeframe intervals selectors */}
              <div className="flex gap-0.5 p-0.5 rounded bg-secondary border border-border/80 text-[9px]">
                {['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-1 rounded font-bold cursor-pointer transition-colors ${timeRange === range
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Primary Composed Price and Volume Chart */}
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop stopColor={isBullish ? 'var(--bullish)' : 'var(--bearish)'} stopOpacity={0.15} />
                        <stop stopColor={isBullish ? 'var(--bullish)' : 'var(--bearish)'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="var(--muted-foreground)"
                      fontSize={9}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="price"
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="var(--muted-foreground)"
                      fontSize={9}
                      fontFamily="monospace"
                      tickLine={false}
                      tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <YAxis
                      yAxisId="volume"
                      orientation="right"
                      domain={[0, 'dataMax * 3']}
                      stroke="none"
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '3 3' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, paddingBottom: 10 }} />

                    {/* Dynamic volume overlay */}
                    {showVolume && (
                      <Bar
                        name="Volume"
                        yAxisId="volume"
                        dataKey="volume"
                        fill="oklch(var(--muted-foreground) / 0.12)"
                      />
                    )}

                    {/* Bollinger Bands Shading Area */}
                    {showBB && (
                      <Area
                        name="Bollinger Band Width"
                        yAxisId="price"
                        type="monotone"
                        dataKey="bbUpper"
                        stroke="transparent"
                        fill="rgba(168, 85, 247, 0.04)"
                        connectNulls={true}
                      />
                    )}
                    {showBB && (
                      <Line
                        name="BB Upper"
                        yAxisId="price"
                        type="monotone"
                        dataKey="bbUpper"
                        stroke="rgba(168, 85, 247, 0.5)"
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                    {showBB && (
                      <Line
                        name="BB Lower"
                        yAxisId="price"
                        type="monotone"
                        dataKey="bbLower"
                        stroke="rgba(168, 85, 247, 0.5)"
                        strokeWidth={1}
                        dot={false}
                        connectNulls={true}
                      />
                    )}

                    {/* Main Price Composed area */}
                    <Area
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      stroke="none"
                      fill="url(#priceGrad)"
                      connectNulls={true}
                      legendType="none"
                    />
                    <Line
                      name="Close Price ($)"
                      yAxisId="price"
                      type="monotone"
                      dataKey="close"
                      stroke={isBullish ? 'var(--bullish)' : 'var(--bearish)'}
                      strokeWidth={2.5}
                      dot={false}
                      connectNulls={true}
                    />

                    {/* Technical Moving Averages overlay lines */}
                    {showSMA && (
                      <Line
                        name="SMA (20)"
                        yAxisId="price"
                        type="monotone"
                        dataKey="sma20"
                        stroke="#FB923C"
                        strokeWidth={1.5}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                    {showEMA && (
                      <Line
                        name="EMA (12)"
                        yAxisId="price"
                        type="monotone"
                        dataKey="ema12"
                        stroke="#22D3EE"
                        strokeWidth={1.5}
                        dot={false}
                        connectNulls={true}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* SECONDARY PANEL: RSI Indicator Chart */}
              {showRSI && (
                <div className="h-32 border-t border-border/30 pt-4">
                  <div className="flex justify-between items-center text-[9px] text-yellow-500 font-bold mb-1">
                    <span>RSI (14) OSCILLATOR</span>
                    <span>OVERBOUGHT: 70 | OVERSOLD: 30</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartPoints} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={8} fontFamily="monospace" tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} />
                      <Line name="RSI" type="monotone" dataKey="rsi" stroke="#EAB308" strokeWidth={1.5} dot={false} connectNulls={true} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* SECONDARY PANEL: MACD Indicator Chart */}
              {showMACD && (
                <div className="h-32 border-t border-border/30 pt-4">
                  <div className="flex justify-between items-center text-[9px] text-violet-400 font-bold mb-1">
                    <span>MACD (12, 26, 9) MOMENTUM</span>
                    <span>DIVERGENCES SPREAD</span>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartPoints} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                      <XAxis dataKey="time" hide />
                      <YAxis stroke="var(--muted-foreground)" fontSize={8} fontFamily="monospace" tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} />
                      <Bar name="Histogram" dataKey="macdHist" fill="#A78BFA" />
                      <Line name="MACD" type="monotone" dataKey="macd" stroke="#8B5CF6" strokeWidth={1.2} dot={false} connectNulls={true} />
                      <Line name="Signal" type="monotone" dataKey="macdSignal" stroke="#EC4899" strokeWidth={1.2} dot={false} connectNulls={true} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ==================================== TABS CONTENT SELECTOR ==================================== */}
          <div className="space-y-4">
            
            {/* Tabs Buttons bar */}
            <div className="flex flex-wrap border-b border-border/40 text-xs font-bold gap-1 pb-px">
              {(['Overview', 'Financials', 'Technical', 'News', 'AI', 'Analysts'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-b-2 transition-all cursor-pointer ${activeTab === tab
                      ? 'border-primary text-primary font-black'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
              >

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* Key stats & metrics list */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Market Cap</span>
                        <span className="text-foreground text-sm font-bold block">${(quote.marketCap / 1e9).toFixed(1)}B</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">P/E Ratio</span>
                        <span className="text-foreground text-sm font-bold block">{quote.peRatio || '—'}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">EPS (TTM)</span>
                        <span className="text-foreground text-sm font-bold block">${quote.eps || '—'}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Div Yield</span>
                        <span className="text-foreground text-sm font-bold block">{quote.dividendYield ? `${quote.dividendYield}%` : '—'}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Beta Ratio</span>
                        <span className="text-foreground text-sm font-bold block">{quote.beta.toFixed(2)}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Return on Equity</span>
                        <span className="text-foreground text-sm font-bold block">{quote.roe ? `${quote.roe}%` : '—'}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Shares Outstanding</span>
                        <span className="text-foreground text-sm font-bold block">{quote.sharesOutstanding}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">Average Volume</span>
                        <span className="text-foreground text-sm font-bold block">{quote.avgVolume}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">52W High</span>
                        <span className="text-foreground text-sm font-bold block">${quote.fiftyTwoWeekRange.high.toFixed(2)}</span>
                      </Card>
                      <Card className="bg-panel border-border/80 shadow-sm p-3.5 space-y-1">
                        <span className="text-muted-foreground text-[9px] uppercase tracking-wider block">52W Low</span>
                        <span className="text-foreground text-sm font-bold block">${quote.fiftyTwoWeekRange.low.toFixed(2)}</span>
                      </Card>
                    </div>

                    {/* 52-Week Range Progress Slider */}
                    <Card className="bg-panel border-border/80 shadow-sm p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                          <span>52-Week Low (${quote.fiftyTwoWeekRange.low.toFixed(2)})</span>
                          <span>Current Position</span>
                          <span>52-Week High (${quote.fiftyTwoWeekRange.high.toFixed(2)})</span>
                        </div>
                        <div className="relative h-2 w-full bg-secondary border border-border/60 rounded-full overflow-visible">
                          <div 
                            style={{ left: `${calculateRangePosition(quote.price, quote.fiftyTwoWeekRange.low, quote.fiftyTwoWeekRange.high)}%` }} 
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-primary border-2 border-white dark:border-background rounded-full shadow-lg z-10 animate-pulse" 
                          />
                          <div 
                            style={{ 
                              left: '0%', 
                              width: `${calculateRangePosition(quote.price, quote.fiftyTwoWeekRange.low, quote.fiftyTwoWeekRange.high)}%` 
                            }} 
                            className="absolute top-0 bottom-0 bg-primary/30 rounded-full" 
                          />
                        </div>
                        <p className="text-center text-[10px] text-muted-foreground font-bold">
                          Live Price represents {calculateRangePosition(quote.price, quote.fiftyTwoWeekRange.low, quote.fiftyTwoWeekRange.high).toFixed(1)}% of the yearly channel spread.
                        </p>
                      </div>
                    </Card>

                    {/* Business Profile details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="bg-panel border-border/85 md:col-span-2 shadow-md">
                        <CardHeader className="pb-2 border-b border-border/20">
                          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Business Profile Overview
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <p className="text-xs leading-relaxed text-muted-foreground">{companyProfile.summary}</p>
                          <div className="grid grid-cols-2 gap-4 text-xs border-t border-border/25 pt-4">
                            <div>
                              <span className="text-muted-foreground block text-[10px]">CHIEF EXECUTIVE</span>
                              <span className="text-foreground font-bold">{companyProfile.ceo}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px]">HEADQUARTERS</span>
                              <span className="text-foreground font-bold">{companyProfile.hq}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px]">FOUNDED YEAR</span>
                              <span className="text-foreground font-bold">{companyProfile.founded}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground block text-[10px]">TOTAL EMPLOYEES</span>
                              <span className="text-foreground font-bold">{companyProfile.employees}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-panel border-border/85 md:col-span-1 shadow-md">
                        <CardHeader className="pb-2 border-b border-border/20">
                          <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Metadata Links
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Official Website:</span>
                              <a href={companyProfile.website} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline flex items-center gap-1">
                                {companyProfile.website.replace('https://', '')} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Exchange Floor:</span>
                              <span className="text-foreground font-bold">NASDAQ Global</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Telemetry Node:</span>
                              <span className="text-emerald-500 font-bold">ACTIVE-NODE-9</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB 2: FINANCIALS */}
                {activeTab === 'Financials' && (
                  <Card className="bg-panel border-border/85 shadow-md">
                    <CardHeader className="pb-3 border-b border-border/20 bg-secondary/5 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Financial Statement Highlights (Billions USD)
                      </CardTitle>

                      {/* Yearly / Quarterly selector toggles */}
                      <div className="flex p-0.5 rounded bg-secondary border border-border text-[9px]">
                        {(['Yearly', 'Quarterly'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setFinancialTimeframe(mode)}
                            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${financialTimeframe === mode ? 'bg-primary text-white' : 'text-muted-foreground'
                              }`}
                          >
                            {mode.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                      {/* Financial chart */}
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={financialSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.2} vertical={false} />
                            <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={9} fontFamily="monospace" />
                            <YAxis stroke="var(--muted-foreground)" fontSize={9} fontFamily="monospace" />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar name="Total Revenue" dataKey="Revenue" fill="var(--primary)" />
                            <Bar name="EBITDA Earnings" dataKey="EBITDA" fill="#A78BFA" />
                            <Bar name="Net Profit Margin" dataKey="NetProfit" fill="#10B981" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Margin telemetry lists */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Operating Margin</span>
                          <span className="text-foreground font-black text-sm">{quote.operatingMargin ? `${quote.operatingMargin}%` : '26.45%'}</span>
                        </div>
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Gross Margin</span>
                          <span className="text-foreground font-black text-sm">{quote.grossMargin ? `${quote.grossMargin}%` : '44.82%'}</span>
                        </div>
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Free Cash Flow</span>
                          <span className="text-foreground font-black text-sm">{quote.freeCashFlow}</span>
                        </div>
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Operating Cash Flow</span>
                          <span className="text-foreground font-black text-sm">{quote.cashFlow}</span>
                        </div>
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Total Assets</span>
                          <span className="text-foreground font-black text-sm">{quote.totalAssets}</span>
                        </div>
                        <div className="p-3 border border-border/30 rounded-lg bg-secondary/10">
                          <span className="text-muted-foreground block text-[10px] uppercase">Total Liabilities</span>
                          <span className="text-foreground font-black text-sm">{quote.totalLiabilities}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* TAB 3: TECHNICALS */}
                {activeTab === 'Technical' && (
                  <div className="space-y-6">
                    <Card className="bg-panel border-border/85 shadow-md">
                      <CardHeader className="pb-2 border-b border-border/20">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Technical Indicators Consensus
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                          <div className="p-4 border border-border/40 rounded-lg bg-secondary/5 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">OSCILLATORS</span>
                            <p className="text-lg font-bold text-yellow-500">NEUTRAL</p>
                            <span className="text-[9px] text-muted-foreground">RSI(14) reading at 54.2</span>
                          </div>
                          <div className="p-4 border border-border/40 rounded-lg bg-secondary/5 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">MOVING AVERAGES</span>
                            <p className="text-lg font-bold text-emerald-500">STRONG BUY</p>
                            <span className="text-[9px] text-muted-foreground">12 MAs suggest upward trend</span>
                          </div>
                          <div className="p-4 border border-border/40 rounded-lg bg-secondary/5 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">SUMMARY CONSENSUS</span>
                            <p className="text-lg font-bold text-emerald-500 uppercase">BUY</p>
                            <span className="text-[9px] text-muted-foreground">Overlay configurations aligned</span>
                          </div>
                          <div className="p-4 border border-border/40 rounded-lg bg-secondary/5 space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">MACD CONSENSUS</span>
                            <p className="text-lg font-bold text-emerald-500">BULLISH CROSS</p>
                            <span className="text-[9px] text-muted-foreground">Signal cross spreads advance</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Price Statistics Table Card */}
                    <Card className="bg-panel border-border/85 shadow-md">
                      <CardHeader className="pb-2 border-b border-border/20">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                          Price Action Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Open Price</span>
                            <span className="text-foreground font-bold">${quote.open.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Previous Close</span>
                            <span className="text-foreground font-bold">${quote.prevClose.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Daily High</span>
                            <span className="text-foreground font-bold">${quote.high.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Daily Low</span>
                            <span className="text-foreground font-bold">${quote.low.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Market Capitalization</span>
                            <span className="text-foreground font-bold">${(quote.marketCap / 1e9).toFixed(1)}B</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-border/10">
                            <span className="text-muted-foreground">Average Volume (Avg)</span>
                            <span className="text-foreground font-bold">{quote.avgVolume}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* TAB 4: NEWS */}
                {activeTab === 'News' && (
                  <div className="space-y-4">
                    {newsList.map((item, index) => (
                      <Card key={index} className="bg-panel border-border/80 shadow-sm p-4 flex gap-4 items-start">
                        <div className="w-24 h-16 rounded overflow-hidden shrink-0 bg-secondary border border-border/30">
                          <img src={item.image} alt={item.title} className="object-cover w-full h-full" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-[9px]">
                            <span className="text-primary font-bold">{item.category.toUpperCase()}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{item.time}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground uppercase font-bold">{item.source}</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer leading-tight">{item.title}</h4>
                          <button
                            onClick={() => toast.success(`Article loaded: ${item.title}`)}
                            className="text-[9px] text-primary font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            Read Coverage <ArrowUpRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* TAB 5: AI INSIGHTS */}
                {activeTab === 'AI' && (
                  <Card className="bg-[#101424] border-primary/20 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
                    <CardHeader className="pb-3 border-b border-border/20 bg-secondary/15">
                      <CardTitle className="text-xs font-bold text-primary uppercase flex items-center gap-1.5 animate-pulse">
                        <Sparkles className="w-4 h-4 text-primary" /> StockInside ML Consensus Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-3.5 border border-border/30 rounded-lg bg-secondary/10 space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">AI SENTIMENT SCORE</span>
                          <p className="text-2xl font-black text-emerald-500">{aiInsight.score}%</p>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase block">{aiInsight.sentiment}</span>
                        </div>
                        <div className="p-3.5 border border-border/30 rounded-lg bg-secondary/10 space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">RISK ASSESSMENT</span>
                          <p className="text-2xl font-black text-foreground">LOW</p>
                          <span className="text-[9px] text-muted-foreground block">Volatility Score: {aiInsight.risk}</span>
                        </div>
                        <div className="p-3.5 border border-border/30 rounded-lg bg-secondary/10 space-y-1">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase block">BUY CONFIRMATION</span>
                          <p className="text-2xl font-black text-foreground">STRONG</p>
                          <span className="text-[9px] text-emerald-400 font-bold block uppercase">ACCUMULATION NODES</span>
                        </div>
                      </div>

                      <div className="border-t border-border/20 pt-4 space-y-3 text-xs leading-normal">
                        <div>
                          <span className="font-bold text-[10px] text-primary uppercase block">Volatility Profile</span>
                          <span className="text-muted-foreground">{aiInsight.volatility}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[10px] text-primary uppercase block">Fundamental Analysis</span>
                          <span className="text-muted-foreground">{aiInsight.fundamentals}</span>
                        </div>
                        <div>
                          <span className="font-bold text-[10px] text-primary uppercase block">Technical analysis</span>
                          <span className="text-muted-foreground">{aiInsight.technicals}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* TAB 6: ANALYST RATINGS */}
                {activeTab === 'Analysts' && (
                  <Card className="bg-panel border-border/85 shadow-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consensus Target Price</h4>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black">${quote.targetPrice.toFixed(2)}</span>
                          <span className="text-xs font-bold text-emerald-500">({analystConsensus.upside.toFixed(1)}% Upside)</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">Derived from over {analystConsensus.total} analyst consensus evaluations compiled within this trade execution cycle.</p>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span className="text-emerald-500">BUY ({analystConsensus.buyPct}%)</span>
                          <span className="text-muted-foreground">HOLD ({analystConsensus.holdPct}%)</span>
                          <span className="text-rose-500">SELL ({analystConsensus.sellPct}%)</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden flex w-full border border-border/40 bg-secondary">
                          <div style={{ width: `${analystConsensus.buyPct}%` }} className="bg-emerald-500 h-full" />
                          <div style={{ width: `${analystConsensus.holdPct}%` }} className="bg-muted-foreground/45 h-full" />
                          <div style={{ width: `${analystConsensus.sellPct}%` }} className="bg-rose-500 h-full" />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Related peers stocks row */}
          <div className="space-y-3 pt-4">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
              Similar Peer Equities Comparison
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedAssets.map((peer, idx) => (
                <Link key={idx} href={`/stock/${peer.symbol}`}>
                  <Card className="bg-panel border-border/80 p-3 hover:border-primary/45 hover:-translate-y-1 transition-all cursor-pointer flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary border border-border/50 flex items-center justify-center font-bold text-xs text-muted-foreground">
                        {peer.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-foreground block">{peer.symbol}</span>
                        <span className="text-[9px] text-muted-foreground font-sans block truncate max-w-[120px]">{peer.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-foreground block">${peer.price.toFixed(2)}</span>
                      <span className={`text-[9px] font-bold block ${peer.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {peer.changePercent >= 0 ? '+' : ''}{peer.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-fidelity order execution desks */}
        <div className="xl:col-span-1 space-y-6" id="trading-panel">
          
          {/* Order execution panel */}
          <Card className="bg-[#101424] border-border/80 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-primary/55 to-transparent" />
            <CardHeader className="pb-3 border-b border-border/30 bg-secondary/15">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-primary" /> Trading Desk Terminal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
                
                {/* Buy vs Sell selection tabs */}
                <div className="grid grid-cols-2 p-0.5 rounded bg-secondary border border-border">
                  <button
                    type="button"
                    onClick={() => setTradeType('BUY')}
                    className={`py-1.5 text-[10px] rounded font-bold cursor-pointer transition-colors ${tradeType === 'BUY'
                        ? 'bg-emerald-500 text-white shadow-sm font-black'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    BUY {upperSymbol}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeType('SELL')}
                    className={`py-1.5 text-[10px] rounded font-bold cursor-pointer transition-colors ${tradeType === 'SELL'
                        ? 'bg-rose-500 text-white shadow-sm font-black'
                        : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    SELL {upperSymbol}
                  </button>
                </div>

                {/* Order Type selectors */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Order Execution Type</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as 'MARKET' | 'LIMIT' | 'STOP_LOSS' | 'TAKE_PROFIT')}
                    className="w-full h-8.5 rounded bg-background border border-border text-foreground px-2 focus:outline-none text-xs cursor-pointer font-mono"
                  >
                    <option value="MARKET">Market Order</option>
                    <option value="LIMIT">Limit Order</option>
                    <option value="STOP_LOSS">Stop Loss Order</option>
                    <option value="TAKE_PROFIT">Take Profit Order</option>
                  </select>
                </div>

                {/* Conditional Fields based on Order Type */}
                {orderType === 'LIMIT' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Limit Trigger Price ($)</label>
                    <input
                      type="number"
                      step={0.01}
                      value={activeLimitPrice}
                      onChange={(e) => setLimitPrice(Number(e.target.value))}
                      className="w-full h-8.5 rounded bg-background border border-border text-foreground px-2 focus:outline-none text-xs font-mono"
                    />
                  </div>
                )}

                {orderType === 'STOP_LOSS' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Stop Trigger Price ($)</label>
                    <input
                      type="number"
                      step={0.01}
                      value={activeStopPrice}
                      onChange={(e) => setStopPrice(Number(e.target.value))}
                      className="w-full h-8.5 rounded bg-background border border-border text-foreground px-2 focus:outline-none text-xs font-mono"
                    />
                  </div>
                )}

                {orderType === 'TAKE_PROFIT' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Take Profit Price ($)</label>
                    <input
                      type="number"
                      step={0.01}
                      value={activeTakeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(Number(e.target.value))}
                      className="w-full h-8.5 rounded bg-background border border-border text-foreground px-2 focus:outline-none text-xs font-mono"
                    />
                  </div>
                )}

                {/* Quantity Input */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase">Quantity (Shares)</label>
                  <input
                    type="number"
                    min={1}
                    value={tradeQuantity}
                    onChange={(e) => setTradeQuantity(Number(e.target.value))}
                    className="w-full h-8.5 rounded bg-background border border-border text-foreground px-2 focus:outline-none text-xs font-mono"
                  />
                </div>

                {/* Pricing summary ledger details */}
                <div className="border-t border-border/30 pt-3 space-y-2 text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Live Bid Price</span>
                    <span className="text-foreground font-bold">${quote.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission Charge</span>
                    <span className="text-emerald-500 font-bold font-mono">FREE</span>
                  </div>
                  <div className="flex justify-between border-t border-dashed border-border/20 pt-2 text-xs">
                    <span className="text-foreground font-bold">Estimated Cost</span>
                    <span className="text-foreground font-black">${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>

                {/* Order Execution submit CTA */}
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded font-black tracking-wider text-white shadow-md cursor-pointer transition-all hover:brightness-105 uppercase ${tradeType === 'BUY' ? 'bg-emerald-600' : 'bg-rose-600'
                    }`}
                >
                  EXECUTE Sandbox {tradeType}
                </button>

                {/* Buying Power details */}
                <div className="flex justify-between items-center text-[9px] text-muted-foreground pt-2.5 border-t border-border/30">
                  <span>Buying Power</span>
                  <span className="text-foreground font-bold">${buyingPower.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* AI consensus overview dial */}
          <Card className="bg-panel border-border/80 shadow-md">
            <CardHeader className="pb-2 border-b border-border/20">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
                ML Consensus Dial
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Visual gauge representation */}
              <div className="relative w-36 h-20 mx-auto overflow-hidden flex items-end justify-center">
                <div className="absolute top-0 left-0 w-36 h-36 rounded-full border-[8px] border-secondary" />
                <div
                  style={{ transform: `rotate(${(aiInsight.score / 100) * 180}deg)` }}
                  className="absolute top-0 left-0 w-36 h-36 rounded-full border-[8px] border-t-primary border-r-primary border-l-transparent border-b-transparent transform origin-center transition-transform duration-500"
                />
                <div className="z-10 pb-1 text-center">
                  <span className="text-xl font-black text-foreground block">{aiInsight.score}%</span>
                  <span className="text-[8px] text-primary font-bold block uppercase">{aiInsight.sentiment}</span>
                </div>
              </div>

              <div className="flex justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/20 font-bold">
                <div className="text-left">
                  <span>RISK</span>
                  <span className="block text-rose-500 uppercase">{aiInsight.risk.split(' ')[0]}</span>
                </div>
                <div className="text-right">
                  <span>OUTLOOK</span>
                  <span className="block text-emerald-500 uppercase">{aiInsight.sentiment}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
