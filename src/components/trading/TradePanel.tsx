'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Zap, 
  ChevronDown, 
  ShieldCheck, 
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockQuote } from '@/lib/stockMock';
import { TradingMode } from './ModeSwitch';

interface TradePanelProps {
  mode: TradingMode;
  selectedAsset: StockQuote;
  availableAssets: StockQuote[];
  onSelectAsset: (quote: StockQuote) => void;
  demoBalance: number;
  liveBalance: number;
  onExecuteTrade: (params: {
    asset: StockQuote;
    type: 'BUY' | 'SELL';
    amount: number;
    orderType: 'MARKET' | 'LIMIT';
    leverage: number;
    stopLoss: number;
    takeProfit: number;
  }) => void;
  className?: string;
}

export default function TradePanel({
  mode,
  selectedAsset,
  availableAssets,
  onSelectAsset,
  demoBalance,
  liveBalance,
  onExecuteTrade,
  className,
}: TradePanelProps) {
  const isDemo = mode === 'demo';
  const activeBalance = isDemo ? demoBalance : liveBalance;

  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [amount, setAmount] = useState<number>(500);
  const [leverage, setLeverage] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<number>(5);
  const [takeProfit, setTakeProfit] = useState<number>(15);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

  const presets = [100, 500, 1000, 2500, 5000];

  const handlePercentageSelect = (pct: number) => {
    const calculated = Math.floor((activeBalance * (pct / 100)) * 100) / 100;
    setAmount(Math.max(10, calculated));
  };

  const handleTradeSubmit = () => {
    onExecuteTrade({
      asset: selectedAsset,
      type: activeTab,
      amount,
      orderType,
      leverage,
      stopLoss,
      takeProfit,
    });
  };

  const sharesCalculated = (amount * leverage) / (selectedAsset.price || 1);

  return (
    <div className={cn("flex flex-col h-full bg-[#050608] rounded-[22px] border border-[#1E293B] hover:border-[#D84315]/40 transition-colors p-4.5 shadow-2xl font-mono select-none space-y-4", className)}>
      
      {/* Header & Balance Banner */}
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5722] shadow-[0_0_8px_#FF5722] animate-pulse" />
          <h3 className="font-extrabold text-xs text-[#F8FAFC] tracking-wider uppercase font-stylish">ORDER EXECUTION PANEL</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] bg-[#040406] px-2.5 py-1 rounded-lg border border-[#1E293B]">
          <Wallet className="w-3.5 h-3.5 text-[#FF7043]" />
          <span className="font-bold text-[#F8FAFC]">${activeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Buy / Sell Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0F14] rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setActiveTab('BUY')}
          className={cn(
            "py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === 'BUY' ? "bg-[#9FEF00] text-[#05070A] shadow-[0_0_15px_rgba(159,239,0,0.3)]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
          )}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>BUY / LONG</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SELL')}
          className={cn(
            "py-2 rounded-lg font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5",
            activeTab === 'SELL' ? "bg-[#EF4444] text-[#FFFFFF] shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "text-[#94A3B8] hover:text-[#F8FAFC]"
          )}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>SELL / SHORT</span>
        </button>
      </div>

      {/* Asset Selector */}
      <div className="relative">
        <label className="text-[10px] text-[#94A3B8] uppercase font-bold mb-1 block">ASSET INSTRUMENT</label>
        <button
          type="button"
          onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] hover:border-[#9FEF00]/50 text-[#F8FAFC] transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-[#9FEF00]/10 border border-[#9FEF00]/30 text-[#9FEF00] flex items-center justify-center font-bold text-xs">
              {selectedAsset.symbol.slice(0, 2)}
            </span>
            <div className="text-left">
              <div className="font-bold text-xs text-[#F8FAFC]">{selectedAsset.symbol}</div>
              <div className="text-[10px] text-[#94A3B8] truncate">{selectedAsset.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F8FAFC]">${selectedAsset.price.toFixed(2)}</span>
            <ChevronDown className={cn("w-4 h-4 text-[#94A3B8] transition-transform", isAssetDropdownOpen && "rotate-180")} />
          </div>
        </button>

        {isAssetDropdownOpen && (
          <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-[#0B0F14] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
            {availableAssets.map((asset) => (
              <button
                key={asset.symbol}
                type="button"
                onClick={() => {
                  onSelectAsset(asset);
                  setIsAssetDropdownOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 hover:bg-[#10161D] text-left transition-colors cursor-pointer border-b border-[#1E293B]/60 last:border-0 text-xs",
                  selectedAsset.symbol === asset.symbol && "bg-[#9FEF00]/10"
                )}
              >
                <div>
                  <span className="font-bold text-[#F8FAFC]">{asset.symbol}</span>
                  <span className="text-[10px] text-[#94A3B8] ml-2">{asset.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#F8FAFC]">${asset.price.toFixed(2)}</span>
                  <span className={cn("text-[10px] ml-2 font-bold", asset.change >= 0 ? "text-[#22C55E]" : "text-[#EF4444]")}>
                    {asset.change >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Order Type Selector */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0F14] rounded-xl border border-[#1E293B]">
        <button
          type="button"
          onClick={() => setOrderType('MARKET')}
          className={cn(
            "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px]",
            orderType === 'MARKET' ? "bg-[#10161D] text-[#FF7043] border border-[#FF7043]/40 shadow-sm" : "text-[#94A3B8] hover:text-[#F8FAFC]"
          )}
        >
          MARKET
        </button>
        <button
          type="button"
          onClick={() => setOrderType('LIMIT')}
          className={cn(
            "py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[38px]",
            orderType === 'LIMIT' ? "bg-[#10161D] text-[#FF7043] border border-[#FF7043]/40 shadow-sm" : "text-[#94A3B8] hover:text-[#F8FAFC]"
          )}
        >
          LIMIT
        </button>
      </div>

      {/* Order Amount */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-bold">
          <span>ORDER CAPITAL ($)</span>
          <span>AVAILABLE: ${activeBalance.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
        </div>

        <div className="relative">
          <span className="absolute left-3 top-2.5 text-[#94A3B8] text-sm font-bold">$</span>
          <input
            type="number"
            min={10}
            max={activeBalance}
            value={amount}
            onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-[#0B0F14] border border-[#1E293B] focus:border-[#FF7043] rounded-xl pl-7 pr-4 py-2 text-sm font-extrabold text-[#F8FAFC] outline-none transition-all"
          />
        </div>

        {/* Percentage Selector Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1 text-[10px]">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handlePercentageSelect(pct)}
              className="py-1.5 min-h-[34px] rounded-lg bg-[#0B0F14] hover:bg-[#10161D] text-[#94A3B8] hover:text-[#FF7043] border border-[#1E293B] font-bold cursor-pointer transition-colors active:scale-95"
            >
              {pct === 100 ? 'MAX' : `${pct}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Leverage Selector */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] text-[#94A3B8] font-bold">
          <span>LEVERAGE MULTIPLIER</span>
          <span className="text-[#FF7043]">{leverage}x CROSS</span>
        </div>
        <div className="grid grid-cols-5 gap-1 sm:gap-1.5 text-[10px]">
          {[1, 5, 10, 25, 100].map((lev) => (
            <button
              key={lev}
              type="button"
              onClick={() => setLeverage(lev)}
              className={cn(
                "py-2 min-h-[34px] rounded-lg border font-bold transition-all cursor-pointer active:scale-95",
                leverage === lev ? "bg-[#FF7043]/15 text-[#FF7043] border-[#FF7043]/50" : "bg-[#0B0F14] text-[#94A3B8] border-[#1E293B] hover:text-[#F8FAFC]"
              )}
            >
              {lev}x
            </button>
          ))}
        </div>
      </div>

      {/* Stop Loss & Take Profit */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <span className="text-[#94A3B8] block font-bold mb-1">STOP LOSS (%)</span>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0B0F14] border border-[#1E293B] focus:border-[#EF4444] rounded-lg px-2.5 py-1.5 text-[#EF4444] font-bold text-xs outline-none"
          />
        </div>
        <div>
          <span className="text-[#94A3B8] block font-bold mb-1">TAKE PROFIT (%)</span>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
            className="w-full bg-[#0B0F14] border border-[#1E293B] focus:border-[#22C55E] rounded-lg px-2.5 py-1.5 text-[#22C55E] font-bold text-xs outline-none"
          />
        </div>
      </div>

      {/* Position Estimation Breakdown */}
      <div className="bg-[#0B0F14] border border-[#1E293B] rounded-xl p-3 space-y-1.5 text-[10px] text-[#94A3B8]">
        <div className="flex justify-between">
          <span>Est. Shares / Contracts:</span>
          <span className="text-[#F8FAFC] font-bold">{sharesCalculated.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span>Effective Exposure:</span>
          <span className="text-[#F8FAFC] font-bold">${(amount * leverage).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between">
          <span>Est. Fee (0.02%):</span>
          <span className="text-[#9FEF00] font-bold">${((amount * leverage) * 0.0002).toFixed(2)}</span>
        </div>
      </div>

      {/* Primary Submit Button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTradeSubmit}
        className={cn(
          "w-full py-3.5 rounded-xl font-extrabold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2",
          activeTab === 'BUY'
            ? "btn-primary-glow text-white"
            : "bg-[#EF4444] hover:bg-[#DC2626] text-[#FFFFFF] shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        )}
      >
        <Zap className="w-4 h-4 fill-current" />
        <span>CONFIRM {activeTab} ORDER (${(amount * leverage).toLocaleString()})</span>
      </motion.button>
    </div>
  );
}
