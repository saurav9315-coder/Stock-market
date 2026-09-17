'use client';

import React, { useState } from 'react';
import { DollarSign, Upload, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioModalsProps {
  cashBalance: number;
  activeModal: 'addFunds' | 'withdrawFunds' | 'import' | null;
  onClose: () => void;
  onAddFundsSubmit: (amount: number) => void;
  onWithdrawFundsSubmit: (amount: number) => void;
  onImportSubmit: (json: string) => void;
}

export default function PortfolioModals({
  cashBalance,
  activeModal,
  onClose,
  onAddFundsSubmit,
  onWithdrawFundsSubmit,
  onImportSubmit
}: PortfolioModalsProps) {
  const [fundsAmount, setFundsAmount] = useState(5000);
  const [jsonText, setJsonText] = useState('');

  if (!activeModal) return null;

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundsAmount <= 0) return;
    onAddFundsSubmit(fundsAmount);
    setFundsAmount(5000);
    onClose();
  };

  const handleSubmitWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (fundsAmount <= 0 || fundsAmount > cashBalance) return;
    onWithdrawFundsSubmit(fundsAmount);
    setFundsAmount(5000);
    onClose();
  };

  const handleSubmitImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonText.trim()) return;
    onImportSubmit(jsonText);
    setJsonText('');
    onClose();
  };

  const renderContent = () => {
    switch (activeModal) {
      case 'addFunds':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Deposit Cash Capital
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Deposit Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div className="bg-secondary/40 border border-border/60 rounded-lg p-3 text-[10px] text-muted-foreground font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Current cash balance:</span>
                  <span>${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-border/20 pt-1 mt-1 font-bold text-foreground">
                  <span>Estimated new balance:</span>
                  <span>${(cashBalance + fundsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer shadow-md"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        );

      case 'withdrawFunds':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-rose-500" /> Withdraw Cash Capital
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitWithdraw} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Withdraw Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max={cashBalance}
                  required
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-secondary text-foreground border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-primary"
                />
              </div>
              <div className="bg-secondary/40 border border-border/60 rounded-lg p-3 text-[10px] text-muted-foreground font-mono space-y-1">
                <div className="flex justify-between">
                  <span>Current cash balance:</span>
                  <span>${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between border-t border-border/20 pt-1 mt-1 font-bold text-foreground">
                  <span>Estimated new balance:</span>
                  <span>${Math.max(0, cashBalance - fundsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              {fundsAmount > cashBalance && (
                <div className="flex items-center gap-1.5 text-[9px] text-rose-500 font-bold bg-rose-500/5 p-2 rounded-lg border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Withdrawal exceeds current cash balance buying power.</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fundsAmount > cashBalance || fundsAmount <= 0}
                  className="flex-1 py-2 text-xs font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-md"
                >
                  Confirm Withdrawal
                </button>
              </div>
            </form>
          </div>
        );

      case 'import':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-primary" /> Import Portfolio JSON Configuration
              </h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSubmitImport} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Paste Configuration JSON Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder='{ "cashBalance": 15000, "customHoldings": [] }'
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full p-2.5 bg-secondary text-foreground border border-border rounded-lg text-xs font-mono focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-bold bg-amber-500/5 p-2 rounded-lg border border-amber-500/20 font-mono leading-normal">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Caution: Importing configuration overrides all current active goals, holdings and transaction ledger states.</span>
              </div>
              <div className="flex items-center gap-2 pt-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-bold rounded-lg bg-secondary border border-border text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold rounded-lg text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  Apply Configuration
                </button>
              </div>
            </form>
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
