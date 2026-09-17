'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  MoreVertical,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStockQuote } from '@/lib/stockMock';

interface HoldingItem {
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  sector: string;
}

interface HoldingsTableProps {
  isLoading?: boolean;
  holdings: HoldingItem[];
  totalNav: number;
  onTradeAction: (symbol: string, quantity: number, type: 'BUY' | 'SELL') => void;
}

type SortField = 'symbol' | 'value' | 'pnl' | 'weight' | 'dailyChange';
type SortOrder = 'asc' | 'desc';

export default function HoldingsTable({
  isLoading = false,
  holdings,
  totalNav,
  onTradeAction
}: HoldingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [pnlFilter, setPnlFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('value');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected asset for direct quick trade form
  const [quickTradeSymbol, setQuickTradeSymbol] = useState<string | null>(null);
  const [quickTradeType, setQuickTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quickTradeQty, setQuickTradeQty] = useState(1);

  // Extract unique sectors for filter
  const sectorsList = useMemo(() => {
    const sectors = new Set<string>();
    holdings.forEach(h => sectors.add(h.sector));
    return Array.from(sectors);
  }, [holdings]);

  // Compute stats and enrich holdings
  const enrichedHoldings = useMemo(() => {
    return holdings.map((h) => {
      const value = h.quantity * h.currentPrice;
      const cost = h.quantity * h.avgBuyPrice;
      const pnl = value - cost;
      const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0;
      
      const quote = getStockQuote(h.symbol);
      const dailyChange = h.quantity * quote.change;
      const dailyChangePercent = quote.changePercent;
      
      const weight = totalNav > 0 ? (value / totalNav) * 100 : 0;

      return {
        ...h,
        value,
        cost,
        pnl,
        pnlPct,
        dailyChange,
        dailyChangePercent,
        weight,
      };
    });
  }, [holdings, totalNav]);

  // Handle Sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter & Search logic
  const filteredHoldings = useMemo(() => {
    return enrichedHoldings
      .filter((h) => {
        const matchesSearch = 
          h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
          h.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSector = sectorFilter === 'ALL' || h.sector === sectorFilter;
        
        let matchesPnl = true;
        if (pnlFilter === 'PROFIT') matchesPnl = h.pnl >= 0;
        if (pnlFilter === 'LOSS') matchesPnl = h.pnl < 0;

        return matchesSearch && matchesSector && matchesPnl;
      })
      .sort((a, b) => {
        let aVal = 0;
        let bVal = 0;

        if (sortField === 'symbol') {
          return sortOrder === 'asc' 
            ? a.symbol.localeCompare(b.symbol)
            : b.symbol.localeCompare(a.symbol);
        }

        if (sortField === 'value') {
          aVal = a.value;
          bVal = b.value;
        } else if (sortField === 'pnl') {
          aVal = a.pnlPct;
          bVal = b.pnlPct;
        } else if (sortField === 'weight') {
          aVal = a.weight;
          bVal = b.weight;
        } else if (sortField === 'dailyChange') {
          aVal = a.dailyChangePercent;
          bVal = b.dailyChangePercent;
        }

        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
  }, [enrichedHoldings, searchTerm, sectorFilter, pnlFilter, sortField, sortOrder]);

  // Pagination calculations
  const paginatedHoldings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHoldings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHoldings, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredHoldings.length / itemsPerPage));

  const handleQuickTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTradeSymbol || quickTradeQty <= 0) return;
    onTradeAction(quickTradeSymbol, quickTradeQty, quickTradeType);
    setQuickTradeSymbol(null);
    setQuickTradeQty(1);
  };

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground ml-1" />;
    return sortOrder === 'asc' 
      ? <TrendingUp className="w-3 h-3 text-emerald-500 ml-1" />
      : <TrendingDown className="w-3 h-3 text-rose-500 ml-1" />;
  };

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[400px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Activity className="w-4 h-4 text-primary" /> Active Holdings Ledger
        </CardTitle>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-48 sm:w-60">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search ticker or name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/80 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Sector Filter */}
          <div className="w-32">
            <select
              value={sectorFilter}
              onChange={(e) => {
                setSectorFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs bg-secondary/80 border border-border rounded-lg text-foreground focus:outline-none font-mono"
            >
              <option value="ALL">All Sectors</option>
              {sectorsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Return P&L Filter */}
          <div className="w-32">
            <select
              value={pnlFilter}
              onChange={(e) => {
                setPnlFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs bg-secondary/80 border border-border rounded-lg text-foreground focus:outline-none font-mono"
            >
              <option value="ALL">All Returns</option>
              <option value="PROFIT">Profitable</option>
              <option value="LOSS">Underperforming</option>
            </select>
          </div>
        </div>
      </CardHeader>

      {/* Desktop view table */}
      <div className="hidden md:block overflow-x-auto">
        <Table className="relative min-w-[900px]">
          <TableHeader className="sticky top-0 bg-panel z-10 border-b border-border/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3 px-4 font-semibold text-xs font-mono">Company</TableHead>
              <TableHead 
                onClick={() => handleSort('symbol')} 
                className="py-3 px-4 font-semibold text-xs font-mono cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center">Symbol {renderSortIndicator('symbol')}</div>
              </TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-xs font-mono">Quantity</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-xs font-mono">Avg Cost</TableHead>
              <TableHead className="py-3 px-4 text-right font-semibold text-xs font-mono">Current Price</TableHead>
              
              <TableHead 
                onClick={() => handleSort('value')} 
                className="py-3 px-4 text-right font-semibold text-xs font-mono cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end">Market Value {renderSortIndicator('value')}</div>
              </TableHead>

              <TableHead 
                onClick={() => handleSort('pnl')} 
                className="py-3 px-4 text-right font-semibold text-xs font-mono cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end">Profit / Loss {renderSortIndicator('pnl')}</div>
              </TableHead>

              <TableHead 
                onClick={() => handleSort('dailyChange')} 
                className="py-3 px-4 text-right font-semibold text-xs font-mono cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end">Daily Change {renderSortIndicator('dailyChange')}</div>
              </TableHead>

              <TableHead 
                onClick={() => handleSort('weight')} 
                className="py-3 px-4 text-right font-semibold text-xs font-mono cursor-pointer hover:text-foreground transition-colors"
              >
                <div className="flex items-center justify-end">Weight {renderSortIndicator('weight')}</div>
              </TableHead>
              <TableHead className="py-3 px-4 text-center font-semibold text-xs font-mono">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHoldings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-10 text-muted-foreground font-mono text-xs">
                  No active holdings matching filters found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedHoldings.map((h) => {
                const isGain = h.pnl >= 0;
                const isDailyGain = h.dailyChange >= 0;

                return (
                  <TableRow key={h.symbol} className="hover:bg-secondary/45 border-border/40 transition-colors font-mono text-xs group">
                    <TableCell className="py-3.5 px-4 font-sans font-medium text-foreground">
                      <div className="truncate max-w-[140px] font-semibold">{h.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[140px] font-mono mt-0.5">{h.sector}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <Link href={`/stock/${h.symbol}`}>
                        <span className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer block">
                          {h.symbol}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right font-semibold text-foreground/80">
                      {h.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right font-semibold text-foreground/85">
                      ${h.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right font-extrabold text-foreground">
                      ${h.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right font-extrabold text-foreground">
                      ${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    
                    {/* Return PnL */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn("font-bold", isGain ? 'text-emerald-500' : 'text-rose-500')}>
                          {isGain ? '+' : ''}${h.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={cn("text-[9px] font-bold px-1 rounded mt-0.5", isGain ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                          {isGain ? '+' : ''}{h.pnlPct.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Daily Change */}
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={cn("font-bold", isDailyGain ? 'text-emerald-500' : 'text-rose-500')}>
                          {isDailyGain ? '+' : ''}${h.dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className={cn("text-[9px] font-bold px-1 rounded mt-0.5", isDailyGain ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                          {isDailyGain ? '+' : ''}{h.dailyChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </TableCell>

                    {/* Weights */}
                    <TableCell className="py-3.5 px-4 text-right font-bold text-foreground/80">
                      {h.weight.toFixed(2)}%
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setQuickTradeSymbol(h.symbol);
                            setQuickTradeType('BUY');
                          }}
                          title="Buy Shares"
                          className="p-1 rounded bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-500/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setQuickTradeSymbol(h.symbol);
                            setQuickTradeType('SELL');
                          }}
                          title="Sell Shares"
                          className="p-1 rounded bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-500/20"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view cards */}
      <div className="block md:hidden p-3 space-y-3 border-t border-border/40">
        {paginatedHoldings.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground font-mono text-xs">
            No active holdings matching filters found.
          </div>
        ) : (
          paginatedHoldings.map((h) => {
            const isGain = h.pnl >= 0;
            const isDailyGain = h.dailyChange >= 0;

            return (
              <div key={h.symbol} className="bg-panel border border-border/60 hover:border-primary/45 rounded-xl p-3.5 space-y-3 font-mono text-xs shadow-sm relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                
                {/* Header: Symbol & Name */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/stock/${h.symbol}`}>
                        <span className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer">
                          {h.symbol}
                        </span>
                      </Link>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-secondary/80 text-muted-foreground font-sans">
                        {h.sector}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-sans truncate max-w-[150px] mt-0.5">{h.name}</div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-foreground bg-secondary/60 border border-border px-2 py-0.5 rounded-full">
                      {h.weight.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-border/20">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Quantity</span>
                    <span className="font-bold text-foreground">{h.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Market Value</span>
                    <span className="font-bold text-foreground">${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Avg Cost</span>
                    <span className="font-semibold text-foreground/80">${h.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Current Price</span>
                    <span className="font-semibold text-foreground/80">${h.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Total P&L</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={cn("font-bold", isGain ? 'text-emerald-500' : 'text-rose-500')}>
                        {isGain ? '+' : ''}${h.pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={cn("text-[9px] font-bold px-1 rounded", isGain ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                        {isGain ? '+' : ''}{h.pnlPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-muted-foreground block">Daily Change</span>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className={cn("font-bold", isDailyGain ? 'text-emerald-500' : 'text-rose-500')}>
                        {isDailyGain ? '+' : ''}${h.dailyChange.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className={cn("text-[9px] font-bold px-1 rounded", isDailyGain ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500')}>
                        {isDailyGain ? '+' : ''}{h.dailyChangePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-border/10">
                  <button
                    onClick={() => {
                      setQuickTradeSymbol(h.symbol);
                      setQuickTradeType('BUY');
                    }}
                    className="flex-1 py-2 rounded bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer border border-emerald-500/20 font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Buy
                  </button>
                  <button
                    onClick={() => {
                      setQuickTradeSymbol(h.symbol);
                      setQuickTradeType('SELL');
                    }}
                    className="flex-1 py-2 rounded bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer border border-rose-500/20 font-bold flex items-center justify-center gap-1.5 text-xs shadow-sm"
                  >
                    <Minus className="w-3.5 h-3.5" /> Sell
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border/40 p-4 font-mono text-xs">
        <span className="text-muted-foreground">
          Showing {filteredHoldings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHoldings.length)} of {filteredHoldings.length} holdings
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-secondary hover:bg-muted border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>
          <span className="font-bold text-foreground">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-secondary hover:bg-muted border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Quick Trade Popup Inline Form */}
      {quickTradeSymbol && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-panel border border-border rounded-xl p-5 w-full max-w-sm font-mono shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Execute Position Trade: {quickTradeSymbol}
              </h3>
              <button 
                onClick={() => setQuickTradeSymbol(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleQuickTradeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Trade Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickTradeType('BUY')}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer",
                      quickTradeType === 'BUY'
                        ? "bg-emerald-600 text-white shadow"
                        : "bg-secondary text-muted-foreground border border-border hover:bg-muted"
                    )}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickTradeType('SELL')}
                    className={cn(
                      "py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer",
                      quickTradeType === 'SELL'
                        ? "bg-rose-600 text-white shadow"
                        : "bg-secondary text-muted-foreground border border-border hover:bg-muted"
                    )}
                  >
                    SELL
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Quantity (Shares)</label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  required
                  value={quickTradeQty}
                  onChange={(e) => setQuickTradeQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs"
                />
              </div>

              <div className="bg-secondary/60 rounded-lg p-3 text-[10px] text-muted-foreground space-y-1 border border-border/40">
                <div className="flex justify-between">
                  <span>Ticker Current Price:</span>
                  <span className="font-bold text-foreground">${getStockQuote(quickTradeSymbol).price}</span>
                </div>
                <div className="flex justify-between border-t border-border/20 pt-1 mt-1">
                  <span className="font-bold">Estimated Outlay:</span>
                  <span className="font-bold text-foreground text-xs">
                    ${(quickTradeQty * getStockQuote(quickTradeSymbol).price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickTradeSymbol(null)}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg text-white transition-colors cursor-pointer shadow-md",
                    quickTradeType === 'BUY' ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
                  )}
                >
                  Transmit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}
