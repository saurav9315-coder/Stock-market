'use client';

import React from 'react';
import { Play, FolderClosed, Plus, Trash2, Edit, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Watchlist {
  id: string;
  name: string;
  color: string;
  symbols: string[];
}

interface WatchlistSidebarProps {
  isLoading?: boolean;
  watchlists: Watchlist[];
  activeId: string;
  onSelect: (id: string) => void;
  performance: Record<string, { count: number; change: number }>;
  onRename: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateTrigger: () => void;
}

export default function WatchlistSidebar({
  isLoading = false,
  watchlists,
  activeId,
  onSelect,
  performance,
  onRename,
  onDuplicate,
  onDelete,
  onCreateTrigger
}: WatchlistSidebarProps) {
  if (isLoading) {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-4 w-28 bg-muted rounded mb-5" />
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="h-12 bg-muted rounded-lg w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Title & Action */}
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <span className="text-xs font-bold font-mono text-muted-foreground uppercase tracking-wider">
          Watchlist Collections
        </span>
        <button
          onClick={onCreateTrigger}
          title="Create a new watchlist"
          className="p-1 rounded bg-secondary hover:bg-primary/10 border border-border hover:border-primary/20 text-primary cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Collections Navigation List */}
      <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
        {watchlists.map((wl) => {
          const isActive = wl.id === activeId;
          const perf = performance[wl.id] || { count: 0, change: 0 };
          const isPositive = perf.change >= 0;

          return (
            <div
              key={wl.id}
              onClick={() => onSelect(wl.id)}
              className={cn(
                "group relative flex flex-col gap-1.5 p-3 rounded-lg border transition-all cursor-pointer",
                isActive 
                  ? "bg-secondary/70 border-primary shadow-sm"
                  : "bg-panel/40 border-border/60 hover:bg-secondary/40 hover:border-border"
              )}
            >
              {/* Header: Tag, Name & Options */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  {/* Colored indicator dot */}
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", wl.color)} />
                  <span className={cn(
                    "text-xs font-semibold truncate",
                    isActive ? "text-foreground font-bold" : "text-foreground/80"
                  )}>
                    {wl.name}
                  </span>
                </div>

                {/* Performance Badge */}
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded font-mono",
                  perf.count === 0 
                    ? "bg-secondary text-muted-foreground"
                    : isPositive 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-rose-500/10 text-rose-500"
                )}>
                  {perf.count === 0 ? 'Empty' : `${isPositive ? '+' : ''}${perf.change.toFixed(2)}%`}
                </span>
              </div>

              {/* Footer: Count & Options */}
              <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-muted-foreground">
                <span className="font-sans shrink-0">{perf.count} asset(s) tracking</span>
                
                {/* Options overlay visible on hover or if active */}
                <div className={cn(
                  "flex items-center gap-1.5 transition-opacity duration-100",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRename(wl.id);
                    }}
                    title="Rename list"
                    className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate(wl.id);
                    }}
                    title="Duplicate list"
                    className="p-0.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(wl.id);
                    }}
                    title="Delete list"
                    className="p-0.5 rounded hover:bg-secondary hover:text-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
