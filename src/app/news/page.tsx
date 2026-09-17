'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, SlidersHorizontal, Settings2, Bookmark, Flame, Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock Data
import { MOCK_ARTICLES, NewsArticle } from '@/lib/newsMock';

// Custom Subcomponents
import HeroFeaturedNews from './components/HeroFeaturedNews';
import NewsGridFeed from './components/NewsGridFeed';
import LiveFlashFeed from './components/LiveFlashFeed';
import AiAnalysisWidget from './components/AiAnalysisWidget';
import EconomicCalendarPanel from './components/EconomicCalendarPanel';
import NewsRightSidebar from './components/NewsRightSidebar';
import { ShareModal, ReportModal, PersonalizeModal, ArticleDetailModal } from './components/NewsModals';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function NewsPage() {
  const [mounted, setMounted] = useState(false);
  const [articlesList, setArticlesList] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bookmarks state (persisted in localStorage)
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  
  // Personalization settings
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Refresh spinner state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);

  // Sync state on client mount
  useEffect(() => {
    setMounted(true);
    setArticlesList(MOCK_ARTICLES);
    const cached = localStorage.getItem('news_bookmarks');
    if (cached) {
      try {
        setBookmarks(JSON.parse(cached));
      } catch (e) {
        console.error("Error reading bookmarks cache", e);
      }
    }
  }, []);

  // Update localStorage when bookmarks change
  const handleBookmarkToggle = (id: string) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      localStorage.setItem('news_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRefresh = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    toast.info("Fetching latest market intelligence reports...", { icon: "📡" });

    // Simulate server latency
    setTimeout(() => {
      const randomId = `dynamic-art-${Date.now()}`;
      const newArticles = [
        {
          id: randomId,
          title: `ALERT: Institutional Volume Spike Recorded on Core High-Beta Indices`,
          summary: "Options trading desks report heavy block trade purchases on major index trackers, indicating strong hedging flow ahead of monetary policy announcements.",
          content: "Aggregated options volumes show institutional accounts are placing size-based directional wagers on indices. Market analysts highlight this activity as a near-term volatility anchor, driving supportive flows under chip manufacturing and enterprise software sectors.",
          source: "Bloomberg Technology",
          author: "Quant Desk Intel",
          category: "Markets",
          publishedTime: "Just now",
          sentiment: "bullish" as const,
          relatedStocks: ["SPY", "QQQ", "NVDA"],
          coverImage: "linear-gradient(135deg, oklch(0.2 0.05 140), oklch(0.1 0.02 240))",
          viewsCount: 1850,
          trendingScore: 89,
          readTime: "2 min read"
        },
        ...MOCK_ARTICLES
      ];
      setArticlesList(newArticles);
      setIsRefreshing(false);
      toast.success("Intelligence feed successfully synchronized!");
    }, 1200);
  };

  const handleSectorToggle = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const handleSourceToggle = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleArticleSelect = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsDetailOpen(true);
  };

  const handleSymbolClick = (symbol: string) => {
    setSearchQuery(symbol);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground font-mono text-xs">
        Connecting to Market Intelligence Terminals...
      </div>
    );
  }

  // 1. Sector and Source Filters
  const displayArticles = articlesList.filter((art) => {
    if (selectedSectors.length > 0 && !selectedSectors.includes(art.category)) {
      return false;
    }
    if (selectedSources.length > 0 && !selectedSources.includes(art.source)) {
      return false;
    }
    return true;
  });

  // 2. Search filtering
  const searchedArticles = displayArticles.filter((art) => {
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchesTitle = art.title.toLowerCase().includes(query);
      const matchesSummary = art.summary.toLowerCase().includes(query);
      const matchesSource = art.source.toLowerCase().includes(query);
      const matchesStocks = art.relatedStocks.some(sym => sym.toLowerCase().includes(query));
      return matchesTitle || matchesSummary || matchesSource || matchesStocks;
    }
    return true;
  });

  const hasMatches = searchedArticles.length > 0;
  const featuredArticle = hasMatches ? searchedArticles[0] : null;


  return (
    <div className="space-y-6 font-sans max-w-[1400px] mx-auto pb-12">
      {/* 1. Header and Quick Actions Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/70 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5 font-sans">
            Global News & Research Terminal
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              BLOOMBERG WIRE
            </span>
          </h1>

          <p className="text-xs text-muted-foreground mt-1 font-sans">
            Institutional market intelligence streams, economic events, and AI-powered sentiment diagnostics.
          </p>
        </div>

        {/* Global Control Bar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 font-mono">
          <div className="relative w-48 sm:w-60 h-9">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-amber-400" />
            <input
              type="text"
              placeholder="Search ticker or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-full rounded-xl bg-card text-xs pl-8 pr-3 text-foreground border border-border/80 outline-none focus:border-amber-500/40 font-sans shadow-inner"
            />
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80"
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Syncing...' : 'Refresh'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsPersonalizeOpen(true)}
            className="h-8 gap-1.5 cursor-pointer text-xs border-border/80"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Personalize Feed
          </Button>
        </div>
      </div>

      {/* 2. Main Terminal Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Hero Featured News & Main Feeds (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {featuredArticle ? (
            <HeroFeaturedNews 
              article={featuredArticle} 
              onReadMore={handleArticleSelect} 
            />
          ) : (
            <div className="p-6 rounded-xl border border-border/80 bg-panel text-center text-muted-foreground flex flex-col items-center justify-center min-h-[140px]">
              <span className="text-xs font-bold text-foreground">No featured report matches query</span>
              <p className="text-[10px] text-muted-foreground mt-1">Try another keyword or ticker search.</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <h2 className="text-sm font-bold tracking-tight text-foreground uppercase font-mono">
                Curated Financial News
              </h2>
            </div>
            <NewsGridFeed
              articles={displayArticles}
              onArticleClick={handleArticleSelect}
              bookmarks={bookmarks}
              onBookmarkToggle={handleBookmarkToggle}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSymbolClick={handleSymbolClick}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Timeline, AI gauges, Econ Calendar, and Action bars */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Flash feed */}
          <LiveFlashFeed onSymbolClick={handleSymbolClick} />


          {/* AI Sentiment analysis widget */}
          <AiAnalysisWidget onSymbolClick={handleSymbolClick} />

          {/* Macro Economic Calendar */}
          <EconomicCalendarPanel />

          {/* Ticker Actions, earnings and trending badges */}
          <NewsRightSidebar
            articles={articlesList}
            onArticleClick={handleArticleSelect}
            onSymbolClick={handleSymbolClick}
          />
        </div>
      </div>

      {/* 3. Global Modal Overlays */}
      <ArticleDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        article={selectedArticle}
        isBookmarked={selectedArticle ? bookmarks.includes(selectedArticle.id) : false}
        onBookmarkToggle={() => selectedArticle && handleBookmarkToggle(selectedArticle.id)}
        onShareClick={() => {
          setIsDetailOpen(false);
          setIsShareOpen(true);
        }}
        onReportClick={() => {
          setIsDetailOpen(false);
          setIsReportOpen(true);
        }}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        article={selectedArticle}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        article={selectedArticle}
        onSubmit={(reason) => console.log(`Report submitted for article ${selectedArticle?.id}: ${reason}`)}
      />

      <PersonalizeModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        selectedSectors={selectedSectors}
        onSectorToggle={handleSectorToggle}
        selectedSources={selectedSources}
        onSourceToggle={handleSourceToggle}
        watchlistSymbols={['AAPL', 'MSFT', 'NVDA']}
        portfolioSymbols={['AAPL', 'TSLA', 'MSFT', 'NVDA', 'BTC-USD']}
      />
    </div>
  );
}
