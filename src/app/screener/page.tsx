'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAllQuotes, 
  getStockQuote, 
  STOCKS_METRICS,
  StockQuote
} from '@/lib/stockMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Download,
  Activity,
  Plus,
  Scale,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  FileDown,
  Sparkles,
  Award,
  Eye,
  Bell,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from 'next/link';

type SortField = 'symbol' | 'price' | 'changePercent' | 'marketCap' | 'peRatio' | 'beta' | 'dividendYield';
type SortOrder = 'asc' | 'desc';

export default function ScreenerPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Real-time ticking updates
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const quotes = useMemo(() => {
    if (tick < 0) return [];
    return getAllQuotes();
  }, [tick]);
  
  // 1. Search filter state
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Advanced Filtering states
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'US' | 'INDIA' | 'CRYPTO'>('ALL');
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'NYSE' | 'NASDAQ' | 'NSE' | 'BSE'>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [industryFilter, setIndustryFilter] = useState<string>('ALL');
  
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [maxPE, setMaxPE] = useState<number>(100);
  const [maxBeta, setMaxBeta] = useState<number>(3.0);
  const [minYield, setMinYield] = useState<number>(0);
  
  const [ratingFilter, setRatingFilter] = useState<'ALL' | 'BUY' | 'HOLD' | 'SELL'>('ALL');
  const [techFilter, setTechFilter] = useState<'ALL' | 'RSI_OVERSOLD' | 'RSI_OVERBOUGHT' | 'MACD_BULLISH' | 'MACD_BEARISH'>('ALL');
  const [highDistFilter, setHighDistFilter] = useState<'ALL' | 'NEAR' | 'FAR'>('ALL');

  // 3. Sorting states
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 4. Stock Comparison list
  const [comparisonSymbols, setComparisonSymbols] = useState<string[]>([]);
  const [showComparisonMatrix, setShowComparisonMatrix] = useState(false);

  // Compute filters metadata
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => { if (q.sector) set.add(q.sector); });
    return Array.from(set);
  }, [quotes]);

  const industriesList = useMemo(() => {
    const set = new Set<string>();
    quotes.forEach((q) => { if (q.industry) set.add(q.industry); });
    return Array.from(set);
  }, [quotes]);

  // Compute analyst score for mock rating filters
  const getAnalystScore = (q: StockQuote) => {
    if (!q.recommendations) return 50;
    const total = q.recommendations.buy + q.recommendations.hold + q.recommendations.sell;
    if (total === 0) return 50;
    return Math.round(((q.recommendations.buy * 100) + (q.recommendations.hold * 50)) / total);
  };

  const getAnalystLabel = (q: StockQuote) => {
    const score = getAnalystScore(q);
    if (score >= 70) return 'Buy';
    if (score >= 40) return 'Hold';
    return 'Sell';
  };

  // Live filter & sort calculation
  const filteredAndSortedQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        // Ticker / name search
        const matchesSearch = 
          q.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Market / exchange filtering
        let market: 'US' | 'INDIA' | 'CRYPTO' = 'US';
        let exchange: 'NYSE' | 'NASDAQ' | 'NSE' | 'BSE' | 'CRYPTO' = 'NASDAQ';
        
        if (q.symbol === 'BTC-USD') {
          market = 'CRYPTO';
          exchange = 'CRYPTO';
        } else if (q.symbol === 'SPY' || q.symbol === 'NVDA') {
          exchange = 'NASDAQ';
        } else if (q.symbol === 'AAPL' || q.symbol === 'MSFT') {
          exchange = 'NYSE';
        } else if (q.symbol === 'JNJ' || q.symbol === 'PFE') {
          exchange = 'NYSE';
        } else if (q.symbol === 'JPM' || q.symbol === 'BAC' || q.symbol === 'COIN' || q.symbol === 'PLTR') {
          exchange = 'NYSE';
        } else if (q.symbol.startsWith('NSE') || ['JNJ', 'PFE'].includes(q.symbol)) {
          // just standard exchange grouping mocks
          exchange = 'NYSE';
        }
        
        const matchesMarket = marketFilter === 'ALL' || market === marketFilter;
        const matchesExchange = exchangeFilter === 'ALL' || exchange === exchangeFilter;

        // Sector & Industry
        const matchesSector = sectorFilter === 'ALL' || q.sector === sectorFilter;
        const matchesIndustry = industryFilter === 'ALL' || q.industry === industryFilter;

        // Price
        const matchesPrice = q.price >= minPrice && q.price <= maxPrice;

        // Valuation Filters
        const matchesPE = q.peRatio === 0 || q.peRatio <= maxPE;
        const matchesBeta = q.beta <= maxBeta;
        const matchesYield = q.dividendYield >= minYield;

        // Analyst Recommendation
        const label = getAnalystLabel(q);
        const matchesRating = ratingFilter === 'ALL' || label.toUpperCase() === ratingFilter;

        // Technical momentum mock alerts
        let matchesTech = true;
        if (techFilter === 'RSI_OVERSOLD') matchesTech = q.changePercent < -1.8;
        if (techFilter === 'RSI_OVERBOUGHT') matchesTech = q.changePercent > 1.8;
        if (techFilter === 'MACD_BULLISH') matchesTech = q.changePercent > 0.8 && q.peRatio < 25;
        if (techFilter === 'MACD_BEARISH') matchesTech = q.changePercent < -0.8 && q.peRatio > 40;

        // 52W High distance range
        let matchesHighDist = true;
        const dist = (q.price / q.fiftyTwoWeekRange.high);
        if (highDistFilter === 'NEAR') matchesHighDist = dist >= 0.95;
        if (highDistFilter === 'FAR') matchesHighDist = dist < 0.85;

        return matchesSearch && matchesMarket && matchesExchange && matchesSector && matchesIndustry && matchesPrice && matchesPE && matchesBeta && matchesYield && matchesRating && matchesTech && matchesHighDist;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        // Support standard sorting logic
        if (typeof valA === 'string') {
          return sortOrder === 'asc' 
            ? (valA as string).localeCompare(valB as string) 
            : (valB as string).localeCompare(valA as string);
        }
        
        return sortOrder === 'asc' 
          ? (valA as number) - (valB as number) 
          : (valB as number) - (valA as number);
      });
  }, [quotes, searchTerm, marketFilter, exchangeFilter, sectorFilter, industryFilter, minPrice, maxPrice, maxPE, maxBeta, minYield, ratingFilter, techFilter, highDistFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleToggleComparison = (symbol: string) => {
    setComparisonSymbols((prev) => {
      if (prev.includes(symbol)) {
        return prev.filter((s) => s !== symbol);
      }
      if (prev.length >= 5) {
        toast.warning('Max Comparison limit: Up to 5 stocks can be compared at once.');
        return prev;
      }
      return [...prev, symbol];
    });
  };

  const handleResetFilters = () => {
    setMarketFilter('ALL');
    setExchangeFilter('ALL');
    setSectorFilter('ALL');
    setIndustryFilter('ALL');
    setMinPrice(0);
    setMaxPrice(1000);
    setMaxPE(100);
    setMaxBeta(3.0);
    setMinYield(0);
    setRatingFilter('ALL');
    setTechFilter('ALL');
    setHighDistFilter('ALL');
    setSearchTerm('');
    toast.success('Screener metrics filters reset.');
  };

  // Mock export functionality
  const handleExport = (format: 'CSV' | 'EXCEL' | 'PDF') => {
    if (filteredAndSortedQuotes.length === 0) {
      toast.error('No matching records available for export.');
      return;
    }

    const headers = 'Symbol,Company,Sector,Price,ChangePercent,MarketCap,PE_Ratio,DividendYield,Beta\n';
    const rows = filteredAndSortedQuotes.map(
      (q) => `"${q.symbol}","${q.name.replace(/"/g, '""')}","${q.sector}",${q.price},${q.changePercent},${q.marketCap},${q.peRatio},${q.dividendYield},${q.beta}`
    );
    const blobContent = headers + rows.join('\n');

    if (format === 'CSV' || format === 'EXCEL') {
      const extension = format === 'CSV' ? 'csv' : 'xlsx';
      const type = format === 'CSV' ? 'text/csv' : 'application/vnd.ms-excel';
      const blob = new Blob([blobContent], { type });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `quant_screener_metrics.${extension}`);
      a.click();
      toast.success(`Watchlist metrics successfully exported to ${format}.`);
    } else {
      // PDF export print simulation
      if (typeof window !== 'undefined') {
        window.print();
      }
    }
  };

  // Compare chart data computation
  const comparisonChartData = useMemo(() => {
    return comparisonSymbols.map((sym) => {
      const q = getStockQuote(sym);
      return {
        name: q.symbol,
        Price: q.price,
        Valuation: q.peRatio > 0 ? q.peRatio : 0,
        Beta: q.beta,
        Yield: q.dividendYield
      };
    });
  }, [comparisonSymbols, tick]);

  if (!mounted) {
    return (
      <div className="space-y-6 pb-24 font-mono text-xs animate-pulse">
        <div className="h-12 bg-panel rounded-xl" />
        <div className="h-40 bg-panel rounded-xl" />
        <div className="h-96 bg-panel rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 font-mono text-xs text-foreground">
      {/* Page Title & Exports bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Multi-Asset Equity Screener
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter global equities, benchmark ETFs, and crypto index pairs using technical and valuation indices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('CSV')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground hover:bg-muted text-xs font-semibold cursor-pointer transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => handleExport('EXCEL')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground hover:bg-muted text-xs font-semibold cursor-pointer transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleExport('PDF')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground hover:bg-muted text-xs font-semibold cursor-pointer transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            <span>PDF Print</span>
          </button>
        </div>
      </div>

      {/* Advanced Screener Filter Matrix */}
      <Card className="bg-panel border-border/80 shadow-sm select-none">
        <CardHeader className="border-b border-border/30 pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-primary" /> Advanced Filters Matrix
          </CardTitle>
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </CardHeader>
        <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Ticker search */}
          <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search symbol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg"
              />
            </div>
          </div>

          {/* Market */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Market</label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="ALL">All Markets</option>
              <option value="US">US Stock Market</option>
              <option value="INDIA">India (BSE/NSE)</option>
              <option value="CRYPTO">Cryptocurrencies</option>
            </select>
          </div>

          {/* Sector */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Sector</label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="ALL">All Sectors</option>
              {sectorsList.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>

          {/* Valuation PE */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground">
              <span>Max P/E</span>
              <span className="text-foreground">{maxPE === 100 ? '100+' : maxPE}</span>
            </div>
            <div className="pt-2 px-1">
              <Slider
                min={5}
                max={100}
                step={5}
                value={[maxPE]}
                onValueChange={(val) => setMaxPE(Array.isArray(val) ? val[0] : val)}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Volatility Beta */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] uppercase font-bold text-muted-foreground">
              <span>Max Beta</span>
              <span className="text-foreground">{maxBeta.toFixed(2)}</span>
            </div>
            <div className="pt-2 px-1">
              <Slider
                min={0.2}
                max={3.0}
                step={0.1}
                value={[maxBeta]}
                onValueChange={(val) => setMaxBeta(Array.isArray(val) ? val[0] : val)}
                className="w-full cursor-pointer"
              />
            </div>
          </div>

          {/* Tech Filters */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Technical Indicators</label>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="ALL">No Signal</option>
              <option value="RSI_OVERSOLD">RSI Oversold (&lt;30)</option>
              <option value="RSI_OVERBOUGHT">RSI Overbought (&gt;70)</option>
              <option value="MACD_BULLISH">MACD Bullish Cross</option>
              <option value="MACD_BEARISH">MACD Bearish Cross</option>
            </select>
          </div>

          {/* 52W High range */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">52W High Range</label>
            <select
              value={highDistFilter}
              onChange={(e) => setHighDistFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="ALL">All Range</option>
              <option value="NEAR">Near 52W High (&gt;95%)</option>
              <option value="FAR">Far 52W High (&lt;85%)</option>
            </select>
          </div>

          {/* Analyst Rating */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Analyst Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="ALL">All Ratings</option>
              <option value="BUY">Buy</option>
              <option value="HOLD">Hold</option>
              <option value="SELL">Sell</option>
            </select>
          </div>

          {/* Div Yield */}
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase font-bold text-muted-foreground">Min Dividend Yield</label>
            <select
              value={minYield}
              onChange={(e) => setMinYield(parseFloat(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="0">All Yields</option>
              <option value="0.01">&gt; 1%</option>
              <option value="0.02">&gt; 2%</option>
              <option value="0.03">&gt; 3%</option>
              <option value="0.05">&gt; 5%</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Main Ledger Table Card */}
      <Card className="bg-panel border-border/85 shadow-sm overflow-hidden select-none">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
          <table className="relative w-full text-left table-fixed border-collapse min-w-[950px]">
            <thead className="sticky top-0 bg-panel border-b border-border/40 z-10 shadow-sm">
              <tr className="hover:bg-transparent text-[10px] text-muted-foreground uppercase font-bold">
                <th className="py-3 px-4 w-12 text-center">Compare</th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground w-28" onClick={() => handleSort('symbol')}>
                  <div className="flex items-center">Ticker {sortField === 'symbol' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 w-44">Company Name</th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-28" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end">Price {sortField === 'price' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-32" onClick={() => handleSort('changePercent')}>
                  <div className="flex items-center justify-end">Change% {sortField === 'changePercent' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-36" onClick={() => handleSort('marketCap')}>
                  <div className="flex items-center justify-end">Mkt Cap {sortField === 'marketCap' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-24" onClick={() => handleSort('peRatio')}>
                  <div className="flex items-center justify-end">P/E {sortField === 'peRatio' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 text-right w-24">EPS</th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-28" onClick={() => handleSort('dividendYield')}>
                  <div className="flex items-center justify-end">Yield {sortField === 'dividendYield' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-foreground text-right w-24" onClick={() => handleSort('beta')}>
                  <div className="flex items-center justify-end">Beta {sortField === 'beta' ? (sortOrder === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />) : <ArrowUpDown className="w-3 h-3 opacity-40 ml-1" />}</div>
                </th>
                <th className="py-3 px-4 w-32 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/25">
              {filteredAndSortedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-10 text-muted-foreground">No equities match criteria filters.</td>
                </tr>
              ) : (
                filteredAndSortedQuotes.map((q) => {
                  const isPositive = q.changePercent >= 0;
                  const isCompared = comparisonSymbols.includes(q.symbol);
                  return (
                    <tr key={q.symbol} className="hover:bg-secondary/40 border-border/40 transition-colors group">
                      {/* Checkbox Compare */}
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => handleToggleComparison(q.symbol)}
                          className="rounded accent-primary cursor-pointer w-3.5 h-3.5"
                        />
                      </td>

                      {/* Symbol */}
                      <td className="py-2.5 px-4 font-extrabold text-foreground group-hover:text-primary transition-colors">
                        <Link href={`/stock/${q.symbol}`}>{q.symbol}</Link>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-4 font-sans font-medium text-foreground/80 truncate">{q.name}</td>

                      {/* Price */}
                      <td className="py-2.5 px-4 text-right font-bold text-foreground">
                        ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Daily Change % */}
                      <td className="py-2.5 px-4 text-right font-extrabold">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                          isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {isPositive ? '+' : ''}{q.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* Market Cap */}
                      <td className="py-2.5 px-4 text-right font-bold text-foreground/80">
                        ${(q.marketCap / 1e9).toFixed(1)}B
                      </td>

                      {/* P/E */}
                      <td className="py-2.5 px-4 text-right text-foreground/80">{q.peRatio > 0 ? q.peRatio.toFixed(1) : '—'}</td>

                      {/* EPS */}
                      <td className="py-2.5 px-4 text-right text-foreground/80">{q.eps > 0 ? `$${q.eps.toFixed(2)}` : '—'}</td>

                      {/* Yield */}
                      <td className="py-2.5 px-4 text-right text-foreground/80 font-bold">{q.dividendYield > 0 ? `${q.dividendYield.toFixed(2)}%` : '0.00%'}</td>

                      {/* Beta */}
                      <td className="py-2.5 px-4 text-right text-foreground/80">{q.beta.toFixed(2)}</td>

                      {/* Row actions */}
                      <td className="py-2.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/stock/${q.symbol}`} title="View detail graph" className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => toast.success(`Alert registered for ${q.symbol}`)} title="Set alert trigger" className="p-1 rounded bg-secondary hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Bell className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Floating Sticky Compare Tray at the bottom */}
      <AnimatePresence>
        {comparisonSymbols.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-panel/95 border border-border/80 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-8 z-40 backdrop-blur max-w-xl w-full"
          >
            <div className="flex items-center gap-2.5 select-none">
              <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-foreground">Stock Benchmarker</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">{comparisonSymbols.length} of 5 tickers selected</p>
              </div>
            </div>

            {/* List of checked tags */}
            <div className="flex flex-wrap items-center gap-1.5 max-w-sm">
              {comparisonSymbols.map((sym) => (
                <span key={sym} className="px-2 py-0.5 rounded bg-secondary border border-border/50 text-[10px] font-extrabold text-foreground flex items-center gap-1">
                  {sym}
                  <button onClick={() => handleToggleComparison(sym)} className="text-muted-foreground hover:text-rose-500 cursor-pointer">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Triggers */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setComparisonSymbols([])}
                className="px-3 py-1.5 bg-secondary text-foreground hover:bg-muted font-bold text-[10px] rounded-lg cursor-pointer"
              >
                Clear
              </button>
              <button
                onClick={() => setShowComparisonMatrix(true)}
                className="px-3 py-1.5 bg-primary text-primary-foreground font-bold text-[10px] rounded-lg shadow cursor-pointer hover:opacity-95"
              >
                Compare side-by-side
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Overlay Modal */}
      {showComparisonMatrix && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl p-5 w-full max-w-4xl max-h-[85vh] overflow-y-auto scrollbar-thin shadow-2xl space-y-5 select-none">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 font-mono">
                <Scale className="w-4 h-4 text-primary" /> side-by-side Comparison Matrix
              </h3>
              <button onClick={() => setShowComparisonMatrix(false)} className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">✕</button>
            </div>

            {/* Recharts chart */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Comparison Indicators Chart</span>
              <div className="h-64 bg-secondary/15 rounded-xl border border-border/30 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 15, right: 10, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={9} tickLine={false} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Bar dataKey="Price" fill="var(--primary)" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Valuation" fill="#6366F1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Yield" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Matrix Data Table */}
            <div className="overflow-x-auto border border-border/40 rounded-xl">
              <table className="w-full text-left font-mono text-[11px] min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[9px] text-muted-foreground uppercase font-bold bg-secondary/20">
                    <th className="py-2.5 px-3">Metric benchmark</th>
                    {comparisonSymbols.map(sym => <th key={sym} className="py-2.5 px-3 text-right">{sym}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/25">
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">Price</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right font-extrabold text-foreground">${q.price.toFixed(2)}</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">Daily Change</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      const pos = q.changePercent >= 0;
                      return <td key={sym} className={`py-2 px-3 text-right font-extrabold ${pos ? 'text-emerald-500' : 'text-rose-500'}`}>{pos ? '+' : ''}{q.changePercent.toFixed(2)}%</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">Market Cap</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right text-foreground/80 font-bold">${(q.marketCap / 1e9).toFixed(1)}B</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">P/E Ratio</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right text-foreground/80">{q.peRatio > 0 ? q.peRatio.toFixed(1) : '—'}</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">EPS</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right text-foreground/80">{q.eps > 0 ? `$${q.eps.toFixed(2)}` : '—'}</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">Dividend Yield</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right text-foreground/80 font-bold">{q.dividendYield > 0 ? `${q.dividendYield.toFixed(2)}%` : '0.00%'}</td>;
                    })}
                  </tr>
                  <tr className="hover:bg-secondary/10">
                    <td className="py-2 px-3 font-semibold text-muted-foreground">Beta Volatility</td>
                    {comparisonSymbols.map(sym => {
                      const q = getStockQuote(sym);
                      return <td key={sym} className="py-2 px-3 text-right text-foreground/80">{q.beta.toFixed(2)}</td>;
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2.5">
              <button
                onClick={() => setShowComparisonMatrix(false)}
                className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-lg hover:opacity-90 shadow cursor-pointer"
              >
                Close comparison view
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
