'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Search, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { Alert } from '@/lib/alertsMock';
import { Button } from '@/components/ui/button';

interface ActiveAlertsTableProps {
  alerts: Alert[];
  onToggleStatus: (id: string) => void;
  onDeleteAlert: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
  onBulkToggle: (ids: string[], status: 'active' | 'paused') => void;
  onSymbolClick?: (symbol: string) => void;
}

type SortField = 'symbol' | 'type' | 'targetValue' | 'createdAt' | 'lastTriggered';

export default function ActiveAlertsTable({
  alerts,
  onToggleStatus,
  onDeleteAlert,
  onBulkDelete,
  onBulkToggle,
  onSymbolClick
}: ActiveAlertsTableProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Sorting State
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAlerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Filter types list
  const uniqueTypes = ['All', ...new Set(alerts.map(a => a.type))];

  // Apply filters
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          alert.type.toLowerCase().includes(search.toLowerCase()) ||
                          alert.condition.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || alert.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || alert.status === statusFilter.toLowerCase();
    return matchesSearch && matchesType && matchesStatus;
  });

  // Apply sorting
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (valA === 'Never') valA = '';
    if (valB === 'Never') valB = '';

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Apply pagination
  const totalPages = Math.max(1, Math.ceil(sortedAlerts.length / pageSize));
  const paginatedAlerts = sortedAlerts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleBulkAction = (action: 'delete' | 'activate' | 'pause') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      onBulkDelete(selectedIds);
    } else if (action === 'activate') {
      onBulkToggle(selectedIds, 'active');
    } else if (action === 'pause') {
      onBulkToggle(selectedIds, 'paused');
    }
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-panel p-4 space-y-4">
      {/* 1. Header controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
          Active Indicators Table
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative w-40 sm:w-48 h-7">
            <Search className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search active alarms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full h-full rounded-md bg-secondary text-[11px] pl-7 pr-2 text-foreground border border-border outline-none focus:border-primary/45 font-sans"
            />
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="h-7 rounded bg-secondary text-foreground text-[10px] px-2 border border-border outline-none focus:border-primary/40 font-mono"
          >
            <option value="All">All Types</option>
            {uniqueTypes.filter(t => t !== 'All').map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="h-7 rounded bg-secondary text-foreground text-[10px] px-2 border border-border outline-none focus:border-primary/40 font-mono"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* 2. Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-2.5 rounded-lg bg-primary/10 border border-primary/25 flex items-center justify-between text-xs"
          >
            <span className="font-mono text-primary font-bold">
              {selectedIds.length} alarms selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleBulkAction('activate')} className="h-6 text-[10px] bg-primary text-primary-foreground font-semibold">
                Bulk Resume
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('pause')} className="h-6 text-[10px] bg-secondary text-foreground border border-border">
                Bulk Pause
              </Button>
              <Button size="sm" onClick={() => handleBulkAction('delete')} className="h-6 text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/80">
                Bulk Delete
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Table grid layout */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/40 text-muted-foreground uppercase font-mono text-[9px] tracking-wider h-9">
              <th className="w-8 px-2 text-center">
                <button onClick={toggleSelectAll} className="cursor-pointer">
                  {selectedIds.length === filteredAlerts.length && filteredAlerts.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                </button>
              </th>
              <th className="px-3 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('symbol')}>
                <div className="flex items-center gap-1">
                  Ticker
                  {sortField === 'symbol' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-3 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('type')}>
                <div className="flex items-center gap-1">
                  Alert Type
                  {sortField === 'type' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-3">Criteria</th>
              <th className="px-3 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('targetValue')}>
                <div className="flex items-center gap-1">
                  Value (Curr / Target)
                  {sortField === 'targetValue' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-3">Status</th>
              <th className="px-3 cursor-pointer select-none hover:text-foreground" onClick={() => handleSort('createdAt')}>
                <div className="flex items-center gap-1">
                  Created Date
                  {sortField === 'createdAt' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                </div>
              </th>
              <th className="px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {paginatedAlerts.length > 0 ? (
              paginatedAlerts.map((alert) => {
                const isSelected = selectedIds.includes(alert.id);
                const isActive = alert.status === 'active';
                const isExpired = alert.status === 'expired';

                return (
                  <tr 
                    key={alert.id}
                    className={`h-11 hover:bg-secondary/20 transition-colors ${
                      isSelected ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-2 text-center">
                      <button onClick={() => toggleSelect(alert.id)} className="cursor-pointer">
                        {isSelected ? (
                          <CheckSquare className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Square className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                    <td className="px-3">
                      <button
                        onClick={() => onSymbolClick?.(alert.symbol)}
                        className="font-bold font-mono text-foreground hover:underline cursor-pointer"
                      >
                        {alert.symbol}
                      </button>
                    </td>
                    <td className="px-3 font-mono text-[10px] text-muted-foreground">{alert.type}</td>
                    <td className="px-3 font-semibold text-foreground">{alert.condition}</td>
                    <td className="px-3 font-mono text-[10px]">
                      <span className="text-muted-foreground">{alert.currentValue.toFixed(2)}</span>
                      <span className="text-muted-foreground/60 mx-1">/</span>
                      <span className="text-foreground font-bold">{alert.targetValue.toFixed(2)}</span>
                    </td>
                    <td className="px-3">
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isActive 
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                          : isExpired 
                            ? 'bg-muted/40 text-muted-foreground border border-muted/50'
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-3 font-mono text-[10px] text-muted-foreground">{alert.createdAt}</td>
                    <td className="px-3 text-right space-x-1.5">
                      {!isExpired && (
                        <button
                          onClick={() => onToggleStatus(alert.id)}
                          className={`p-1 rounded border transition-colors cursor-pointer inline-flex items-center justify-center ${
                            isActive 
                              ? 'text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15' 
                              : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/15'
                          }`}
                          title={isActive ? 'Pause Alert' : 'Resume Alert'}
                        >
                          {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteAlert(alert.id)}
                        className="p-1 rounded border text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 transition-colors cursor-pointer inline-flex items-center justify-center"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-muted-foreground">
                  No active alerts found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-mono">
          <span className="text-muted-foreground">
            Page {currentPage} of {totalPages} ({filteredAlerts.length} alarms found)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
