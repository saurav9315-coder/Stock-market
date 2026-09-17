'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderPlus, 
  Trash2, 
  Edit, 
  Upload, 
  Search, 
  Share2, 
  Plus, 
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAllQuotes } from '@/lib/stockMock';
import { toast } from 'sonner';

interface WatchlistModalsProps {
  activeModal: 'create' | 'rename' | 'delete' | 'addStock' | 'share' | null;
  onClose: () => void;
  
  // Watchlist lists for name lookup
  activeWatchlistName?: string;
  activeWatchlistId?: string;
  watchlistSymbols?: string[];
  
  // Handlers
  onCreateSubmit: (name: string, color: string) => void;
  onRenameSubmit: (id: string, name: string) => void;
  onDeleteSubmit: (id: string) => void;
  onAddStockSubmit: (symbol: string) => void;
}

const COLORS_PRESETS = [
  { id: 'bg-rose-500', label: 'Red' },
  { id: 'bg-emerald-500', label: 'Green' },
  { id: 'bg-blue-500', label: 'Blue' },
  { id: 'bg-purple-500', label: 'Purple' },
  { id: 'bg-indigo-500', label: 'Indigo' },
  { id: 'bg-amber-500', label: 'Amber' },
  { id: 'bg-cyan-500', label: 'Cyan' },
  { id: 'bg-pink-500', label: 'Pink' }
];

export default function WatchlistModals({
  activeModal,
  onClose,
  activeWatchlistName = '',
  activeWatchlistId = '',
  watchlistSymbols = [],
  onCreateSubmit,
  onRenameSubmit,
  onDeleteSubmit,
  onAddStockSubmit
}: WatchlistModalsProps) {
  const [watchlistNameInput, setWatchlistNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial inputs loader on rename
  React.useEffect(() => {
    if (activeModal === 'rename' && activeWatchlistName) {
      setWatchlistNameInput(activeWatchlistName);
    } else {
      setWatchlistNameInput('');
    }
  }, [activeModal, activeWatchlistName]);

  // List matching stocks to add
  const availableToAdd = useMemo(() => {
    if (activeModal !== 'addStock') return [];
    return getAllQuotes().filter(
      (q) => 
        !watchlistSymbols.includes(q.symbol) &&
        (q.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
         q.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeModal, watchlistSymbols, searchQuery]);

  if (!activeModal) return null;

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistNameInput.trim()) return;
    onCreateSubmit(watchlistNameInput, selectedColor);
    setWatchlistNameInput('');
    onClose();
  };

  const handleSubmitRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistNameInput.trim()) return;
    onRenameSubmit(activeWatchlistId, watchlistNameInput);
    setWatchlistNameInput('');
    onClose();
  };

  const handleShareClipboard = () => {
    if (typeof window !== 'undefined') {
      const sharePayload = {
        id: activeWatchlistId,
        n: activeWatchlistName,
        s: watchlistSymbols
      };
      const shareUrl = `${window.location.origin}/watchlist/preview?hash=${btoa(JSON.stringify(sharePayload))}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast.success('Share snapshot link copied to clipboard.');
        onClose();
      }).catch(() => {
        toast.error('Clipboard copy action failed.');
      });
    }
  };

  const renderContent = () => {
    switch (activeModal) {
      case 'create':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-primary" /> Create Watchlist Collection
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmitCreate} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Volatile Caps, Swing Options"
                  value={watchlistNameInput}
                  onChange={(e) => setWatchlistNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground block">Visual Color Tag</label>
                <div className="grid grid-cols-4 gap-2">
                  {COLORS_PRESETS.map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setSelectedColor(col.id)}
                      className={cn(
                        "py-1 rounded text-[9px] font-bold text-white transition-all cursor-pointer flex items-center justify-center border",
                        selectedColor === col.id ? "border-foreground scale-105" : "border-transparent opacity-75 hover:opacity-100"
                      )}
                      style={{ backgroundColor: `var(--${col.id.replace('bg-', 'color-')})` || '#4F46E5' }}
                    >
                      <div className={cn("w-3 h-3 rounded-full border border-white/20", col.id)} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold rounded-lg text-white bg-primary hover:opacity-90 cursor-pointer shadow"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        );

      case 'rename':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-primary" /> Rename Watchlist Collection
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            
            <form onSubmit={handleSubmitRename} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">New Collection Name</label>
                <input
                  type="text"
                  required
                  placeholder="Rename watchlist"
                  value={watchlistNameInput}
                  onChange={(e) => setWatchlistNameInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-bold rounded-lg text-white bg-primary hover:opacity-90 cursor-pointer shadow"
                >
                  Confirm Rename
                </button>
              </div>
            </form>
          </div>
        );

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-rose-500" /> Delete Watchlist Collection
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-start gap-2.5 bg-rose-500/5 border border-rose-500/15 rounded-lg p-3 text-rose-500">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-normal">
                  <p className="font-bold">Permanent deletion alert</p>
                  <p className="text-[10px] text-rose-500/80">Are you sure you want to delete the watchlist folder &ldquo;{activeWatchlistName}&rdquo;? All tracking layouts will be lost.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSubmit(activeWatchlistId);
                    onClose();
                  }}
                  className="flex-1 py-2 font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-500 cursor-pointer shadow-md"
                >
                  Delete Folder
                </button>
              </div>
            </div>
          </div>
        );

      case 'addStock':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" /> Add Asset to &ldquo;{activeWatchlistName}&rdquo;
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter available stock ticker..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary text-foreground border border-border rounded-lg"
                />
              </div>

              {/* Items List */}
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {availableToAdd.length === 0 ? (
                  <p className="text-[10px] text-center text-muted-foreground py-4">No matching tickers found.</p>
                ) : (
                  availableToAdd.map((q) => (
                    <button
                      key={q.symbol}
                      onClick={() => {
                        onAddStockSubmit(q.symbol);
                        setSearchQuery('');
                        onClose();
                      }}
                      className="flex items-center justify-between w-full p-2.5 text-[11px] rounded-lg bg-secondary/50 border border-border/40 hover:bg-secondary hover:border-primary/20 transition-all cursor-pointer text-left"
                    >
                      <div>
                        <span className="font-bold text-foreground">{q.symbol}</span>
                        <span className="text-[9px] text-muted-foreground block truncate max-w-[150px] font-sans mt-0.5">{q.name}</span>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-extrabold text-foreground">${q.price.toFixed(2)}</span>
                        <span className="text-[8px] bg-primary text-primary-foreground font-bold px-1 py-0.5 rounded">Watch</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'share':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-primary" /> Share &ldquo;{activeWatchlistName}&rdquo;
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            
            <div className="space-y-4 font-mono text-xs">
              <p className="text-muted-foreground leading-normal text-[11px]">Generate a read-only snapshot URL representing the active watchlists tickers portfolio ratios. Ratios will live update based on market coordinates.</p>
              
              <button
                onClick={handleShareClipboard}
                className="w-full py-2 font-bold rounded-lg text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                <Share2 className="w-4 h-4" /> Copy Secure Snapshot Link
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-panel border border-border rounded-xl p-5 w-full max-w-sm font-mono shadow-2xl space-y-4">
        {renderContent()}
      </div>
    </div>
  );
}
