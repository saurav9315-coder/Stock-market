'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Globe2, 
  Plus, 
  Edit3, 
  Trash, 
  Search, 
  Calendar, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Flame,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { ExchangeConfig, AdminStock } from '@/lib/adminMock';

interface MarketsStocksViewProps {
  exchanges: ExchangeConfig[];
  setExchanges: (exch: ExchangeConfig[]) => void;
  stocks: AdminStock[];
  setStocks: (stk: AdminStock[]) => void;
  logAction: (action: string) => void;
  permissions: Record<string, boolean>;
}

export default function MarketsStocksView({
  exchanges,
  setExchanges,
  stocks,
  setStocks,
  logAction,
  permissions
}: MarketsStocksViewProps) {
  const [activeTab, setActiveTab] = useState<'markets' | 'stocks'>('markets');
  const [searchStock, setSearchStock] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Modals state
  const [stockModalType, setStockModalType] = useState<'add' | 'edit' | null>(null);
  const [activeStock, setActiveStock] = useState<AdminStock | null>(null);
  
  // Stock Form State
  const [stockForm, setStockForm] = useState({
    symbol: '',
    name: '',
    exchange: 'NASDAQ',
    price: 0,
    change: 0,
    category: 'None' as 'Featured' | 'Trending' | 'None',
    sector: 'Technology'
  });

  const canModifyMarkets = permissions.markets;
  const canModifyStocks = permissions.stocks;

  // ------------------------------------------
  // EXCHANGE ACTIONS
  // ------------------------------------------
  const toggleExchangeStatus = (code: string, currentStatus: 'Open' | 'Closed' | 'Halted') => {
    if (!canModifyMarkets) return toast.error('Access Denied: Support and Finance roles cannot manage exchanges.');
    
    const statuses: ('Open' | 'Closed' | 'Halted')[] = ['Open', 'Closed', 'Halted'];
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    const updated = exchanges.map(ex => {
      if (ex.code === code) return { ...ex, status: nextStatus };
      return ex;
    });
    setExchanges(updated);
    logAction(`Toggled Exchange ${code} state status from ${currentStatus} to ${nextStatus}`);
    toast.success(`Exchange ${code} status is now ${nextStatus}`);
  };

  // ------------------------------------------
  // STOCK ACTIONS
  // ------------------------------------------
  const filteredStocks = stocks.filter(stk => {
    const matchesSearch = 
      stk.symbol.toLowerCase().includes(searchStock.toLowerCase()) ||
      stk.name.toLowerCase().includes(searchStock.toLowerCase()) ||
      stk.sector.toLowerCase().includes(searchStock.toLowerCase());
    
    const matchesCategory = filterCategory === 'All' || stk.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const openAddStock = () => {
    if (!canModifyStocks) return toast.error('Access Denied: Support and Finance roles cannot modify stocks.');
    setStockModalType('add');
    setStockForm({
      symbol: '',
      name: '',
      exchange: 'NASDAQ',
      price: 100.0,
      change: 0.0,
      category: 'None',
      sector: 'Technology'
    });
  };

  const openEditStock = (stk: AdminStock) => {
    if (!canModifyStocks) return toast.error('Access Denied: Stock modification blocked.');
    setStockModalType('edit');
    setActiveStock(stk);
    setStockForm({
      symbol: stk.symbol,
      name: stk.name,
      exchange: stk.exchange,
      price: stk.price,
      change: stk.change,
      category: stk.category,
      sector: stk.sector
    });
  };

  const handleDeleteStock = (id: string, name: string) => {
    if (!canModifyStocks) return toast.error('Access Denied');
    if (confirm(`Remove stock ticker ${name} from active directories?`)) {
      const updated = stocks.filter(s => s.id !== id);
      setStocks(updated);
      logAction(`Removed stock ticker: ${name} (${id})`);
      toast.success('Stock ticker deleted');
    }
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyStocks) return;

    if (stockModalType === 'add') {
      const newStock: AdminStock = {
        id: `stk-${Math.floor(100 + Math.random() * 900)}`,
        symbol: stockForm.symbol.toUpperCase(),
        name: stockForm.name,
        exchange: stockForm.exchange,
        price: Number(stockForm.price),
        change: Number(stockForm.change),
        category: stockForm.category,
        sector: stockForm.sector
      };
      setStocks([newStock, ...stocks]);
      logAction(`Added new stock ticker: ${newStock.symbol} (${newStock.name})`);
      toast.success(`Successfully listed ${newStock.symbol}`);
    } else if (stockModalType === 'edit' && activeStock) {
      const updated = stocks.map(s => {
        if (s.id === activeStock.id) {
          return {
            ...s,
            symbol: stockForm.symbol.toUpperCase(),
            name: stockForm.name,
            exchange: stockForm.exchange,
            price: Number(stockForm.price),
            change: Number(stockForm.change),
            category: stockForm.category,
            sector: stockForm.sector
          };
        }
        return s;
      });
      setStocks(updated);
      logAction(`Edited stock parameters for: ${stockForm.symbol}`);
      toast.success(`Successfully modified ${stockForm.symbol} parameters`);
    }

    setStockModalType(null);
    setActiveStock(null);
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs selectors */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('markets')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'markets' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe2 className="w-4 h-4" /> Markets & Exchanges
        </button>
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === 'stocks' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Building2 className="w-4 h-4" /> Stocks Registry
        </button>
      </div>

      {/* MARKETS & EXCHANGES CONFIG */}
      {activeTab === 'markets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {exchanges.map(ex => (
            <Card key={ex.code} className="bg-panel border-border/80 relative overflow-hidden group">
              {/* Status color band */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                ex.status === 'Open' ? 'bg-bullish' : ex.status === 'Halted' ? 'bg-destructive' : 'bg-muted-foreground'
              }`} />
              
              <CardHeader className="pb-2 p-5 flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    {ex.code} - {ex.name}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1 flex items-center gap-1.5 text-muted-foreground font-mono">
                    <Clock className="w-3.5 h-3.5" /> Hours: {ex.tradingHours} ({ex.timeZone})
                  </CardDescription>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={ex.status === 'Open' ? 'default' : ex.status === 'Halted' ? 'destructive' : 'secondary'}
                    className="text-[9px] py-0 font-bold uppercase tracking-wider font-mono cursor-pointer hover:opacity-85"
                    onClick={() => toggleExchangeStatus(ex.code, ex.status)}
                    title="Click to toggle status clearance"
                  >
                    {ex.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-0 space-y-3">
                <div className="border-t border-border/60 pt-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Exchange Calendar Holidays (2026)</span>
                  {ex.holidays.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">No holidays configured for crypto ledger.</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {ex.holidays.map((h, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 text-[10px] rounded font-mono text-muted-foreground border border-border">
                          <Calendar className="w-3 h-3 text-primary" /> {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Simulated Quick Action button */}
                <div className="flex justify-end pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => toggleExchangeStatus(ex.code, ex.status)}
                    className="text-[10px] gap-1 cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground bg-card"
                  >
                    Rotates status switch
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* STOCKS REGISTRY MANAGER */}
      {activeTab === 'stocks' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel border border-border/80 rounded-xl p-4">
            {/* Search and filter */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input 
                  placeholder="Search ticker, name, sector..." 
                  value={searchStock}
                  onChange={e => setSearchStock(e.target.value)}
                  className="pl-9 bg-card text-xs"
                />
              </div>

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-card border border-border rounded px-2.5 py-1.5 text-xs text-foreground outline-none cursor-pointer"
              >
                <option value="All">All Classifications</option>
                <option value="Featured">Featured Tickers</option>
                <option value="Trending">Trending Tickers</option>
                <option value="None">Standard Tickers</option>
              </select>
            </div>

            {/* List button */}
            <Button size="sm" onClick={openAddStock} className="gap-1.5 cursor-pointer font-bold shrink-0 text-xs">
              <Plus className="w-4 h-4" /> Add Stock Ticker
            </Button>
          </div>

          {/* Stocks Datagrid */}
          <Card className="bg-panel border-border/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/40 border-b border-border">
                  <tr>
                    <th className="p-3 font-semibold text-muted-foreground">Ticker Symbol</th>
                    <th className="p-3 font-semibold text-muted-foreground">Company Name</th>
                    <th className="p-3 font-semibold text-muted-foreground">Exchange</th>
                    <th className="p-3 font-semibold text-muted-foreground">Sector Category</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">Last Price ($)</th>
                    <th className="p-3 font-semibold text-muted-foreground text-right">Intraday Change (%)</th>
                    <th className="p-3 font-semibold text-muted-foreground text-center">Tags / Badges</th>
                    <th className="p-3 font-semibold text-muted-foreground text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStocks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground italic">
                        No stocks registered inside search parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredStocks.map(stk => (
                      <tr key={stk.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-mono font-bold text-foreground">{stk.symbol}</td>
                        <td className="p-3 font-semibold text-foreground">{stk.name}</td>
                        <td className="p-3 font-mono text-muted-foreground">{stk.exchange}</td>
                        <td className="p-3 text-muted-foreground">{stk.sector}</td>
                        <td className="p-3 text-right font-mono font-semibold text-foreground">
                          ${stk.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center gap-0.5 font-mono font-semibold ${
                            stk.change >= 0 ? 'text-bullish' : 'text-bearish'
                          }`}>
                            {stk.change >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                            {stk.change.toFixed(2)}%
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {stk.category === 'Featured' && (
                            <Badge className="bg-primary/25 border-primary/40 text-primary gap-1 text-[9px] py-0 font-bold font-mono">
                              <Sparkles className="w-2.5 h-2.5" /> FEATURED
                            </Badge>
                          )}
                          {stk.category === 'Trending' && (
                            <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-500 gap-1 text-[9px] py-0 font-bold font-mono">
                              <Flame className="w-2.5 h-2.5" /> TRENDING
                            </Badge>
                          )}
                          {stk.category === 'None' && (
                            <span className="text-[10px] text-muted-foreground italic font-mono">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => openEditStock(stk)}
                              title="Modify Stock parameters"
                              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDeleteStock(stk.id, stk.symbol)}
                              title="Delete Ticker"
                              className="p-1.5 rounded hover:bg-muted text-bearish cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ADD/EDIT STOCK FORM MODAL */}
      {stockModalType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleStockSubmit}
            className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md relative overflow-hidden animate-in zoom-in-95 duration-200"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                {stockModalType === 'add' ? 'Register New Stock Ticker' : 'Edit Stock parameters'}
              </h3>
              <button 
                type="button" 
                onClick={() => { setStockModalType(null); setActiveStock(null); }}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Ticker Symbol</label>
                  <Input 
                    value={stockForm.symbol}
                    onChange={e => setStockForm({ ...stockForm, symbol: e.target.value })}
                    placeholder="e.g. AMZN"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Asset Sector</label>
                  <Input 
                    value={stockForm.sector}
                    onChange={e => setStockForm({ ...stockForm, sector: e.target.value })}
                    placeholder="e.g. Energy"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-muted-foreground font-semibold">Corporate Name</label>
                <Input 
                  value={stockForm.name}
                  onChange={e => setStockForm({ ...stockForm, name: e.target.value })}
                  placeholder="e.g. Amazon.com Inc."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Target Exchange</label>
                  <select 
                    value={stockForm.exchange}
                    onChange={e => setStockForm({ ...stockForm, exchange: e.target.value })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    {exchanges.map(ex => (
                      <option key={ex.code} value={ex.code}>{ex.code}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold block">Market Tag Status</label>
                  <select 
                    value={stockForm.category}
                    onChange={e => setStockForm({ ...stockForm, category: e.target.value as any })}
                    className="w-full bg-card border border-border rounded px-2.5 py-2 text-foreground outline-none mt-1"
                  >
                    <option value="None">None (Standard)</option>
                    <option value="Featured">Featured</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">Price ($)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={stockForm.price}
                    onChange={e => setStockForm({ ...stockForm, price: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-muted-foreground font-semibold">24h Change (%)</label>
                  <Input 
                    type="number" 
                    step="0.01"
                    value={stockForm.change}
                    onChange={e => setStockForm({ ...stockForm, change: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
              <Button type="button" variant="ghost" onClick={() => { setStockModalType(null); setActiveStock(null); }} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" className="cursor-pointer">
                Confirm Ticker Listing
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
