'use client';

import React from 'react';
import { ToggleLeft, ToggleRight, Sparkles, Send, Mail, MessageCircle, AlertCircle, PlusCircle } from 'lucide-react';
import { AlertTemplate, MOCK_TEMPLATES } from '@/lib/alertsMock';

interface SidebarProps {
  channels: Record<string, boolean>;
  onToggleChannel: (channel: string) => void;
  onApplyTemplate: (template: AlertTemplate) => void;
}

export default function AlertConfigurationSidebar({
  channels,
  onToggleChannel,
  onApplyTemplate
}: SidebarProps) {
  // Description/Label mappings for channels
  const channelDetails = [
    { id: 'inApp', label: 'In-App Notifications', desc: 'Real-time dashboard alert bells & toast models.', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'email', label: 'Email Reports', desc: 'Detailed end-of-day reports and volatility flags.', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'sms', label: 'SMS Carrier Messages (UI Ready)', desc: 'Direct text alarms for critical floor breaks.', icon: <Send className="w-3.5 h-3.5" /> },
    { id: 'telegram', label: 'Telegram Bot Sync (UI Ready)', desc: 'Dispatch JSON alerts to chosen private groups.', icon: <MessageCircle className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Notification Channels checklist */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground font-sans tracking-tight flex items-center gap-2 border-b border-border/40 pb-2">
          <Send className="w-3.5 h-3.5 text-primary" />
          Dispatch Channels
        </h3>
        <div className="space-y-3.5">
          {channelDetails.map((ch) => {
            const isEnabled = channels[ch.id];
            return (
              <div 
                key={ch.id}
                className="flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    {ch.icon}
                    {ch.label}
                  </span>
                  <p className="text-[10px] text-muted-foreground leading-normal">{ch.desc}</p>
                </div>
                <button
                  onClick={() => onToggleChannel(ch.id)}
                  className="cursor-pointer text-primary transition-transform active:scale-95 shrink-0"
                >
                  {isEnabled ? (
                    <ToggleRight className="w-6 h-6 text-primary" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-muted-foreground/60" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Alert Strategy Templates */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground font-sans tracking-tight flex items-center gap-2 border-b border-border/40 pb-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          Quick Strategy Presets
        </h3>
        <p className="text-[10px] text-muted-foreground leading-normal">
          Click a template to instantly deploy pre-configured volatility and RSI indicators directly into your active checklist.
        </p>
        <div className="space-y-3.5 pt-1">
          {MOCK_TEMPLATES.map((tmpl) => (
            <div 
              key={tmpl.name}
              className="p-3 rounded-lg bg-secondary/35 border border-border/40 hover:bg-secondary/55 transition-colors group flex flex-col justify-between gap-2.5"
            >
              <div>
                <span className="text-xs font-bold text-foreground block font-mono">{tmpl.name}</span>
                <span className="text-[10px] text-muted-foreground block leading-normal mt-0.5">{tmpl.description}</span>
                <span className="text-[9px] font-mono text-primary font-bold block mt-1.5">
                  Contains: {tmpl.alerts.length} predefined metrics
                </span>
              </div>
              <button
                onClick={() => onApplyTemplate(tmpl)}
                className="w-full h-7 rounded border border-primary/20 hover:border-primary bg-primary/5 hover:bg-primary text-primary hover:text-primary-foreground text-[10px] font-bold font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 uppercase"
              >
                <PlusCircle className="w-3 h-3" />
                Deploy Presets
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
