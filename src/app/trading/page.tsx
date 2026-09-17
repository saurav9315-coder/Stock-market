'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  RefreshCw, 
  SlidersHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import ModeSwitch, { TradingMode } from '@/components/trading/ModeSwitch';
import StatusCard, { TradingMetric } from '@/components/trading/StatusCard';
import ChartToolbar, { TimeFrame, ChartStyle } from '@/components/trading/ChartToolbar';
import TradePanel from '@/components/trading/TradePanel';
import PositionCard, { OpenPosition } from '@/components/trading/PositionCard';
import RecentTradesTable, { ExecutedTrade } from '@/components/trading/RecentTradesTable';
import MarketSentimentBlock from '@/components/trading/MarketSentimentBlock';
import { getAllQuotes, getStockQuote, getChartData, StockQuote } from '@/lib/stockMock';
import { cn } from '@/lib/utils';

const TradingChart = dynamic(() => import('@/components/trading/TradingChart'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col min-h-[380px] bg-[#050608] rounded-[22px] border border-[#1E293B] p-6 justify-center items-center gap-3 font-mono animate-pulse">
      <div className="w-8 h-8 rounded-full border-2 border-[#FF5722] border-t-transparent animate-spin" />
      <span className="text-xs text-zinc-500 font-bold">SYNCHRONIZING TICK TELEMETRY...</span>
    </div>
  ),
});

export default function TradingDeskPage() {

  // Mode Selection (Demo vs Live)
  const [mode, setMode] = useState<TradingMode>('demo');

  // Balances State
  const [demoBalance, setDemoBalance] = useState<number>(100000.00);
  const [liveBalance, setLiveBalance] = useState<number>(12450.80);

  // Available Assets & Selected Asset
  const availableAssets = useMemo(() => getAllQuotes(), []);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDA');
  const selectedAsset = useMemo(() => {
    return getStockQuote(selectedSymbol) || availableAssets[0];
  }, [selectedSymbol, availableAssets]);

  // Live Price Ticking Simulation for current asset
  const [liveQuote, setLiveQuote] = useState<StockQuote>(selectedAsset);
  useEffect(() => {
    setLiveQuote(selectedAsset);
  }, [selectedAsset]);

  // Real-time subtle price tick updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveQuote((prev) => {
        const delta = (Math.random() - 0.48) * (prev.price * 0.003);
        const newPrice = +(prev.price + delta).toFixed(2);
        const change = +(prev.change + delta).toFixed(2);
        const changePercent = +((change / prev.prevClose) * 100).toFixed(2);
        return {
          ...prev,
          price: newPrice,
          change,
          changePercent,
        };
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Chart state & controls
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('area');
  const [indicators, setIndicators] = useState({
    sma: true,
    ema: false,
    bollinger: false,
    volume: true,
  });
  const [showGrid, setShowGrid] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Chart data computation
  const rawChartData = useMemo(() => {
    return getChartData(selectedSymbol, timeframe);
  }, [selectedSymbol, timeframe]);

  // Sync latest live price tick into chart data
  const chartData = useMemo(() => {
    if (!rawChartData.length) return rawChartData;
    const copy = [...rawChartData];
    copy[copy.length - 1] = {
      ...copy[copy.length - 1],
      close: liveQuote.price,
      high: Math.max(copy[copy.length - 1].high, liveQuote.price),
      low: Math.min(copy[copy.length - 1].low, liveQuote.price),
    };
    return copy;
  }, [rawChartData, liveQuote.price]);

  // Open Positions & Recent Executed Trades
  const [positions, setPositions] = useState<OpenPosition[]>([
    {
      id: 'pos-1',
      symbol: 'NVDA',
      name: 'NVIDIA Corp',
      type: 'BUY',
      entryPrice: 868.50,
      currentPrice: liveQuote.symbol === 'NVDA' ? liveQuote.price : 875.12,
      amount: 1500,
      leverage: 2,
      pnl: 114.30,
      pnlPercent: 7.62,
      time: '11:42:05',
    },
    {
      id: 'pos-2',
      symbol: 'AAPL',
      name: 'Apple Inc',
      type: 'SELL',
      entryPrice: 184.20,
      currentPrice: 182.52,
      amount: 800,
      leverage: 1,
      pnl: 36.40,
      pnlPercent: 4.55,
      time: '11:15:30',
    },
  ]);

  const [recentTrades, setRecentTrades] = useState<ExecutedTrade[]>([
    {
      id: 'trade-101',
      symbol: 'MSFT',
      type: 'BUY',
      mode: 'demo',
      amount: 1000,
      executionPrice: 412.30,
      pnl: 88.50,
      timestamp: '10:55:12',
      status: 'WIN',
    },
    {
      id: 'trade-100',
      symbol: 'TSLA',
      type: 'SELL',
      mode: 'live',
      amount: 500,
      executionPrice: 245.80,
      pnl: 42.10,
      timestamp: '10:30:00',
      status: 'WIN',
    },
  ]);

  // Update position PnL dynamically as price ticks
  useEffect(() => {
    setPositions((prev) =>
      prev.map((pos) => {
        if (pos.symbol === liveQuote.symbol) {
          const isBuy = pos.type === 'BUY';
          const priceDiff = isBuy ? liveQuote.price - pos.entryPrice : pos.entryPrice - liveQuote.price;
          const pnl = priceDiff * (pos.amount / pos.entryPrice) * pos.leverage;
          const pnlPercent = (pnl / pos.amount) * 100;
          return {
            ...pos,
            currentPrice: liveQuote.price,
            pnl: +pnl.toFixed(2),
            pnlPercent: +pnlPercent.toFixed(2),
          };
        }
        return pos;
      })
    );
  }, [liveQuote]);

  // Top Status Cards metrics
  const statusMetrics: TradingMetric[] = useMemo(() => {
    const totalPnl = positions.reduce((acc, p) => acc + p.pnl, 0);
    return [
      {
        title: 'PAYOUT RETURN %',
        value: '88.5%',
        subtitle: '+2.4% avg margin execution',
        change: '+2.4%',
        isPositive: true,
        type: 'payout',
      },
      {
        title: 'WIN / LOSS STREAK',
        value: '5 WINS',
        subtitle: 'Consecutive ITM execution',
        change: '+3 Streak',
        isPositive: true,
        type: 'streak',
      },
      {
        title: 'ITM SUCCESS RATE',
        value: '76.4%',
        subtitle: 'In-The-Money prediction accuracy',
        change: '+1.8%',
        isPositive: true,
        type: 'itm',
      },
      {
        title: 'ACTIVE POSITIONS',
        value: `${positions.length} ORDERS`,
        subtitle: `Total PnL: ${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`,
        change: totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`,
        isPositive: totalPnl >= 0,
        type: 'orders',
      },
      {
        title: 'MARKET TELEMETRY',
        value: 'OPEN',
        subtitle: 'NYSE & NASDAQ live ticks sync',
        change: 'LIVE',
        isPositive: true,
        type: 'market',
      },
    ];
  }, [positions]);

  // Reset Demo Balance handler
  const handleResetDemoBalance = () => {
    setDemoBalance(100000.00);
    toast.success('Virtual Demo Trading Balance reset to $100,000.00 USD');
  };

  // Close position handler
  const handleClosePosition = (id: string) => {
    const target = positions.find((p) => p.id === id);
    if (!target) return;

    // Settle balance
    if (mode === 'demo') {
      setDemoBalance((prev) => prev + target.amount + target.pnl);
    } else {
      setLiveBalance((prev) => prev + target.amount + target.pnl);
    }

    // Add to history
    setRecentTrades((prev) => [
      {
        id: `trade-${Date.now()}`,
        symbol: target.symbol,
        type: target.type,
        mode: mode,
        amount: target.amount,
        executionPrice: target.currentPrice,
        pnl: target.pnl,
        timestamp: new Date().toLocaleTimeString(),
        status: target.pnl >= 0 ? 'WIN' : 'LOSS',
      },
      ...prev,
    ]);

    // Remove from open positions
    setPositions((prev) => prev.filter((p) => p.id !== id));
    toast.info(`Closed position on ${target.symbol} with P&L: ${target.pnl >= 0 ? '+' : ''}$${target.pnl.toFixed(2)}`);
  };

  // Execute trade handler
  const handleExecuteTrade = (params: {
    asset: StockQuote;
    type: 'BUY' | 'SELL';
    amount: number;
    orderType: 'MARKET' | 'LIMIT';
    leverage: number;
    stopLoss: number;
    takeProfit: number;
  }) => {
    const currentBal = mode === 'demo' ? demoBalance : liveBalance;
    if (params.amount > currentBal) {
      toast.error(`Insufficient ${mode.toUpperCase()} capital. Max available: $${currentBal.toFixed(2)}`);
      return;
    }

    // Deduct capital
    if (mode === 'demo') {
      setDemoBalance((prev) => prev - params.amount);
    } else {
      setLiveBalance((prev) => prev - params.amount);
    }

    // Add position
    const newPos: OpenPosition = {
      id: `pos-${Date.now()}`,
      symbol: params.asset.symbol,
      name: params.asset.name,
      type: params.type,
      entryPrice: params.asset.price,
      currentPrice: params.asset.price,
      amount: params.amount,
      leverage: params.leverage,
      pnl: 0.00,
      pnlPercent: 0.00,
      time: new Date().toLocaleTimeString(),
    };

    setPositions((prev) => [newPos, ...prev]);

    toast.success(`${mode.toUpperCase()} ${params.type} Order executed for ${params.asset.symbol} @ $${params.asset.price.toFixed(2)}!`);
  };

  const toggleIndicator = (key: 'sma' | 'ema' | 'bollinger' | 'volume') => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={cn("p-2 sm:p-4 md:p-6 space-y-5 bg-[#040406] min-h-full text-foreground select-none max-w-full", isFullscreen && "fixed inset-0 z-50 p-2 overflow-y-auto")}>
      
      {/* 1. Mode Switcher (Demo vs Live) Header Bar */}
      <ModeSwitch
        mode={mode}
        onModeChange={setMode}
        demoBalance={demoBalance}
        liveBalance={liveBalance}
        onResetDemoBalance={handleResetDemoBalance}
      />

      {/* 2. Top Status Cards */}
      <StatusCard metrics={statusMetrics} />

      {/* 3. Main Trading Terminal Section (Chart + Trade Panel Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left / Center: Interactive Trading Chart & Controls (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Chart Toolbar */}
          <ChartToolbar
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            chartStyle={chartStyle}
            onChartStyleChange={setChartStyle}
            indicators={indicators}
            onToggleIndicator={toggleIndicator}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
          />

          {/* Interactive Trading Chart */}
          <TradingChart
            quote={liveQuote}
            chartData={chartData}
            timeframe={timeframe}
            chartStyle={chartStyle}
            indicators={indicators}
            showGrid={showGrid}
            isLiveTickActive={true}
          />
        </div>

        {/* Right: Order Execution Trade Panel (4 Cols) */}
        <div className="lg:col-span-4 h-full">
          <TradePanel
            mode={mode}
            selectedAsset={liveQuote}
            availableAssets={availableAssets}
            onSelectAsset={(quote) => setSelectedSymbol(quote.symbol)}
            demoBalance={demoBalance}
            liveBalance={liveBalance}
            onExecuteTrade={handleExecuteTrade}
          />
        </div>
      </div>

      {/* 4. Compact Dashboard Blocks (Open Positions, History, Sentiment) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Active Open Positions Block (6 Cols) */}
        <div className="lg:col-span-6">
          <PositionCard
            positions={positions}
            onClosePosition={handleClosePosition}
          />
        </div>

        {/* Recent Trades Table Block (3 Cols) */}
        <div className="lg:col-span-3">
          <RecentTradesTable trades={recentTrades} />
        </div>

        {/* AI Market Sentiment & Neural Signal Block (3 Cols) */}
        <div className="lg:col-span-3">
          <MarketSentimentBlock asset={liveQuote} />
        </div>
      </div>
    </div>
  );
}
