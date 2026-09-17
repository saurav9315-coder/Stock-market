'use client';

import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, RefreshCw, Calendar, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  date: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'DEPOSIT' | 'WITHDRAWAL';
  symbol?: string;
  quantity?: number;
  price?: number;
  totalAmount: number;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
}

interface RecentTransactionsProps {
  isLoading?: boolean;
  transactions: Transaction[];
}

export default function RecentTransactions({
  isLoading = false,
  transactions
}: RecentTransactionsProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType === 'ALL') return true;
      return t.type === filterType;
    });
  }, [transactions, filterType]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));

  // Helper for type badges
  const renderTypeBadge = (type: Transaction['type']) => {
    switch (type) {
      case 'DEPOSIT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">DEPOSIT</span>;
      case 'WITHDRAWAL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">WITHDRAWAL</span>;
      case 'BUY':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">BUY</span>;
      case 'SELL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">SELL</span>;
      case 'DIVIDEND':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">DIVIDEND</span>;
      default:
        return null;
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (isLoading) {
    return (
      <Card className="bg-panel border-border/80 w-full animate-pulse h-[300px]">
        <CardContent className="h-full flex items-center justify-center">
          <div className="h-4 w-40 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-panel border-border/85 w-full shadow-sm overflow-hidden">
      <CardHeader className="border-b border-border/40 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5 font-mono">
          <Calendar className="w-4 h-4 text-primary" /> Historical Transaction Log
        </CardTitle>

        {/* Filter selection dropdown */}
        <div className="w-40">
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-2 py-1.5 text-xs bg-secondary/80 border border-border rounded-lg text-foreground focus:outline-none font-mono"
          >
            <option value="ALL">All Operations</option>
            <option value="BUY">Buys</option>
            <option value="SELL">Sells</option>
            <option value="DIVIDEND">Dividends</option>
            <option value="DEPOSIT">Deposits</option>
            <option value="WITHDRAWAL">Withdrawals</option>
          </select>
        </div>
      </CardHeader>

      <div className="overflow-x-auto font-mono text-xs">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="py-2.5 px-4 font-semibold text-xs text-muted-foreground">Execution Date</TableHead>
              <TableHead className="py-2.5 px-4 font-semibold text-xs text-muted-foreground">Transaction Type</TableHead>
              <TableHead className="py-2.5 px-4 font-semibold text-xs text-muted-foreground">Asset Ticker</TableHead>
              <TableHead className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground">Shares Quantity</TableHead>
              <TableHead className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground">Execution Price</TableHead>
              <TableHead className="py-2.5 px-4 text-right font-semibold text-xs text-muted-foreground">Total Cash Outlay</TableHead>
              <TableHead className="py-2.5 px-4 text-center font-semibold text-xs text-muted-foreground">Clearing Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No operations recorded on account ledger.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-secondary/30 border-border/40 transition-colors">
                  <TableCell className="py-3 px-4 text-foreground/80">{formatDate(tx.date)}</TableCell>
                  <TableCell className="py-3 px-4">{renderTypeBadge(tx.type)}</TableCell>
                  <TableCell className="py-3 px-4 font-bold text-foreground">{tx.symbol || 'USD CORE'}</TableCell>
                  <TableCell className="py-3 px-4 text-right text-foreground/70">
                    {tx.quantity ? tx.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 }) : '—'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right text-foreground/70">
                    {tx.price ? `$${tx.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right font-bold text-foreground">
                    ${tx.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between border-t border-border/40 p-3 text-xs">
        <span className="text-muted-foreground">
          Showing {filteredTransactions.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} operations
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-secondary hover:bg-muted border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Prev
          </button>
          <span className="font-bold px-2">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-secondary hover:bg-muted border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </Card>
  );
}
