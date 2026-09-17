'use client';

import React from 'react';
import { Sparkles, ArrowUpRight, BrainCircuit, ShieldAlert, Cpu } from 'lucide-react';
import { MOCK_AI_SMART_ALERTS, Alert } from '@/lib/alertsMock';
import { Button } from '@/components/ui/button';

interface SmartAlertsProps {
  onAddPresetAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'lastTriggered' | 'currentValue'>) => void;
  onSymbolClick?: (symbol: string) => void;
}

export default function AiSmartAlerts({ onAddPresetAlert, onSymbolClick }: SmartAlertsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'volatility':
        return <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />;
      case 'momentum':
        return <BrainCircuit className="w-4 h-4 text-emerald-500" />;
      default:
        return <Cpu className="w-4 h-4 text-amber-500" />;
    }
  };

  const mapToAlertTemplate = (smart: typeof MOCK_AI_SMART_ALERTS[0]) => {
    // Maps AI alert metadata to target form values
    const symbol = smart.title.split(': ')[1] || 'SPY';
    let type = 'Price Above';
    let condition = 'Price Above 190.00';
    let targetValue = 190;

    if (smart.type === 'volatility') {
      type = 'Volume Spike';
      condition = 'Volume > 2.0x Avg';
      targetValue = 2.0;
    } else if (smart.type === 'momentum') {
      type = 'RSI';
      condition = 'RSI < 30';
      targetValue = 30;
    }

    return {
      symbol,
      type,
      condition,
      targetValue,
      status: 'active' as const,
      frequency: 'Repeating' as const
    };
  };

  return (
    <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-primary animate-pulse" />
          AI Smart Alerts Recommendations
        </h3>
        <span className="text-[9px] font-mono text-primary bg-primary/10 border border-primary/20 px-2 py-0.2 rounded-full font-bold">
          QUANT MODELS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_AI_SMART_ALERTS.map((smart) => {
          const mappedAlert = mapToAlertTemplate(smart);

          return (
            <div 
              key={smart.id}
              className="p-3.5 rounded-lg border border-border/60 bg-secondary/15 hover:bg-secondary/30 transition-all flex flex-col justify-between gap-3 relative group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-secondary border border-border/80 flex items-center justify-center">
                      {getIcon(smart.type)}
                    </div>
                    <button
                      onClick={() => onSymbolClick?.(mappedAlert.symbol)}
                      className="text-xs font-bold text-foreground hover:underline font-mono"
                    >
                      {smart.title}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                    {smart.confidence}% Conf.
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {smart.description}
                </p>
                <div className="text-[10px] text-muted-foreground font-mono leading-normal bg-secondary/40 px-2.5 py-1 rounded border border-border/50">
                  <strong className="text-foreground font-sans">Quant Playbook:</strong> {smart.suggestedAction}
                </div>
              </div>

              <button
                onClick={() => onAddPresetAlert(mappedAlert)}
                className="h-7 w-full rounded border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 uppercase mt-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Track This Metric
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface PlusCircleProps {
  className?: string;
}

function PlusCircle({ className }: PlusCircleProps) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}
