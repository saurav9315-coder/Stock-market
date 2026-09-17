import React, { useState } from 'react';
import { Transaction } from '@/lib/walletMock';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  X, 
  FileText, 
  Calendar,
  AlertTriangle,
  ZoomIn,
  Send,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminVerificationPanelProps {
  transactions: Transaction[];
  onApproveDeposit: (id: string) => void;
  onRejectDeposit: (id: string, reason: string) => void;
}

export default function AdminVerificationPanel({
  transactions,
  onApproveDeposit,
  onRejectDeposit
}: AdminVerificationPanelProps) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [zoomProof, setZoomProof] = useState<boolean>(false);

  // Filter only pending deposits or deposits under review
  const pendingDeposits = transactions.filter(
    (t) => t.type === 'Deposit' && (t.status === 'Pending' || t.status === 'Under Review')
  );

  const handleApprove = (id: string) => {
    onApproveDeposit(id);
    setSelectedTxn(null);
  };

  const handleRejectSubmit = (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    onRejectDeposit(id, rejectReason.trim());
    setIsRejecting(false);
    setSelectedTxn(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-foreground">Compliance Verification Queue</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review manual deposits, audit reference numbers (UTRs), and cross-reference screenshot attachments.
        </p>
      </div>

      {pendingDeposits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-panel border border-border rounded-full text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Compliance Ledger Clear</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
              There are no pending manual deposit receipts awaiting review.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pendingDeposits.map((txn) => (
            <div
              key={txn.id}
              className="rounded-xl border border-amber-500/25 bg-card p-5 relative overflow-hidden shadow-xs hover:border-amber-500/40 transition-all flex flex-col justify-between min-h-[180px]"
            >
              {/* Alert Indicator Header */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      PENDING AUDIT
                    </span>
                    <h4 className="text-xs font-bold text-foreground font-mono mt-1.5">{txn.id}</h4>
                  </div>
                  <span className="text-sm font-bold font-mono text-foreground">
                    ${txn.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">User Profile:</span>
                    <span className="text-foreground font-medium">Alex Mercer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Method:</span>
                    <span className="text-foreground font-medium">{txn.method}</span>
                  </div>
                  {txn.utr && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UTR ID:</span>
                      <span className="text-foreground font-mono font-semibold">{txn.utr}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-border/30 pt-3.5 mt-4 flex items-center justify-between gap-2">
                <button
                  onClick={() => { setSelectedTxn(txn); setIsRejecting(false); }}
                  className="px-2.5 py-1.5 border border-border bg-panel hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold rounded cursor-pointer transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Review Receipt
                </button>

                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleApprove(txn.id)}
                    className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-500/90 text-white text-[10px] font-bold rounded cursor-pointer transition-all flex items-center gap-0.5"
                    title="Approve & Credit Balance"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { setSelectedTxn(txn); setIsRejecting(true); setRejectReason(''); }}
                    className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-500/90 text-white text-[10px] font-bold rounded cursor-pointer transition-all flex items-center gap-0.5"
                    title="Flag & Reject"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Approve/Reject Lightbox Modal */}
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
                onClick={() => { setSelectedTxn(null); setIsRejecting(false); }}
                className="absolute right-4 top-4 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {!isRejecting ? (
                <div className="space-y-5 text-left">
                  <div className="border-b border-border/40 pb-4">
                    <span className="text-[10px] font-bold font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      MANUAL DEPOSIT AUDIT
                    </span>
                    <h3 className="text-base font-extrabold text-foreground font-mono mt-1.5">
                      ID: {selectedTxn.id}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Depositor Name</span>
                      <span className="text-foreground font-medium block mt-0.5">Alex Mercer</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Submit Date</span>
                      <span className="text-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        {new Date(selectedTxn.date).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Method</span>
                      <span className="text-foreground font-bold mt-0.5 block">{selectedTxn.method}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Reference UTR</span>
                      <span className="text-foreground font-mono font-semibold mt-0.5 block">{selectedTxn.utr || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-panel/30 border border-border/30 rounded-lg flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block">Requested Credit Amount</span>
                      <span className="text-xl font-extrabold font-mono text-foreground mt-0.5 block">
                        ${selectedTxn.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {selectedTxn.note && (
                    <div className="space-y-1 text-xs">
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Depositor Note</span>
                      <p className="p-3 bg-panel/35 border border-border/30 rounded-lg text-foreground font-medium leading-relaxed italic">
                        "{selectedTxn.note}"
                      </p>
                    </div>
                  )}

                  {/* Payment Screenshot */}
                  {selectedTxn.screenshotUrl && (
                    <div className="space-y-2 text-xs">
                      <span className="text-muted-foreground block text-[10px] uppercase font-mono tracking-wider">Payment Proof Screenshot</span>
                      <div className="relative rounded-lg overflow-hidden border border-border bg-[#0b0f19] flex items-center justify-center p-2 group">
                        <img 
                          src={selectedTxn.screenshotUrl} 
                          alt="Proof" 
                          className="max-h-48 object-contain rounded"
                        />
                        <button
                          onClick={() => setZoomProof(true)}
                          className="absolute bottom-3 right-3 p-2 bg-black/60 hover:bg-black/80 border border-border/40 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 text-[10px] font-bold cursor-pointer"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          Zoom In
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 border-t border-border/30 pt-4 mt-6">
                    <button
                      onClick={() => setIsRejecting(true)}
                      className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-500/90 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Reject & Add Reason
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTxn.id)}
                      className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-500/90 text-white font-bold text-xs rounded-lg cursor-pointer"
                    >
                      Approve & Credit Balance
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-left">
                  <div className="border-b border-border/40 pb-4">
                    <span className="text-[10px] font-bold font-mono text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                      FLAG TRANSACTION
                    </span>
                    <h3 className="text-base font-extrabold text-foreground font-mono mt-1.5">
                      Reject: {selectedTxn.id}
                    </h3>
                  </div>

                  <form onSubmit={(e) => handleRejectSubmit(e, selectedTxn.id)} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="rejReason" className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
                        Rejection Reason / Auditor Comments
                      </label>
                      <textarea
                        id="rejReason"
                        placeholder="Please enter compliance rejection comments, e.g. UTR matches another account, payment proof image is blurred..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-panel focus:outline-none focus:border-primary/50 text-foreground h-24 resize-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="w-1/2 py-2 bg-secondary hover:bg-muted text-foreground font-bold text-xs rounded-lg border border-border cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-1/2 py-2 bg-rose-500 hover:bg-rose-500/90 text-white font-bold text-xs rounded-lg cursor-pointer"
                      >
                        Submit Rejection
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proof zoom lightbox */}
      <AnimatePresence>
        {zoomProof && selectedTxn && (
          <div 
            onClick={() => setZoomProof(false)}
            className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <button 
                onClick={() => setZoomProof(false)}
                className="absolute top-4 right-4 p-2 bg-black/60 border border-border/30 rounded-full text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img 
                src={selectedTxn.screenshotUrl} 
                alt="Zoomed proof" 
                className="max-h-[85vh] object-contain rounded-lg border border-border"
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
