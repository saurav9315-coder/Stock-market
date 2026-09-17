'use client';

import React from 'react';
import { Newspaper, ChevronRight } from 'lucide-react';
import { NewsArticle } from '@/lib/newsMock';
import { Button } from '@/components/ui/button';

interface HeroFeaturedNewsProps {
  article: NewsArticle;
  onReadMore: (article: NewsArticle) => void;
}

export default function HeroFeaturedNews({ article, onReadMore }: HeroFeaturedNewsProps) {
  const isPositive = article.sentiment === 'bullish';
  const isNegative = article.sentiment === 'bearish';

  return (
    <div className="relative rounded-xl border border-border/80 bg-panel overflow-hidden group">
      {/* Decorative colored glow strip matching article sentiment */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-muted-foreground'
      }`} />

      {/* Visual cover gradient block */}
      <div 
        className="w-full h-44 sm:h-52 relative overflow-hidden" 
        style={{ background: article.coverImage }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-panel to-transparent opacity-90" />
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-300" />
        
        {/* Sentiment Badge Overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded border border-white/10">
            {article.category}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border ${
            isPositive 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35' 
              : isNegative 
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/35' 
                : 'bg-black/40 text-muted-foreground border-border/55'
          }`}>
            SENTIMENT: {article.sentiment.toUpperCase()}
          </span>
        </div>
        
        <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary glow-bullish">
            <Newspaper className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono font-bold text-white tracking-wide uppercase drop-shadow">
            FEATURED REPORT
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span className="font-bold text-foreground">{article.source}</span>
            <span>•</span>
            <span>By {article.author}</span>
            <span>•</span>
            <span>{article.publishedTime}</span>
          </div>

          <h3 className="text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
            {article.summary}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div className="flex gap-1">
            {article.relatedStocks.map(stock => (
              <span 
                key={stock} 
                className="text-[9px] px-1.5 py-0.5 rounded bg-secondary-foreground/10 text-foreground font-mono border border-border"
              >
                {stock}
              </span>
            ))}
          </div>

          <Button 
            size="sm" 
            onClick={() => onReadMore(article)} 
            className="text-[11px] h-7 bg-primary text-primary-foreground font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all cursor-pointer"
          >
            Read Analysis Report
            <ChevronRight className="w-3.5 h-3.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
