'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell
} from 'recharts';
import { 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  PenTool, 
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface ChartCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  wick: [number, number];
  body: [number, number];
}

interface RealTimeChartPanelProps {
  symbol: string;
  currentPrice: number;
}

const INTERVALS = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'] as const;
type Interval = typeof INTERVALS[number];
type ChartType = 'Candlestick' | 'Area' | 'Line' | 'Volume';

export default function RealTimeChartPanel({ symbol, currentPrice }: RealTimeChartPanelProps) {
  const [chartType, setChartType] = useState<ChartType>('Candlestick');
  const [interval, setIntervalVal] = useState<Interval>('5m');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Candles states
  const [candles, setCandles] = useState<ChartCandle[]>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(40); // number of visible candles
  const [panOffset, setPanOffset] = useState<number>(0);   // index displacement from end

  // Drawing Tools
  const [activeTool, setActiveTool] = useState<'None' | 'Trendline' | 'Horizontal' | 'Fibonacci'>('None');
  const [drawings, setDrawings] = useState<{ id: string; type: string; details: string }[]>([]);

  // Generate mock candles
  useEffect(() => {
    // Generate initial historical baseline candles
    let basePrice = currentPrice || 180.50;
    const initialCandles: ChartCandle[] = Array.from({ length: 120 }, (_, i) => {
      const time = new Date();
      // subtract intervals
      const timeScale = interval.includes('m') ? Number(interval.replace('m','')) : 
                        interval.includes('H') ? Number(interval.replace('H','')) * 60 : 1440;
      time.setMinutes(time.getMinutes() - (120 - i) * timeScale);

      const change = (Math.random() - 0.49) * (basePrice * 0.015);
      const open = basePrice;
      const close = basePrice + change;
      const high = Math.max(open, close) + Math.random() * (basePrice * 0.005);
      const low = Math.min(open, close) - Math.random() * (basePrice * 0.005);
      const volume = Math.floor(Math.random() * 800000) + 100000;

      basePrice = close;

      return {
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume,
        wick: [Number(low.toFixed(2)), Number(high.toFixed(2))],
        body: [Number(open.toFixed(2)), Number(close.toFixed(2))]
      };
    });

    const timer = setTimeout(() => {
      setCandles(initialCandles);
      setPanOffset(0);
    }, 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, interval]);

  // Live Price Ticks Updater
  useEffect(() => {
    if (!autoRefresh || candles.length === 0) return;

    // Update the last candle with high-frequency current price
    const timer = setTimeout(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];

        const nextClose = currentPrice;
        const nextHigh = nextClose > last.high ? nextClose : last.high;
        const nextLow = nextClose < last.low ? nextClose : last.low;
        
        const updatedLast: ChartCandle = {
          ...last,
          close: nextClose,
          high: nextHigh,
          low: nextLow,
          wick: [nextLow, nextHigh],
          body: [last.open, nextClose],
          volume: last.volume + Math.floor(Math.random() * 500)
        };

        return [...prev.slice(0, lastIdx), updatedLast];
      });
    }, 0);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrice, autoRefresh]);

  // Sliced candles for zoom/pan window
  const visibleCandles = useMemo(() => {
    if (candles.length === 0) return [];
    
    // Zoom boundary
    const count = Math.min(candles.length, zoomLevel);
    
    // Pan offset constraints
    const maxOffset = candles.length - count;
    const currentOffset = Math.min(maxOffset, Math.max(0, panOffset));
    
    const startIndex = candles.length - count - currentOffset;
    return candles.slice(startIndex, candles.length - currentOffset);
  }, [candles, zoomLevel, panOffset]);

  // Navigation handlers
  const handleZoomIn = () => setZoomLevel(prev => Math.max(15, prev - 5));
  const handleZoomOut = () => setZoomLevel(prev => Math.min(90, prev + 5));

  const handlePanLeft = () => {
    setPanOffset(prev => {
      const maxOffset = candles.length - zoomLevel;
      return Math.min(maxOffset, prev + 5);
    });
  };
  const handlePanRight = () => {
    setPanOffset(prev => Math.max(0, prev - 5));
  };

  const handleAddDrawing = (type: 'Trendline' | 'Horizontal' | 'Fibonacci') => {
    setActiveTool(type);
    // eslint-disable-next-line react-hooks/purity
    const mockDrawingId = `d-${Date.now()}`;
    const desc = type === 'Horizontal' ? 'Support / Resistance line set at ' + currentPrice : 
                 type === 'Trendline' ? 'Trend baseline channel aligned.' : 'Fibonacci retracement grids computed.';
    
    setDrawings(prev => [...prev, { id: mockDrawingId, type, details: desc }]);
    toast.success(`${type} Drawing Tool placed on chart canvas.`);
  };

  const handleClearDrawings = () => {
    setDrawings([]);
    setActiveTool('None');
    toast.info('Cleared all custom drawing vectors.');
  };

  return (
    <Card className={`bg-panel border-border/80 relative transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-[100] rounded-none border-none' : ''
    }`}>
      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
          {/* Asset Title / Selection */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold uppercase font-sans tracking-wide text-foreground flex items-center gap-2">
              {symbol} <span className="text-[10px] text-muted-foreground font-mono font-medium">{interval} Chart</span>
            </span>
            {/* Chart Type Toggles */}
            <div className="flex items-center bg-card/60 border border-border/60 rounded-lg p-0.5 shrink-0">
              {(['Candlestick', 'Area', 'Line', 'Volume'] as ChartType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setChartType(t)}
                  className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                    chartType === t ? 'bg-primary text-white font-sans' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'Candlestick' ? '🕯️' : t === 'Area' ? '📈' : t === 'Line' ? '📉' : '📊'}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe Selectors */}
          <div className="flex flex-wrap items-center gap-1.5">
            {INTERVALS.map((int) => (
              <button
                key={int}
                onClick={() => setIntervalVal(int)}
                className={`px-2 py-1 rounded border text-[9px] font-mono cursor-pointer transition-all ${
                  interval === int 
                    ? 'bg-primary/10 border-primary/40 text-primary font-bold' 
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {int}
              </button>
            ))}
          </div>

          {/* Utility Tools */}
          <div className="flex items-center gap-1.5">
            <Button 
              variant="outline" 
              size="xs" 
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`gap-1 font-bold ${autoRefresh ? 'text-bullish border-bullish/20 bg-bullish/5' : 'text-muted-foreground'}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin-slow' : ''}`} />
              Live
            </Button>
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)} 
              className="p-1.5 border border-border rounded-lg bg-card text-foreground cursor-pointer hover:bg-secondary transition-all shrink-0"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Dynamic Chart Area */}
        <div className="h-[280px] sm:h-[340px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={visibleCandles} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} tickLine={false} />
              <YAxis 
                domain={['auto', 'auto']} 
                stroke="rgba(255,255,255,0.2)" 
                fontSize={9} 
                tickLine={false} 
                orientation="right"
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip 
                cursor={{ stroke: 'rgba(255,255,255,0.15)', strokeDasharray: '2 2' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartCandle;
                    return (
                      <div className="bg-popover border border-border/80 rounded-xl p-3 text-[10px] font-mono shadow-2xl space-y-1 text-foreground min-w-[120px]">
                        <div className="font-bold text-[11px] border-b border-border/40 pb-1 mb-1 text-primary">{data.time}</div>
                        <div className="flex justify-between"><span>O:</span><span className="font-bold">${data.open.toFixed(2)}</span></div>
                        <div className="flex justify-between text-bullish"><span>H:</span><span className="font-bold">${data.high.toFixed(2)}</span></div>
                        <div className="flex justify-between text-bearish"><span>L:</span><span className="font-bold">${data.low.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>C:</span><span className="font-bold">${data.close.toFixed(2)}</span></div>
                        <div className="flex justify-between text-muted-foreground"><span>Vol:</span><span className="font-bold">{(data.volume / 1000).toFixed(1)}k</span></div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {chartType === 'Line' && (
                <Line type="monotone" dataKey="close" stroke="var(--primary)" strokeWidth={2} dot={false} />
              )}

              {chartType === 'Area' && (
                <Area type="monotone" dataKey="close" stroke="var(--primary)" fill="url(#chartAreaGrad)" strokeWidth={2} />
              )}

              {chartType === 'Candlestick' && (
                // Wicks: thin line bar from low to high
                <Bar dataKey="wick" barSize={1.5} fill="#4b5563">
                  {visibleCandles.map((entry, idx) => (
                    <Cell key={`wick-${idx}`} fill={entry.close >= entry.open ? 'var(--bullish)' : 'var(--bearish)'} opacity={0.6} />
                  ))}
                </Bar>
              )}

              {chartType === 'Candlestick' && (
                // Body: wider floating bar from open to close
                <Bar dataKey="body" barSize={7}>
                  {visibleCandles.map((entry, idx) => {
                    const isUp = entry.close >= entry.open;
                    return (
                      <Cell 
                        key={`body-${idx}`} 
                        fill={isUp ? 'var(--bullish)' : 'var(--bearish)'} 
                        stroke={isUp ? 'var(--bullish)' : 'var(--bearish)'}
                      />
                    );
                  })}
                </Bar>
              )}

              {chartType === 'Volume' && (
                <Bar dataKey="volume" barSize={6}>
                  {visibleCandles.map((entry, idx) => (
                    <Cell key={`vol-${idx}`} fill={entry.close >= entry.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'} />
                  ))}
                </Bar>
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Floating Drawings Layer Overlay */}
          {drawings.length > 0 && (
            <div className="absolute top-2 left-2 bg-card/85 backdrop-blur border border-border/80 rounded-xl p-2.5 max-w-[180px] pointer-events-none select-none text-[9px] font-mono space-y-1 shadow-md">
              <span className="font-bold text-muted-foreground block border-b border-border/20 pb-0.5 mb-1 uppercase tracking-wider">Canvas Overlays</span>
              {drawings.map((d) => (
                <div key={d.id} className="text-foreground leading-tight">
                  • <span className="font-bold text-primary">{d.type}</span>: Active
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation & Drawing controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-border/40 pt-4 text-[10px]">
          {/* Zoom/Pan Buttons */}
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePanLeft} 
              className="p-1.5 border border-border rounded-lg bg-card text-foreground cursor-pointer hover:bg-secondary transition-all"
              title="Pan Left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomOut} 
              className="p-1.5 border border-border rounded-lg bg-card text-foreground cursor-pointer hover:bg-secondary transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomIn} 
              className="p-1.5 border border-border rounded-lg bg-card text-foreground cursor-pointer hover:bg-secondary transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handlePanRight} 
              className="p-1.5 border border-border rounded-lg bg-card text-foreground cursor-pointer hover:bg-secondary transition-all"
              title="Pan Right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Drawings Tool buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground font-semibold font-sans">Drawings:</span>
            {(['Trendline', 'Horizontal', 'Fibonacci'] as const).map((tool) => (
              <button
                key={tool}
                onClick={() => handleAddDrawing(tool)}
                className={`px-2 py-1 rounded border text-[9px] font-sans font-bold cursor-pointer transition-all flex items-center gap-1 ${
                  activeTool === tool 
                    ? 'bg-primary/20 border-primary/50 text-primary' 
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                <PenTool className="w-3 h-3" />
                {tool}
              </button>
            ))}
            {drawings.length > 0 && (
              <button
                onClick={handleClearDrawings}
                className="px-2 py-1 rounded border border-bearish/30 bg-bearish/10 text-bearish font-sans font-bold cursor-pointer hover:bg-bearish/20 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
