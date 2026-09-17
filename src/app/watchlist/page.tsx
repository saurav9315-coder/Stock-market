'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWatchlist } from './hooks/useWatchlist';

// Components
import WatchlistSidebar from './components/WatchlistSidebar';
import WatchlistHeader from './components/WatchlistHeader';
import WatchlistFilters from './components/WatchlistFilters';
import WatchlistTable from './components/WatchlistTable';
import StockComparer from './components/StockComparer';
import WatchlistAnalytics from './components/WatchlistAnalytics';
import RealTimeMarketPanel from './components/RealTimeMarketPanel';
import AIWatchlistInsights from './components/AIWatchlistInsights';
import WatchlistModals from './components/WatchlistModals';

// Icons
import { AlertCircle, Sliders, RefreshCw, Layers } from 'lucide-react';

export default function WatchlistPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const watchlist = useWatchlist();

  // Advanced filter states
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [selectedCap, setSelectedCap] = useState('ALL');
  const [selectedPriceRange, setSelectedPriceRange] = useState('ALL');
  const [selectedRating, setSelectedRating] = useState('ALL');
  const [selectedChange, setSelectedChange] = useState('ALL');
  const [selectedVolume, setSelectedVolume] = useState('ALL');

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Modal controller
  const [activeModal, setActiveModal] = useState<'create' | 'rename' | 'delete' | 'addStock' | 'share' | null>(null);

  // Extract unique sectors & industries for filter selectors
  const sectorsList = useMemo(() => {
    const list = new Set<string>();
    watchlist.allQuotes.forEach(q => { if (q.sector) list.add(q.sector); });
    return Array.from(list);
  }, [watchlist.allQuotes]);

  const industriesList = useMemo(() => {
    const list = new Set<string>();
    watchlist.allQuotes.forEach(q => { if (q.industry) list.add(q.industry); });
    return Array.from(list);
  }, [watchlist.allQuotes]);

  if (!mounted) {
    return (
      <div className="space-y-6 pb-24 font-mono text-xs">
        {/* Floating State Controls Simulator Skeleton */}
        <div className="bg-panel/95 border border-panel-border/80 rounded-xl p-3.5 h-12 animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar Collections skeleton */}
          <div className="xl:col-span-1 bg-panel border border-panel-border rounded-2xl p-5 h-96 animate-pulse" />
          {/* Central content list skeleton */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-panel border border-panel-border rounded-2xl p-6 h-40 animate-pulse" />
            <div className="bg-panel border border-border/85 rounded-2xl h-80 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const handleResetFilters = () => {
    setSelectedSector('ALL');
    setSelectedIndustry('ALL');
    setSelectedCap('ALL');
    setSelectedPriceRange('ALL');
    setSelectedRating('ALL');
    setSelectedChange('ALL');
    setSelectedVolume('ALL');
    setSearchTerm('');
  };

  const handleAddStockTrigger = () => {
    setActiveModal('addStock');
  };

  const handleRetryError = () => {
    watchlist.setSimulateError(false);
    watchlist.setSimulateOffline(false);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-24"
    >
      {/* Floating State Controls Simulator */}
      <div className="bg-panel/95 border border-panel-border/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] shadow-lg sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-bold text-foreground uppercase tracking-wider">State Controls:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={watchlist.simulateLoading}
              onChange={(e) => watchlist.setSimulateLoading(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Loading
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={watchlist.simulateError}
              onChange={(e) => watchlist.setSimulateError(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Error
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={watchlist.simulateEmpty}
              onChange={(e) => watchlist.setSimulateEmpty(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Empty List
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={watchlist.simulateOffline}
              onChange={(e) => watchlist.setSimulateOffline(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Offline
          </label>
        </div>
      </div>

      {/* Error Boundary */}
      <AnimatePresence mode="wait">
        {watchlist.error ? (
          <motion.div
            key="error-boundary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4 font-mono text-xs shadow-xl"
          >
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Watchlist Services Disrupted</h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {watchlist.error}
            </p>
            <button
              onClick={handleRetryError}
              className="px-4 py-2 font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect Services
            </button>
          </motion.div>
        ) : (
          <motion.div key="watchlist-workspace" className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            
            {/* Left Sidebar Collections Navigation */}
            <div className="xl:col-span-1 flex flex-col gap-6">
              <div className="bg-panel border border-panel-border rounded-2xl p-5 shadow-sm">
                <WatchlistSidebar
                  isLoading={watchlist.isLoading}
                  watchlists={watchlist.watchlists}
                  activeId={watchlist.activeWatchlistId}
                  onSelect={watchlist.setActiveWatchlistId}
                  performance={watchlist.watchlistsPerformance}
                  onRename={(id) => {
                    watchlist.setActiveWatchlistId(id);
                    setActiveModal('rename');
                  }}
                  onDuplicate={(id) => {
                    watchlist.setActiveWatchlistId(id);
                    watchlist.duplicateWatchlist(id);
                  }}
                  onDelete={(id) => {
                    watchlist.setActiveWatchlistId(id);
                    setActiveModal('delete');
                  }}
                  onCreateTrigger={() => setActiveModal('create')}
                />
              </div>
            </div>

            {/* Center & Right Workspace columns */}
            <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Central Ledger workspace (takes 2 cols in desktop layout) */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. Header display */}
                <WatchlistHeader
                  watchlistName={watchlist.activeWatchlist?.name || 'Active List'}
                  watchlistId={watchlist.activeWatchlistId}
                  totalStocks={watchlist.activeQuotes.length}
                  totalWatchlists={watchlist.watchlists.length}
                  lastUpdated={new Date().toLocaleTimeString()}
                  onCreate={() => setActiveModal('create')}
                  onRename={() => setActiveModal('rename')}
                  onDuplicate={() => watchlist.duplicateWatchlist(watchlist.activeWatchlistId)}
                  onImport={() => setActiveModal('addStock')} // add stock serves as default import loader here
                  onExport={watchlist.exportWatchlist}
                  onShare={() => setActiveModal('share')}
                />

                {/* 2. Advanced filters block */}
                <WatchlistFilters
                  sectors={sectorsList}
                  industries={industriesList}
                  selectedSector={selectedSector}
                  setSelectedSector={setSelectedSector}
                  selectedIndustry={selectedIndustry}
                  setSelectedIndustry={setSelectedIndustry}
                  selectedCap={selectedCap}
                  setSelectedCap={setSelectedCap}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={setSelectedPriceRange}
                  selectedRating={selectedRating}
                  setSelectedRating={setSelectedRating}
                  selectedChange={selectedChange}
                  setSelectedChange={setSelectedChange}
                  selectedVolume={selectedVolume}
                  setSelectedVolume={setSelectedVolume}
                  onReset={handleResetFilters}
                />

                {/* Quick Stock Adder trigger */}
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-muted-foreground">List actions:</span>
                  <button
                    onClick={handleAddStockTrigger}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground font-bold hover:opacity-90 rounded-lg cursor-pointer shadow-sm"
                  >
                    Add Stock Symbol
                  </button>
                </div>

                {/* 3. Main interactive data grid */}
                <WatchlistTable
                  isLoading={watchlist.isLoading}
                  quotes={watchlist.activeQuotes}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onRemove={watchlist.removeStockFromWatchlist}
                  onAddToPortfolio={watchlist.addStockToWatchlist}
                  onCompareToggle={watchlist.toggleComparisonSymbol}
                  comparisonSymbols={watchlist.comparisonSymbols}
                  onSetAlert={watchlist.setStockAlert}
                  onShareStock={watchlist.shareWatchlist}
                  
                  sectorFilter={selectedSector}
                  industryFilter={selectedIndustry}
                  capFilter={selectedCap}
                  priceFilter={selectedPriceRange}
                  ratingFilter={selectedRating}
                  changeFilter={selectedChange}
                  volumeFilter={selectedVolume}
                />

                {/* 4. Compare Stock grid */}
                <StockComparer
                  comparisonData={watchlist.comparisonData}
                  onRemove={watchlist.toggleComparisonSymbol}
                  onClear={watchlist.clearComparison}
                />

                {/* 5. Watchlist Analytics charts */}
                <WatchlistAnalytics
                  isLoading={watchlist.isLoading}
                  analytics={watchlist.analytics}
                  quotes={watchlist.activeQuotes}
                />

                {/* 6. AI Insights advisory */}
                <AIWatchlistInsights
                  isLoading={watchlist.isLoading}
                  insights={watchlist.aiInsights}
                />

              </div>

              {/* Right Movers Panel (takes 1 col in desktop layout) */}
              <div className="lg:col-span-1 bg-panel border border-panel-border rounded-2xl p-5 shadow-sm h-fit">
                <RealTimeMarketPanel
                  isLoading={watchlist.isLoading}
                  feeds={watchlist.realTimeFeeds}
                  onSelectStock={watchlist.addStockToWatchlist}
                />
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* CRUD Modals overlay */}
      <WatchlistModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        activeWatchlistName={watchlist.activeWatchlist?.name}
        activeWatchlistId={watchlist.activeWatchlistId}
        watchlistSymbols={watchlist.activeWatchlist?.symbols || []}
        onCreateSubmit={watchlist.createWatchlist}
        onRenameSubmit={watchlist.renameWatchlist}
        onDeleteSubmit={watchlist.deleteWatchlist}
        onAddStockSubmit={watchlist.addStockToWatchlist}
      />
    </motion.div>
  );
}
