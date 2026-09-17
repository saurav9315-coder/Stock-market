'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from './hooks/usePortfolio';

// Components
import PortfolioHeader from './components/PortfolioHeader';
import PortfolioSummary from './components/PortfolioSummary';
import PortfolioPerformance from './components/PortfolioPerformance';
import AssetAllocation from './components/AssetAllocation';
import HoldingsTable from './components/HoldingsTable';
import TopPerformers from './components/TopPerformers';
import RecentTransactions from './components/RecentTransactions';
import DividendTracker from './components/DividendTracker';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import AIInsights from './components/AIInsights';
import WatchlistPreview from './components/WatchlistPreview';
import InvestmentGoals from './components/InvestmentGoals';
import PortfolioModals from './components/PortfolioModals';

// Icons
import { AlertCircle, Sliders, RefreshCw } from 'lucide-react';

export default function PortfolioPage() {
  const portfolio = usePortfolio();

  // Modal active controllers
  const [activeModal, setActiveModal] = useState<'addFunds' | 'withdrawFunds' | 'import' | null>(null);

  // Trigger quick buy/sell trade on an asset
  const [directTradeSymbol, setDirectTradeSymbol] = useState<string | null>(null);
  
  // Handler to link AI Insight stock click to quick buy form
  const handleQuickTradeLink = (symbol: string) => {
    // Open the holdings search/actions by focusing on that ticker
    portfolio.executeTradeAction(symbol, 5, 'BUY'); // default execute 5 shares buy as convenience
  };

  const handleRetryError = () => {
    portfolio.setSimulateError(false);
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
      {/* Floating State Control Panel (Sandbox Simulator) */}
      <div className="bg-panel/95 border border-panel-border/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] shadow-lg sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary animate-pulse" />
          <span className="font-bold text-foreground uppercase tracking-wider">State Controls:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={portfolio.simulateLoading}
              onChange={(e) => portfolio.setSimulateLoading(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Loading
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={portfolio.simulateError}
              onChange={(e) => portfolio.setSimulateError(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Error
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
            <input
              type="checkbox"
              checked={portfolio.simulateEmpty}
              onChange={(e) => portfolio.setSimulateEmpty(e.target.checked)}
              className="rounded accent-primary cursor-pointer"
            />
            Simulate Empty Ledger
          </label>
        </div>
      </div>

      {/* Error Boundary Screen */}
      <AnimatePresence mode="wait">
        {portfolio.error ? (
          <motion.div
            key="error-boundary"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-rose-500/5 border border-rose-500/15 rounded-2xl p-8 text-center max-w-xl mx-auto my-12 space-y-4 font-mono text-xs shadow-xl"
          >
            <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Account Service Interrupted</h2>
            <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {portfolio.error}
            </p>
            <button
              onClick={handleRetryError}
              className="px-4 py-2 font-bold text-xs bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reconnect Service
            </button>
          </motion.div>
        ) : (
          <motion.div key="portfolio-dashboard" className="space-y-6">
            
            {/* 1. Header Metrics block */}
            <PortfolioHeader
              metrics={portfolio.metrics}
              onAddFunds={() => setActiveModal('addFunds')}
              onWithdrawFunds={() => setActiveModal('withdrawFunds')}
              onImport={() => setActiveModal('import')}
              onExport={portfolio.exportPortfolio}
              onPDF={portfolio.generatePDFReport}
              onCSV={portfolio.generateCSVReport}
              onShare={portfolio.sharePortfolio}
            />

            {/* 2. KPI Metrics Grid Summary */}
            <PortfolioSummary
              isLoading={portfolio.isLoading}
              metrics={portfolio.metrics}
              analytics={portfolio.analytics}
            />

            {/* 3. Mid Level: Chart comparisons & Allocation Distributions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 flex">
                <PortfolioPerformance
                  isLoading={portfolio.isLoading}
                  getHistoricalPerformance={portfolio.getHistoricalPerformance}
                />
              </div>
              <div className="xl:col-span-1 flex">
                <AssetAllocation
                  isLoading={portfolio.isLoading}
                  allocations={portfolio.allocations}
                />
              </div>
            </div>

            {/* 4. Active holdings & Performance leaders block */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 flex flex-col">
                <HoldingsTable
                  isLoading={portfolio.isLoading}
                  holdings={portfolio.holdings}
                  totalNav={portfolio.metrics.netAssetValue}
                  onTradeAction={portfolio.executeTradeAction}
                />
              </div>
              <div className="xl:col-span-1 flex flex-col gap-6">
                <TopPerformers
                  isLoading={portfolio.isLoading}
                  performers={portfolio.performers}
                />
                <WatchlistPreview
                  isLoading={portfolio.isLoading}
                  onAddStock={handleQuickTradeLink}
                />
              </div>
            </div>

            {/* 5. Analytics Scatter Plots & Goals Milestone distributions */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PortfolioAnalytics
                isLoading={portfolio.isLoading}
                analytics={portfolio.analytics}
              />
              <InvestmentGoals
                isLoading={portfolio.isLoading}
                goals={portfolio.goals}
                cashBalance={portfolio.cashBalance}
                onAddGoal={portfolio.addGoal}
                onAllocateFunds={portfolio.updateGoalProgress}
              />
            </div>

            {/* 6. AI Insights Panel */}
            <AIInsights
              isLoading={portfolio.isLoading}
              aiInsights={portfolio.aiInsights}
              onQuickTrade={handleQuickTradeLink}
            />

            {/* 7. Dividend tracker summary */}
            <DividendTracker
              isLoading={portfolio.isLoading}
              dividends={portfolio.dividends}
            />

            {/* 8. Recent cash/equity transaction records ledger */}
            <RecentTransactions
              isLoading={portfolio.isLoading}
              transactions={portfolio.transactions}
            />

          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Action Modals */}
      <PortfolioModals
        cashBalance={portfolio.cashBalance}
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onAddFundsSubmit={portfolio.addFunds}
        onWithdrawFundsSubmit={portfolio.withdrawFunds}
        onImportSubmit={portfolio.importPortfolio}
      />
    </motion.div>
  );
}
