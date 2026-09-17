'use client';

import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

interface WatchlistFiltersProps {
  sectors: string[];
  industries: string[];
  
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  
  selectedIndustry: string;
  setSelectedIndustry: (industry: string) => void;
  
  selectedCap: string;
  setSelectedCap: (cap: string) => void;
  
  selectedPriceRange: string;
  setSelectedPriceRange: (range: string) => void;
  
  selectedRating: string;
  setSelectedRating: (rating: string) => void;
  
  selectedChange: string;
  setSelectedChange: (change: string) => void;
  
  selectedVolume: string;
  setSelectedVolume: (volume: string) => void;

  onReset: () => void;
}

export default function WatchlistFilters({
  sectors,
  industries,
  selectedSector,
  setSelectedSector,
  selectedIndustry,
  setSelectedIndustry,
  selectedCap,
  setSelectedCap,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedRating,
  setSelectedRating,
  selectedChange,
  setSelectedChange,
  selectedVolume,
  setSelectedVolume,
  onReset
}: WatchlistFiltersProps) {
  return (
    <div className="bg-panel border border-panel-border rounded-xl p-4 font-mono text-xs shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Filter className="w-4 h-4 text-primary" />
          <span>Advanced Asset Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 px-2 py-1 rounded bg-secondary hover:bg-muted border border-border text-foreground hover:text-primary transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Grid of selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {/* Sector Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Sector</label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Sectors</option>
            {sectors.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Industry Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Industry</label>
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>

        {/* Market Cap Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Market Cap</label>
          <select
            value={selectedCap}
            onChange={(e) => setSelectedCap(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Sizes</option>
            <option value="MEGA">Mega Cap (&gt;$200B)</option>
            <option value="LARGE">Large Cap ($10B-$200B)</option>
            <option value="MID">Mid/Small (&lt;$10B)</option>
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Price Range</label>
          <select
            value={selectedPriceRange}
            onChange={(e) => setSelectedPriceRange(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Prices</option>
            <option value="UNDER100">Under $100</option>
            <option value="100TO500">$100 - $500</option>
            <option value="ABOVE500">Above $500</option>
          </select>
        </div>

        {/* Analyst Rating Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Analyst Rating</label>
          <select
            value={selectedRating}
            onChange={(e) => setSelectedRating(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Ratings</option>
            <option value="BUY">Buy Recommended</option>
            <option value="HOLD">Hold Recommended</option>
            <option value="SELL">Sell Recommended</option>
          </select>
        </div>

        {/* Daily Change Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Daily Change</label>
          <select
            value={selectedChange}
            onChange={(e) => setSelectedChange(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Directions</option>
            <option value="GAINERS">Gainers (+)</option>
            <option value="LOSERS">Losers (-)</option>
          </select>
        </div>

        {/* Volume Filter */}
        <div className="space-y-1">
          <label className="text-[9px] uppercase font-bold text-muted-foreground">Trading Volume</label>
          <select
            value={selectedVolume}
            onChange={(e) => setSelectedVolume(e.target.value)}
            className="w-full px-2 py-1.5 bg-secondary text-foreground border border-border rounded-lg focus:outline-none"
          >
            <option value="ALL">All Volume</option>
            <option value="HIGH">High Volume (&gt;20M)</option>
            <option value="MODERATE">Moderate Volume</option>
          </select>
        </div>
      </div>
    </div>
  );
}
