'use client';

import React from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Activity, 
  Sparkles,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y';
export type ChartStyle = 'area' | 'line' | 'candlestick' | 'bar';

interface ChartToolbarProps {
  timeframe: TimeFrame;
  onTimeframeChange: (tf: TimeFrame) => void;
  chartStyle: ChartStyle;
  onChartStyleChange: (style: ChartStyle) => void;
  indicators: {
    sma: boolean;
    ema: boolean;
    bollinger: boolean;
    volume: boolean;
  };
  onToggleIndicator: (key: 'sma' | 'ema' | 'bollinger' | 'volume') => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  className?: string;
}

const timeframes: TimeFrame[] = ['1D', '1W', '1M', '3M', '6M', '1Y'];

export default function ChartToolbar({
  timeframe,
  onTimeframeChange,
  chartStyle,
  onChartStyleChange,
  indicators,
  onToggleIndicator,
  isFullscreen,
  onToggleFullscreen,
  showGrid,
  onToggleGrid,
  className,
}: ChartToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-[#0B0F14] border border-[#1E293B] select-none font-mono text-xs", className)}>
      {/* Timeframe Selectors */}
      <div className="flex items-center gap-1 bg-[#05070A] p-1 rounded-lg border border-[#1E293B]">
        {timeframes.map((tf) => (
          <button
            key={tf}
            type="button"
            onClick={() => onTimeframeChange(tf)}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer",
              timeframe === tf
                ? "bg-[#9FEF00] text-[#05070A] shadow-md shadow-[#9FEF00]/20"
                : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#10161D]"
            )}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Center Controls: Chart Style & Indicators */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Chart Style Selector */}
        <div className="flex items-center gap-1 bg-[#05070E] p-1 rounded-lg border border-border/60">
          <button
            type="button"
            onClick={() => onChartStyleChange('area')}
            title="Area Chart"
            className={cn(
              "p-1.5 rounded-md transition-colors cursor-pointer",
              chartStyle === 'area' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChartStyleChange('line')}
            title="Line Chart"
            className={cn(
              "p-1.5 rounded-md transition-colors cursor-pointer",
              chartStyle === 'line' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChartStyleChange('candlestick')}
            title="Bar / Candlestick"
            className={cn(
              "p-1.5 rounded-md transition-colors cursor-pointer",
              chartStyle === 'candlestick' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Indicators Toggles */}
        <div className="flex items-center gap-1 bg-[#05070E] p-1 rounded-lg border border-border/60 text-[10px]">
          <span className="px-1 text-muted-foreground/60 font-bold uppercase hidden sm:inline">INDICATORS:</span>
          
          <button
            type="button"
            onClick={() => onToggleIndicator('sma')}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all cursor-pointer border",
              indicators.sma 
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40" 
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            SMA 20
          </button>

          <button
            type="button"
            onClick={() => onToggleIndicator('ema')}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all cursor-pointer border",
              indicators.ema 
                ? "bg-purple-500/20 text-purple-400 border-purple-500/40" 
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            EMA 12
          </button>

          <button
            type="button"
            onClick={() => onToggleIndicator('bollinger')}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all cursor-pointer border",
              indicators.bollinger 
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40" 
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            BOLLINGER
          </button>

          <button
            type="button"
            onClick={() => onToggleIndicator('volume')}
            className={cn(
              "px-2 py-0.5 rounded font-bold transition-all cursor-pointer border",
              indicators.volume 
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                : "bg-transparent text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            VOLUME
          </button>
        </div>
      </div>

      {/* Right Controls: Grid & Fullscreen */}
      <div className="flex items-center gap-1.5 bg-[#05070E] p-1 rounded-lg border border-border/60">
        <button
          type="button"
          onClick={onToggleGrid}
          title={showGrid ? "Hide Grid Lines" : "Show Grid Lines"}
          className={cn(
            "p-1.5 rounded-md transition-colors cursor-pointer",
            showGrid ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Layers className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-blue-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
