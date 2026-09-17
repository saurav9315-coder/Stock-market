'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Trash2, 
  ShoppingCart, 
  RotateCw 
} from 'lucide-react';
import { toast } from 'sonner';
import { getPortfolioHoldings, executeTrade, StockQuote } from '@/lib/stockMock';
import { loadWalletState, saveWalletState, WalletState } from '@/lib/walletMock';

interface LiveWatchListPortfolioProps {
  quotes: StockQuote[];
  priceFlash: Record<string, 'up' | 'down' | null>;
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  connectionStatus: string;
}

export default function LiveWatchListPortfolio({
  quotes,
  priceFlash,
  selectedSymbol,
  onSelectSymbol,
  connectionStatus
}: LiveWatchListPortfolioProps) {
  // Local Watchlist list
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>(['AAPL', 'MSFT', 'NVDA', 'TSLA', 'BTC-USD']);
  const [newSymbolInput, setNewSymbolInput] = useState('');

  // Portfolio states
  const [holdings, setHoldings] = useState(getPortfolioHoldings());
  const [wallet, setWallet] = useState<WalletState>(loadWalletState());

  const refreshHoldingsAndWallet = () => {
    setHoldings(getPortfolioHoldings());
    setWallet(loadWalletState());
  };

  // Keep holdings synced with dynamic mock ticks
  const liveHoldings = useMemo(() => {
    return holdings.map((h) => {
      const liveQuote = quotes.find((q) => q.symbol === h.symbol);
      return {
        ...h,
        currentPrice: liveQuote ? liveQuote.price : h.currentPrice,
        change: liveQuote ? liveQuote.change : 0,
        changePercent: liveQuote ? liveQuote.changePercent : 0
      };
    });
  }, [holdings, quotes]);

  // Compute live portfolio metrics
  const portfolioMetrics = useMemo(() => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    let totalDailyReturn = 0;

    liveHoldings.forEach((h) => {
      totalInvested += h.quantity * h.avgBuyPrice;
      totalCurrentValue += h.quantity * h.currentPrice;
      totalDailyReturn += h.quantity * (h.currentPrice * (h.changePercent / 100));
    });

    const unrealizedPL = totalCurrentValue - totalInvested;
    const totalReturnPercent = totalInvested > 0 ? (unrealizedPL / totalInvested) * 100 : 0;
    const dailyReturnPercent = totalCurrentValue > 0 ? (totalDailyReturn / totalCurrentValue) * 100 : 0;

    return {
      currentValue: totalCurrentValue + wallet.availableCash,
      invested: totalInvested,
      unrealizedPL,
      realizedPL: 4250.00, // baseline mock realized gains
      dailyReturn: totalDailyReturn,
      dailyReturnPercent,
      totalReturnPercent
    };
  }, [liveHoldings, wallet.availableCash]);

  // Watchlist Actions
  const handleAddToWatchlist = (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newSymbolInput.trim().toUpperCase();
    if (!sym) return;

    const exists = quotes.some(q => q.symbol === sym);
    if (!exists) {
      return toast.error(`Ticker symbol ${sym} not found in exchange registries.`);
    }

    if (watchlistSymbols.includes(sym)) {
      return toast.info(`${sym} is already present in your watchlist.`);
    }

    setWatchlistSymbols(prev => [...prev, sym]);
    setNewSymbolInput('');
    toast.success(`Added ${sym} to live watch monitoring.`);
  };

  const handleRemoveFromWatchlist = (sym: string) => {
    setWatchlistSymbols(prev => prev.filter(s => s !== sym));
    toast.info(`Removed ${sym} from watchlist.`);
  };

  // Quick Trade Placement
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQty, setTradeQty] = useState<string>('5');
  
  const targetQuote = useMemo(() => {
    return quotes.find(q => q.symbol === selectedSymbol);
  }, [quotes, selectedSymbol]);

  const handlePlaceOrder = () => {
    const qty = Number(tradeQty);
    if (isNaN(qty) || qty <= 0) return toast.error('Enter a valid order size.');

    if (!targetQuote) return;

    const totalCost = qty * targetQuote.price;
    
    if (tradeType === 'BUY') {
      if (totalCost > wallet.availableCash) {
        return toast.error(`Insufficient cash balance. Required: $${totalCost.toLocaleString()}, Available: $${wallet.availableCash.toLocaleString()}`);
      }
      
      const success = executeTrade(selectedSymbol, qty, 'BUY');
      if (success) {
        // deduct cash
        const nextWallet = {
          ...wallet,
          availableCash: wallet.availableCash - totalCost,
          investedAmount: wallet.investedAmount + totalCost
        };
        saveWalletState(nextWallet);
        refreshHoldingsAndWallet();
        toast.success(`ORDER FILLED: Purchased ${qty} shares of ${selectedSymbol} at $${targetQuote.price.toFixed(2)}`);
      }
    } else {
      // SELL
      const holding = holdings.find(h => h.symbol === selectedSymbol);
      if (!holding || holding.quantity < qty) {
        return toast.error(`Insufficient holdings of ${selectedSymbol} to execute sell order.`);
      }

      const success = executeTrade(selectedSymbol, qty, 'SELL');
      if (success) {
        // add cash
        const nextWallet = {
          ...wallet,
          availableCash: wallet.availableCash + totalCost,
          investedAmount: Math.max(0, wallet.investedAmount - totalCost)
        };
        saveWalletState(nextWallet);
        refreshHoldingsAndWallet();
        toast.success(`ORDER FILLED: Sold ${qty} shares of ${selectedSymbol} at $${targetQuote.price.toFixed(2)}`);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* 1. Live Watchlist */}
      <Card className="bg-panel border-border/80 xl:col-span-2 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2 p-4 sm:p-5 flex flex-row items-center justify-between border-b border-border/40">
            <div>
              <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
                👁️ Live Watchlist Monitoring
              </CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">Real-time quotes flashing ticker feeds</p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-mono">
              <span className={`w-2 h-2 rounded-full ${connectionStatus === 'Connected' ? 'bg-bullish' : 'bg-bearish'} animate-pulse`} />
              <span className="text-muted-foreground">{connectionStatus === 'Connected' ? 'Auto-Refreshing' : 'Disconnected'}</span>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px]">
            {/* Search addition */}
            <form onSubmit={handleAddToWatchlist} className="flex gap-2 mb-3.5">
              <Input
                type="text"
                placeholder="Add Symbol (e.g. AMZN, NVDA)..."
                value={newSymbolInput}
                onChange={e => setNewSymbolInput(e.target.value)}
                className="bg-card h-8 text-[10px]"
              />
              <Button type="submit" size="sm" className="h-8 cursor-pointer text-[10px] font-bold">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add
              </Button>
            </form>

            {/* Watchlist table */}
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              <div className="grid grid-cols-5 text-muted-foreground font-semibold pb-1.5 border-b border-border/20 uppercase tracking-wider text-[9px]">
                <span className="col-span-2">Symbol</span>
                <span className="text-right">Price</span>
                <span className="text-right">Change %</span>
                <span className="text-right">Actions</span>
              </div>

              {watchlistSymbols.map((symbol) => {
                const quote = quotes.find(q => q.symbol === symbol);
                const flash = priceFlash[symbol];
                const isSelected = selectedSymbol === symbol;

                if (!quote) return null;

                const isUp = quote.changePercent >= 0;

                return (
                  <div 
                    key={symbol}
                    onClick={() => onSelectSymbol(symbol)}
                    className={`grid grid-cols-5 py-2 px-1 rounded border border-transparent items-center cursor-pointer transition-all duration-300 hover:bg-card/40 ${
                      isSelected ? 'bg-primary/5 border-primary/20' : ''
                    } ${
                      flash === 'up' ? 'bg-bullish/10 border-bullish/25 text-bullish' :
                      flash === 'down' ? 'bg-bearish/10 border-bearish/25 text-bearish' : ''
                    }`}
                  >
                    {/* Symbol / Name */}
                    <div className="col-span-2">
                      <span className="font-extrabold text-foreground block">{quote.symbol}</span>
                      <span className="text-[9px] text-muted-foreground font-sans block truncate max-w-[120px]">{quote.name}</span>
                    </div>

                    {/* Price */}
                    <span className="text-right font-extrabold text-foreground">
                      ${quote.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>

                    {/* Change */}
                    <span className={`text-right font-bold ${isUp ? 'text-bullish' : 'text-bearish'}`}>
                      {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
                    </span>

                    {/* Actions */}
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist(symbol);
                        }}
                        className="text-muted-foreground hover:text-bearish h-6 w-6 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>
      </Card>

      {/* 2. Live Portfolio Statistics HUD & Quick Trade */}
      <Card className="bg-panel border-border/80 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-2 p-4 sm:p-5 border-b border-border/40 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-extrabold font-sans flex items-center gap-1.5">
                💼 Live Portfolio HUD
              </CardTitle>
              <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">NAV metrics & order placements</p>
            </div>
            <button 
              onClick={refreshHoldingsAndWallet}
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground rounded cursor-pointer transition-all"
              title="Refresh ledger values"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </CardHeader>

          <CardContent className="p-4 sm:p-5 pt-3 font-mono text-[10px] space-y-3.5">
            {/* Quick Metrics HUD */}
            <div className="grid grid-cols-2 gap-3.5 border-b border-border/20 pb-3">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Net Asset Value (NAV)</span>
                <span className="text-sm font-extrabold text-foreground block mt-0.5">
                  ${portfolioMetrics.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Unrealized profit</span>
                <span className={`text-sm font-extrabold block mt-0.5 ${portfolioMetrics.unrealizedPL >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  ${portfolioMetrics.unrealizedPL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Available Cash</span>
                <span className="text-[11px] font-bold text-foreground block mt-0.5">
                  ${wallet.availableCash.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Total Return</span>
                <span className={`text-[11px] font-bold block mt-0.5 ${portfolioMetrics.totalReturnPercent >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {portfolioMetrics.totalReturnPercent >= 0 ? '+' : ''}{portfolioMetrics.totalReturnPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Quick Trade Form */}
            <div className="space-y-2">
              <span className="text-muted-foreground font-semibold block text-[9px] uppercase tracking-wider">Quick Trade Panel ({selectedSymbol})</span>
              
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-1 bg-card border border-border/60 rounded-lg p-0.5">
                <button
                  onClick={() => setTradeType('BUY')}
                  className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-all ${
                    tradeType === 'BUY' ? 'bg-bullish text-white' : 'text-muted-foreground'
                  }`}
                >
                  Buy Shares
                </button>
                <button
                  onClick={() => setTradeType('SELL')}
                  className={`py-1 rounded text-[9px] font-bold cursor-pointer transition-all ${
                    tradeType === 'SELL' ? 'bg-bearish text-white' : 'text-muted-foreground'
                  }`}
                >
                  Sell Shares
                </button>
              </div>

              {/* Price / Input size */}
              <div className="flex gap-2">
                <div className="flex-1 bg-card border border-border rounded-lg px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-muted-foreground text-[9px]">Market:</span>
                  <span className="font-bold text-foreground">${targetQuote?.price.toFixed(2) || '0.00'}</span>
                </div>
                <Input
                  type="number"
                  placeholder="Qty"
                  value={tradeQty}
                  onChange={e => setTradeQty(e.target.value)}
                  className="w-16 bg-card h-8 text-center text-[10px]"
                />
              </div>

              {/* Place execution */}
              <Button 
                onClick={handlePlaceOrder}
                className={`w-full text-[10px] font-bold h-8 text-white ${
                  tradeType === 'BUY' ? 'bg-bullish hover:bg-bullish/90' : 'bg-bearish hover:bg-bearish/90'
                } cursor-pointer`}
              >
                <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Execute {tradeType} Order
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
