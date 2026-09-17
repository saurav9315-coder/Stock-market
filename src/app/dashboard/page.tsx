'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Eye, 
  Newspaper, 
  Sparkles, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Activity,
  Zap,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Palette,
  SlidersHorizontal,
  Download,
  Play,
  Pause,
  X,
  Filter,
  Check,
  Percent,
  Layers,
  Grid
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import SectorHeatmap from '@/components/dashboard/SectorHeatmap';

const PortfolioChart = dynamic(() => import('./components/PortfolioChart'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-secondary/20 animate-pulse rounded-lg flex items-center justify-center text-xs font-mono text-muted-foreground">
      LOADING GRAPH BUFFERS...
    </div>
  )
});

type ThemePalette = 'sheryians' | 'emerald' | 'violet' | 'cyan' | 'amber' | 'sapphire';

const PALETTES: Array<{ id: ThemePalette; name: string; primaryHex: string; accentClass: string; bgBadge: string }> = [
  { id: 'sheryians', name: 'Sheryians Orange', primaryHex: '#F4511E', accentClass: 'from-[#F4511E] to-[#E65100]', bgBadge: 'bg-[#F4511E]/20 text-[#F4511E] border-[#F4511E]/40' },
  { id: 'emerald', name: 'Neon Emerald', primaryHex: '#9FEF00', accentClass: 'from-[#9FEF00] to-[#22C55E]', bgBadge: 'bg-[#9FEF00]/20 text-[#9FEF00] border-[#9FEF00]/40' },
  { id: 'violet', name: 'Cyber Violet', primaryHex: '#A855F7', accentClass: 'from-[#A855F7] to-[#C084FC]', bgBadge: 'bg-[#A855F7]/20 text-[#C084FC] border-[#A855F7]/40' },
  { id: 'cyan', name: 'Electric Cyan', primaryHex: '#06B6D4', accentClass: 'from-[#06B6D4] to-[#38BDF8]', bgBadge: 'bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/40' },
  { id: 'amber', name: 'Sunset Amber', primaryHex: '#F59E0B', accentClass: 'from-[#F59E0B] to-[#FACC15]', bgBadge: 'bg-[#F59E0B]/20 text-[#FACC15] border-[#F59E0B]/40' },
  { id: 'sapphire', name: 'Royal Sapphire', primaryHex: '#3B82F6', accentClass: 'from-[#3B82F6] to-[#60A5FA]', bgBadge: 'bg-[#3B82F6]/20 text-[#60A5FA] border-[#3B82F6]/40' }
];

interface KPICardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  sparklineData: { val: number }[];
  subtitle: string;
}

interface IndexData {
  name: string;
  value: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
  sparkline: { val: number }[];
}

interface AssetRow {
  company: string;
  symbol: string;
  price: number;
  changePercent: number;
  volume: string;
}

interface NewsCard {
  id: string;
  title: string;
  category: string;
  time: string;
  source: string;
  image: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

interface EconomicEvent {
  time: string;
  event: string;
  impact: 'HIGH' | 'MED' | 'LOW';
  actual: string;
  forecast: string;
}

interface OrderRow {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  orderType: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  limitPrice: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  time: string;
}

interface TransactionRow {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRADE_FEE' | 'DIVIDEND';
  amount: string;
  status: 'COMPLETED' | 'PROCESSING';
  time: string;
}

interface PositionRow {
  symbol: string;
  company: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPct: number;
}

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [themeColor, setThemeColor] = useState<ThemePalette>('sheryians');
  const [showCustomizer, setShowCustomizer] = useState(true);

  
  // Live Simulation controls
  const [isLivePaused, setIsLivePaused] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<number>(3000);

  // Chart Function state
  const [chartTimeframe, setChartTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');
  const [showBenchmark, setShowBenchmark] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Quick Trade Modal State
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeSymbol, setTradeSymbol] = useState('NVDA');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeShares, setTradeShares] = useState(10);
  const [tradeType, setTradeType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [tradePrice, setTradePrice] = useState(875.12);

  // Interactive Lists State
  const [orders, setOrders] = useState<OrderRow[]>([
    { id: 'ORD-9821', symbol: 'NVDA', side: 'BUY', orderType: 'LIMIT', quantity: 20, limitPrice: 870.00, status: 'FILLED', time: '14:24:10' },
    { id: 'ORD-9820', symbol: 'AAPL', side: 'BUY', orderType: 'MARKET', quantity: 50, limitPrice: 182.52, status: 'FILLED', time: '13:50:04' },
    { id: 'ORD-9819', symbol: 'TSLA', side: 'SELL', orderType: 'STOP', quantity: 15, limitPrice: 178.00, status: 'PENDING', time: '11:12:45' },
    { id: 'ORD-9818', symbol: 'MSFT', side: 'BUY', orderType: 'LIMIT', quantity: 10, limitPrice: 410.00, status: 'CANCELLED', time: '09:45:18' },
  ]);

  const [positions, setPositions] = useState<PositionRow[]>([
    { symbol: 'NVDA', company: 'NVIDIA Corp.', shares: 120, avgPrice: 620.50, currentPrice: 875.12, unrealizedPnL: 30554.40, unrealizedPnLPct: 41.03 },
    { symbol: 'AAPL', company: 'Apple Inc.', shares: 250, avgPrice: 165.20, currentPrice: 182.52, unrealizedPnL: 4330.00, unrealizedPnLPct: 10.48 },
    { symbol: 'MSFT', company: 'Microsoft Corp.', shares: 80, avgPrice: 380.00, currentPrice: 415.50, unrealizedPnL: 2840.00, unrealizedPnLPct: 9.34 },
    { symbol: 'AMZN', company: 'Amazon.com', shares: 150, avgPrice: 152.40, currentPrice: 178.15, unrealizedPnL: 3862.50, unrealizedPnLPct: 16.89 },
  ]);

  // Search & sorting state for Gainers/Losers
  const [gainerSearch, setGainerSearch] = useState('');
  const [loserSearch, setLoserSearch] = useState('');
  const [gainerSort, setGainerSort] = useState<'symbol' | 'changePercent'>('changePercent');
  const [loserSort, setLoserSort] = useState<'symbol' | 'changePercent'>('changePercent');
  const [gainerPage, setGainerPage] = useState(1);
  const [loserPage, setLoserPage] = useState(1);

  // Filters for News & Calendar
  const [newsSentimentFilter, setNewsSentimentFilter] = useState<'ALL' | 'positive' | 'negative' | 'neutral'>('ALL');
  const [calendarImpactFilter, setCalendarImpactFilter] = useState<'ALL' | 'HIGH' | 'MED' | 'LOW'>('ALL');

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('quant_dashboard_color_theme') as ThemePalette;
    if (saved && PALETTES.some(p => p.id === saved)) {
      setThemeColor(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } else {
      setThemeColor('sheryians');
      document.documentElement.setAttribute('data-theme', 'sheryians');
    }
  }, []);


  const changePalette = (newPalette: ThemePalette) => {
    setThemeColor(newPalette);
    localStorage.setItem('quant_dashboard_color_theme', newPalette);
    document.documentElement.setAttribute('data-theme', newPalette);
    toast.success(`Theme palette changed to ${PALETTES.find(p => p.id === newPalette)?.name}`, {
      description: 'Applied new color styling to dashboard widgets and charts.'
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isLivePaused) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, tickSpeed);

    return () => clearInterval(interval);
  }, [isLivePaused, tickSpeed]);

  const activePalette = useMemo(() => {
    return PALETTES.find(p => p.id === themeColor) || PALETTES[0];
  }, [themeColor]);

  // Timeframe filter data count
  const dataPointsCount = useMemo(() => {
    switch (chartTimeframe) {
      case '1D': return 24;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '6M': return 180;
      case '1Y': return 365;
      case 'ALL': return 500;
    }
  }, [chartTimeframe]);

  // Deterministic chart points
  const portfolioChartData = useMemo(() => {
    const baseValue = 142000;
    const items = [];
    const count = dataPointsCount;
    for (let i = 0; i < count; i++) {
      const sinOffset = Math.sin((i + tick) * 0.08) * 4500 + Math.cos((i * 0.1) + tick * 0.02) * 2000;
      const indexValue = Math.round(baseValue + (i * (8000 / count)) + sinOffset);
      
      let label = `${i}d`;
      if (chartTimeframe === '1D') {
        const hour = (9 + Math.floor(i / 2.5)) % 12 || 12;
        const min = Math.floor((i % 2.5) * 24);
        label = `${hour}:${min < 10 ? '0' + min : min}`;
      } else if (chartTimeframe === '1W') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        label = days[i % 7];
      } else if (chartTimeframe === '1M') {
        label = `Jun ${i + 1}`;
      }

      items.push({
        time: label,
        Portfolio: indexValue,
        BenchmarkSPY: Math.round(indexValue * 0.85 + Math.sin(i * 0.05 + tick * 0.05) * 1200),
      });
    }
    return items;
  }, [chartTimeframe, dataPointsCount, tick]);

  // ROW 1: TOP 4 STAT CARDS
  const kpis: KPICardData[] = useMemo(() => {
    const totalValOffset = Math.sin(tick * 0.1) * 324;
    const profitOffset = Math.sin(tick * 0.1) * 142;
    const cashOffset = Math.cos(tick * 0.08) * 50;

    const baseVal = 148932.40 + totalValOffset;
    const baseProfit = 1824.50 + profitOffset;
    const baseCash = 24192.50 + cashOffset;
    const tradeCount = 42 + (tick % 5);

    const getSparkline = (offset: number) => {
      const arr = [];
      for (let i = 0; i < 10; i++) {
        arr.push({ val: 20 + Math.sin(i * 0.5 + tick * 0.3 + offset) * 10 });
      }
      return arr;
    };

    return [
      {
        title: 'Portfolio Value',
        value: `$${baseVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: '+1.24%',
        isPositive: true,
        icon: DollarSign,
        subtitle: 'vs. $147,107.90 yesterday',
        sparklineData: getSparkline(0),
      },
      {
        title: "Today's Profit / Loss",
        value: `$${baseProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: baseProfit >= 0 ? '+1.24%' : '-0.85%',
        isPositive: baseProfit >= 0,
        icon: TrendingUp,
        subtitle: 'Unrealized P&L intraday',
        sparklineData: getSparkline(3),
      },
      {
        title: 'Available Balance',
        value: `$${baseCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 'USD Cash',
        isPositive: true,
        icon: Briefcase,
        subtitle: 'Ready for trade execution',
        sparklineData: getSparkline(6),
      },
      {
        title: "Today's Trades",
        value: `${tradeCount} Orders`,
        change: '98.5% Filled',
        isPositive: true,
        icon: Zap,
        subtitle: 'Avg execution latency: 42ms',
        sparklineData: getSparkline(9),
      },
    ];
  }, [tick]);

  // ROW 2: MARKET OVERVIEW INDICES
  const indices: IndexData[] = useMemo(() => {
    const indicesBase = [
      { name: 'Nifty 50', base: 22462.80, scale: 35 },
      { name: 'Sensex', base: 74014.50, scale: 120 },
      { name: 'Bank Nifty', base: 47825.20, scale: 80 },
      { name: 'Nasdaq', base: 16274.90, scale: 50 },
      { name: 'S&P 500', base: 5164.82, scale: 15 },
      { name: 'Dow Jones', base: 39087.30, scale: 60 },
    ];

    return indicesBase.map((idx, index) => {
      const fluc = Math.sin(tick * 0.15 + index) * idx.scale;
      const val = idx.base + fluc;
      const pct = (fluc / idx.base) * 100;
      const positive = fluc >= 0;

      const spark = [];
      for (let i = 0; i < 8; i++) {
        spark.push({ val: 10 + Math.sin(i * 0.6 + tick * 0.2 + index) * 6 });
      }

      return {
        name: idx.name,
        value: val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        change: fluc >= 0 ? `+${fluc.toFixed(2)}` : fluc.toFixed(2),
        changePercent: `${positive ? '+' : ''}${pct.toFixed(2)}%`,
        isPositive: positive,
        sparkline: spark,
      };
    });
  }, [tick]);

  // ROW 2: WATCHLIST PREVIEW
  const watchListItems = useMemo(() => {
    const watchlistBase = [
      { name: 'Apple Inc.', symbol: 'AAPL', price: 182.52, changePercent: 2.14 },
      { name: 'NVIDIA Corp.', symbol: 'NVDA', price: 875.12, changePercent: 4.28 },
      { name: 'Microsoft Corp.', symbol: 'MSFT', price: 415.50, changePercent: 1.32 },
      { name: 'Tesla, Inc.', symbol: 'TSLA', price: 175.34, changePercent: -3.12 },
    ];

    return watchlistBase.map((item, index) => {
      const sinValue = Math.sin(tick * 0.08 + index);
      const activePrice = item.price * (1 + sinValue * 0.005);
      const activeChange = item.changePercent + sinValue * 0.2;
      return {
        ...item,
        price: activePrice,
        changePercent: activeChange,
      };
    });
  }, [tick]);

  // ROW 3: TOP GAINERS & LOSERS
  const gainersList: AssetRow[] = useMemo(() => {
    const list = [
      { company: 'NVIDIA Corp.', symbol: 'NVDA', price: 875.12, changePercent: 4.28, volume: '42.4M' },
      { company: 'Apple Inc.', symbol: 'AAPL', price: 182.52, changePercent: 2.14, volume: '51.2M' },
      { company: 'Amazon.com, Inc.', symbol: 'AMZN', price: 178.15, changePercent: 1.84, volume: '31.8M' },
      { company: 'Microsoft Corp.', symbol: 'MSFT', price: 415.50, changePercent: 1.32, volume: '22.9M' },
      { company: 'Alphabet Inc.', symbol: 'GOOGL', price: 151.60, changePercent: 1.18, volume: '28.4M' },
      { company: 'Meta Platforms', symbol: 'META', price: 485.12, changePercent: 0.95, volume: '18.5M' },
    ];
    return list
      .filter(row => 
        row.company.toLowerCase().includes(gainerSearch.toLowerCase()) || 
        row.symbol.toLowerCase().includes(gainerSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (gainerSort === 'symbol') return a.symbol.localeCompare(b.symbol);
        return b.changePercent - a.changePercent;
      });
  }, [gainerSearch, gainerSort]);

  const losersList: AssetRow[] = useMemo(() => {
    const list = [
      { company: 'Tesla, Inc.', symbol: 'TSLA', price: 175.34, changePercent: -3.12, volume: '84.1M' },
      { company: 'Intel Corporation', symbol: 'INTC', price: 43.20, changePercent: -2.84, volume: '24.2M' },
      { company: 'Advanced Micro Devices', symbol: 'AMD', price: 168.45, changePercent: -1.94, volume: '36.8M' },
      { company: 'Netflix, Inc.', symbol: 'NFLX', price: 605.80, changePercent: -0.88, volume: '10.4M' },
      { company: 'Broadcom Inc.', symbol: 'AVGO', price: 1350.20, changePercent: -0.72, volume: '4.5M' },
      { company: 'Adobe Inc.', symbol: 'ADBE', price: 502.10, changePercent: -0.65, volume: '3.2M' },
    ];
    return list
      .filter(row => 
        row.company.toLowerCase().includes(loserSearch.toLowerCase()) || 
        row.symbol.toLowerCase().includes(loserSearch.toLowerCase())
      )
      .sort((a, b) => {
        if (loserSort === 'symbol') return a.symbol.localeCompare(b.symbol);
        return a.changePercent - b.changePercent;
      });
  }, [loserSearch, loserSort]);

  // ROW 4: LATEST NEWS
  const newsList: NewsCard[] = useMemo(() => {
    const raw: NewsCard[] = [
      {
        id: 'news-1',
        title: 'Federal Reserve Signals Softening Stance Amid Cooling Core CPI Data',
        category: 'Macro',
        time: '12m ago',
        source: 'Bloomberg Desk',
        image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&h=250',
        summary: 'Treasury yields compress as futures price in rate cuts in the Q3 monetary policy cycle.',
        sentiment: 'positive'
      },
      {
        id: 'news-2',
        title: 'NVIDIA Unveils Next-Gen Blackwell Architecture Compute Clusters',
        category: 'Tech',
        time: '1h ago',
        source: 'Reuters Financial',
        image: 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=400&h=250',
        summary: 'Enterprise ML pipelines demonstrate 14x throughput improvements in real-time inference execution.',
        sentiment: 'positive'
      },
      {
        id: 'news-3',
        title: 'Crypto Volatility Flares as Bitcoin Re-Tests Key Exponential Support',
        category: 'Crypto',
        time: '3h ago',
        source: 'Terminal Feed',
        image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=400&h=250',
        summary: 'Institutional bid clusters form at $64.5K level following leveraged long liquidation cascade.',
        sentiment: 'negative'
      }
    ];
    if (newsSentimentFilter === 'ALL') return raw;
    return raw.filter(n => n.sentiment === newsSentimentFilter);
  }, [newsSentimentFilter]);

  // ROW 4: ECONOMIC CALENDAR
  const calendar: EconomicEvent[] = useMemo(() => {
    const raw: EconomicEvent[] = [
      { time: '18:00', event: 'US Core CPI (MoM)', impact: 'HIGH', actual: '0.2%', forecast: '0.3%' },
      { time: '20:30', event: 'Fed Chair Powell Testimony', impact: 'HIGH', actual: '--', forecast: '--' },
      { time: 'Tomorrow', event: 'Initial Jobless Claims', impact: 'MED', actual: '--', forecast: '215K' },
      { time: 'Jul 05', event: 'US Non-Farm Payrolls', impact: 'HIGH', actual: '--', forecast: '190K' },
    ];
    if (calendarImpactFilter === 'ALL') return raw;
    return raw.filter(c => c.impact === calendarImpactFilter);
  }, [calendarImpactFilter]);

  // ROW 5: RECENT TRANSACTIONS DATA
  const recentTransactions: TransactionRow[] = [
    { id: 'TX-4012', type: 'DEPOSIT', amount: '+$10,000.00', status: 'COMPLETED', time: 'Today, 08:30' },
    { id: 'TX-4011', type: 'TRADE_FEE', amount: '-$2.45', status: 'COMPLETED', time: 'Today, 14:24' },
    { id: 'TX-4010', type: 'DIVIDEND', amount: '+$142.80', status: 'COMPLETED', time: 'Yesterday' },
    { id: 'TX-4009', type: 'WITHDRAW', amount: '-$2,500.00', status: 'COMPLETED', time: 'Jul 22, 2026' },
  ];

  // Open Quick Trade Modal Function
  const openTradeModal = (symbol: string, side: 'BUY' | 'SELL', price?: number) => {
    setTradeSymbol(symbol);
    setTradeSide(side);
    if (price) setTradePrice(price);
    setTradeModalOpen(true);
  };

  // Submit Quick Trade Order Function
  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrd: OrderRow = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      symbol: tradeSymbol,
      side: tradeSide,
      orderType: tradeType,
      quantity: tradeShares,
      limitPrice: tradePrice,
      status: 'FILLED',
      time: new Date().toLocaleTimeString('en-US', { hour12: false })
    };
    setOrders(prev => [newOrd, ...prev]);
    setTradeModalOpen(false);
    toast.success(`Executed ${tradeSide} order for ${tradeShares} shares of ${tradeSymbol}`, {
      description: `Filled at $${tradePrice.toFixed(2)} via Quant High Frequency Router.`
    });
  };

  // Cancel Pending Order Function
  const handleCancelOrder = (ordId: string) => {
    setOrders(prev => prev.map(o => o.id === ordId ? { ...o, status: 'CANCELLED' } : o));
    toast.info(`Order ${ordId} cancelled`, {
      description: 'Order removed from active matching book.'
    });
  };

  // Close Active Position Function
  const handleClosePosition = (symbol: string) => {
    setPositions(prev => prev.filter(p => p.symbol !== symbol));
    toast.success(`Closed open position in ${symbol}`, {
      description: `Realized intraday P&L recorded to ledger.`
    });
  };

  // Chart CSV Export Function
  const handleExportChartData = () => {
    const csvHeader = "Time,PortfolioVal,BenchmarkVal\n";
    const csvRows = portfolioChartData.map(d => `${d.time},${d.Portfolio},${d.BenchmarkSPY}`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Portfolio_Valuation_${chartTimeframe}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    toast.success("Exported Portfolio Chart Telemetry CSV", {
      description: `Downloaded ${portfolioChartData.length} records.`
    });
  };

  return (
    <div className={`space-y-6 select-none font-sans text-foreground theme-${themeColor}`}>
      
      {/* Dashboard Top Header Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-stylish">
              Institutional Quant Command
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 font-sans">
            Real-time multi-asset telemetry and high-frequency execution pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Telemetry Speed / Pause Function Controls */}
          <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-lg border border-border/50 text-xs font-mono">
            <button 
              onClick={() => setIsLivePaused(!isLivePaused)}
              className={`px-2 py-1 rounded flex items-center gap-1 font-bold cursor-pointer transition-colors ${
                isLivePaused ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
              title={isLivePaused ? 'Resume Live Updates' : 'Pause Live Updates'}
            >
              {isLivePaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              <span>{isLivePaused ? 'PAUSED' : 'LIVE'}</span>
            </button>

            <select
              value={tickSpeed}
              onChange={(e) => setTickSpeed(Number(e.target.value))}
              className="bg-background border border-border/60 rounded px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground outline-none cursor-pointer"
            >
              <option value={1000}>1s (High Freq)</option>
              <option value={3000}>3s (Standard)</option>
              <option value={5000}>5s (Eco Mode)</option>
            </select>
          </div>
        </div>
      </div>


      {/* ====================================================================
          ROW 1: TOP 4 STAT CARDS
          ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={index}
              whileHover={{ translateY: -2 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <Card className="bg-card/90 border-border/80 hover:border-primary/40 transition-all shadow-xl relative overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <CardContent className="p-4">
                  {loading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="flex justify-between">
                        <div className="w-24 h-3 bg-muted/40 rounded" />
                        <div className="w-6 h-6 bg-muted/40 rounded" />
                      </div>
                      <div className="w-32 h-6 bg-muted/40 rounded" />
                      <div className="w-20 h-3 bg-muted/40 rounded" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block truncate">{kpi.title}</span>
                        <p className="text-xl font-bold font-mono tracking-tight text-foreground truncate tabular-nums">{kpi.value}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 px-1.5 py-0.2 rounded ${
                            kpi.isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {kpi.change}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-sans truncate">{kpi.subtitle}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-14 shrink-0">
                        <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(159,239,0,0.15)]">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="w-16 h-6 opacity-90 mt-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={kpi.sparklineData}>
                              <Line 
                                type="monotone" 
                                dataKey="val" 
                                stroke={kpi.isPositive ? '#10B981' : '#F43F5E'} 
                                strokeWidth={1.5} 
                                dot={false} 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ====================================================================
          ROW 2: INTERACTIVE CHART, MARKET OVERVIEW, WATCHLIST
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Interactive Portfolio Chart (Col 6) */}
        <div className="lg:col-span-6">
          <Card className="bg-panel border-border/80 shadow-xl overflow-hidden h-full">
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-border/30 bg-secondary/15">
              <div>
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                  <span>Portfolio Valuation & Benchmark</span>
                </CardTitle>
                <p className="text-[10px] text-muted-foreground font-sans">
                  Real-time capital performance vs S&P 500 Benchmark
                </p>
              </div>

              {/* Chart Function Controls & Timeframe Toggles */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowBenchmark(!showBenchmark)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer border transition-colors ${
                    showBenchmark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-background text-muted-foreground border-border/60'
                  }`}
                  title="Toggle S&P 500 Benchmark Line"
                >
                  S&P 500
                </button>

                <button
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold cursor-pointer border transition-colors ${
                    showGrid ? 'bg-primary/20 text-primary border-primary/40' : 'bg-background text-muted-foreground border-border/60'
                  }`}
                  title="Toggle Chart Grid"
                >
                  Grid
                </button>

                <button
                  onClick={handleExportChartData}
                  className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-secondary hover:bg-secondary/70 border border-border/60 text-foreground flex items-center gap-1 cursor-pointer"
                  title="Download Chart CSV Data"
                >
                  <Download className="w-3 h-3 text-primary" /> CSV
                </button>

                <div className="inline-flex bg-secondary p-0.5 rounded border border-border/60 font-mono text-[10px]">
                  {(['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                        chartTimeframe === tf 
                          ? 'bg-primary text-primary-foreground shadow-sm font-extrabold' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="h-64 sm:h-72 w-full">
                <PortfolioChart 
                  data={portfolioChartData} 
                  showBenchmark={showBenchmark} 
                  showGrid={showGrid}
                  colorHex={activePalette.primaryHex}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Overview Indices (Col 3) */}
        <div className="lg:col-span-3">
          <Card className="bg-panel border-border/80 shadow-xl h-full">
            <CardHeader className="p-3.5 border-b border-border/30">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Market Indices</span>
                <span className="text-[9px] text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">LIVE</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[310px] overflow-y-auto">
              {indices.map((idx, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg border border-border/40 bg-secondary/10 hover:bg-secondary/35 transition-all font-mono">
                  <div>
                    <span className="text-xs font-bold text-foreground block">{idx.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{idx.change}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-foreground block">{idx.value}</span>
                    <span className={`text-[10px] font-bold block ${
                      idx.isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {idx.changePercent}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Watchlist (Col 3) */}
        <div className="lg:col-span-3">
          <Card className="bg-panel border-border/80 shadow-xl h-full">
            <CardHeader className="p-3.5 border-b border-border/30">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-primary" /> Watchlist</span>
                <span className="text-[10px] text-muted-foreground">4 Assets</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-[310px] overflow-y-auto">
              {watchListItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-secondary/10 hover:bg-secondary/35 transition-all font-mono"
                >
                  <div>
                    <span className="font-bold text-foreground block text-xs">{item.symbol}</span>
                    <span className="text-[9px] text-muted-foreground font-sans truncate block max-w-[80px]">{item.name}</span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-foreground block">${item.price.toFixed(2)}</span>
                      <span className={`text-[9px] font-bold block ${
                        item.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <button 
                        onClick={() => openTradeModal(item.symbol, 'BUY', item.price)}
                        className="px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[8px] font-bold cursor-pointer transition-colors"
                      >
                        BUY
                      </button>
                      <button 
                        onClick={() => openTradeModal(item.symbol, 'SELL', item.price)}
                        className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[8px] font-bold cursor-pointer transition-colors"
                      >
                        SELL
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ====================================================================
          ROW 3: TOP GAINERS, TOP LOSERS, MARKET HEATMAP
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Top Gainers (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-border/80 shadow-lg h-full">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-emerald-500 flex items-center gap-1.5 uppercase font-mono">
                <ArrowUpRight className="w-4 h-4" /> Top Gainers
              </CardTitle>
              <div className="relative flex items-center border border-border/60 bg-background/50 rounded px-2 py-0.5">
                <Search className="w-3 h-3 text-muted-foreground mr-1" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={gainerSearch}
                  onChange={(e) => { setGainerSearch(e.target.value); setGainerPage(1); }}
                  className="bg-transparent border-none outline-none text-[9px] text-foreground placeholder:text-muted-foreground w-16 font-mono"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[9px] bg-secondary/15 uppercase">
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gainersList.slice((gainerPage - 1) * 3, gainerPage * 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-border/20 hover:bg-secondary/15 transition-all">
                        <td className="py-2 px-3">
                          <span className="font-bold text-foreground block">{row.symbol}</span>
                          <span className="text-[9px] text-muted-foreground font-sans truncate block max-w-[90px]">{row.company}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-foreground">${row.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-emerald-500 font-bold">+{row.changePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Losers (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-border/80 shadow-lg h-full">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-rose-500 flex items-center gap-1.5 uppercase font-mono">
                <ArrowDownRight className="w-4 h-4" /> Top Losers
              </CardTitle>
              <div className="relative flex items-center border border-border/60 bg-background/50 rounded px-2 py-0.5">
                <Search className="w-3 h-3 text-muted-foreground mr-1" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={loserSearch}
                  onChange={(e) => { setLoserSearch(e.target.value); setLoserPage(1); }}
                  className="bg-transparent border-none outline-none text-[9px] text-foreground placeholder:text-muted-foreground w-16 font-mono"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[9px] bg-secondary/15 uppercase">
                      <th className="py-2 px-3">Company</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {losersList.slice((loserPage - 1) * 3, loserPage * 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-border/20 hover:bg-secondary/15 transition-all">
                        <td className="py-2 px-3">
                          <span className="font-bold text-foreground block">{row.symbol}</span>
                          <span className="text-[9px] text-muted-foreground font-sans truncate block max-w-[90px]">{row.company}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-foreground">${row.price.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right text-rose-500 font-bold">{row.changePercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Market Sector Heatmap (Col 4) */}
        <div className="lg:col-span-4">
          <SectorHeatmap />
        </div>

      </div>

      {/* ====================================================================
          ROW 4: LATEST NEWS, AI INSIGHTS, ECONOMIC CALENDAR
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Latest News & Sentiment Filter (Col 5) */}
        <div className="lg:col-span-5">
          <Card className="bg-panel border-border/80 shadow-xl h-full">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Newspaper className="w-4 h-4 text-primary" /> Intelligence Stream
              </CardTitle>

              {/* Sentiment Filter Pills */}
              <div className="flex items-center gap-1 font-mono text-[9px]">
                {(['ALL', 'positive', 'negative', 'neutral'] as const).map((sent) => (
                  <button
                    key={sent}
                    onClick={() => setNewsSentimentFilter(sent)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                      newsSentimentFilter === sent
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sent.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3.5 space-y-3.5 max-h-[320px] overflow-y-auto">
              {newsList.map((news) => (
                <div key={news.id} className="flex gap-3 items-start border-b border-border/20 pb-3 last:border-b-0 last:pb-0">
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-secondary">
                    <img src={news.image} alt={news.title} className="object-cover w-full h-full" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[8px] font-mono">
                      <span className="text-primary font-bold">{news.category}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{news.time}</span>
                    </div>
                    <h4 className="text-xs font-bold text-foreground leading-snug truncate cursor-pointer hover:text-primary transition-colors">{news.title}</h4>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{news.summary}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* AI Insights (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-primary/30 shadow-xl relative overflow-hidden h-full">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase font-mono">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" /> AI Portfolio Advisor
              </CardTitle>
              <span className="text-[8px] font-mono bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold">
                SCORE 88/100
              </span>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/40 space-y-1">
                <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase">BUY SIGNAL</span>
                <h5 className="text-xs font-bold text-foreground font-mono">ACCUMULATE NVDA</h5>
                <p className="text-[10px] text-muted-foreground leading-tight">Moving average crossover indicates bullish momentum continuation.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-secondary/20 border border-border/40 space-y-1">
                <span className="text-[9px] font-bold font-mono text-rose-400 uppercase">RISK ALERT</span>
                <h5 className="text-xs font-bold text-foreground font-mono">TSLA BETA VOLATILITY</h5>
                <p className="text-[10px] text-muted-foreground leading-tight">Beta of 2.14 triggers risk limit alert. Consider tightening stop losses.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Economic Calendar & Impact Filter (Col 3) */}
        <div className="lg:col-span-3">
          <Card className="bg-panel border-border/80 shadow-xl h-full">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Calendar className="w-4 h-4 text-primary" /> Economic Calendar
              </CardTitle>

              {/* Impact Filter */}
              <select
                value={calendarImpactFilter}
                onChange={(e) => setCalendarImpactFilter(e.target.value as any)}
                className="bg-background border border-border/60 rounded px-1 py-0.5 text-[9px] font-mono text-muted-foreground outline-none cursor-pointer"
              >
                <option value="ALL">ALL IMPACT</option>
                <option value="HIGH">HIGH ONLY</option>
                <option value="MED">MED ONLY</option>
              </select>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5 font-mono text-[10px]">
              {calendar.map((event, index) => (
                <div key={index} className="p-2 rounded border border-border/30 bg-secondary/10 space-y-1">
                  <div className="flex justify-between items-center text-[8px]">
                    <span className="text-primary font-bold">{event.time}</span>
                    <span className={`px-1 py-0.2 rounded font-bold ${
                      event.impact === 'HIGH' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {event.impact}
                    </span>
                  </div>
                  <h5 className="font-sans font-bold text-foreground truncate">{event.event}</h5>
                  <div className="flex justify-between text-[8px] text-muted-foreground">
                    <span>Forecast: {event.forecast}</span>
                    <span>Actual: {event.actual}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ====================================================================
          ROW 5: RECENT ORDERS, RECENT TRANSACTIONS, OPEN POSITIONS
          ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Recent Orders (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-border/80 shadow-xl">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" /> Recent Orders
              </CardTitle>
              <button 
                onClick={() => openTradeModal('NVDA', 'BUY')}
                className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-[9px] font-mono font-bold cursor-pointer"
              >
                + New Order
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[9px] bg-secondary/15 uppercase">
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-2">Side</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id} className="border-b border-border/20 hover:bg-secondary/15 transition-all text-[11px]">
                        <td className="py-2 px-3">
                          <span className="font-bold text-foreground block">{ord.symbol}</span>
                          <span className="text-[9px] text-muted-foreground font-sans block">{ord.orderType} • {ord.quantity}sh</span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`font-bold ${ord.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {ord.side}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-foreground">${ord.limitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right">
                          {ord.status === 'PENDING' ? (
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              className="px-1.5 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[8px] font-bold cursor-pointer"
                            >
                              CANCEL
                            </button>
                          ) : (
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              ord.status === 'FILLED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {ord.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions Ledger (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-border/80 shadow-xl">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Wallet Ledger
              </CardTitle>
              <span className="text-[9px] font-mono text-muted-foreground">Audit Log</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[9px] bg-secondary/15 uppercase">
                      <th className="py-2 px-3">Type</th>
                      <th className="py-2 px-2 text-right">Amount</th>
                      <th className="py-2 px-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-border/20 hover:bg-secondary/15 transition-all text-[11px]">
                        <td className="py-2 px-3">
                          <span className="font-bold text-foreground block">{tx.type}</span>
                          <span className="text-[9px] text-muted-foreground block">{tx.id}</span>
                        </td>
                        <td className="py-2 px-2 text-right font-bold text-foreground">{tx.amount}</td>
                        <td className="py-2 px-3 text-right text-muted-foreground text-[10px]">{tx.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Positions & Action Controls (Col 4) */}
        <div className="lg:col-span-4">
          <Card className="bg-[#131C2E] border-border/80 shadow-xl">
            <CardHeader className="p-3.5 border-b border-border/30 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" /> Open Positions
              </CardTitle>
              <span className="text-[9px] font-mono text-muted-foreground">{positions.length} Active Holdings</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground text-[9px] bg-secondary/15 uppercase">
                      <th className="py-2 px-3">Asset</th>
                      <th className="py-2 px-2 text-right">Unrealized P&L</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => (
                      <tr key={pos.symbol} className="border-b border-border/20 hover:bg-secondary/15 transition-all text-[11px]">
                        <td className="py-2 px-3">
                          <span className="font-bold text-foreground block">{pos.symbol}</span>
                          <span className="text-[9px] text-muted-foreground font-sans block">{pos.shares} Shares @ ${pos.currentPrice.toFixed(2)}</span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className="text-emerald-500 font-bold block">+${pos.unrealizedPnL.toLocaleString()}</span>
                          <span className="text-emerald-500 text-[9px] font-bold block">+{pos.unrealizedPnLPct}%</span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => handleClosePosition(pos.symbol)}
                            className="px-1.5 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[8px] font-bold cursor-pointer transition-colors"
                          >
                            CLOSE
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* ====================================================================
          QUICK TRADE ORDER MODAL FUNCTION
          ==================================================================== */}
      <AnimatePresence>
        {tradeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-panel border border-primary/30 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold font-mono text-foreground">Quick Execution: {tradeSymbol}</h3>
                </div>
                <button 
                  onClick={() => setTradeModalOpen(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteOrder} className="space-y-4 font-mono text-xs">
                
                {/* Side Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/30 rounded-xl border border-border/50">
                  <button
                    type="button"
                    onClick={() => setTradeSide('BUY')}
                    className={`py-2 rounded-lg font-bold cursor-pointer transition-all ${
                      tradeSide === 'BUY' ? 'bg-emerald-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    BUY ORDER
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeSide('SELL')}
                    className={`py-2 rounded-lg font-bold cursor-pointer transition-all ${
                      tradeSide === 'SELL' ? 'bg-rose-500 text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    SELL ORDER
                  </button>
                </div>

                {/* Symbol & Order Type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Asset Ticker</label>
                    <input
                      type="text"
                      value={tradeSymbol}
                      onChange={(e) => setTradeSymbol(e.target.value.toUpperCase())}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Order Type</label>
                    <select
                      value={tradeType}
                      onChange={(e) => setTradeType(e.target.value as any)}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                    >
                      <option value="MARKET">MARKET</option>
                      <option value="LIMIT">LIMIT</option>
                      <option value="STOP">STOP</option>
                    </select>
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Quantity (Shares)</label>
                    <input
                      type="number"
                      min={1}
                      value={tradeShares}
                      onChange={(e) => setTradeShares(Number(e.target.value))}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Price ($)</label>
                    <input
                      type="number"
                      step={0.01}
                      value={tradePrice}
                      onChange={(e) => setTradePrice(Number(e.target.value))}
                      className="w-full bg-background border border-border/60 rounded-xl px-3 py-2 text-foreground font-bold outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Estimated Total Calculation */}
                <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Est. Total Cost:</span>
                  <span className="font-bold text-foreground text-sm">${(tradeShares * tradePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className={`w-full py-3 rounded-xl font-bold text-sm tracking-wider cursor-pointer shadow-lg transition-all ${
                    tradeSide === 'BUY'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                  }`}
                >
                  DISPATCH {tradeSide} ORDER
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Institutional Telemetry Footer */}
      <div className="text-center text-[10px] text-muted-foreground font-mono border-t border-border/30 pt-4 mt-8">
        <p>StockInside Trading Console • Multi-Asset High Frequency Desk • Color Matrix Configured</p>
      </div>

    </div>
  );
}
