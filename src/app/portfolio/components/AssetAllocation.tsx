'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from 'recharts';
import { PieChart as PieIcon, BarChart2, Globe, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const COLORS = ['#6366F1', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#06B6D4'];

interface AllocationItem {
  name: string;
  value: number;
  amount: number;
}

interface AssetAllocationProps {
  isLoading?: boolean;
  allocations: {
    sectorAllocation: AllocationItem[];
    industryAllocation: AllocationItem[];
    assetAllocation: AllocationItem[];
    countryAllocation: AllocationItem[];
    marketCapDistribution: AllocationItem[];
  };
}

export default function AssetAllocation({
  isLoading = false,
  allocations
}: AssetAllocationProps) {
  const [activeTab, setActiveTab] = useState<'sector' | 'industry' | 'asset' | 'country' | 'marketCap'>('sector');

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[360px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // Determine chart to render
  const renderChart = () => {
    switch (activeTab) {
      case 'sector':
        return renderPieChart(allocations.sectorAllocation);
      case 'asset':
        return renderPieChart(allocations.assetAllocation);
      case 'industry':
        return renderBarChart(allocations.industryAllocation);
      case 'country':
        return renderPieChart(allocations.countryAllocation);
      case 'marketCap':
        return renderBarChart(allocations.marketCapDistribution);
      default:
        return null;
    }
  };

  const renderPieChart = (data: AllocationItem[]) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
          No allocation data available.
        </div>
      );
    }

    return (
      <div className="flex flex-col lg:flex-row items-center justify-around h-64 gap-4">
        <div className="w-full lg:w-1/2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Customized Legend */}
        <div className="w-full lg:w-1/2 space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin font-mono text-xs">
          {data.map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between border-b border-border/20 pb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-foreground truncate max-w-[150px]">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground font-semibold">${item.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                <span className="text-primary font-bold">{item.value.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = (data: AllocationItem[]) => {
    if (data.length === 0) {
      return (
        <div className="h-full flex items-center justify-center text-xs font-mono text-muted-foreground">
          No allocation data available.
        </div>
      );
    }

    return (
      <div className="h-60 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} horizontal={false} />
            <XAxis 
              type="number" 
              stroke="var(--muted-foreground)" 
              fontSize={9} 
              tickFormatter={(val) => `${val}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="var(--muted-foreground)" 
              fontSize={9} 
              width={100}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value, name, props) => [`${value}% ($${Number(props.payload.amount).toLocaleString(undefined, { maximumFractionDigits: 0 })})`, 'Allocation']}
              contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono)', fontSize: '11px' }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const tabs = [
    { id: 'sector', label: 'Sector', icon: PieIcon },
    { id: 'industry', label: 'Industry', icon: BarChart2 },
    { id: 'asset', label: 'Asset Type', icon: Target },
    { id: 'country', label: 'Country', icon: Globe },
    { id: 'marketCap', label: 'Market Cap', icon: BarChart2 },
  ] as const;

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-border/40">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
          <PieIcon className="w-4 h-4 text-primary" /> Asset Allocation Diversification
        </CardTitle>
        <div className="flex flex-wrap gap-1 bg-secondary/80 p-0.5 rounded-lg border border-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold rounded cursor-pointer transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="pt-6 h-76">
        {renderChart()}
      </CardContent>
    </Card>
  );
}
