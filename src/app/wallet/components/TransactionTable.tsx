import React, { useState } from 'react';
import { Transaction } from '@/lib/walletMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Eye, 
  X,
  FileText,
  AlertOctagon,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Sorting: newest transactions first by default
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions based on inputs
  const filteredTransactions = sortedTransactions.filter((txn) => {
    const matchesSearch = txn.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (txn.note && txn.note.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'All' || txn.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || txn.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadgeClass = (status: Transaction['status']) => {
    switch (status) {
      case 'Completed':
      case 'Approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border/40';
    }
  };

  const getTxnIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'Deposit':
      case 'Refund':
      case 'Bonus':
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Withdrawal':
      case 'Buy Stock':
        return <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />;
      case 'Sell Stock':
        return <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const downloadStatement = () => {
    toast.info("Compiling CSV account statement ledger...");
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Transaction ID,Date,Type,Amount,Method,Status,Note"].join(",") + "\n"
      + filteredTransactions.map(t => [t.id, t.date, t.type, t.amount, t.method, t.status, t.note || ''].join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Wallet_Statement_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement CSV file downloaded!");
  };

  const simulateInvoiceDownload = (txn: Transaction) => {
    toast.success(`Mock PDF Invoice compiled for transaction ${txn.id}!`);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-panel/30 border border-border/30 rounded-xl p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by txn ID or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-panel border border-border px-3 py-1.5 rounded-lg text-xs">
            <span className="text-muted-foreground uppercase text-[9px] font-bold font-mono">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-foreground border-none outline-none focus:ring-0 text-xs font-medium cursor-pointer"
            >
              <option value="All">All Transactions</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Buy Stock">Buy Stock</option>
              <option value="Sell Stock">Sell Stock</option>
              <option value="Refund">Refund</option>
              <option value="Bonus">Bonus</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-panel border border-border px-3 py-1.5 rounded-lg text-xs">
            <span className="text-muted-foreground uppercase text-[9px] font-bold font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-foreground border-none outline-none focus:ring-0 text-xs font-medium cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Download CSV */}
          <button
            onClick={downloadStatement}
            className="p-2 border border-border bg-panel hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
            title="Download CSV Statement"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-xl border border-panel-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/45 bg-panel/30 text-[10px] uppercase font-bold text-muted-foreground font-mono tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 text-xs">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No transactions found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-panel/20 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-foreground">
                      {txn.id}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-mono">
                      {new Date(txn.date).toLocaleString(undefined, {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <div className="p-1 rounded bg-panel border border-border/20">
                          {getTxnIcon(txn.type)}
                        </div>
                        {txn.type}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      ${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground font-medium">
                      {txn.method}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTxn(txn)}
                        className="px-2.5 py-1.5 bg-panel border border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold rounded cursor-pointer transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox / Slide-out Details Pane */}
      <AnimatePresence>
        {selectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border border-panel-border bg-card p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedTxn(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5 text-left">
                <div className="border-b border-border/40 pb-4">
                  <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase tracking-wider block">
                    Transaction Invoice Receipt
                  </span>
                  <h3 className="text-base font-extrabold text-foreground font-mono mt-1">
                    ID: {selectedTxn.id}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Date & Time</span>
                    <span className="text-foreground font-medium flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                      {new Date(selectedTxn.date).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Method</span>
                    <span className="text-foreground font-medium mt-0.5 block">{selectedTxn.method}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Transaction Type</span>
                    <span className="text-foreground font-bold mt-0.5 block">{selectedTxn.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Clearance Status</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1 ${getStatusBadgeClass(selectedTxn.status)}`}>
                      {selectedTxn.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-panel/30 border border-border/30 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Settlement Value</span>
                    <span className="text-xl font-extrabold font-mono text-foreground mt-0.5 block">
                      ${selectedTxn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <button
                    onClick={() => simulateInvoiceDownload(selectedTxn)}
                    className="p-2 border border-border bg-panel hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Invoice PDF
                  </button>
                </div>

                {/* Optional Note */}
                {selectedTxn.note && (
                  <div className="space-y-1 text-xs">
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Reference Note</span>
                    <p className="p-3 bg-panel/35 border border-border/30 rounded-lg text-foreground font-medium leading-relaxed italic">
                      "{selectedTxn.note}"
                    </p>
                  </div>
                )}

                {/* Deposit Proof Image Lightbox Link */}
                {selectedTxn.screenshotUrl && (
                  <div className="space-y-2 text-xs">
                    <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Uploaded Payment Proof</span>
                    <div className="relative rounded-lg overflow-hidden border border-border bg-[#0b0f19] flex items-center justify-center p-2 group">
                      <img 
                        src={selectedTxn.screenshotUrl} 
                        alt="Payment screenshot proof" 
                        className="max-h-48 object-contain rounded"
                      />
                      <a 
                        href={selectedTxn.screenshotUrl} 
                        download={`Proof_${selectedTxn.id}.png`}
                        className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 border border-border/40 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Screenshot
                      </a>
                    </div>
                  </div>
                )}

                {/* UTR */}
                {selectedTxn.utr && (
                  <div className="flex items-center justify-between pb-3 border-b border-border/35 text-xs">
                    <span className="text-muted-foreground text-[10px] uppercase font-mono tracking-wider">UTR / Transaction Hash</span>
                    <span className="font-mono text-foreground font-bold">{selectedTxn.utr}</span>
                  </div>
                )}

                {/* Rejection Log */}
                {selectedTxn.status === 'Rejected' && selectedTxn.rejectionReason && (
                  <div className="flex gap-2.5 p-3.5 bg-rose-500/5 border border-rose-500/15 rounded-lg text-[11px] text-left">
                    <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-rose-400 block uppercase font-mono tracking-wider">Compliance Flag Reason</span>
                      <p className="text-muted-foreground mt-0.5 leading-relaxed">
                        {selectedTxn.rejectionReason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
