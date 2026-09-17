'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Bell, Copy, Check, FileJson, AlertCircle } from 'lucide-react';
import { Alert } from '@/lib/alertsMock';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alert: Omit<Alert, 'id' | 'createdAt' | 'lastTriggered' | 'currentValue'>) => void;
  defaultSymbol?: string;
}

export function CreateAlertModal({ isOpen, onClose, onSubmit, defaultSymbol = '' }: CreateModalProps) {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState('Price Above');
  const [targetValue, setTargetValue] = useState('');
  const [frequency, setFrequency] = useState<'Once' | 'Daily' | 'Weekly' | 'Repeating'>('Repeating');

  useEffect(() => {
    if (isOpen) {
      setSymbol(defaultSymbol || 'AAPL');
      setTargetValue('185.00');
      setType('Price Above');
      setFrequency('Repeating');
    }
  }, [isOpen, defaultSymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !targetValue.trim()) return;

    const val = parseFloat(targetValue);
    if (isNaN(val)) return;

    const conditionText = `${type} ${val.toFixed(2)}`;

    onSubmit({
      symbol: symbol.toUpperCase(),
      type,
      condition: conditionText,
      targetValue: val,
      status: 'active',
      frequency
    });

    onClose();
  };

  const tickerOptions = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'GOOGL', 'BTC-USD', 'HDFCBANK', 'RELIANCE'];
  const alertTypes = ['Price Above', 'Price Below', 'Percentage Change', 'Volume Spike', 'RSI', 'MACD', 'EMA Cross', 'Bollinger Bands'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary animate-pulse" />
            Configure Custom Indicator Alarm
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set target thresholds. Our quantitative tickers execute check updates in latency bounds &lt; 8ms.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-2 space-y-4 text-xs font-sans">
          {/* Symbol */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Asset Ticker</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="h-8 w-full rounded-lg bg-secondary text-foreground text-xs px-3 border border-border outline-none focus:border-primary/45 font-mono"
            >
              {tickerOptions.map((sym) => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>

          {/* Alert Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Trigger Criterion</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                // Adjust default values depending on selection
                if (e.target.value === 'RSI') setTargetValue('30');
                else if (e.target.value === 'Volume Spike') setTargetValue('2.0');
                else if (e.target.value === 'Percentage Change') setTargetValue('5.0');
                else setTargetValue('185.00');
              }}
              className="h-8 w-full rounded-lg bg-secondary text-foreground text-xs px-3 border border-border outline-none focus:border-primary/45 font-mono"
            >
              {alertTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target Value */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Target Threshold</label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="h-8 w-full rounded-lg bg-secondary text-foreground text-xs px-3 border border-border outline-none focus:border-primary/45 font-mono"
                required
              />
            </div>

            {/* Frequency */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Frequency</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="h-8 w-full rounded-lg bg-secondary text-foreground text-xs px-3 border border-border outline-none focus:border-primary/45 font-mono"
              >
                <option value="Once">Only Once</option>
                <option value="Daily">Daily Limit</option>
                <option value="Weekly">Weekly Limit</option>
                <option value="Repeating">Repeating Alarm</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold h-8 w-full">
              Deploy Indicator Alarm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ImportExportProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onImport: (importedAlerts: Alert[]) => void;
}

export function ImportExportModal({ isOpen, onClose, alerts, onImport }: ImportExportProps) {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJsonText(JSON.stringify(alerts.map(({ symbol, type, condition, targetValue, status, frequency }) => ({
        symbol, type, condition, targetValue, status, frequency
      })), null, 2));
      setErrorMsg('');
    }
  }, [isOpen, alerts]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setErrorMsg('Data must be a JSON array of alerts.');
        return;
      }
      
      const formatted = parsed.map((item, idx) => {
        if (!item.symbol || !item.type || !item.condition || typeof item.targetValue !== 'number') {
          throw new Error(`Invalid format at index ${idx}`);
        }
        return {
          id: `imported-${Date.now()}-${idx}`,
          symbol: item.symbol.toUpperCase(),
          type: item.type,
          condition: item.condition,
          currentValue: item.targetValue * 0.98, // mock start value slightly lower
          targetValue: item.targetValue,
          status: item.status || 'active',
          createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
          lastTriggered: 'Never',
          frequency: item.frequency || 'Repeating'
        } as Alert;
      });

      onImport(formatted);
      onClose();
    } catch (err: any) {
      setErrorMsg(`JSON validation failed: ${err.message}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <FileJson className="w-4 h-4 text-primary" />
            Import / Export Configurations
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Copy active alerts in tabular JSON schemas to save or sync between client workspaces.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleImport} className="py-2 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="p-3.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">JSON Data Schema</label>
            <textarea
              rows={10}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full rounded bg-secondary text-foreground text-[10px] p-3 border border-border outline-none focus:border-primary/40 font-mono leading-relaxed"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" size="sm" onClick={copyToClipboard} className="h-8 gap-1.5">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Schema'}
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-semibold h-8">
              Import Configuration
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
