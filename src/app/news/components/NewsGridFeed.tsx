'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, BookmarkCheck, Search, Filter, RefreshCw, SlidersHorizontal, Newspaper, ChevronRight } from 'lucide-react';
import { NewsArticle } from '@/lib/newsMock';
import { Button } from '@/components/ui/button';

interface NewsGridFeedProps {
  articles: NewsArticle[];
  onArticleClick: (article: NewsArticle) => void;
  bookmarks: string[];
  onBookmarkToggle: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSymbolClick?: (symbol: string) => void;
}

export default function NewsGridFeed({
  articles,
  onArticleClick,
  bookmarks,
  onBookmarkToggle,
  searchQuery,
  setSearchQuery,
  onSymbolClick
}: NewsGridFeedProps) {
  const [activeTab, setActiveTab] = useState('All');
  const [sentimentFilter, setSentimentFilter] = useState<'All' | 'Bullish' | 'Bearish' | 'Neutral'>('All');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('All');

  const categories = [
    'All', 'Markets', 'Stocks', 'Economy', 'IPO', 
    'Earnings', 'Crypto', 'Commodities', 'ETFs', 'Technology', 'AI'
  ];

  const uniqueSources = ['All', ...new Set(articles.map(art => art.source))];

  // Filtering Logic
  const filteredArticles = articles.filter((art) => {
    // 1. Category Tab Filter (ignored when search query is active)
    if (searchQuery.trim() === '' && activeTab !== 'All' && art.category.toLowerCase() !== activeTab.toLowerCase()) {
      return false;
    }


    // 2. Sentiment Filter
    if (sentimentFilter !== 'All' && art.sentiment.toLowerCase() !== sentimentFilter.toLowerCase()) {
      return false;
    }

    // 3. Source Filter
    if (sourceFilter !== 'All' && art.source !== sourceFilter) {
      return false;
    }

    // 4. Search Filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesTitle = art.title.toLowerCase().includes(query);
      const matchesSummary = art.summary.toLowerCase().includes(query);
      const matchesSource = art.source.toLowerCase().includes(query);
      const matchesStocks = art.relatedStocks.some(sym => sym.toLowerCase().includes(query));
      if (!matchesTitle && !matchesSummary && !matchesSource && !matchesStocks) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Category Tabs Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-1.5 overflow-x-auto scrollbar-none gap-2">
        <div className="flex gap-1.5">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filters Toggle Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          className={`h-7 px-2.5 text-[10px] gap-1 cursor-pointer shrink-0 border border-border/80 ${
            showFiltersPanel ? 'bg-secondary text-foreground' : ''
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filter options
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 rounded-lg border border-border/80 bg-secondary/20 space-y-3"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Sentiment Filter */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">AI Sentiment</span>
                <div className="flex gap-1">
                  {['All', 'Bullish', 'Bearish', 'Neutral'].map((sent) => (
                    <button
                      key={sent}
                      onClick={() => setSentimentFilter(sent as any)}
                      className={`px-2.5 py-0.5 text-[10px] font-medium rounded-md border cursor-pointer transition-colors ${
                        sentimentFilter === sent
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-popover text-muted-foreground border-border hover:bg-secondary'
                      }`}
                    >
                      {sent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Filter */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Media Source</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="h-6 w-full rounded bg-popover text-foreground text-[10px] px-2 border border-border outline-none focus:border-primary/40 font-mono"
                >
                  {uniqueSources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => {
              const isBookmarked = bookmarks.includes(article.id);
              const isPositive = article.sentiment === 'bullish';
              const isNegative = article.sentiment === 'bearish';

              return (
                <motion.div
                  key={article.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border/80 bg-panel hover:border-border/95 transition-all overflow-hidden flex flex-col group relative"
                >
                  {/* Visual Top Stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-[2.5px] ${
                    isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-muted-foreground/30'
                  }`} />

                  {/* Header Image Mock */}
                  <div 
                    className="w-full h-28 relative overflow-hidden" 
                    style={{ background: article.coverImage }}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    
                    {/* Category overlay */}
                    <div className="absolute top-2.5 left-3">
                      <span className="text-[9px] uppercase font-mono font-bold bg-black/65 text-white px-2 py-0.5 rounded border border-white/5">
                        {article.category}
                      </span>
                    </div>

                    {/* Bookmark overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookmarkToggle(article.id);
                      }}
                      className="absolute top-2.5 right-3 p-1 rounded bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5 text-white/80" />
                      )}
                    </button>
                  </div>

                  {/* Info contents */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                        <span className="font-bold text-foreground">{article.source}</span>
                        <span>•</span>
                        <span>{article.publishedTime}</span>
                      </div>
                      <h4 
                        onClick={() => onArticleClick(article)}
                        className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors cursor-pointer line-clamp-2"
                      >
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/40">
                      <div className="flex gap-1.5">
                        {article.relatedStocks.map(stock => (
                          <button
                            key={stock}
                            onClick={() => onSymbolClick?.(stock)}
                            className="text-[9px] px-1 py-0.2 rounded bg-secondary-foreground/5 text-foreground hover:bg-secondary-foreground/10 font-mono border border-border"
                          >
                            {stock}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => onArticleClick(article)}
                        className="text-[10px] font-bold text-primary flex items-center gap-0.5 hover:gap-1 transition-all cursor-pointer"
                      >
                        Details
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-2 p-8 rounded-xl border border-border/80 bg-panel text-center text-muted-foreground flex flex-col items-center justify-center min-h-[220px]">
              <Newspaper className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <h4 className="text-xs font-bold text-foreground">No matches found</h4>
              <p className="text-[10px] leading-relaxed max-w-xs mt-1">
                We couldn't find any articles matching your search query or filter tags. Clear filters to see all feeds.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSearchQuery('');
                  setSentimentFilter('All');
                  setSourceFilter('All');
                  setActiveTab('All');
                }} 
                className="mt-4 text-[10px] h-7 cursor-pointer"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
