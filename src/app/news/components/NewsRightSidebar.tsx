'use client';

import React from 'react';
import { Flame, Eye, Calendar, TrendingUp } from 'lucide-react';
import { NewsArticle } from '@/lib/newsMock';

interface NewsRightSidebarProps {
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  onSymbolClick?: (symbol: string) => void;
}

export default function NewsRightSidebar({ articles, onArticleClick, onSymbolClick }: NewsRightSidebarProps) {
  // Sort articles by views count to get 'Most Read'
  const mostRead = [...articles]
    .sort((a, b) => b.viewsCount - a.viewsCount)
    .slice(0, 4);

  // Hardcode some upcoming earnings events
  const upcomingEarnings = [
    { symbol: 'MSFT', date: 'Jul 22', period: 'Q2 Earnings', time: 'Post-Market' },
    { symbol: 'GOOGL', date: 'Jul 23', period: 'Q2 Earnings', time: 'Post-Market' },
    { symbol: 'TSLA', date: 'Jul 24', period: 'Q2 Earnings', time: 'Post-Market' },
    { symbol: 'AAPL', date: 'Jul 30', period: 'Q2 Earnings', time: 'Post-Market' }
  ];

  // Hardcode some trending tickers
  const trendingTickers = [
    { symbol: 'NVDA', price: 912.40, change: 3.20, changePercent: 3.25, isUp: true },
    { symbol: 'AAPL', price: 185.15, change: 1.55, changePercent: 0.85, isUp: true },
    { symbol: 'TSLA', price: 171.12, change: -4.22, changePercent: -2.40, isUp: false },
    { symbol: 'BTC-USD', price: 68150.00, change: 2710.00, changePercent: 4.14, isUp: true }
  ];

  return (
    <div className="space-y-6">
      {/* Trending Stocks Widget */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground font-sans tracking-tight flex items-center gap-2 border-b border-border/40 pb-2">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          Trending Securities
        </h3>
        <div className="space-y-3">
          {trendingTickers.map((ticker) => (
            <div 
              key={ticker.symbol} 
              className="flex items-center justify-between text-xs"
            >
              <button 
                onClick={() => onSymbolClick?.(ticker.symbol)}
                className="font-bold font-mono text-foreground hover:underline cursor-pointer"
              >
                {ticker.symbol}
              </button>
              <div className="text-right font-mono">
                <span className="font-bold text-foreground block">
                  {ticker.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-bold ${ticker.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {ticker.isUp ? '+' : ''}{ticker.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Most Read News */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground font-sans tracking-tight flex items-center gap-2 border-b border-border/40 pb-2">
          <Flame className="w-3.5 h-3.5 text-primary" />
          Most Read Analyses
        </h3>
        <div className="space-y-3.5">
          {mostRead.map((article) => (
            <div 
              key={article.id} 
              onClick={() => onArticleClick(article)}
              className="group cursor-pointer space-y-1.5"
            >
              <h4 className="text-xs font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </h4>
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono">
                <span>{article.source}</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" />
                  {article.viewsCount > 1000 
                    ? `${(article.viewsCount / 1000).toFixed(1)}k` 
                    : article.viewsCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Corporate Actions */}
      <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
        <h3 className="text-xs font-bold text-foreground font-sans tracking-tight flex items-center gap-2 border-b border-border/40 pb-2">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          Earnings This Week
        </h3>
        <div className="space-y-3">
          {upcomingEarnings.map((action) => (
            <div 
              key={action.symbol} 
              className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/35 border border-border/40 hover:bg-secondary/55 transition-colors"
            >
              <div>
                <button
                  onClick={() => onSymbolClick?.(action.symbol)}
                  className="font-bold font-mono text-foreground hover:underline cursor-pointer"
                >
                  {action.symbol}
                </button>
                <span className="text-[9px] text-muted-foreground block font-mono">{action.period}</span>
              </div>
              <div className="text-right font-mono text-[10px]">
                <span className="font-bold text-foreground block">{action.date}</span>
                <span className="text-muted-foreground/80">{action.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
