'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Copy, Share2, AlertTriangle, Settings2, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { NewsArticle } from '@/lib/newsMock';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
}

export function ShareModal({ isOpen, onClose, article }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!article) return null;

  const shareUrl = `https://quant.antigravity.finance/news/${article.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" />
            Share Intelligence Report
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Share this curated news article with colleagues or export it to financial feeds.
          </p>
          <div className="p-3 rounded-lg bg-secondary/40 border border-border/80">
            <h4 className="text-xs font-bold text-foreground mb-1 leading-snug">{article.title}</h4>
            <span className="text-[10px] text-muted-foreground font-mono">{article.source} • {article.author}</span>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 h-8 rounded-lg bg-secondary text-foreground text-xs px-3 border border-border outline-none focus:border-primary/40 font-mono"
            />
            <Button size="sm" onClick={copyToClipboard} className="h-8 gap-1">
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  onSubmit: (reason: string) => void;
}

export function ReportModal({ isOpen, onClose, article, onSubmit }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!article) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReason('');
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Report Intel Stale/Biased
          </DialogTitle>
        </DialogHeader>
        {submitted ? (
          <div className="py-6 text-center text-emerald-500 font-bold text-sm">
            Thank you! Report registered successfully.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Flag inaccuracies, out-of-date stock correlations, or incorrect AI sentiment scoring.
            </p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Report Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe the issue with the article sentiment, related symbols (e.g. incorrect symbol mapping), or contents..."
                rows={4}
                className="w-full rounded-lg bg-secondary text-foreground text-xs p-3 border border-border outline-none focus:border-primary/40 leading-relaxed resize-none"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" size="sm" className="bg-destructive hover:bg-destructive/80 text-destructive-foreground">
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PersonalizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSectors: string[];
  onSectorToggle: (sector: string) => void;
  selectedSources: string[];
  onSourceToggle: (source: string) => void;
  watchlistSymbols: string[];
  portfolioSymbols: string[];
}

export function PersonalizeModal({
  isOpen,
  onClose,
  selectedSectors,
  onSectorToggle,
  selectedSources,
  onSourceToggle,
  watchlistSymbols,
  portfolioSymbols
}: PersonalizeModalProps) {
  const sectors = ['Technology', 'AI', 'Economy', 'Semiconductors', 'Banking', 'Automotive', 'Crypto', 'Commodities'];
  const sources = ['Bloomberg Technology', 'Wall Street Journal', 'CNBC Pro', 'Reuters India', 'Bloomberg Markets', 'CoinDesk', 'Morningstar'];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            Personalize Intelligence Feed
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[450px] overflow-y-auto scrollbar-thin pr-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Customize filter weights to highlight sectors, sources, and news matching your current portfolios.
          </p>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Target Sectors</h4>
            <div className="flex flex-wrap gap-1.5">
              {sectors.map((sector) => {
                const isSelected = selectedSectors.includes(sector);
                return (
                  <button
                    key={sector}
                    onClick={() => onSectorToggle(sector)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70 hover:text-foreground'
                    }`}
                  >
                    {sector}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase font-mono tracking-wider">Trusted Sources</h4>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((source) => {
                const isSelected = selectedSources.includes(source);
                return (
                  <button
                    key={source}
                    onClick={() => onSourceToggle(source)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary/70 hover:text-foreground'
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/80 space-y-2">
            <h4 className="text-xs font-bold text-foreground">Auto-Linked Sync Priorities</h4>
            <div className="grid grid-cols-2 gap-4 text-[11px] text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Watchlist Tickers:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {watchlistSymbols.length > 0 ? (
                    watchlistSymbols.map(sym => (
                      <span key={sym} className="px-1 py-0.2 rounded bg-secondary-foreground/10 text-foreground font-mono">{sym}</span>
                    ))
                  ) : (
                    <span>No tickers loaded</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-semibold text-foreground">Portfolio Holdings:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {portfolioSymbols.length > 0 ? (
                    portfolioSymbols.map(sym => (
                      <span key={sym} className="px-1 py-0.2 rounded bg-secondary-foreground/10 text-foreground font-mono">{sym}</span>
                    ))
                  ) : (
                    <span>No holdings loaded</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

interface ArticleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onShareClick: () => void;
  onReportClick: () => void;
}

export function ArticleDetailModal({
  isOpen,
  onClose,
  article,
  isBookmarked,
  onBookmarkToggle,
  onShareClick,
  onReportClick
}: ArticleDetailModalProps) {
  if (!article) return null;

  const isPositive = article.sentiment === 'bullish';
  const isNegative = article.sentiment === 'bearish';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border border-border sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header Visual Stripe */}
        <div className={`h-1.5 w-full ${isPositive ? 'bg-emerald-500' : isNegative ? 'bg-rose-500' : 'bg-muted-foreground'}`} />
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-muted-foreground font-mono tracking-wider uppercase bg-secondary/80 px-2 py-0.5 rounded border border-border">
                {article.category}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isPositive 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                    : isNegative 
                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/10' 
                      : 'bg-muted/20 text-muted-foreground border border-muted'
                }`}>
                  AI sentiment: {article.sentiment.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground/60">•</span>
                <span className="text-xs text-muted-foreground font-mono">{article.publishedTime}</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {article.title}
            </h2>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-3">
              <div>
                <span>Source: <strong className="text-foreground">{article.source}</strong></span>
                <span className="mx-2">•</span>
                <span>By: <strong className="text-foreground">{article.author}</strong></span>
              </div>
              <span className="font-mono text-[10px]">{article.readTime}</span>
            </div>
          </div>

          {/* Banner cover mock */}
          <div 
            className="w-full h-44 rounded-xl border border-border/50 relative overflow-hidden flex items-center justify-center"
            style={{ background: article.coverImage }}
          >
            <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
            <div className="relative text-center p-4">
              <span className="text-[10px] font-mono font-bold tracking-widest text-primary-foreground/60 uppercase">
                QUANT INTELLIGENCE INDEX
              </span>
              <h3 className="text-sm font-bold text-white mt-1 uppercase tracking-tight">
                {article.source} EXCLUSIVE REPORT
              </h3>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
            <p className="font-bold border-l-2 border-primary/50 pl-3 italic text-muted-foreground">
              {article.summary}
            </p>
            {article.content.split('\n\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          <div className="border-t border-border/40 pt-4 space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase font-mono">Related Security Tickers:</span>
              {article.relatedStocks.map((stock) => (
                <span 
                  key={stock} 
                  className="text-[10px] px-1.5 py-0.5 rounded bg-secondary-foreground/10 text-foreground font-mono border border-border"
                >
                  {stock}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center p-4 bg-muted/30 border-t border-border/60">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onShareClick} className="gap-1 text-xs">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </Button>
            <Button variant="ghost" size="sm" onClick={onReportClick} className="gap-1 text-xs text-destructive hover:bg-destructive/10">
              <AlertTriangle className="w-3.5 h-3.5" />
              Report
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onBookmarkToggle} className="gap-1 text-xs">
            {isBookmarked ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                Bookmarked
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                Bookmark
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
