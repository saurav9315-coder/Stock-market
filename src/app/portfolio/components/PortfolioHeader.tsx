'use client';

import React from 'react';
import { 
  Plus, 
  Minus, 
  Upload, 
  Download, 
  FileText, 
  Share2, 
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioHeaderProps {
  metrics: {
    netAssetValue: number;
    cashBalance: number;
    totalInvested: number;
    dailyChangeValue: number;
    dailyChangePercent: number;
    totalReturnPercent: number;
    lastUpdated: string;
  };
  onAddFunds: () => void;
  onWithdrawFunds: () => void;
  onImport: () => void;
  onExport: () => void;
  onPDF: () => void;
  onCSV: () => void;
  onShare: () => void;
}

export default function PortfolioHeader({
  metrics,
  onAddFunds,
  onWithdrawFunds,
  onImport,
  onExport,
  onPDF,
  onCSV,
  onShare
}: PortfolioHeaderProps) {
  const isPnLPositive = metrics.dailyChangeValue >= 0;

  return (
    <div className="flex flex-col gap-6 border-b border-border/40 pb-6">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-primary/20 rounded-xl text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Briefcase className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2">
                Quantitative Equity Holdings
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  INSTITUTIONAL
                </span>
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-9">
            Institutional-grade wealth management dashboard for active equity accounts.
          </p>
        </div>

        {/* Action Button Grid */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onAddFunds}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Funds
          </button>
          <button
            onClick={onWithdrawFunds}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
            Withdraw
          </button>
          <div className="h-6 w-px bg-border/80 mx-1 hidden sm:block" />
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={onPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            PDF Report
          </button>
          <button
            onClick={onCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* Main Account Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-panel border border-panel-border rounded-xl p-4 lg:p-5 font-mono shadow-sm">
        {/* Total portfolio value */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Net Asset Value (NAV)</span>
          <p className="text-xl lg:text-2xl font-extrabold text-foreground truncate">
            ${metrics.netAssetValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Daily Profit & Loss */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Today's Profit / Loss</span>
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-lg lg:text-xl font-bold truncate",
              isPnLPositive ? "text-emerald-500" : "text-rose-500"
            )}>
              {isPnLPositive ? '+' : ''}${metrics.dailyChangeValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={cn(
              "text-xs font-semibold px-1 rounded",
              isPnLPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {isPnLPositive ? '+' : ''}{metrics.dailyChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Total Returns */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Total Return (%)</span>
          <p className={cn(
            "text-xl lg:text-2xl font-bold truncate",
            metrics.totalReturnPercent >= 0 ? "text-emerald-500" : "text-rose-500"
          )}>
            {metrics.totalReturnPercent >= 0 ? '+' : ''}{metrics.totalReturnPercent.toFixed(2)}%
          </p>
        </div>

        {/* Invested */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Total Invested</span>
          <p className="text-xl lg:text-2xl font-bold text-foreground truncate">
            ${metrics.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Cash Balance */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Cash Balance</span>
          <p className="text-xl lg:text-2xl font-bold text-foreground truncate">
            ${metrics.cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        {/* Last Updated */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Last Updated</span>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1.5">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-semibold">{metrics.lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
