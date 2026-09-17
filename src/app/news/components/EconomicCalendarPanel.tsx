'use client';

import React from 'react';
import { Calendar, Globe2, AlertOctagon } from 'lucide-react';
import { MOCK_ECONOMIC_EVENTS } from '@/lib/newsMock';

export default function EconomicCalendarPanel() {
  return (
    <div className="rounded-xl border border-border/80 bg-panel flex flex-col overflow-hidden h-[420px]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0 bg-secondary/10">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground font-sans tracking-tight">
            Macroeconomic Calendar
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">Today</span>
      </div>

      {/* Grid listing */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin">
        {MOCK_ECONOMIC_EVENTS.map((event) => {
          const isHigh = event.importance === 'high';
          const isMedium = event.importance === 'medium';

          return (
            <div 
              key={event.id} 
              className="p-3 rounded-lg border border-border/60 bg-secondary/15 hover:bg-secondary/30 transition-colors flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.2 rounded border border-border">
                    {event.time}
                  </span>
                  <div className="flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-muted-foreground/80" />
                    <span className="font-mono text-[10px] text-foreground font-bold">{event.country}</span>
                  </div>
                </div>

                {/* Importance badges */}
                <span className={`text-[8px] font-bold font-mono px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                  isHigh 
                    ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' 
                    : isMedium 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/10' 
                      : 'bg-muted/30 text-muted-foreground border border-muted'
                }`}>
                  {event.importance} Impact
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-foreground leading-snug">{event.title}</h4>
              </div>

              {/* Stat grid */}
              <div className="grid grid-cols-3 gap-2 text-[10px] pt-1.5 border-t border-border/25 font-mono">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Actual</span>
                  <span className={`font-bold ${
                    event.actual ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}>
                    {event.actual || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Forecast</span>
                  <span className="font-bold text-foreground/80">
                    {event.forecast || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase tracking-wider">Previous</span>
                  <span className="font-bold text-foreground/70">
                    {event.previous || '--'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
