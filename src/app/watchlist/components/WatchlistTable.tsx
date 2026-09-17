'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown, 
  MoreVertical, 
  Eye, 
  EyeOff,
  Briefcase,
  Scale,
  Trash2,
  Settings,
  DollarSign,
  AlertOctagon,
  Share2,
  ChevronRight,
  TrendingUp as IconGainer,
  SlidersHorizontal,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStockQuote, StockQuote } from '@/lib/stockMock';

interface StockListItem extends StockQuote {
  watchStatus?: boolean;
}

interface WatchlistTableProps {
  isLoading?: boolean;
  quotes: StockListItem[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRemove: (symbol: string) => void;
  onAddToPortfolio: (symbol: string) => void;
  onCompareToggle: (symbol: string) => void;
  comparisonSymbols: string[];
  onSetAlert: (symbol: string) => void;
  onShareStock: (symbol: string) => void;
  
  // Sector/Industry details for filtering
  sectorFilter: string;
  industryFilter: string;
  capFilter: string;
  priceFilter: string;
  ratingFilter: string;
  changeFilter: string;
  volumeFilter: string;
}

type SortField = 'symbol' | 'price' | 'change' | 'volume' | 'cap' | 'rating';
type SortOrder = 'asc' | 'desc';

export default function WatchlistTable({
  isLoading = false,
  quotes,
  searchTerm,
  setSearchTerm,
  onRemove,
  onAddToPortfolio,
  onCompareToggle,
  comparisonSymbols,
  onSetAlert,
  onShareStock,
  
  sectorFilter,
  industryFilter,
  capFilter,
  priceFilter,
  ratingFilter,
  changeFilter,
  volumeFilter
}: WatchlistTableProps) {
  // Sort state
  interface SortCriterion {
    field: SortField;
    order: SortOrder;
  }
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([
    { field: 'symbol', order: 'asc' }
  ]);
  
  // Page state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Quick Action Menu active row symbol
  const [activeMenuSymbol, setActiveMenuSymbol] = useState<string | null>(null);

  // Column visibility states
  const [visibleColumns, setVisibleColumns] = useState({
    logo: true,
    name: true,
    symbol: true,
    price: true,
    change: true,
    volume: true,
    cap: true,
    sector: true,
    rating: true,
    watch: true
  });

  const [showVisibilityDropdown, setShowVisibilityDropdown] = useState(false);

  // Column width resize state (in pixels)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    logo: 60,
    name: 180,
    symbol: 80,
    price: 100,
    change: 110,
    volume: 110,
    cap: 120,
    sector: 120,
    rating: 120,
    watch: 80,
    actions: 60
  });

  // Track resizing mouse listeners
  const resizeRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  const startResize = (col: string, e: React.MouseEvent) => {
    e.preventDefault();
    resizeRef.current = {
      col,
      startX: e.clientX,
      startWidth: columnWidths[col]
    };
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizeRef.current) return;
    const { col, startX, startWidth } = resizeRef.current;
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(40, startWidth + deltaX);
    setColumnWidths((prev) => ({
      ...prev,
      [col]: newWidth
    }));
  };

  const handleResizeEnd = () => {
    resizeRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleSort = (field: SortField, event?: React.MouseEvent) => {
    const isShiftKey = event?.shiftKey || false;

    setSortCriteria((prev) => {
      const idx = prev.findIndex((c) => c.field === field);

      if (isShiftKey) {
        if (idx === -1) {
          return [...prev, { field, order: 'asc' }];
        } else {
          const current = prev[idx];
          if (current.order === 'asc') {
            const next = [...prev];
            next[idx] = { ...current, order: 'desc' };
            return next;
          } else {
            return prev.filter((c) => c.field !== field);
          }
        }
      } else {
        if (idx === 0 && prev.length === 1) {
          return [{ field, order: prev[0].order === 'asc' ? 'desc' : 'asc' }];
        } else {
          return [{ field, order: 'asc' }];
        }
      }
    });
  };

  const getAnalystScore = (symbol: string) => {
    const q = getStockQuote(symbol);
    const recommendation = q.recommendations;
    if (!recommendation) return 50; // default
    const total = recommendation.buy + recommendation.hold + recommendation.sell;
    if (total === 0) return 50;
    return Math.round(((recommendation.buy * 100) + (recommendation.hold * 50)) / total);
  };

  const getAnalystLabel = (symbol: string) => {
    const score = getAnalystScore(symbol);
    if (score >= 70) return 'Buy';
    if (score >= 40) return 'Hold';
    return 'Sell';
  };

  // Live filter & search calculation
  const filteredQuotes = useMemo(() => {
    return quotes
      .filter((q) => {
        const matchesSearch = 
          q.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSector = sectorFilter === 'ALL' || q.sector === sectorFilter;
        const matchesIndustry = industryFilter === 'ALL' || q.industry === industryFilter;
        
        let matchesCap = true;
        if (capFilter === 'MEGA') matchesCap = q.marketCap >= 200e9;
        if (capFilter === 'LARGE') matchesCap = q.marketCap >= 10e9 && q.marketCap < 200e9;
        if (capFilter === 'MID') matchesCap = q.marketCap < 10e9;

        let matchesPrice = true;
        if (priceFilter === 'UNDER100') matchesPrice = q.price < 100;
        if (priceFilter === '100TO500') matchesPrice = q.price >= 100 && q.price <= 500;
        if (priceFilter === 'ABOVE500') matchesPrice = q.price > 500;

        let matchesRating = true;
        const label = getAnalystLabel(q.symbol);
        if (ratingFilter === 'BUY') matchesRating = label === 'Buy';
        if (ratingFilter === 'HOLD') matchesRating = label === 'Hold';
        if (ratingFilter === 'SELL') matchesRating = label === 'Sell';

        let matchesChange = true;
        if (changeFilter === 'GAINERS') matchesChange = q.changePercent >= 0;
        if (changeFilter === 'LOSERS') matchesChange = q.changePercent < 0;

        let matchesVolume = true;
        if (volumeFilter === 'HIGH') matchesVolume = q.volume >= 20000000;
        if (volumeFilter === 'MODERATE') matchesVolume = q.volume < 20000000;

        return matchesSearch && matchesSector && matchesIndustry && matchesCap && matchesPrice && matchesRating && matchesChange && matchesVolume;
      })
      .sort((a, b) => {
        for (const crit of sortCriteria) {
          let aVal: any = 0;
          let bVal: any = 0;

          if (crit.field === 'symbol') {
            const cmp = a.symbol.localeCompare(b.symbol);
            if (cmp !== 0) {
              return crit.order === 'asc' ? cmp : -cmp;
            }
          } else {
            if (crit.field === 'price') {
              aVal = a.price;
              bVal = b.price;
            } else if (crit.field === 'change') {
              aVal = a.changePercent;
              bVal = b.changePercent;
            } else if (crit.field === 'volume') {
              aVal = a.volume;
              bVal = b.volume;
            } else if (crit.field === 'cap') {
              aVal = a.marketCap;
              bVal = b.marketCap;
            } else if (crit.field === 'rating') {
              aVal = getAnalystScore(a.symbol);
              bVal = getAnalystScore(b.symbol);
            }

            if (aVal !== bVal) {
              return crit.order === 'asc' ? aVal - bVal : bVal - aVal;
            }
          }
        }
        return 0;
      });
  }, [quotes, searchTerm, sectorFilter, industryFilter, capFilter, priceFilter, ratingFilter, changeFilter, volumeFilter, sortCriteria]);

  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuotes, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / itemsPerPage));

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sectorFilter, industryFilter, capFilter, priceFilter, ratingFilter, changeFilter, volumeFilter]);

  const renderSortIndicator = (field: SortField) => {
    const idx = sortCriteria.findIndex((c) => c.field === field);
    if (idx === -1) return <ArrowUpDown className="w-3 h-3 text-muted-foreground ml-1 shrink-0" />;
    const crit = sortCriteria[idx];

    return (
      <div className="flex items-center gap-0.5 ml-1 shrink-0">
        {crit.order === 'asc' ? (
          <TrendingUp className="w-3 h-3 text-[#F4511E]" />
        ) : (
          <TrendingDown className="w-3 h-3 text-rose-500" />
        )}
        {sortCriteria.length > 1 && (
          <span className="text-[8px] bg-secondary border border-border px-1 py-0.5 rounded font-black text-muted-foreground leading-none">
            {idx + 1}
          </span>
        )}
      </div>
    );
  };

  const getAnalystRatingBadge = (symbol: string) => {
    const label = getAnalystLabel(symbol);
    const score = getAnalystScore(symbol);
    return (
      <div className="flex flex-col items-start gap-1 font-sans">
        <span className={cn(
          "text-[9px] font-extrabold px-1.5 py-0.5 rounded",
          label === 'Buy' ? "bg-[#F4511E]/10 text-[#F4511E]" : label === 'Hold' ? "bg-amber-500/10 text-amber-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {label} ({score}%)
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[380px]">
        <div className="p-5 flex items-center justify-between border-b border-border/40">
          <div className="h-4 w-40 bg-muted rounded" />
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="h-3 w-28 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-visible relative">
      {/* Table Header controls */}
      <div className="border-b border-border/40 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        
        {/* Search Stock bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search watchlist stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary/80 border border-border rounded-lg text-foreground focus:outline-none focus:border-primary font-mono"
          />
        </div>

        {/* Column visibility dropdown trigger */}
        <div className="relative self-end md:self-auto">
          <button
            onClick={() => setShowVisibilityDropdown(!showVisibilityDropdown)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-muted transition-colors border border-border cursor-pointer font-mono"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Columns</span>
          </button>
          
          {showVisibilityDropdown && (
            <div className="absolute right-0 mt-2 w-44 bg-popover border border-border rounded-lg shadow-2xl z-40 p-3.5 font-mono text-[10px] space-y-1.5 text-foreground">
              <span className="font-bold text-muted-foreground block border-b border-border/40 pb-1 mb-2">Visible columns</span>
              {Object.keys(visibleColumns).map((col) => (
                <label key={col} className="flex items-center gap-2 cursor-pointer capitalize">
                  <input
                    type="checkbox"
                    checked={visibleColumns[col as keyof typeof visibleColumns]}
                    onChange={(e) => setVisibleColumns(prev => ({
                      ...prev,
                      [col]: e.target.checked
                    }))}
                    className="rounded accent-primary cursor-pointer h-3.5 w-3.5"
                  />
                  <span>{col}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Table Area */}
      <div className="overflow-x-auto">
        <table className="relative min-w-max w-full table-fixed text-left font-mono text-xs border-collapse">
          <thead className="sticky top-0 bg-panel z-15 border-b border-border/40">
            <tr className="hover:bg-transparent">
              
              {/* Logo Column */}
              {visibleColumns.logo && (
                <th style={{ width: columnWidths.logo }} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none">
                  Logo
                  <div onMouseDown={(e) => startResize('logo', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Company Name Column */}
              {visibleColumns.name && (
                <th style={{ width: columnWidths.name }} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none">
                  Company
                  <div onMouseDown={(e) => startResize('name', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Symbol Column */}
              {visibleColumns.symbol && (
                <th style={{ width: columnWidths.symbol }} onClick={(e) => handleSort('symbol', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground">
                  <div className="flex items-center">Symbol {renderSortIndicator('symbol')}</div>
                  <div onMouseDown={(e) => startResize('symbol', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Price Column */}
              {visibleColumns.price && (
                <th style={{ width: columnWidths.price }} onClick={(e) => handleSort('price', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground text-right">
                  <div className="flex items-center justify-end">Price {renderSortIndicator('price')}</div>
                  <div onMouseDown={(e) => startResize('price', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Change Column */}
              {visibleColumns.change && (
                <th style={{ width: columnWidths.change }} onClick={(e) => handleSort('change', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground text-right">
                  <div className="flex items-center justify-end">Change {renderSortIndicator('change')}</div>
                  <div onMouseDown={(e) => startResize('change', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Volume Column */}
              {visibleColumns.volume && (
                <th style={{ width: columnWidths.volume }} onClick={(e) => handleSort('volume', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground text-right">
                  <div className="flex items-center justify-end">Volume {renderSortIndicator('volume')}</div>
                  <div onMouseDown={(e) => startResize('volume', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Market Cap Column */}
              {visibleColumns.cap && (
                <th style={{ width: columnWidths.cap }} onClick={(e) => handleSort('cap', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground text-right">
                  <div className="flex items-center justify-end">Mkt Cap {renderSortIndicator('cap')}</div>
                  <div onMouseDown={(e) => startResize('cap', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Sector Column */}
              {visibleColumns.sector && (
                <th style={{ width: columnWidths.sector }} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none">
                  Sector
                  <div onMouseDown={(e) => startResize('sector', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Rating Column */}
              {visibleColumns.rating && (
                <th style={{ width: columnWidths.rating }} onClick={(e) => handleSort('rating', e)} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none cursor-pointer hover:text-foreground">
                  <div className="flex items-center">Rating {renderSortIndicator('rating')}</div>
                  <div onMouseDown={(e) => startResize('rating', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Watch status Column */}
              {visibleColumns.watch && (
                <th style={{ width: columnWidths.watch }} className="relative py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none">
                  Watch
                  <div onMouseDown={(e) => startResize('watch', e)} className="absolute right-0 top-0 bottom-0 w-1 bg-border/40 hover:bg-primary cursor-col-resize z-20" />
                </th>
              )}

              {/* Actions Column */}
              <th style={{ width: columnWidths.actions }} className="py-3 px-3 text-[10px] uppercase font-bold text-muted-foreground select-none text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40">
            {paginatedQuotes.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center py-10 text-muted-foreground">
                  No watchlisted assets match filters.
                </td>
              </tr>
            ) : (
              paginatedQuotes.map((q) => {
                const isGainer = q.changePercent >= 0;
                const isCompared = comparisonSymbols.includes(q.symbol);
                const isWatching = true; // since it is on the active list

                return (
                  <tr key={q.symbol} className="hover:bg-secondary/40 border-border/40 transition-colors group">
                    
                    {/* Logo */}
                    {visibleColumns.logo && (
                      <td className="py-3 px-3">
                        <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-sans font-bold text-xs select-none">
                          {q.symbol.slice(0, 2)}
                        </div>
                      </td>
                    )}

                    {/* Company Name */}
                    {visibleColumns.name && (
                      <td className="py-3 px-3">
                        <div className="font-sans font-semibold text-foreground truncate max-w-[170px]">
                          {q.name}
                        </div>
                      </td>
                    )}

                    {/* Stock Symbol */}
                    {visibleColumns.symbol && (
                      <td className="py-3 px-3">
                        <Link href={`/stock/${q.symbol}`}>
                          <span className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer block">
                            {q.symbol}
                          </span>
                        </Link>
                      </td>
                    )}

                    {/* Current Price */}
                    {visibleColumns.price && (
                      <td className="py-3 px-3 text-right font-extrabold text-foreground">
                        ${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    )}

                    {/* Daily Change & Percent */}
                    {visibleColumns.change && (
                      <td className="py-3 px-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn("font-bold", isGainer ? "text-[#F4511E]" : "text-rose-500")}>
                            {isGainer ? '+' : ''}${q.change.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                          <span className={cn("text-[9px] font-bold px-1 rounded mt-0.5", isGainer ? "bg-[#F4511E]/10 text-[#F4511E]" : "bg-rose-500/10 text-rose-500")}>
                            {isGainer ? '+' : ''}{q.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Volume */}
                    {visibleColumns.volume && (
                      <td className="py-3 px-3 text-right text-foreground/80">
                        {q.volume.toLocaleString()}
                      </td>
                    )}

                    {/* Market Cap */}
                    {visibleColumns.cap && (
                      <td className="py-3 px-3 text-right text-foreground/80 font-bold">
                        ${(q.marketCap / 1e9).toFixed(1)}B
                      </td>
                    )}

                    {/* Sector */}
                    {visibleColumns.sector && (
                      <td className="py-3 px-3 text-muted-foreground font-semibold">
                        {q.sector || 'Technology'}
                      </td>
                    )}

                    {/* Analyst Rating */}
                    {visibleColumns.rating && (
                      <td className="py-3 px-3">
                        {getAnalystRatingBadge(q.symbol)}
                      </td>
                    )}

                    {/* Watch Status */}
                    {visibleColumns.watch && (
                      <td className="py-3 px-3">
                        <button
                          onClick={() => onRemove(q.symbol)}
                          title="Click to remove from watchlist"
                          className="text-primary hover:text-rose-500 transition-colors cursor-pointer"
                        >
                          {isWatching ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                        </button>
                      </td>
                    )}

                    {/* Actions Menu */}
                    <td className="py-3 px-3 text-center relative overflow-visible">
                      <button
                        onClick={() => setActiveMenuSymbol(activeMenuSymbol === q.symbol ? null : q.symbol)}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown menu overlay */}
                      {activeMenuSymbol === q.symbol && (
                        <>
                          {/* Close overlay backdrop */}
                          <div onClick={() => setActiveMenuSymbol(null)} className="fixed inset-0 z-30 bg-transparent" />
                          <div className="absolute right-6 top-1 mt-2 w-40 bg-popover border border-border rounded-lg shadow-2xl z-40 p-1 flex flex-col font-sans text-[11px] text-foreground">
                            
                            <Link href={`/stock/${q.symbol}`} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary rounded cursor-pointer text-left">
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /> View Details
                            </Link>

                            <button
                              onClick={() => {
                                onAddToPortfolio(q.symbol);
                                setActiveMenuSymbol(null);
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary rounded cursor-pointer text-left w-full"
                            >
                              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Add to Portfolio
                            </button>

                            <button
                              onClick={() => {
                                onCompareToggle(q.symbol);
                                setActiveMenuSymbol(null);
                              }}
                              className={cn(
                                "flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary rounded cursor-pointer text-left w-full",
                                isCompared && "text-primary font-bold"
                              )}
                            >
                              <Scale className="w-3.5 h-3.5 text-muted-foreground" /> {isCompared ? 'Remove Compare' : 'Add to Compare'}
                            </button>

                            <button
                              onClick={() => {
                                onSetAlert(q.symbol);
                                setActiveMenuSymbol(null);
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary rounded cursor-pointer text-left w-full"
                            >
                              <Bell className="w-3.5 h-3.5 text-muted-foreground" /> Set Alert
                            </button>

                            <button
                              onClick={() => {
                                onShareStock(q.symbol);
                                setActiveMenuSymbol(null);
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-secondary rounded cursor-pointer text-left w-full"
                            >
                              <Share2 className="w-3.5 h-3.5 text-muted-foreground" /> Share Asset
                            </button>

                            <div className="h-px bg-border/40 my-1" />

                            <button
                              onClick={() => {
                                onRemove(q.symbol);
                                setActiveMenuSymbol(null);
                              }}
                              className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-rose-500/10 text-rose-500 rounded cursor-pointer text-left w-full"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" /> Remove Watch
                            </button>

                          </div>
                        </>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Paginator */}
      <div className="flex items-center justify-between border-t border-border/40 p-4 font-mono text-xs select-none">
        <span className="text-muted-foreground">
          Showing {filteredQuotes.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredQuotes.length)} of {filteredQuotes.length} stocks
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
    </Card>
  );
}
