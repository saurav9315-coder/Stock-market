'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_NEWS } from '@/lib/stockMock';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// No unused imports

export default function RecentNews() {
  const [filter, setFilter] = useState<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'>('ALL');

  const filteredNews = MOCK_NEWS.filter((item) => {
    if (filter === 'ALL') return true;
    return item.sentiment.toUpperCase() === filter;
  });

  return (
    <Card className="bg-panel border-border/80 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 border-b border-border/40">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          Curated Financial Intelligence
        </CardTitle>
        
        {/* Sentiment Filter tabs */}
        <div className="flex gap-1.5 p-0.5 rounded-lg bg-secondary border border-border">
          {(['ALL', 'POSITIVE', 'NEGATIVE'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-0.5 text-[10px] rounded-md font-semibold transition-all cursor-pointer ${
                filter === type
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin">
        <div className="divide-y divide-border/40">
          {filteredNews.map((item) => {
            const isPositive = item.sentiment === 'positive';
            const isNegative = item.sentiment === 'negative';

            return (
              <div 
                key={item.id} 
                className="p-4 hover:bg-secondary/45 transition-colors group relative"
              >
                {/* Visual indicator bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity ${
                  isPositive ? 'bg-[#F4511E]' : isNegative ? 'bg-rose-500' : 'bg-muted-foreground'
                }`} />

                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">{item.source}</span>
                    <span className="text-[10px] text-muted-foreground/60">•</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{item.time}</span>
                  </div>
                  {item.symbol && (
                    <Link href={`/stock/${item.symbol}`}>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-foreground/10 text-foreground font-mono border border-border hover:border-primary/40 transition-colors">
                        {item.symbol}
                      </span>
                    </Link>
                  )}
                </div>

                <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between mt-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isPositive 
                      ? 'bg-[#F4511E]/10 text-[#F4511E] border border-[#F4511E]/20' 
                      : isNegative 
                        ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' 
                        : 'bg-muted/20 text-muted-foreground border border-muted'
                  }`}>
                    {item.sentiment.toUpperCase()}
                  </span>
                  
                  {item.impactPercent && (
                    <span className={`text-[10px] font-mono font-semibold ${
                      item.impactPercent >= 0 ? 'text-[#F4511E]' : 'text-rose-500'
                    }`}>
                      Impact: {item.impactPercent >= 0 ? '+' : ''}{item.impactPercent}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
