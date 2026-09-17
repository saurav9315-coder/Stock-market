'use client';

import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Sliders, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChartDataPoint, StockQuote } from '@/lib/stockMock';
import { TimeFrame, ChartStyle } from './ChartToolbar';

interface TradingChartProps {
  quote: StockQuote;
  chartData: ChartDataPoint[];
  timeframe: TimeFrame;
  chartStyle: ChartStyle;
  indicators: {
    sma: boolean;
    ema: boolean;
    bollinger: boolean;
    volume: boolean;
  };
  showGrid: boolean;
  isLiveTickActive?: boolean;
  className?: string;
}

export default function TradingChart({
  quote,
  chartData,
  timeframe,
  chartStyle,
  indicators,
  showGrid,
  isLiveTickActive = true,
  className,
}: TradingChartProps) {
  const isPositive = quote.change >= 0;

  // Process chart data with Bollinger upper/lower bounds if toggled
  const processedData = useMemo(() => {
    return chartData.map((d) => {
      const sma = d.sma20 || d.close;
      const stdDev = sma * 0.015;
      return {
        ...d,
        sma20: d.sma20 || d.close * 0.99,
        ema12: d.ema12 || d.close * 1.005,
        bbUpper: sma + stdDev * 2,
        bbLower: sma - stdDev * 2,
      };
    });
  }, [chartData]);

  // Calculate min & max Y-axis domains
  const yDomain = useMemo(() => {
    if (!processedData.length) return ['auto', 'auto'];
    const prices = processedData.map(d => d.close);
    const min = Math.min(...prices) * 0.98;
    const max = Math.max(...prices) * 1.02;
    return [min, max];
  }, [processedData]);

  return (
    <div className={cn("flex flex-col h-full bg-[#050608] rounded-[22px] border border-[#1E293B] hover:border-[#D84315]/40 transition-colors p-4.5 shadow-2xl overflow-hidden select-none", className)}>
      {/* Stock Quote Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-3.5 mb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#D84315]/15 border border-[#D84315]/40 text-[#FF7043] font-mono font-black text-sm shadow-[0_0_15px_rgba(216,67,21,0.25)]">
            {quote.symbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-foreground">{quote.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground border border-border">
                {quote.sector}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mt-0.5">
              <span>Vol: {(quote.volume / 1000000).toFixed(2)}M</span>
              <span>•</span>
              <span>P/E: {quote.peRatio}</span>
              <span>•</span>
              <span>Beta: {quote.beta}</span>
            </div>
          </div>
        </div>

        {/* Live Price Tag */}
        <div className="flex items-center gap-3 font-mono">
          {isLiveTickActive && (
            <div className="flex items-center gap-1.5 text-[10px] text-[#F4511E] font-bold px-2 py-0.5 rounded-full bg-[#F4511E]/10 border border-[#F4511E]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F4511E] animate-pulse shadow-[0_0_6px_#F4511E]" />
              LIVE TICK TELEMETRY
            </div>
          )}

          <div className="text-right">
            <div className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              ${quote.price.toFixed(2)}
            </div>
            <div className={cn("text-xs font-bold flex items-center justify-end gap-1", isPositive ? "text-[#F4511E]" : "text-rose-400")}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{isPositive ? '+' : ''}{quote.change.toFixed(2)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Graphic Container */}
      <div className="flex-1 w-full min-h-[340px] sm:min-h-[420px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#1F293D" opacity={0.5} />}

            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#1E293B' }} 
              tickLine={false} 
            />

            <YAxis 
              domain={yDomain as [number, number]} 
              orientation="right" 
              tick={{ fontSize: 10, fill: '#64748B', fontFamily: 'monospace' }} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(v) => `$${v.toFixed(0)}`}
            />

            <YAxis 
              yAxisId="vol"
              hide={true}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Bollinger Bands Overlay */}
            {indicators.bollinger && (
              <>
                <Line type="monotone" dataKey="bbUpper" stroke="#06B6D4" strokeDasharray="2 2" strokeWidth={1} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="bbLower" stroke="#06B6D4" strokeDasharray="2 2" strokeWidth={1} dot={false} isAnimationActive={false} />
              </>
            )}

            {/* SMA Indicator */}
            {indicators.sma && (
              <Line type="monotone" dataKey="sma20" stroke="#F59E0B" strokeWidth={1.5} dot={false} isAnimationActive={false} name="SMA 20" />
            )}

            {/* EMA Indicator */}
            {indicators.ema && (
              <Line type="monotone" dataKey="ema12" stroke="#A855F7" strokeWidth={1.5} dot={false} isAnimationActive={false} name="EMA 12" />
            )}

            {/* Volume Bar Overlay */}
            {indicators.volume && (
              <Bar dataKey="volume" yAxisId="vol" fill="#3B82F6" opacity={0.2} radius={[2, 2, 0, 0]} />
            )}

            {/* Main Price Line / Area */}
            {chartStyle === 'area' ? (
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth={2}
                fill={isPositive ? 'url(#colorBullish)' : 'url(#colorBearish)'}
                isAnimationActive={false}
              />
            ) : chartStyle === 'candlestick' || chartStyle === 'bar' ? (
              <Bar
                dataKey="close"
                fill={isPositive ? '#10B981' : '#F43F5E'}
                radius={[2, 2, 0, 0]}
                isAnimationActive={false}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            <defs>
              <linearGradient id="colorBullish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorBearish" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Custom Tooltip component for chart hover
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#090D18]/95 border border-border/80 p-2.5 rounded-xl shadow-2xl backdrop-blur-md text-xs font-mono space-y-1">
        <div className="text-[10px] text-muted-foreground border-b border-border/40 pb-1 flex justify-between gap-4">
          <span>TIME: {data.time}</span>
          <span className="text-primary font-bold">TICKS TELEMETRY</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-bold text-foreground text-right">${data.close?.toFixed(2)}</span>
          {data.open && (
            <>
              <span className="text-muted-foreground">Open:</span>
              <span className="text-foreground text-right">${data.open?.toFixed(2)}</span>
            </>
          )}
          {data.sma20 && (
            <>
              <span className="text-amber-400">SMA 20:</span>
              <span className="text-amber-400 text-right">${data.sma20?.toFixed(2)}</span>
            </>
          )}
          {data.ema12 && (
            <>
              <span className="text-purple-400">EMA 12:</span>
              <span className="text-purple-400 text-right">${data.ema12?.toFixed(2)}</span>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
}
