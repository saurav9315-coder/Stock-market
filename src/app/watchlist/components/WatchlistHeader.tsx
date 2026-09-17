'use client';

import React from 'react';
import { 
  Plus, 
  Edit, 
  Copy, 
  Upload, 
  Download, 
  Share2, 
  Calendar,
  Layers,
  Activity,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistHeaderProps {
  watchlistName: string;
  watchlistId: string;
  totalStocks: number;
  totalWatchlists: number;
  lastUpdated: string;
  onCreate: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onImport: () => void;
  onExport: () => void;
  onShare: () => void;
}

export default function WatchlistHeader({
  watchlistName,
  watchlistId,
  totalStocks,
  totalWatchlists,
  lastUpdated,
  onCreate,
  onRename,
  onDuplicate,
  onImport,
  onExport,
  onShare
}: WatchlistHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-border/40 pb-5">
      {/* Top Title Bar & Primary Action Group */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-primary/20 rounded-xl text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-sans flex items-center gap-2">
              {watchlistName}
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                ACTIVE DECK
              </span>
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 ml-10">
            Real-time multi-asset watchlists and indicators overview workspace.
          </p>
        </div>

        {/* Global actions row */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black transition-all cursor-pointer shadow-lg shadow-amber-500/20 border border-amber-400/40"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Watchlist
          </button>
          <button
            onClick={onRename}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            Rename
          </button>
          <button
            onClick={onDuplicate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
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
            Export Config
          </button>
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Link
          </button>
        </div>
      </div>

      {/* Meta Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-panel border border-panel-border rounded-xl p-4 font-mono shadow-sm">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Active Symbols</span>
          <p className="text-xl font-extrabold text-foreground">{totalStocks} Tickers</p>
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Total Watchlists</span>
          <p className="text-xl font-extrabold text-foreground">{totalWatchlists} Folders</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Feed Connection</span>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-500 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>WebSocket Live</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground block">Last Synced</span>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1 text-xs font-semibold">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
