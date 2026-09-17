'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Line, 
  Legend 
} from 'recharts';

interface PortfolioChartProps {
  data: Array<{
    time: string;
    Portfolio: number;
    BenchmarkSPY: number;
  }>;
  showBenchmark?: boolean;
  showGrid?: boolean;
  colorHex?: string;
}

export function PortfolioChart({ data, showBenchmark = true, showGrid = true, colorHex }: PortfolioChartProps) {
  const primaryStroke = colorHex || "var(--primary)";

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor={primaryStroke} stopOpacity={0.35} />
            <stop stopColor={primaryStroke} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} vertical={false} />
        )}
        <XAxis 
          dataKey="time" 
          stroke="var(--muted-foreground)" 
          fontSize={9} 
          fontFamily="monospace"
          tickLine={false} 
        />
        <YAxis 
          domain={['dataMin - 2000', 'dataMax + 2000']} 
          stroke="var(--muted-foreground)" 
          fontSize={9} 
          fontFamily="monospace"
          tickLine={false} 
          tickFormatter={(val) => `$${Math.round(val/1000)}k`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--popover)', 
            borderColor: 'var(--border)', 
            borderRadius: '8px',
            color: 'var(--foreground)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }} 
          labelStyle={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--muted-foreground)' }}
          itemStyle={{ fontSize: 11, fontWeight: 'bold' }}
        />
        <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'sans-serif', paddingTop: 10 }} />
        <Area 
          name="Portfolio Value ($)"
          type="monotone" 
          dataKey="Portfolio" 
          stroke={primaryStroke} 
          strokeWidth={2.5}
          fillOpacity={1} 
          fill="url(#colorPort)" 
        />
        {showBenchmark && (
          <Line 
            name="S&P 500 Index (Benchmark)"
            type="monotone" 
            dataKey="BenchmarkSPY" 
            stroke="#10B981" 
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default PortfolioChart;

