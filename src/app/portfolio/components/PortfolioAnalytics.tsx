'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  LabelList 
} from 'recharts';
import { Activity, ShieldAlert, Award, TrendingUp, Info } from 'lucide-react';

interface PortfolioAnalyticsProps {
  isLoading?: boolean;
  analytics: {
    volatility: number;
    beta: number;
    sharpeRatio: number;
    alpha: number;
    drawdown: number;
    riskScore: number;
    diversificationScore: number;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-popover border border-border rounded-lg p-2.5 font-mono text-[10px] text-foreground shadow-md">
        <p className="font-bold border-b border-border/20 pb-1 mb-1">{data.name}</p>
        <p>Risk (Beta): <span className="font-semibold text-primary">{data.x}</span></p>
        <p>Est. Return: <span className="font-semibold text-emerald-500">{data.y}%</span></p>
      </div>
    );
  }
  return null;
};

export default function PortfolioAnalytics({
  isLoading = false,
  analytics
}: PortfolioAnalyticsProps) {
  // Scatter plot data mapping holding assets: Risk (Beta) vs Return (Profit/Loss %)
  const scatterData = [
    { name: 'AAPL', x: 1.12, y: 4.18, z: 200 },
    { name: 'MSFT', x: 0.90, y: 6.51, z: 250 },
    { name: 'NVDA', x: 1.68, y: 34.63, z: 400 },
    { name: 'TSLA', x: 2.10, y: -10.26, z: 150 },
    { name: 'BTC-USD', x: 1.85, y: 16.97, z: 180 },
    { name: 'My Portfolio', x: analytics.beta, y: 12.2, z: 500, isPortfolio: true },
  ];

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[350px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Award className="w-4 h-4 text-primary" /> Advanced Portfolio Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Metric summaries grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
          
          <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 space-y-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Portfolio Beta</span>
            <p className="text-lg font-black text-foreground">{analytics.beta}</p>
            <span className="text-[8px] text-muted-foreground block">Systemic market risk ratio</span>
          </div>

          <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 space-y-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Sharpe Ratio</span>
            <p className="text-lg font-black text-foreground">{analytics.sharpeRatio}</p>
            <span className="text-[8px] text-muted-foreground block">Risk-adjusted return reward</span>
          </div>

          <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 space-y-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Alpha (Jensen's)</span>
            <p className="text-lg font-black text-emerald-500 font-bold">+{analytics.alpha}%</p>
            <span className="text-[8px] text-muted-foreground block">Excess return vs benchmark</span>
          </div>

          <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 space-y-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Est. Volatility</span>
            <p className="text-lg font-black text-foreground">{analytics.volatility}%</p>
            <span className="text-[8px] text-muted-foreground block">Annual deviation standard</span>
          </div>

          <div className="bg-secondary/35 border border-border/40 rounded-xl p-3.5 space-y-1 col-span-2 md:col-span-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">Max Drawdown</span>
            <p className="text-lg font-black text-rose-500">-{analytics.drawdown}%</p>
            <span className="text-[8px] text-muted-foreground block">Peak-to-trough drop value</span>
          </div>
          
        </div>

        {/* Risk vs Return Scatter Plot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          <div className="space-y-3 font-mono text-xs lg:col-span-1">
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-primary" /> Risk vs. Return Matrix
            </h4>
            <div className="bg-secondary/20 border border-border/30 rounded-xl p-4 space-y-3 text-[11px] leading-relaxed">
              <p>This scatter plot graphs individual assets by systemic volatility risk (**Beta**) on the X-axis against expected **Return** on the Y-axis.</p>
              <p>Assets in the **top-left** quadrant indicate superior risk-adjusted performance (high alpha). Assets in the **bottom-right** signify high volatility with lagging yields.</p>
              <p>The **My Portfolio** node aggregates current holdings, showing optimized placement relative to risk levels.</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-2">
            <div className="h-56 w-full bg-secondary/15 rounded-xl border border-border/30 p-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: -20 }}>
                  <XAxis 
                    type="number" 
                    dataKey="x" 
                    name="Beta" 
                    unit="" 
                    stroke="var(--muted-foreground)" 
                    fontSize={9}
                    tickLine={false} 
                    axisLine={false}
                    domain={[0.5, 2.5]}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="y" 
                    name="Return" 
                    unit="%" 
                    stroke="var(--muted-foreground)" 
                    fontSize={9}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Scatter plots. We render portfolio separate from normal holdings */}
                  <Scatter 
                    name="Holdings" 
                    data={scatterData.filter(d => !d.isPortfolio)} 
                    fill="var(--muted-foreground)" 
                    className="opacity-70"
                  >
                    <LabelList dataKey="name" position="top" style={{ fontSize: 9, fontFamily: 'var(--font-geist-mono)', fill: 'var(--foreground)' }} />
                  </Scatter>
                  <Scatter 
                    name="My Portfolio" 
                    data={scatterData.filter(d => d.isPortfolio)} 
                    fill="var(--primary)"
                  >
                    <LabelList dataKey="name" position="top" style={{ fontSize: 10, fontFamily: 'var(--font-geist-mono)', fill: 'var(--foreground)', fontWeight: 'bold' }} />
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </CardContent>
    </Card>
  );
}
